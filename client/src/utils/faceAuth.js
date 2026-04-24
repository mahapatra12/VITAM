const FACE_DESCRIPTOR_LENGTH = 64;
const DEFAULT_CAPTURE_SIZE = 256;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const waitForVideoReady = async (videoEl, timeoutMs = 8000) => {
  if (!videoEl) {
    throw new Error('Camera preview not available.');
  }
  if (videoEl.readyState >= 2 && videoEl.videoWidth > 0 && videoEl.videoHeight > 0) {
    return;
  }

  await new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error('Camera stream did not initialize in time.'));
    }, timeoutMs);

    const onReady = () => {
      if (videoEl.videoWidth > 0 && videoEl.videoHeight > 0) {
        cleanup();
        resolve();
      }
    };

    const cleanup = () => {
      window.clearTimeout(timeout);
      videoEl.removeEventListener('loadedmetadata', onReady);
      videoEl.removeEventListener('canplay', onReady);
    };

    videoEl.addEventListener('loadedmetadata', onReady);
    videoEl.addEventListener('canplay', onReady);
    onReady();
  });
};

export const startFaceCamera = async (videoEl, options = {}) => {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    throw new Error('Camera access is not supported on this browser.');
  }
  if (typeof window !== 'undefined' && !window.isSecureContext) {
    throw new Error('Face authentication requires HTTPS (or localhost).');
  }

  const constraints = {
    video: {
      facingMode: options.facingMode || 'user',
      width: { ideal: 640 },
      height: { ideal: 480 },
    },
    audio: false,
  };

  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  videoEl.srcObject = stream;
  videoEl.muted = true;
  videoEl.playsInline = true;
  await videoEl.play();
  await waitForVideoReady(videoEl);
  await delay(220);
  return stream;
};

export const stopFaceCamera = (stream, videoEl) => {
  if (stream?.getTracks) {
    stream.getTracks().forEach((track) => {
      try {
        track.stop();
      } catch (_) {
        // no-op
      }
    });
  }
  if (videoEl) {
    videoEl.pause?.();
    videoEl.srcObject = null;
  }
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const centerCropRect = (width, height, scale = 0.72) => {
  const size = Math.max(32, Math.floor(Math.min(width, height) * scale));
  const x = Math.floor((width - size) / 2);
  const y = Math.floor((height - size) / 2);
  return { x, y, width: size, height: size };
};

const resolveFaceRect = async (canvas) => {
  const fallback = centerCropRect(canvas.width, canvas.height);
  const FaceDetectorCtor = typeof window !== 'undefined' ? window.FaceDetector : null;
  if (!FaceDetectorCtor) {
    return { rect: fallback, mode: 'fallback' };
  }

  try {
    const detector = new FaceDetectorCtor({ maxDetectedFaces: 1, fastMode: true });
    const faces = await detector.detect(canvas);
    if (!Array.isArray(faces) || faces.length === 0) {
      throw new Error('No face detected. Align your face in the camera frame.');
    }

    const box = faces[0]?.boundingBox;
    if (!box) {
      throw new Error('Unable to read face position. Try again.');
    }

    const size = Math.max(box.width, box.height) * 1.4;
    const x = clamp(Math.floor(box.x - (size - box.width) / 2), 0, canvas.width - 1);
    const y = clamp(Math.floor(box.y - (size - box.height) / 2), 0, canvas.height - 1);
    const width = clamp(Math.floor(size), 32, canvas.width - x);
    const height = clamp(Math.floor(size), 32, canvas.height - y);
    const square = Math.min(width, height);
    return {
      rect: { x, y, width: square, height: square },
      mode: 'detected',
    };
  } catch (error) {
    throw new Error(error?.message || 'Face detection failed. Please retry.');
  }
};

const computeDescriptorFromImage = (imageData) => {
  const { data, width, height } = imageData;
  const gray = new Float32Array(width * height);

  let sum = 0;
  for (let i = 0; i < gray.length; i += 1) {
    const offset = i * 4;
    const value = (0.299 * data[offset] + 0.587 * data[offset + 1] + 0.114 * data[offset + 2]) / 255;
    gray[i] = value;
    sum += value;
  }

  const mean = sum / gray.length;
  let variance = 0;
  for (let i = 0; i < gray.length; i += 1) {
    const delta = gray[i] - mean;
    variance += delta * delta;
  }
  const contrast = Math.sqrt(variance / gray.length);
  if (contrast < 0.06) {
    throw new Error('Face image contrast is too low. Increase light and retry.');
  }

  if (mean < 0.12 || mean > 0.88) {
    throw new Error('Face image brightness is not ideal. Adjust camera lighting and retry.');
  }

  const blockSize = Math.floor(width / 8);
  const vector = [];
  for (let by = 0; by < 8; by += 1) {
    for (let bx = 0; bx < 8; bx += 1) {
      let blockSum = 0;
      let count = 0;
      const startY = by * blockSize;
      const startX = bx * blockSize;
      for (let y = startY; y < startY + blockSize; y += 1) {
        for (let x = startX; x < startX + blockSize; x += 1) {
          const idx = y * width + x;
          blockSum += gray[idx];
          count += 1;
        }
      }
      vector.push(blockSum / Math.max(1, count));
    }
  }

  const vectorMean = vector.reduce((acc, value) => acc + value, 0) / vector.length;
  const centered = vector.map((value) => value - vectorMean);
  const magnitude = Math.sqrt(centered.reduce((acc, value) => acc + value * value, 0));
  if (!Number.isFinite(magnitude) || magnitude <= 0.000001) {
    throw new Error('Face descriptor could not be generated. Please retry.');
  }

  const normalized = centered.map((value) => Number((value / magnitude).toFixed(8)));
  return {
    descriptor: normalized,
    metrics: {
      avgBrightness: Number(mean.toFixed(4)),
      avgContrast: Number(contrast.toFixed(4)),
    },
  };
};

export const captureFaceDescriptor = async (videoEl, options = {}) => {
  await waitForVideoReady(videoEl);

  const canvas = document.createElement('canvas');
  canvas.width = videoEl.videoWidth;
  canvas.height = videoEl.videoHeight;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  context.drawImage(videoEl, 0, 0, canvas.width, canvas.height);

  const { rect, mode } = await resolveFaceRect(canvas);
  const cropCanvas = document.createElement('canvas');
  cropCanvas.width = DEFAULT_CAPTURE_SIZE;
  cropCanvas.height = DEFAULT_CAPTURE_SIZE;
  const cropContext = cropCanvas.getContext('2d', { willReadFrequently: true });
  cropContext.drawImage(
    canvas,
    rect.x,
    rect.y,
    rect.width,
    rect.height,
    0,
    0,
    DEFAULT_CAPTURE_SIZE,
    DEFAULT_CAPTURE_SIZE
  );

  const imageData = cropContext.getImageData(0, 0, DEFAULT_CAPTURE_SIZE, DEFAULT_CAPTURE_SIZE);
  const { descriptor, metrics } = computeDescriptorFromImage(imageData);
  if (!Array.isArray(descriptor) || descriptor.length !== FACE_DESCRIPTOR_LENGTH) {
    throw new Error('Face descriptor generation failed.');
  }

  return {
    descriptor,
    detectionMode: mode,
    metrics,
  };
};

export const averageFaceDescriptors = (descriptors) => {
  if (!Array.isArray(descriptors) || descriptors.length === 0) {
    throw new Error('No face descriptors were captured.');
  }
  const size = FACE_DESCRIPTOR_LENGTH;
  const sums = new Array(size).fill(0);
  descriptors.forEach((descriptor) => {
    if (!Array.isArray(descriptor) || descriptor.length !== size) {
      throw new Error('Face descriptor size mismatch.');
    }
    for (let i = 0; i < size; i += 1) {
      sums[i] += descriptor[i];
    }
  });
  const averaged = sums.map((value) => value / descriptors.length);
  const magnitude = Math.sqrt(averaged.reduce((acc, value) => acc + value * value, 0));
  if (!Number.isFinite(magnitude) || magnitude <= 0.000001) {
    throw new Error('Face descriptors are too inconsistent. Please capture again.');
  }
  return averaged.map((value) => Number((value / magnitude).toFixed(8)));
};

export const FACE_AUTH_META = {
  descriptorLength: FACE_DESCRIPTOR_LENGTH,
  minimumSamples: 3,
};

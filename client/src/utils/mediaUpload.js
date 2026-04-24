export const MAX_PROFILE_IMAGE_BYTES = 10 * 1024 * 1024;
const PROFILE_IMAGE_TYPES = new Set(['image/jpeg', 'image/png']);

export const validateProfileImageFile = (file) => {
  if (!file) {
    return 'Select a JPG or PNG image to continue.';
  }

  if (!PROFILE_IMAGE_TYPES.has(String(file.type || '').toLowerCase())) {
    return 'Only JPG and PNG images are supported for profile photos.';
  }

  if (file.size > MAX_PROFILE_IMAGE_BYTES) {
    return 'Profile photos must be 10 MB or smaller.';
  }

  return null;
};

export const getMediaUploadErrorMessage = (error, fallbackMessage) => {
  const code = error?.response?.data?.code;
  const message = error?.response?.data?.msg;
  const detail = error?.response?.data?.detail;
  const requestId = error?.response?.data?.requestId;

  if (code === 'UPLOAD_UNAVAILABLE') {
    const parts = [message || 'Media upload is unavailable right now'];
    if (detail) {
      parts.push(detail);
    }
    if (requestId) {
      parts.push(`Ref: ${requestId}`);
    }
    return parts.join(' ');
  }

  if (code === 'INVALID_FILE_TYPE' || code === 'FILE_TOO_LARGE') {
    return message || fallbackMessage;
  }

  return message || error?.message || fallbackMessage;
};

import { onCLS, onLCP, onTTFB, onINP, onFCP } from 'web-vitals';

export default function reportVitals(onReport) {
  if (!onReport || typeof onReport !== 'function') return;
  onCLS(onReport);
  onLCP(onReport);
  onFCP(onReport);
  onTTFB(onReport);
  onINP(onReport);
}

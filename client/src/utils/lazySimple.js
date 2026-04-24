import { lazy } from 'react';

export default function lazySimple(importer) {
  const Component = lazy(importer);
  Component.preload = importer;
  return Component;
}

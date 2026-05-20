'use client';

import { useState } from 'react';
import Image, { type ImageProps } from 'next/image';
import styles from './FadeImage.module.scss';

// Wrapper around next/image that crossfades from 0 → 1 opacity once the
// image is fully decoded. Avoids the "pop" of images appearing all at once
// when they finish loading. ~600ms cinema easing.
export default function FadeImage({ className, ...props }: ImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <Image
      {...props}
      className={`${styles.image} ${loaded ? styles.loaded : ''} ${className ?? ''}`}
      onLoad={(e) => {
        setLoaded(true);
        props.onLoad?.(e);
      }}
    />
  );
}

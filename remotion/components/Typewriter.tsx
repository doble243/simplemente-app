import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';

export function getTyped(localFrame: number, text: string, charsPerFrame = 2) {
  return text.slice(0, Math.floor(localFrame / charsPerFrame));
}

export const Cursor: React.FC<{ color?: string }> = ({ color = '#4F46E5' }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame % 20, [0, 10, 20], [1, 0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return <span style={{ opacity, color, lineHeight: 1 }}>|</span>;
};

export const Typewriter: React.FC<{
  text: string;
  startFrame: number;
  charsPerFrame?: number;
  style?: React.CSSProperties;
  cursorColor?: string;
}> = ({ text, startFrame, charsPerFrame = 2, style, cursorColor = '#4F46E5' }) => {
  const frame = useCurrentFrame();
  const local = Math.max(0, frame - startFrame);
  const typed = getTyped(local, text, charsPerFrame);
  const done = typed.length >= text.length;

  return (
    <span style={style}>
      {typed}
      {!done && <Cursor color={cursorColor} />}
    </span>
  );
};

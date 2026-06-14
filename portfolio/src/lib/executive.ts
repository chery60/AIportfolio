export function hexToRgb(hex?: string): string {
  if (!hex) return '48, 54, 65';
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '48, 54, 65';
}

export const executiveMotion = {
  softReveal: {
    initial: { opacity: 0, y: 10, filter: 'blur(4px)' },
    animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
    transition: { duration: 0.28, ease: [0.2, 0.8, 0.2, 1] },
  },
  panelReveal: {
    initial: { opacity: 0, y: 8, scale: 0.992 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: { duration: 0.32, ease: [0.2, 0.8, 0.2, 1] },
  },
};

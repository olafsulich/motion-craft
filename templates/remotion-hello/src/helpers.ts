// Closed forms from docs/HELLO-SPEC.md. Everything is a pure function of the frame number.
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
export const easeOutCubic = (x: number) => 1 - (1 - x) ** 3;
export const easeInCubic = (x: number) => x ** 3;
export const easeInOutCubic = (x: number) => (x < 0.5 ? 4 * x ** 3 : 1 - (-2 * x + 2) ** 3 / 2);

// Spring from 0 to 1 with a tiny overshoot (2.8 %): stiffness 256, damping 24, mass 1, 30 fps.
// Same curve as remotion's spring({frame: n, fps: 30, config: {mass: 1, stiffness: 256, damping: 24}}).
const OMEGA_D = 16 * Math.sqrt(1 - 0.75 ** 2);
export const S = (n: number) => {
  if (n <= 0) return 0;
  const s = n / 30;
  return 1 - Math.exp(-12 * s) * (Math.cos(OMEGA_D * s) + (12 / OMEGA_D) * Math.sin(OMEGA_D * s));
};

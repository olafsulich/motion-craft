import {useEffect, useState} from 'react';
import {AbsoluteFill, cancelRender, continueRender, delayRender, staticFile, useCurrentFrame} from 'remotion';
import {loadFont} from '@remotion/fonts';
import {S, clamp01, easeInCubic, easeInOutCubic, easeOutCubic, lerp} from './helpers';

const GROUND = '#0B0D10';
const SURFACE = '#14181D';
const BORDER = '#2A313A';
const TEXT = '#F2F4F7';
const ACCENT = '#FF6B2C';
const FONT = 'Inter';

const useFonts = () => {
  const [handle] = useState(() => delayRender('Loading Inter'));
  useEffect(() => {
    Promise.all([
      loadFont({family: FONT, url: staticFile('fonts/Inter-700.woff2'), weight: '700'}),
      loadFont({family: FONT, url: staticFile('fonts/Inter-600.woff2'), weight: '600'}),
    ])
      .then(() => continueRender(handle))
      .catch((e) => cancelRender(e));
  }, [handle]);
};

const cameraScale = (f: number) => {
  if (f <= 54) return lerp(1.0, 1.2, easeInOutCubic(f / 54));
  if (f <= 78) return lerp(1.2, 1.12, easeInOutCubic((f - 54) / 24));
  return lerp(1.12, 1.18, (f - 78) / 41);
};

// A word that rises on a spring and fades in; `exit` (0..1) lifts and fades it out again.
const Word = ({f, start, size, weight, color, rise, exit = 0, children}: {
  f: number; start: number; size: number; weight: number; color: string; rise: number; exit?: number; children: string;
}) => {
  const y = rise * (1 - S(f - start)) - 24 * exit;
  return (
    <span style={{
      display: 'inline-block', fontSize: size, fontWeight: weight, color, lineHeight: 1,
      transform: `translateY(${y}px)`, opacity: clamp01((f - start) / 5) * (1 - exit),
    }}>{children}</span>
  );
};

const row = (centreY: number, size: number): React.CSSProperties => ({
  position: 'absolute', left: 0, width: 1920, top: centreY - size / 2, height: size,
  display: 'flex', justifyContent: 'center', gap: '0.28em',
  fontFamily: FONT, fontSize: size, lineHeight: 1, letterSpacing: '-0.02em', whiteSpace: 'nowrap',
});

export const Hello = () => {
  useFonts();
  const f = useCurrentFrame();

  // Beat 1 card, Beat 2 morph to pill
  const enter = S(f - 6);
  const m = easeInOutCubic(clamp01((f - 54) / 24));
  const w = lerp(880, 960, m);
  const h = lerp(520, 180, m);
  const radius = Math.min(lerp(44, 90, m), h / 2);

  // Exit of headline and line
  const exit1 = easeInCubic(clamp01((f - 50) / 8));
  const exit2 = easeInCubic(clamp01((f - 52) / 8));
  const lineLen = 480 * easeOutCubic(clamp01((f - 22) / 18));

  return (
    <AbsoluteFill style={{background: GROUND}}>
      <AbsoluteFill style={{transform: `scale(${cameraScale(f)})`, transformOrigin: '960px 540px'}}>
        <div style={{
          position: 'absolute', left: 960 - w / 2, top: 540 - h / 2, width: w, height: h,
          boxSizing: 'border-box', background: SURFACE, border: `2px solid ${BORDER}`, borderRadius: radius,
          transform: `translateY(${60 * (1 - enter)}px) scale(${0.86 + 0.14 * enter})`,
          opacity: clamp01((f - 6) / 6),
        }} />

        <div style={{...row(520, 132), fontWeight: 700}}>
          <Word f={f} start={14} size={132} weight={700} color={TEXT} rise={56} exit={exit1}>Motion,</Word>
          <Word f={f} start={19} size={132} weight={700} color={ACCENT} rise={56} exit={exit2}>directed.</Word>
        </div>

        {lineLen > 0 && (
          <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, opacity: 1 - exit1, transform: `translateY(${-24 * exit1}px)`}}>
            <line x1={720} y1={700} x2={720 + lineLen} y2={700} stroke={ACCENT} strokeWidth={4} strokeLinecap="round" />
          </svg>
        )}

        <div style={{...row(540, 72), fontWeight: 600}}>
          <Word f={f} start={72} size={72} weight={600} color={TEXT} rise={40}>Straight</Word>
          <Word f={f} start={76} size={72} weight={600} color={TEXT} rise={40}>to</Word>
          <Word f={f} start={80} size={72} weight={600} color={ACCENT} rise={40}>mp4.</Word>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

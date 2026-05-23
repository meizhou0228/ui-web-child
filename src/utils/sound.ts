/**
 * Tiny audio playback helper. Files live in /public/assets/audio/.
 * Soft-fails silently if file missing or user has muted browser.
 *
 * Sounds (mp3):
 *   click       — short button feedback
 *   ding        — successful check-in
 *   cheer       — encouragement
 *   milestone   — long badge unlock fanfare
 *   chest-open  — redemption chest opening
 *   success     — generic success
 */
export type SoundName =
  | 'click'
  | 'ding'
  | 'cheer'
  | 'milestone'
  | 'chest-open'
  | 'success';

const CACHE = new Map<SoundName, HTMLAudioElement>();

function get(name: SoundName): HTMLAudioElement {
  let el = CACHE.get(name);
  if (!el) {
    el = new Audio(`/assets/audio/${name}.mp3`);
    el.preload = 'auto';
    el.volume = 0.55;
    CACHE.set(name, el);
  }
  return el;
}

const KEY = 'ui-web-child:sound-on';

export function isSoundOn(): boolean {
  if (typeof localStorage === 'undefined') return true;
  return localStorage.getItem(KEY) !== '0';
}

export function setSoundOn(on: boolean) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(KEY, on ? '1' : '0');
}

export function play(name: SoundName) {
  if (!isSoundOn()) return;
  try {
    const el = get(name);
    el.currentTime = 0;
    el.play().catch(() => {/* browsers block autoplay until interaction; ignore */});
  } catch {
    // ignore
  }
}

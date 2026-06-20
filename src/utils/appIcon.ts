/** Solid background behind the avatar; matches manifest background_color. */
export const ICON_BG = '#FEF3C7';
/** Avatar occupies this fraction of the canvas (keeps it inside the maskable safe zone). */
const SAFE_RATIO = 0.64;

/**
 * Draw the avatar centered on a solid background and return a PNG data URL.
 * Returns '' when a 2D context is unavailable (non-browser env).
 */
export function composeIcon(img: HTMLImageElement, size: number, bg: string = ICON_BG): string {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);
  const inner = size * SAFE_RATIO;
  const offset = (size - inner) / 2;
  ctx.drawImage(img, offset, offset, inner, inner);
  return canvas.toDataURL('image/png');
}

/** Build the web-manifest object with the given icon data URLs. Pure. */
export function buildIconManifest(icon192: string, icon512: string): object {
  return {
    name: '宝宝积分小屋',
    short_name: '积分小屋',
    description: '给大班宝宝使用的离线习惯打分和奖励小应用。',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#FEF3C7',
    theme_color: '#7DD3FC',
    lang: 'zh-CN',
    icons: [
      { src: icon192, sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
      { src: icon512, sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
    ],
  };
}

/** Point the manifest + apple-touch-icon links at the generated icons. */
export function applyAppIcon(opts: { manifestUrl: string; appleTouchUrl: string }): void {
  const manifest = document.querySelector('link[rel="manifest"]');
  if (manifest) manifest.setAttribute('href', opts.manifestUrl);

  let apple = document.querySelector('link[rel="apple-touch-icon"]');
  if (!apple) {
    apple = document.createElement('link');
    apple.setAttribute('rel', 'apple-touch-icon');
    document.head.appendChild(apple);
  }
  apple.setAttribute('href', opts.appleTouchUrl);
}

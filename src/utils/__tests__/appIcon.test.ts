import { describe, it, expect, beforeEach } from 'vitest';
import { buildIconManifest, applyAppIcon } from '@/utils/appIcon';

describe('buildIconManifest', () => {
  it('embeds the given icon data URLs with maskable purpose', () => {
    const m = buildIconManifest('data:image/png;base64,AAA', 'data:image/png;base64,BBB') as {
      name: string;
      icons: { src: string; sizes: string; type: string; purpose: string }[];
    };
    expect(m.name).toBe('宝宝积分小屋');
    expect(m.icons).toHaveLength(2);
    expect(m.icons[0]).toEqual({
      src: 'data:image/png;base64,AAA', sizes: '192x192', type: 'image/png', purpose: 'any maskable',
    });
    expect(m.icons[1]).toEqual({
      src: 'data:image/png;base64,BBB', sizes: '512x512', type: 'image/png', purpose: 'any maskable',
    });
  });
});

describe('applyAppIcon', () => {
  beforeEach(() => {
    document.head.innerHTML = '<link rel="manifest" href="/manifest.webmanifest" />';
  });

  it('swaps the manifest href and creates the apple-touch-icon link', () => {
    applyAppIcon({ manifestUrl: 'blob:fake-manifest', appleTouchUrl: 'data:image/png;base64,CCC' });

    const manifest = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
    const apple = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement;
    expect(manifest.getAttribute('href')).toBe('blob:fake-manifest');
    expect(apple).not.toBeNull();
    expect(apple.getAttribute('href')).toBe('data:image/png;base64,CCC');
  });

  it('reuses an existing apple-touch-icon link', () => {
    document.head.innerHTML +=
      '<link rel="apple-touch-icon" href="/pwa-icons/apple-touch-icon.png" />';
    applyAppIcon({ manifestUrl: 'blob:m2', appleTouchUrl: 'data:image/png;base64,DDD' });
    const apples = document.querySelectorAll('link[rel="apple-touch-icon"]');
    expect(apples).toHaveLength(1);
    expect((apples[0] as HTMLLinkElement).getAttribute('href')).toBe('data:image/png;base64,DDD');
  });
});

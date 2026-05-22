import type { Category } from '@/types';

export const PRESET_CATEGORIES: Category[] = [
  { id: 'study', name: '学习', icon: 'study', color: 'sky',     accentColor: '#7DD3FC' },
  { id: 'life',  name: '生活', icon: 'life',  color: 'amber',   accentColor: '#FCD34D' },
  { id: 'sport', name: '运动', icon: 'sport', color: 'emerald', accentColor: '#A7F3D0' },
];

export function findCategory(id: string): Category | undefined {
  return PRESET_CATEGORIES.find((c) => c.id === id);
}

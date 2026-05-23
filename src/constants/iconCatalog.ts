export const ICON_CATALOG = {
  task: [
    'book-open', 'input-numbers', 'pencil', 'books', 'abc', 'memo',
    'sunrise', 'shirt', 'toothbrush', 'bowl-of-food', 'teddy-bear',
    'broom', 'mobile-phone', 'soap', 'sleeping-face',
    'jumping-rope', 'runner', 'flexed-biceps',
    'closed-book', 'mountain', 'trophy',
    'piano', 'guitar', 'paint-brush', 'puzzle',
  ],
  reward: [
    'tv', 'strawberry', 'sticker', 'game-dice', 'bento', 'moon',
    'gift', 'lego', 'movie', 'roller', 'sparkles', 'candy', 'ice-cream',
  ],
  milestone: [
    'rising-star', 'shooting-star', 'medal', 'trophy', 'crown', 'diamond',
  ],
  category: ['study', 'life', 'sport'],
  child: ['bear', 'fox', 'rabbit', 'dinosaur', 'panda', 'unicorn'],
} as const;

export type IconType = keyof typeof ICON_CATALOG;

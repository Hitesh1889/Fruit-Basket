import { FruitType } from './types';

export const BASKET_CAPACITY = 4;

export const FRUIT_CONFIG: Record<FruitType, { emoji: string; color: string; bg: string }> = {
  [FruitType.STRAWBERRY]: { emoji: '🍓', color: '#ef4444', bg: 'bg-red-100' },
  [FruitType.APPLE]: { emoji: '🍎', color: '#dc2626', bg: 'bg-red-50' },
  [FruitType.ORANGE]: { emoji: '🍊', color: '#f97316', bg: 'bg-orange-100' },
  [FruitType.BANANA]: { emoji: '🍌', color: '#eab308', bg: 'bg-yellow-100' },
  [FruitType.GRAPE]: { emoji: '🍇', color: '#9333ea', bg: 'bg-purple-100' },
  [FruitType.BLUEBERRY]: { emoji: '🫐', color: '#2563eb', bg: 'bg-blue-100' },
  [FruitType.KIWI]: { emoji: '🥝', color: '#65a30d', bg: 'bg-lime-100' },
  [FruitType.PEACH]: { emoji: '🍑', color: '#f43f5e', bg: 'bg-rose-100' },
};

export const LEVELS = [
  { level: 1, baskets: 4, empty: 1, types: 3 }, // Start with 3 fruit types, 4 baskets total
  { level: 2, baskets: 5, empty: 2, types: 3 },
  { level: 3, baskets: 6, empty: 2, types: 4 },
  { level: 4, baskets: 7, empty: 2, types: 5 },
  { level: 5, baskets: 8, empty: 2, types: 6 },
  { level: 6, baskets: 9, empty: 3, types: 6 },
  { level: 7, baskets: 10, empty: 3, types: 7 },
  { level: 8, baskets: 11, empty: 3, types: 8 },
];
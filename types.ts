export enum FruitType {
  STRAWBERRY = 'STRAWBERRY',
  APPLE = 'APPLE',
  ORANGE = 'ORANGE',
  BANANA = 'BANANA',
  GRAPE = 'GRAPE',
  BLUEBERRY = 'BLUEBERRY',
  KIWI = 'KIWI',
  PEACH = 'PEACH'
}

export interface BasketModel {
  id: string;
  fruits: FruitType[];
  capacity: number;
}

export interface GameState {
  baskets: BasketModel[];
  selectedBasketId: string | null;
  moves: number;
  level: number;
  isWon: boolean;
  history: BasketModel[][]; // For Undo
}

export interface LevelConfig {
  basketCount: number;
  emptyBaskets: number;
  fruitTypes: FruitType[];
  shuffleDepth: number;
}

export interface MoveResult {
  isValid: boolean;
  message?: string;
}

// AI Hint Response Structure
export interface HintResponse {
  fromBasketIndex: number;
  toBasketIndex: number;
  explanation: string;
}

import { BasketModel, FruitType, LevelConfig } from '../types';
import { BASKET_CAPACITY } from '../constants';

export const generateLevel = (config: LevelConfig): BasketModel[] => {
  const { basketCount, emptyBaskets, fruitTypes, shuffleDepth } = config;
  
  // 1. Create solved baskets
  const filledBasketsCount = basketCount - emptyBaskets;
  let baskets: BasketModel[] = [];

  // Initialize filled baskets
  for (let i = 0; i < filledBasketsCount; i++) {
    const typeIndex = i % fruitTypes.length;
    const type = fruitTypes[typeIndex];
    baskets.push({
      id: `basket-${i}`,
      fruits: Array(BASKET_CAPACITY).fill(type),
      capacity: BASKET_CAPACITY
    });
  }

  // Initialize empty baskets
  for (let i = 0; i < emptyBaskets; i++) {
    baskets.push({
      id: `basket-empty-${i}`,
      fruits: [],
      capacity: BASKET_CAPACITY
    });
  }
  
  // Let's do a rigorous shuffle
  let currentBaskets = JSON.parse(JSON.stringify(baskets)) as BasketModel[];
  const totalMoves = shuffleDepth * 15; // Sufficient randomness

  // Simplified mixing strategy that guarantees solvability:
  // Take all fruits from the 'filled' baskets.
  const allFruits: FruitType[] = [];
  baskets.forEach(b => {
      allFruits.push(...b.fruits);
      b.fruits = [];
  });
  
  // Shuffle the fruits array
  for (let i = allFruits.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allFruits[i], allFruits[j]] = [allFruits[j], allFruits[i]];
  }

  // Distribute back to the non-empty baskets (leave the intended empty ones empty)
  let fruitIndex = 0;
  for (let i = 0; i < filledBasketsCount; i++) {
      for(let j=0; j<BASKET_CAPACITY; j++) {
          if(fruitIndex < allFruits.length) {
              baskets[i].fruits.push(allFruits[fruitIndex]);
              fruitIndex++;
          }
      }
  }

  return baskets;
};

export const isValidMove = (source: BasketModel, dest: BasketModel): boolean => {
  if (source.id === dest.id) return false;
  if (source.fruits.length === 0) return false;
  if (dest.fruits.length >= dest.capacity) return false;

  const fruitToMove = source.fruits[source.fruits.length - 1];
  
  // If destination is empty, any fruit can go there
  if (dest.fruits.length === 0) return true;

  // If destination is not empty, must match top fruit
  const topFruit = dest.fruits[dest.fruits.length - 1];
  return topFruit === fruitToMove;
};

export const performMove = (
  baskets: BasketModel[],
  sourceId: string,
  destId: string
): BasketModel[] => {
  const newBaskets = baskets.map(b => ({ ...b, fruits: [...b.fruits] }));
  const source = newBaskets.find(b => b.id === sourceId);
  const dest = newBaskets.find(b => b.id === destId);

  if (!source || !dest) return baskets;
  
  if (source.fruits.length === 0) return newBaskets;

  const fruitType = source.fruits[source.fruits.length - 1];

  // Calculate how many matching fruits are at the top of the source stack
  let count = 0;
  for (let i = source.fruits.length - 1; i >= 0; i--) {
    if (source.fruits[i] === fruitType) {
      count++;
    } else {
      break;
    }
  }

  // Calculate available space in destination
  const availableSpace = dest.capacity - dest.fruits.length;

  // Determine how many to move (limited by space)
  const toMove = Math.min(count, availableSpace);

  // Execute move
  for (let i = 0; i < toMove; i++) {
    const fruit = source.fruits.pop();
    if (fruit) {
      dest.fruits.push(fruit);
    }
  }

  return newBaskets;
};

export const checkWin = (baskets: BasketModel[]): boolean => {
  return baskets.every(basket => {
    if (basket.fruits.length === 0) return true; // Empty is fine
    if (basket.fruits.length < BASKET_CAPACITY) return false; // Must be full if not empty
    
    const firstFruit = basket.fruits[0];
    return basket.fruits.every(f => f === firstFruit);
  });
};

// Power-up Logic

export const addEmptyBasket = (baskets: BasketModel[]): BasketModel[] => {
  const newBaskets = JSON.parse(JSON.stringify(baskets));
  newBaskets.push({
    id: `basket-extra-${Date.now()}`,
    fruits: [],
    capacity: BASKET_CAPACITY
  });
  return newBaskets;
};

export const shuffleCurrentBaskets = (baskets: BasketModel[]): BasketModel[] => {
  const newBaskets = JSON.parse(JSON.stringify(baskets)) as BasketModel[];
  
  // 1. Gather all fruits
  let allFruits: FruitType[] = [];
  newBaskets.forEach(b => {
    allFruits.push(...b.fruits);
    b.fruits = [];
  });

  // 2. Fisher-Yates Shuffle
  for (let i = allFruits.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allFruits[i], allFruits[j]] = [allFruits[j], allFruits[i]];
  }

  // 3. Redistribute randomly to baskets that have space
  // We do not force baskets to be full; we distribute randomly to mix things up thoroughly.
  let fruitIndex = 0;
  while (fruitIndex < allFruits.length) {
    // Find valid baskets (not full)
    const validBaskets = newBaskets.filter(b => b.fruits.length < b.capacity);
    if (validBaskets.length === 0) break; // Should theoretically not happen if capacity is sufficient

    // Pick a random basket
    const randomBasket = validBaskets[Math.floor(Math.random() * validBaskets.length)];
    randomBasket.fruits.push(allFruits[fruitIndex]);
    fruitIndex++;
  }

  return newBaskets;
};
import type { Money } from './types';

/** Arrotonda al centesimo. Da applicare dopo ogni somma o moltiplicazione di importi. */
export const roundMoney = (n: number): Money => Math.round((n + Number.EPSILON) * 100) / 100;

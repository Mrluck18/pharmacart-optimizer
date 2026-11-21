import type { Order, OrderLine, Pharmacy } from '@pharmacart/shared';
import { calculateOrderCost } from './order-cost';

/** Assembla l'ordine presso una farmacia: righe, subtotale, spedizione e totale. */
export const buildOrder = (pharmacy: Pharmacy, lines: readonly OrderLine[]): Order => ({
  pharmacyId: pharmacy.id,
  pharmacyName: pharmacy.name,
  lines: [...lines],
  ...calculateOrderCost(lines, pharmacy),
});

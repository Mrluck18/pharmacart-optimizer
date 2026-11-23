import { roundMoney } from '@pharmacart/shared';
import type { CartItem, CartSolution, Offer, OrderLine, Pharmacy } from '@pharmacart/shared';
import { buildOrder } from './build-order';
import { indexAvailableOffers, type OfferIndex } from './offer-index';

export const DEFAULT_MAX_ORDERS = 2;

export interface SplitOptions {
  /** Numero massimo di ordini (farmacie) su cui dividere l'acquisto. Default 2. */
  maxOrders?: number;
}

/** Una farmacia che può soddisfare un item, con la riga d'ordine già prezzata. */
interface Choice {
  pharmacy: Pharmacy;
  line: OrderLine;
}

const compareById = (a: Pharmacy, b: Pharmacy): number => {
  if (a.id === b.id) {
    return 0;
  }

  return a.id < b.id ? -1 : 1;
};

const candidatesFor = (
  item: CartItem,
  pharmacies: readonly Pharmacy[],
  offerIndex: OfferIndex,
): Choice[] => {
  const choices: Choice[] = [];

  for (const pharmacy of pharmacies) {
    const line = offerIndex.lineFor(item, pharmacy.id);
    if (line !== undefined) {
      choices.push({ pharmacy, line });
    }
  }

  return choices;
};

const countOrders = (picked: readonly Choice[]): number =>
  new Set(picked.map((choice) => choice.pharmacy.id)).size;

/** Raggruppa le scelte per farmacia e calcola costo di ogni ordine e totale. */
const toSolution = (picked: readonly Choice[]): CartSolution => {
  const groups = new Map<string, { pharmacy: Pharmacy; lines: OrderLine[] }>();

  for (const { pharmacy, line } of picked) {
    const group = groups.get(pharmacy.id) ?? { pharmacy, lines: [] };
    group.lines.push(line);
    groups.set(pharmacy.id, group);
  }

  const orders = [...groups.values()].map(({ pharmacy, lines }) => buildOrder(pharmacy, lines));
  const total = roundMoney(orders.reduce((sum, order) => sum + order.total, 0));

  return { orders, total };
};

/** Meno spesa, a parità meno ordini. Un pareggio completo mantiene la soluzione già trovata. */
const isBetter = (candidate: CartSolution, current: CartSolution | undefined): boolean =>
  current === undefined ||
  candidate.total < current.total ||
  (candidate.total === current.total && candidate.orders.length < current.orders.length);

/**
 * Migliore suddivisione del carrello su più farmacie, con al massimo `maxOrders` ordini.
 *
 * Ricerca esaustiva: prova ogni assegnazione prodotto -> farmacia (al più P^N casi, con P
 * farmacie e N prodotti: 81 per 3 farmacie e 4 prodotti), quindi il risultato è ottimo.
 * Comprende anche l'acquisto in una sola farmacia, perciò non costa mai più della farmacia
 * singola migliore. Restituisce null se il carrello è vuoto, se un prodotto non ha offerte
 * disponibili o se nessuna soluzione rispetta `maxOrders`.
 *
 * Deterministica: le farmacie sono esplorate per id crescente e un pareggio completo
 * mantiene la prima soluzione trovata.
 */
export const findBestSplit = (
  items: readonly CartItem[],
  offers: readonly Offer[],
  pharmacies: readonly Pharmacy[],
  options: SplitOptions = {},
): CartSolution | null => {
  if (items.length === 0) {
    return null;
  }

  const maxOrders = options.maxOrders ?? DEFAULT_MAX_ORDERS;
  const offerIndex = indexAvailableOffers(offers);
  const sortedPharmacies = [...pharmacies].sort(compareById);
  const candidates = items.map((item) => candidatesFor(item, sortedPharmacies, offerIndex));

  if (candidates.some((choices) => choices.length === 0)) {
    return null;
  }

  const search = (picked: readonly Choice[]): CartSolution | undefined => {
    const choices = candidates[picked.length];
    if (choices === undefined) {
      return toSolution(picked);
    }

    let best: CartSolution | undefined;

    for (const choice of choices) {
      const extended = [...picked, choice];
      if (countOrders(extended) > maxOrders) {
        continue;
      }

      const solution = search(extended);
      if (solution !== undefined && isBetter(solution, best)) {
        best = solution;
      }
    }

    return best;
  };

  return search([]) ?? null;
};

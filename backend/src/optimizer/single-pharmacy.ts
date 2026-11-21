import type { CartItem, CartSolution, Offer, Order, OrderLine, Pharmacy } from '@pharmacart/shared';
import { buildOrder } from './build-order';

const offerKey = (pharmacyId: string, productId: string) => `${pharmacyId}:${productId}`;

const indexAvailableOffers = (offers: readonly Offer[]): Map<string, Offer> => {
  const index = new Map<string, Offer>();

  for (const offer of offers) {
    if (offer.available) {
      index.set(offerKey(offer.pharmacyId, offer.productId), offer);
    }
  }

  return index;
};

/** Righe d'ordine per una farmacia, o null se non ha disponibili tutti i prodotti. */
const buildLines = (
  items: readonly CartItem[],
  pharmacyId: string,
  offerIndex: ReadonlyMap<string, Offer>,
): OrderLine[] | null => {
  const lines: OrderLine[] = [];

  for (const item of items) {
    const offer = offerIndex.get(offerKey(pharmacyId, item.productId));
    if (offer === undefined) {
      return null;
    }

    lines.push({
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: offer.price,
      url: offer.url,
    });
  }

  return lines;
};

/** A parità di totale vince l'id farmacia minore: il risultato non dipende dall'input. */
const isBetter = (candidate: Order, current: Order | undefined): boolean =>
  current === undefined ||
  candidate.total < current.total ||
  (candidate.total === current.total && candidate.pharmacyId < current.pharmacyId);

/**
 * Farmacia singola più economica: tra le farmacie che hanno disponibili TUTTI i prodotti
 * del carrello, sceglie quella con il costo totale (prodotti + spedizione) minore.
 * Restituisce null se il carrello è vuoto o se nessuna farmacia copre l'intero carrello.
 *
 * Assume productId distinti negli item e al più un'offerta per coppia (prodotto, farmacia).
 */
export const findBestSinglePharmacy = (
  items: readonly CartItem[],
  offers: readonly Offer[],
  pharmacies: readonly Pharmacy[],
): CartSolution | null => {
  if (items.length === 0) {
    return null;
  }

  const offerIndex = indexAvailableOffers(offers);
  let best: Order | undefined;

  for (const pharmacy of pharmacies) {
    const lines = buildLines(items, pharmacy.id, offerIndex);
    if (lines === null) {
      continue;
    }

    const order = buildOrder(pharmacy, lines);
    if (isBetter(order, best)) {
      best = order;
    }
  }

  return best === undefined ? null : { orders: [best], total: best.total };
};

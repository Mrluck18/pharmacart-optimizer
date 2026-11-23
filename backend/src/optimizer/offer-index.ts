import type { CartItem, Offer, OrderLine } from '@pharmacart/shared';

export interface OfferIndex {
  /** Riga d'ordine prezzata, o undefined se la farmacia non ha l'offerta disponibile. */
  lineFor(item: CartItem, pharmacyId: string): OrderLine | undefined;
}

const keyOf = (pharmacyId: string, productId: string) => `${pharmacyId}:${productId}`;

/** Indicizza le sole offerte disponibili per coppia (farmacia, prodotto). */
export const indexAvailableOffers = (offers: readonly Offer[]): OfferIndex => {
  const byKey = new Map<string, Offer>();

  for (const offer of offers) {
    if (offer.available) {
      byKey.set(keyOf(offer.pharmacyId, offer.productId), offer);
    }
  }

  return {
    lineFor: (item, pharmacyId) => {
      const offer = byKey.get(keyOf(pharmacyId, item.productId));
      if (offer === undefined) {
        return undefined;
      }

      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: offer.price,
        url: offer.url,
      };
    },
  };
};

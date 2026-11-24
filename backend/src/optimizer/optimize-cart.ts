import { roundMoney } from '@pharmacart/shared';
import type {
  CartItem,
  CartSolution,
  Offer,
  OptimizationResult,
  Pharmacy,
  Savings,
} from '@pharmacart/shared';
import { indexAvailableOffers, type OfferIndex } from './offer-index';
import { findBestSinglePharmacy } from './single-pharmacy';
import { findBestSplit, type SplitOptions } from './split';

/** Vero se almeno una delle farmacie ha l'item disponibile. */
const hasOffer = (item: CartItem, pharmacies: readonly Pharmacy[], index: OfferIndex): boolean =>
  pharmacies.some((pharmacy) => index.lineFor(item, pharmacy.id) !== undefined);

/** Risparmio dello split rispetto alla farmacia singola; null se manca uno dei due. */
const calculateSavings = (
  single: CartSolution | null,
  split: CartSolution | null,
): Savings | null => {
  if (single === null || split === null) {
    return null;
  }

  const amount = roundMoney(single.total - split.total);
  const percent = single.total > 0 ? Math.round((amount / single.total) * 1000) / 10 : 0;

  return { amount, percent };
};

/**
 * Calcola le due opzioni d'acquisto per un carrello: la farmacia singola più economica e la
 * migliore suddivisione su più farmacie, con il risparmio dell'una sull'altra.
 *
 * I prodotti che nessuna farmacia ha disponibile non bloccano il calcolo: vengono elencati in
 * `unavailable` e le due opzioni si calcolano sui prodotti rimanenti.
 */
export const optimizeCart = (
  items: readonly CartItem[],
  offers: readonly Offer[],
  pharmacies: readonly Pharmacy[],
  options: SplitOptions = {},
): OptimizationResult => {
  const offerIndex = indexAvailableOffers(offers);
  const purchasable: CartItem[] = [];
  const unavailable: string[] = [];

  for (const item of items) {
    if (hasOffer(item, pharmacies, offerIndex)) {
      purchasable.push(item);
    } else {
      unavailable.push(item.productId);
    }
  }

  const single = findBestSinglePharmacy(purchasable, offers, pharmacies);
  const split = findBestSplit(purchasable, offers, pharmacies, options);

  return { single, split, savings: calculateSavings(single, split), unavailable };
};

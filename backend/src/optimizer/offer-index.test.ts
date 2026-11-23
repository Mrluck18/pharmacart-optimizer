import { describe, expect, it } from '@jest/globals';
import { item, offer, offers } from './fixtures';
import { indexAvailableOffers } from './offer-index';

describe('indexAvailableOffers', () => {
  it('restituisce la riga prezzata per l’item presso la farmacia', () => {
    const index = indexAvailableOffers(offers);

    expect(index.lineFor(item('whey', 2), 'efarma')).toEqual({
      productId: 'whey',
      quantity: 2,
      unitPrice: 29.5,
      url: 'https://efarma.example/p/whey',
    });
  });

  it('restituisce undefined se la farmacia non ha l’offerta', () => {
    const index = indexAvailableOffers(offers);

    expect(index.lineFor(item('whey'), 'altra-farmacia')).toBeUndefined();
    expect(index.lineFor(item('omega3'), 'redcare')).toBeUndefined();
  });

  it('ignora le offerte non disponibili', () => {
    const soldOut = { ...offer('redcare', 'whey', 36.9), available: false };
    const index = indexAvailableOffers([soldOut]);

    expect(index.lineFor(item('whey'), 'redcare')).toBeUndefined();
  });
});

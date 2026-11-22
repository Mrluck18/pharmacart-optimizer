import { describe, expect, it } from '@jest/globals';
import type { CartSolution, Pharmacy } from '@pharmacart/shared';
import {
  eFarma,
  fullCart,
  item,
  loreto,
  offer,
  offers,
  pharmacies,
  redcare,
  without,
} from './fixtures';
import { findBestSinglePharmacy } from './single-pharmacy';

const chosenPharmacy = (solution: CartSolution | null) => solution?.orders[0]?.pharmacyId;

describe('findBestSinglePharmacy', () => {
  it('sceglie la farmacia singola più economica', () => {
    expect(findBestSinglePharmacy(fullCart, offers, pharmacies)).toEqual({
      total: 61.3,
      orders: [
        {
          pharmacyId: 'redcare',
          pharmacyName: 'Redcare',
          lines: [
            {
              productId: 'whey',
              quantity: 1,
              unitPrice: 36.9,
              url: 'https://redcare.example/p/whey',
            },
            {
              productId: 'creatina',
              quantity: 1,
              unitPrice: 12.9,
              url: 'https://redcare.example/p/creatina',
            },
            {
              productId: 'magnesio',
              quantity: 1,
              unitPrice: 11.5,
              url: 'https://redcare.example/p/magnesio',
            },
          ],
          subtotal: 61.3,
          shipping: 0,
          total: 61.3,
        },
      ],
    });
  });

  it('preferisce la spedizione gratuita a un subtotale più basso', () => {
    // Loreto ha il subtotale minore (46,00 contro 48,40) ma paga 5,50 di spedizione
    const cart = [item('whey'), item('magnesio')];
    const result = findBestSinglePharmacy(cart, offers, [loreto, redcare]);

    expect(chosenPharmacy(result)).toBe('redcare');
    expect(result?.total).toBe(48.4);
  });

  it('applica la quantità richiesta', () => {
    const result = findBestSinglePharmacy([item('whey', 2)], offers, [eFarma]);

    expect(result?.total).toBe(59);
    expect(result?.orders[0]?.lines[0]?.quantity).toBe(2);
  });

  it('esclude le farmacie che non hanno tutti i prodotti', () => {
    const catalog = without(offers, 'redcare', 'magnesio');
    const cart = [item('creatina'), item('magnesio')];
    const result = findBestSinglePharmacy(cart, catalog, pharmacies);

    expect(chosenPharmacy(result)).toBe('efarma');
    expect(result?.total).toBe(33.4);
  });

  it('ignora le offerte non disponibili', () => {
    const soldOut = { ...offer('redcare', 'whey', 36.9), available: false };
    const catalog = [...without(offers, 'redcare', 'whey'), soldOut];
    const result = findBestSinglePharmacy(fullCart, catalog, pharmacies);

    expect(chosenPharmacy(result)).toBe('loreto');
    expect(result?.total).toBe(62);
  });

  it('restituisce null se nessuna farmacia copre l’intero carrello', () => {
    const cart = [...fullCart, item('omega3')];

    expect(findBestSinglePharmacy(cart, offers, pharmacies)).toBeNull();
  });

  it('restituisce null per un carrello vuoto', () => {
    expect(findBestSinglePharmacy([], offers, pharmacies)).toBeNull();
  });

  it('a parità di totale sceglie l’id minore, a prescindere dall’input', () => {
    const alpha: Pharmacy = { ...redcare, id: 'alpha', name: 'Alpha' };
    const beta: Pharmacy = { ...redcare, id: 'beta', name: 'Beta' };
    const tied = [offer('alpha', 'whey', 30), offer('beta', 'whey', 30)];
    const wheyOnly = [item('whey')];

    const betaFirst = findBestSinglePharmacy(wheyOnly, tied, [beta, alpha]);
    const alphaFirst = findBestSinglePharmacy(wheyOnly, tied, [alpha, beta]);

    expect(chosenPharmacy(betaFirst)).toBe('alpha');
    expect(chosenPharmacy(alphaFirst)).toBe('alpha');
  });
});

import { describe, expect, it } from '@jest/globals';
import type { Offer } from '@pharmacart/shared';
import { fullCart, item, offer, offers, pharmacies } from './fixtures';
import { optimizeCart } from './optimize-cart';

const soldOutProduct = (productId: string): Offer[] =>
  offers.map((o) => (o.productId === productId ? { ...o, available: false } : o));

describe('optimizeCart', () => {
  it('restituisce farmacia singola, split e risparmio', () => {
    const result = optimizeCart(fullCart, offers, pharmacies);

    expect(result.single?.total).toBe(61.3);
    expect(result.split?.total).toBe(58.8);
    expect(result.savings).toEqual({ amount: 2.5, percent: 4.1 });
    expect(result.unavailable).toEqual([]);
  });

  it('indica risparmio zero quando lo split coincide con la farmacia singola', () => {
    const cart = [item('creatina'), item('magnesio')];
    const result = optimizeCart(cart, offers, pharmacies);

    expect(result.single?.total).toBe(29.3);
    expect(result.split?.total).toBe(29.3);
    expect(result.savings).toEqual({ amount: 0, percent: 0 });
  });

  it('esclude i prodotti senza offerte e calcola sul resto', () => {
    const result = optimizeCart([...fullCart, item('omega3')], offers, pharmacies);

    expect(result.unavailable).toEqual(['omega3']);
    expect(result.single?.total).toBe(61.3);
    expect(result.split?.total).toBe(58.8);
  });

  it('considera non disponibile un prodotto con tutte le offerte esaurite', () => {
    const result = optimizeCart(fullCart, soldOutProduct('whey'), pharmacies);

    expect(result.unavailable).toEqual(['whey']);
    expect(result.single?.total).toBe(29.3);
  });

  it('ignora le offerte di farmacie sconosciute', () => {
    const catalog = [...offers, offer('ghost', 'omega3', 5)];
    const result = optimizeCart([...fullCart, item('omega3')], catalog, pharmacies);

    expect(result.unavailable).toEqual(['omega3']);
  });

  it('restituisce solo lo split quando nessuna farmacia ha tutto il carrello', () => {
    const catalog = [offer('efarma', 'whey', 29.5), offer('redcare', 'creatina', 12.9)];
    const result = optimizeCart([item('whey'), item('creatina')], catalog, pharmacies);

    expect(result.single).toBeNull();
    expect(result.split?.total).toBe(47.3);
    expect(result.savings).toBeNull();
  });

  it('applica maxOrders allo split', () => {
    const result = optimizeCart(fullCart, offers, pharmacies, { maxOrders: 1 });

    expect(result.split?.total).toBe(61.3);
    expect(result.savings).toEqual({ amount: 0, percent: 0 });
  });

  it('mantiene la farmacia singola quando maxOrders non consente alcuno split', () => {
    const result = optimizeCart(fullCart, offers, pharmacies, { maxOrders: 0 });

    expect(result.single?.total).toBe(61.3);
    expect(result.split).toBeNull();
    expect(result.savings).toBeNull();
  });

  it('restituisce solo prodotti non disponibili se nulla è acquistabile', () => {
    expect(optimizeCart([item('omega3')], offers, pharmacies)).toEqual({
      single: null,
      split: null,
      savings: null,
      unavailable: ['omega3'],
    });
  });

  it('gestisce un carrello vuoto', () => {
    expect(optimizeCart([], offers, pharmacies)).toEqual({
      single: null,
      split: null,
      savings: null,
      unavailable: [],
    });
  });
});

import { describe, expect, it } from '@jest/globals';
import { calculateOrderCost } from './order-cost';

const redcare = { shippingCost: 4.9, freeShippingThreshold: 39 };
const eFarma = { shippingCost: 3.9, freeShippingThreshold: 29 };

const line = (unitPrice: number, quantity = 1) => ({ unitPrice, quantity });

describe('calculateOrderCost', () => {
  it('aggiunge la spedizione quando il subtotale è sotto soglia', () => {
    expect(calculateOrderCost([line(12.9), line(11.5)], redcare)).toEqual({
      subtotal: 24.4,
      shipping: 4.9,
      total: 29.3,
    });
  });

  it('non aggiunge la spedizione sopra soglia', () => {
    expect(calculateOrderCost([line(36.9), line(12.9), line(11.5)], redcare)).toEqual({
      subtotal: 61.3,
      shipping: 0,
      total: 61.3,
    });
  });

  it('considera gratuita la spedizione quando il subtotale è esattamente la soglia', () => {
    expect(calculateOrderCost([line(19.5, 2)], redcare)).toEqual({
      subtotal: 39,
      shipping: 0,
      total: 39,
    });
  });

  it('applica la spedizione con un centesimo sotto la soglia', () => {
    expect(calculateOrderCost([line(38.99)], redcare)).toEqual({
      subtotal: 38.99,
      shipping: 4.9,
      total: 43.89,
    });
  });

  it('moltiplica il prezzo per la quantità', () => {
    expect(calculateOrderCost([line(14.9, 2)], eFarma)).toEqual({
      subtotal: 29.8,
      shipping: 0,
      total: 29.8,
    });
  });

  it('confronta la soglia sul subtotale arrotondato', () => {
    // 0.7 + 0.1 vale 0.7999999999999999 in virgola mobile
    const rules = { shippingCost: 3, freeShippingThreshold: 0.8 };

    expect(calculateOrderCost([line(0.7), line(0.1)], rules)).toEqual({
      subtotal: 0.8,
      shipping: 0,
      total: 0.8,
    });
  });

  it('non addebita nulla per un ordine senza righe', () => {
    expect(calculateOrderCost([], redcare)).toEqual({ subtotal: 0, shipping: 0, total: 0 });
  });
});

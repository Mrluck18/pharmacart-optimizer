import { describe, expect, it } from '@jest/globals';
import type { OrderLine } from '@pharmacart/shared';
import { buildOrder } from './build-order';
import { redcare } from './fixtures';

const redcare: Pharmacy = {
  id: 'redcare',
  name: 'Redcare',
  baseUrl: 'https://redcare.example',
  shippingCost: 4.9,
  freeShippingThreshold: 39,
};

const line = (productId: string, unitPrice: number, quantity = 1): OrderLine => ({
  productId,
  quantity,
  unitPrice,
  url: `https://redcare.example/p/${productId}`,
});

describe('buildOrder', () => {
  it('assembla righe, subtotale, spedizione e totale', () => {
    const lines = [line('creatina', 12.9), line('magnesio', 11.5)];

    expect(buildOrder(redcare, lines)).toEqual({
      pharmacyId: 'redcare',
      pharmacyName: 'Redcare',
      lines,
      subtotal: 24.4,
      shipping: 4.9,
      total: 29.3,
    });
  });

  it('non addebita la spedizione quando il subtotale raggiunge la soglia', () => {
    const lines = [line('whey', 36.9), line('creatina', 12.9), line('magnesio', 11.5)];
    const order = buildOrder(redcare, lines);

    expect(order.shipping).toBe(0);
    expect(order.total).toBe(61.3);
  });

  it('non condivide l’array di righe ricevuto in ingresso', () => {
    const lines = [line('creatina', 12.9)];

    expect(buildOrder(redcare, lines).lines).not.toBe(lines);
  });
});

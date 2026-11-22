import type { CartItem, Offer, Pharmacy } from '@pharmacart/shared';

// Dati di esempio condivisi dai test dell'optimizer (stessi prezzi dell'esempio del README).

export const redcare: Pharmacy = {
  id: 'redcare',
  name: 'Redcare',
  baseUrl: 'https://redcare.example',
  shippingCost: 4.9,
  freeShippingThreshold: 39,
};
export const eFarma: Pharmacy = {
  id: 'efarma',
  name: 'eFarma',
  baseUrl: 'https://efarma.example',
  shippingCost: 3.9,
  freeShippingThreshold: 29,
};
export const loreto: Pharmacy = {
  id: 'loreto',
  name: 'Farmacia Loreto',
  baseUrl: 'https://loreto.example',
  shippingCost: 5.5,
  freeShippingThreshold: 49,
};
export const pharmacies = [redcare, eFarma, loreto];

export const offer = (pharmacyId: string, productId: string, price: number): Offer => ({
  productId,
  pharmacyId,
  url: `https://${pharmacyId}.example/p/${productId}`,
  price,
  available: true,
  lastScrapedAt: new Date('2026-10-28T03:00:00Z'),
});

export const offers: Offer[] = [
  offer('redcare', 'whey', 36.9),
  offer('redcare', 'creatina', 12.9),
  offer('redcare', 'magnesio', 11.5),
  offer('efarma', 'whey', 29.5),
  offer('efarma', 'creatina', 17.5),
  offer('efarma', 'magnesio', 15.9),
  offer('loreto', 'whey', 32),
  offer('loreto', 'creatina', 16),
  offer('loreto', 'magnesio', 14),
];

export const without = (all: Offer[], pharmacyId: string, productId: string): Offer[] =>
  all.filter((o) => o.pharmacyId !== pharmacyId || o.productId !== productId);

export const item = (productId: string, quantity = 1): CartItem => ({ productId, quantity });
export const fullCart = [item('whey'), item('creatina'), item('magnesio')];

import { describe, expect, it } from '@jest/globals';
import type { CartSolution, Order, Pharmacy } from '@pharmacart/shared';
import { fullCart, item, offer, offers, pharmacies, redcare, without } from './fixtures';
import { findBestSplit } from './split';

const formatOrder = (order: Order): string =>
  `${order.pharmacyId}: ${order.lines.map((line) => line.productId).join(', ')}`;

const describeOrders = (solution: CartSolution | null) => solution?.orders.map(formatOrder);

// Farmacie con spedizione sempre gratuita: dividere l'acquisto non costa nulla
const freeShipping = (id: string): Pharmacy => ({ ...redcare, id, name: id, shippingCost: 0 });

// Ogni farmacia vende a 10 un solo prodotto e a 20 gli altri
const stores = [freeShipping('a'), freeShipping('b'), freeShipping('c')];
const crossCatalog = [
  offer('a', 'whey', 10),
  offer('a', 'creatina', 20),
  offer('a', 'magnesio', 20),
  offer('b', 'whey', 20),
  offer('b', 'creatina', 10),
  offer('b', 'magnesio', 20),
  offer('c', 'whey', 20),
  offer('c', 'creatina', 20),
  offer('c', 'magnesio', 10),
];

describe('findBestSplit', () => {
  it('divide l’acquisto quando due ordini costano meno di uno', () => {
    const result = findBestSplit(fullCart, offers, pharmacies);

    expect(describeOrders(result)).toEqual(['efarma: whey', 'redcare: creatina, magnesio']);
    expect(result?.total).toBe(58.8);
  });

  it('calcola spedizione e totale di ciascun ordine', () => {
    const result = findBestSplit(fullCart, offers, pharmacies);

    expect(result?.orders.map((order) => order.shipping)).toEqual([0, 4.9]);
    expect(result?.orders.map((order) => order.total)).toEqual([29.5, 29.3]);
  });

  it('restituisce un solo ordine quando la farmacia singola è la scelta migliore', () => {
    const cart = [item('creatina'), item('magnesio')];
    const result = findBestSplit(cart, offers, pharmacies);

    expect(describeOrders(result)).toEqual(['redcare: creatina, magnesio']);
    expect(result?.total).toBe(29.3);
  });

  it('con maxOrders 1 equivale alla farmacia singola', () => {
    const result = findBestSplit(fullCart, offers, pharmacies, { maxOrders: 1 });

    expect(describeOrders(result)).toEqual(['redcare: whey, creatina, magnesio']);
    expect(result?.total).toBe(61.3);
  });

  it('usa al massimo 2 ordini per default', () => {
    const result = findBestSplit(fullCart, crossCatalog, stores);

    expect(result?.orders.length).toBe(2);
    expect(result?.total).toBe(40);
  });

  it('con maxOrders 3 divide su tre farmacie se conviene', () => {
    const result = findBestSplit(fullCart, crossCatalog, stores, { maxOrders: 3 });

    expect(describeOrders(result)).toEqual(['a: whey', 'b: creatina', 'c: magnesio']);
    expect(result?.total).toBe(30);
  });

  it('a parità di totale preferisce meno ordini, poi l’id farmacia minore', () => {
    const twins = [freeShipping('b'), freeShipping('a')];
    const catalog = [
      offer('a', 'whey', 10),
      offer('a', 'creatina', 10),
      offer('b', 'whey', 10),
      offer('b', 'creatina', 10),
    ];
    const result = findBestSplit([item('whey'), item('creatina')], catalog, twins);

    expect(describeOrders(result)).toEqual(['a: whey, creatina']);
  });

  it('non dipende dall’ordine di offerte e farmacie in ingresso', () => {
    const forward = findBestSplit(fullCart, offers, pharmacies);
    const reversed = findBestSplit(fullCart, [...offers].reverse(), [...pharmacies].reverse());

    expect(reversed).toEqual(forward);
  });

  it('ignora le offerte non disponibili', () => {
    const soldOut = { ...offer('efarma', 'whey', 29.5), available: false };
    const catalog = [...without(offers, 'efarma', 'whey'), soldOut];
    const result = findBestSplit(fullCart, catalog, pharmacies);

    expect(describeOrders(result)).toEqual(['redcare: whey, creatina, magnesio']);
    expect(result?.total).toBe(61.3);
  });

  it('applica le quantità richieste', () => {
    const cart = [item('whey', 2), item('creatina')];
    const result = findBestSplit(cart, offers, pharmacies);

    expect(describeOrders(result)).toEqual(['efarma: whey, creatina']);
    expect(result?.total).toBe(76.5);
    expect(result?.orders[0]?.lines[0]?.quantity).toBe(2);
  });

  it('restituisce null per un carrello vuoto', () => {
    expect(findBestSplit([], offers, pharmacies)).toBeNull();
  });

  it('restituisce null se un prodotto non ha offerte disponibili', () => {
    const cart = [...fullCart, item('omega3')];

    expect(findBestSplit(cart, offers, pharmacies)).toBeNull();
  });

  it('restituisce null se maxOrders non consente alcuna soluzione', () => {
    expect(findBestSplit(fullCart, offers, pharmacies, { maxOrders: 0 })).toBeNull();
  });
});

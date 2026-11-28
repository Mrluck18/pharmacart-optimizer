import { describe, expect, it } from '@jest/globals';
import { PharmacyModel } from './pharmacy';
import { invalidPaths } from './test-utils';

const valid = {
  name: 'Redcare',
  baseUrl: 'https://redcare.example',
  shippingCost: 4.9,
  freeShippingThreshold: 39,
};

const paths = (data: Record<string, unknown>) => invalidPaths(new PharmacyModel(data));

describe('PharmacyModel', () => {
  it('accetta una farmacia valida', async () => {
    expect(await paths(valid)).toEqual([]);
  });

  it('richiede tutti i campi', async () => {
    const missing = await paths({});

    expect(missing).toEqual(['baseUrl', 'freeShippingThreshold', 'name', 'shippingCost']);
  });

  it('rifiuta costo di spedizione e soglia negativi', async () => {
    expect(await paths({ ...valid, shippingCost: -1 })).toEqual(['shippingCost']);
    expect(await paths({ ...valid, freeShippingThreshold: -1 })).toEqual([
      'freeShippingThreshold',
    ]);
  });

  it('rimuove gli spazi ai bordi del nome', () => {
    expect(new PharmacyModel({ ...valid, name: '  Redcare ' }).name).toBe('Redcare');
  });

  it('dichiara l’unicità del nome', () => {
    const indexes = PharmacyModel.schema.indexes();

    expect(indexes.some(([fields, options]) => fields.name === 1 && options.unique)).toBe(true);
  });
});

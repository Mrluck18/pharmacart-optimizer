import { describe, expect, it } from '@jest/globals';
import { roundMoney } from './money';

describe('roundMoney', () => {
  it('elimina gli errori di rappresentazione dei float', () => {
    expect(roundMoney(0.1 + 0.2)).toBe(0.3);
    expect(roundMoney(24.4 + 4.9)).toBe(29.3);
    expect(roundMoney(36.9 + 12.9 + 11.5)).toBe(61.3);
  });

  it('arrotonda al centesimo', () => {
    expect(roundMoney(2.344)).toBe(2.34);
    expect(roundMoney(2.346)).toBe(2.35);
    expect(roundMoney(1.005)).toBe(1.01);
  });

  it('lascia invariati i valori già a due decimali', () => {
    expect(roundMoney(12.9)).toBe(12.9);
    expect(roundMoney(0)).toBe(0);
  });

  it('rende affidabile il confronto con la soglia di spedizione gratuita', () => {
    const threshold = 0.8;
    // 0.7 + 0.1 vale 0.7999999999999999: senza arrotondamento la soglia non risulterebbe raggiunta
    expect(roundMoney(0.7 + 0.1) >= threshold).toBe(true);
  });
});

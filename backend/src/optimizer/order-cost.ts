import { roundMoney } from '@pharmacart/shared';
import type { Order, OrderLine, Pharmacy } from '@pharmacart/shared';

export type OrderCostLine = Pick<OrderLine, 'unitPrice' | 'quantity'>;
export type ShippingRules = Pick<Pharmacy, 'shippingCost' | 'freeShippingThreshold'>;
export type OrderCost = Pick<Order, 'subtotal' | 'shipping' | 'total'>;

/**
 * Costo di un ordine presso una singola farmacia.
 * La spedizione è gratuita quando il subtotale (già arrotondato) raggiunge la soglia.
 * Un ordine senza righe non esiste: costo zero e nessuna spedizione.
 */
export const calculateOrderCost = (
  lines: readonly OrderCostLine[],
  rules: ShippingRules,
): OrderCost => {
  if (lines.length === 0) {
    return { subtotal: 0, shipping: 0, total: 0 };
  }

  const rawSubtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
  const subtotal = roundMoney(rawSubtotal);
  const shipping = subtotal >= rules.freeShippingThreshold ? 0 : rules.shippingCost;

  return { subtotal, shipping, total: roundMoney(subtotal + shipping) };
};

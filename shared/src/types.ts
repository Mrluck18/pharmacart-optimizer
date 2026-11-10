/** Importo in euro come float (es. 12.9). Dopo ogni somma applicare roundMoney. */
export type Money = number;

export interface Pharmacy {
  id: string;
  name: string;
  baseUrl: string;
  /** Costo di spedizione quando il subtotale è sotto soglia. */
  shippingCost: Money;
  /** Subtotale a partire dal quale la spedizione è gratuita. */
  freeShippingThreshold: Money;
}

export interface Product {
  id: string;
  name: string;
  /** Chiave canonica di matching tra farmacie. */
  ean: string;
  minsan?: string;
  brand?: string;
}

export interface Offer {
  productId: string;
  pharmacyId: string;
  url: string;
  price: Money;
  available: boolean;
  /** Ultimo aggiornamento del batch notturno. */
  lastScrapedAt: Date;
  /** Ultima conferma della validazione JIT. */
  lastVerifiedAt?: Date;
}

export interface CartItem {
  productId: string;
  /** Intero >= 1. */
  quantity: number;
}

export interface OrderLine {
  productId: string;
  quantity: number;
  unitPrice: Money;
  url: string;
}

/** Ordine presso una singola farmacia: total = subtotal + shipping. */
export interface Order {
  pharmacyId: string;
  pharmacyName: string;
  lines: OrderLine[];
  subtotal: Money;
  shipping: Money;
  total: Money;
}

/** Combinazione di ordini che soddisfa l'intero carrello. */
export interface CartSolution {
  orders: Order[];
  total: Money;
}

export interface Savings {
  amount: Money;
  /** Percentuale rispetto alla farmacia singola, con 1 decimale. */
  percent: number;
}

export interface OptimizationResult {
  /** null se nessuna farmacia copre l'intero carrello. */
  single: CartSolution | null;
  /** null se non esiste una soluzione entro il limite di ordini. */
  split: CartSolution | null;
  /** null se manca single o split. */
  savings: Savings | null;
  /** productId senza alcuna offerta disponibile, esclusi dal calcolo. */
  unavailable: string[];
}

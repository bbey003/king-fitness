'use client';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { CartDrawer } from './CartDrawer';
import type { CartLine } from '@/lib/types';

interface CartCtx {
  lines: CartLine[];
  totalQty: number;
  subtotalCents: number;
  addItem: (line: CartLine) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  drawerOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartCtx | null>(null);

const STORAGE_KEY = 'kf_cart_v1';

export function CartProvider({ children }: { children: ReactNode }): React.ReactElement {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw) as CartLine[]);
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // ignore
    }
  }, [lines, hydrated]);

  const addItem = useCallback((line: CartLine): void => {
    setLines((curr) => {
      const existing = curr.find((l) => l.product_id === line.product_id);
      if (existing) {
        return curr.map((l) =>
          l.product_id === line.product_id
            ? { ...l, quantity: l.quantity + line.quantity }
            : l
        );
      }
      return [...curr, line];
    });
    setDrawerOpen(true);
  }, []);

  const setQty = useCallback((productId: string, qty: number): void => {
    setLines((curr) =>
      curr
        .map((l) => (l.product_id === productId ? { ...l, quantity: Math.max(0, qty) } : l))
        .filter((l) => l.quantity > 0)
    );
  }, []);

  const remove = useCallback((productId: string): void => {
    setLines((curr) => curr.filter((l) => l.product_id !== productId));
  }, []);

  const clear = useCallback((): void => setLines([]), []);

  const totalQty = useMemo(() => lines.reduce((s, l) => s + l.quantity, 0), [lines]);
  const subtotalCents = useMemo(
    () => lines.reduce((s, l) => s + l.unit_price_cents * l.quantity, 0),
    [lines]
  );

  const value: CartCtx = {
    lines,
    totalQty,
    subtotalCents,
    addItem,
    setQty,
    remove,
    clear,
    drawerOpen,
    openCart: () => setDrawerOpen(true),
    closeCart: () => setDrawerOpen(false),
  };

  return (
    <CartContext.Provider value={value}>
      {children}
      <CartDrawer />
    </CartContext.Provider>
  );
}

export function useCart(): CartCtx {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be inside CartProvider');
  return ctx;
}

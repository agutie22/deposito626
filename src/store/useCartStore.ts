import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
    imageUrl?: string;
}

interface UserState {
    phone: string;
    isVerified: boolean;
}

interface CartState {
    items: CartItem[];
    user: UserState;
    addItem: (item: Omit<CartItem, 'quantity'>) => void;
    removeItem: (id: number) => void;
    updateQuantity: (id: number, quantity: number) => void;
    clearCart: () => void;
    getSubtotal: () => number;
    getItemCount: () => number;
    setPhone: (phone: string) => void;
    setVerified: (verified: boolean) => void;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            user: { phone: '', isVerified: false },

            addItem: (item) => {
                set((state) => {
                    const existing = state.items.find((i) => i.id === item.id);
                    if (existing) {
                        return {
                            items: state.items.map((i) =>
                                i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
                            ),
                        };
                    }
                    return { items: [...state.items, { ...item, quantity: 1 }] };
                });
            },

            removeItem: (id) => {
                set((state) => ({
                    items: state.items.filter((i) => i.id !== id),
                }));
            },

            updateQuantity: (id, quantity) => {
                set((state) => ({
                    items:
                        quantity <= 0
                            ? state.items.filter((i) => i.id !== id)
                            : state.items.map((i) =>
                                i.id === id ? { ...i, quantity } : i
                            ),
                }));
            },

            clearCart: () => set({ items: [] }),

            getSubtotal: () => {
                return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
            },

            getItemCount: () => {
                return get().items.reduce((count, item) => count + item.quantity, 0);
            },

            setPhone: (phone) => set((state) => ({ user: { ...state.user, phone } })),
            setVerified: (verified) => set((state) => ({ user: { ...state.user, isVerified: verified } })),
        }),
        {
            name: 'deposito626-cart',
        }
    )
);

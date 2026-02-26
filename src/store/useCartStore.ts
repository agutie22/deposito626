import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
    imageUrl?: string;
    size?: string;
    flavor?: string;
    maxStock?: number;
}

interface UserState {
    phone: string;
    isVerified: boolean;
    isAccessUnlocked: boolean;
    isAccessModalOpen: boolean;
    isCartOpen: boolean;
    referrerPhone: string | null;
}

interface CartState {
    items: CartItem[];
    user: UserState;
    addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
    removeItem: (id: number, size?: string, flavor?: string) => void;
    updateQuantity: (id: number, quantity: number, size?: string, flavor?: string) => void;
    clearCart: () => void;
    getSubtotal: () => number;
    getItemCount: () => number;
    setPhone: (phone: string) => void;
    setVerified: (verified: boolean) => void;
    unlockAccess: (referrerPhone: string) => void;
    openAccessModal: () => void;
    closeAccessModal: () => void;
    setIsCartOpen: (isOpen: boolean) => void;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            user: { phone: '', isVerified: false, isAccessUnlocked: false, isAccessModalOpen: false, isCartOpen: false, referrerPhone: null },

            addItem: (item, quantity = 1) => {
                set((state) => {
                    const existing = state.items.find((i) =>
                        i.id === item.id &&
                        i.size === item.size &&
                        i.flavor === item.flavor
                    );
                    if (existing) {
                        let newQuantity = existing.quantity + quantity;
                        if (existing.maxStock !== undefined && newQuantity > existing.maxStock) {
                            newQuantity = existing.maxStock;
                        }
                        return {
                            items: state.items.map((i) =>
                                (i.id === item.id && i.size === item.size && i.flavor === item.flavor)
                                    ? { ...i, quantity: newQuantity }
                                    : i
                            ),
                        };
                    }

                    let newQuantity = quantity;
                    if (item.maxStock !== undefined && newQuantity > item.maxStock) {
                        newQuantity = item.maxStock;
                    }
                    return { items: [...state.items, { ...item, quantity: newQuantity }] };
                });
            },

            removeItem: (id, size, flavor) => {
                set((state) => ({
                    items: state.items.filter((i) => !(i.id === id && i.size === size && i.flavor === flavor)),
                }));
            },

            updateQuantity: (id, quantity, size, flavor) => {
                set((state) => ({
                    items:
                        quantity <= 0
                            ? state.items.filter((i) => !(i.id === id && i.size === size && i.flavor === flavor))
                            : state.items.map((i) => {
                                if (i.id === id && i.size === size && i.flavor === flavor) {
                                    let newQuantity = quantity;
                                    if (i.maxStock !== undefined && newQuantity > i.maxStock) {
                                        newQuantity = i.maxStock;
                                    }
                                    return { ...i, quantity: newQuantity };
                                }
                                return i;
                            }),
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
            unlockAccess: (referrerPhone) => set((state) => ({
                user: { ...state.user, isAccessUnlocked: true, isAccessModalOpen: false, referrerPhone }
            })),
            openAccessModal: () => set((state) => ({ user: { ...state.user, isAccessModalOpen: true } })),
            closeAccessModal: () => set((state) => ({ user: { ...state.user, isAccessModalOpen: false } })),
            setIsCartOpen: (isOpen) => set((state) => ({ user: { ...state.user, isCartOpen: isOpen } })),
        }),
        {
            name: 'deposito626-cart',
        }
    )
);

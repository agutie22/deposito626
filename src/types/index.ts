export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    stockStatus: 'in_stock' | 'limited' | 'out_of_stock';
    category: string;
    availableSizes?: string[];
    availableFlavors?: string[];
    stockQuantity?: number;
}

export interface StoreStatus {
    isOpen: boolean;
    closingMessage: string;
}

export interface Order {
    id: number;
    created_at: string;
    customer_name: string;
    status: 'pending' | 'completed' | 'cancelled';
    total_amount: number;
    phone?: string;
    address?: string;
    items?: any[]; // Using any[] for now as it's jsonb, can be typed strictly as CartItem[]
}

import { supabase } from '../supabaseClient';
import type { Product, StoreStatus } from '../types';

export interface IAdminService {
    login(password: string): Promise<boolean>;
    logout(): Promise<void>;
    isAuthenticated(): Promise<boolean>;
    getProducts(): Promise<Product[]>;
    saveProduct(product: Product): Promise<Product>;
    deleteProduct(id: number): Promise<void>;
    getStoreStatus(): Promise<StoreStatus>;
    updateStoreStatus(status: StoreStatus): Promise<StoreStatus>;
    uploadProductImage(file: File): Promise<string>;
    getOrderStats(): Promise<{ completed: number; cancelled: number; totalOrders: number; revenue: number }>;
}

export class SupabaseAdminService implements IAdminService {
    async login(password: string): Promise<boolean> {
        // In a real app, you'd use email/password. 
        // For this "Access Code" style flow, we might map a code to a specific email,
        // or just use a single admin account.
        // For now, let's assume we are signing in as 'admin@deposito626.com' with the provided password.
        const { error } = await supabase.auth.signInWithPassword({
            email: 'alexguti@usc.edu',
            password: password,
        });

        return !error;
    }

    async logout(): Promise<void> {
        await supabase.auth.signOut();
    }

    async isAuthenticated(): Promise<boolean> {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return false;

        // Check if user has admin role
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

        return profile?.role === 'admin';
    }

    async getProducts(): Promise<Product[]> {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('name');

        if (error) throw error;

        return data.map(p => ({
            id: p.id,
            name: p.name,
            description: p.description,
            price: p.price,
            imageUrl: p.image_url,
            stockStatus: p.stock_status,
            category: p.category,
            availableSizes: p.available_sizes,
            availableFlavors: p.available_flavors,
            stockQuantity: p.stock_quantity
        }));
    }

    async saveProduct(product: Product): Promise<Product> {
        const dbProduct = {
            id: product.id ? product.id : undefined, // let DB generate ID if 0 or undefined
            name: product.name,
            description: product.description,
            price: product.price,
            image_url: product.imageUrl,
            stock_status: product.stockStatus,
            category: product.category,
            available_sizes: product.availableSizes,
            available_flavors: product.availableFlavors,
            stock_quantity: product.stockQuantity || 0
        };

        // If ID is 0, it's an insert, remove ID to let Postgres generate it
        if (!product.id) {
            delete dbProduct.id;
        }

        const { data, error } = await supabase
            .from('products')
            .upsert(dbProduct)
            .select()
            .single();

        if (error) throw error;

        // Audit log
        await this.logAction('save_product', { productId: data.id, name: data.name });

        return {
            id: data.id,
            name: data.name,
            description: data.description,
            price: data.price,
            imageUrl: data.image_url,
            stockStatus: data.stock_status,
            category: data.category,
            availableSizes: data.available_sizes,
            availableFlavors: data.available_flavors,
            stockQuantity: data.stock_quantity
        };
    }

    async deleteProduct(id: number): Promise<void> {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (error) throw error;

        await this.logAction('delete_product', { productId: id });
    }

    async getStoreStatus(): Promise<StoreStatus> {
        const { data, error } = await supabase
            .from('store_settings')
            .select('*')
            .single();

        if (error || !data) {
            // Fallback to default if no row exists (should be handled by seed)
            return { isOpen: false, closingMessage: 'Store Closed' };
        }

        return {
            isOpen: data.is_open,
            closingMessage: data.closing_message
        };
    }

    async updateStoreStatus(status: StoreStatus): Promise<StoreStatus> {
        const { data, error } = await supabase
            .from('store_settings')
            .upsert({
                id: 1, // Singleton row
                is_open: status.isOpen,
                closing_message: status.closingMessage
            })
            .select()
            .single();

        if (error) throw error;

        await this.logAction('update_store_status', status);

        return {
            isOpen: data.is_open,
            closingMessage: data.closing_message
        };
    }

    async uploadProductImage(file: File): Promise<string> {
        if (!file) throw new Error("No file provided");

        // Generate unique filename: timestamp_filename
        // Sanitize filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error } = await supabase.storage
            .from('products')
            .upload(filePath, file);

        if (error) {
            console.error("Upload failed", error);
            throw error;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('products')
            .getPublicUrl(filePath);

        return publicUrl;
    }

    async getOrderStats(): Promise<{ completed: number; cancelled: number; totalOrders: number; revenue: number }> {
        // Get completed orders count and sum their total_amount for revenue
        const { data: completedOrders, error: completedError } = await supabase
            .from('orders')
            .select('total_amount')
            .eq('status', 'completed');

        if (completedError) throw completedError;

        const completedCount = completedOrders?.length || 0;
        const revenue = completedOrders?.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0) || 0;

        // Get cancelled orders count
        const { count: cancelledCount, error: cancelledError } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'cancelled');

        if (cancelledError) throw cancelledError;

        // Get total orders count
        const { count: totalCount, error: totalError } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true });

        if (totalError) throw totalError;

        return {
            completed: completedCount,
            cancelled: cancelledCount || 0,
            totalOrders: totalCount || 0,
            revenue: revenue
        };
    }

    private async logAction(action: string, details: any) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase
                .from('audit_logs')
                .insert({
                    user_id: user.id,
                    action: action,
                    details: details
                });
        }
    }
}

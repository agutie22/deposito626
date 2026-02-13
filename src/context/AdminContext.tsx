import React, { createContext, useContext, useState, useEffect } from 'react';
import { SupabaseAdminService } from '../services/AdminService';
import type { IAdminService } from '../services/AdminService';

interface AdminContextType {
    service: IAdminService;
    isAdmin: boolean;
    isLoading: boolean;
    login: (password: string) => Promise<boolean>;
    logout: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Initialize Supabase Service
const adminService = new SupabaseAdminService();

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Check for existing session
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const authed = await adminService.isAuthenticated();
            setIsAdmin(authed);
        } catch (e) {
            console.error("Auth check failed", e);
            setIsAdmin(false);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (password: string) => {
        const success = await adminService.login(password);
        if (success) {
            await checkAuth();
        }
        return success;
    };

    const logout = async () => {
        await adminService.logout();
        setIsAdmin(false);
    };

    return (
        <AdminContext.Provider value={{ service: adminService, isAdmin, isLoading, login, logout }}>
            {children}
        </AdminContext.Provider>
    );
};

export const useAdmin = () => {
    const context = useContext(AdminContext);
    if (!context) {
        throw new Error('useAdmin must be used within an AdminProvider');
    }
    return context;
};

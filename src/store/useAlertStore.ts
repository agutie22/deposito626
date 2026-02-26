import { create } from 'zustand';

export type AlertType = 'success' | 'error' | 'info' | 'warning';

interface AlertState {
    isOpen: boolean;
    message: string;
    type: AlertType;
    showAlert: (message: string, type?: AlertType) => void;
    hideAlert: () => void;
}

export const useAlertStore = create<AlertState>((set) => ({
    isOpen: false,
    message: '',
    type: 'info',
    showAlert: (message, type = 'info') => {
        set({ isOpen: true, message, type });
        // Auto-hide after 3 seconds
        setTimeout(() => {
            set((state) => {
                // Only hide if the message hasn't changed (prevents hiding newer alerts too early)
                if (state.message === message) {
                    return { isOpen: false, message: '', type: 'info' };
                }
                return state;
            });
        }, 3000);
    },
    hideAlert: () => set({ isOpen: false, message: '', type: 'info' }),
}));

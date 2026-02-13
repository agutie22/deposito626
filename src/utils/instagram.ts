import type { CartItem } from '../store/useCartStore';

const INSTAGRAM_HANDLE = 'eldeposito626';

export interface OrderDetails {
    items: CartItem[];
    subtotal: number;
    phone: string;
    address?: string;
    orderId: string;
}

export function generateOrderId(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `DP-${timestamp}-${random}`;
}

export function formatOrderMessage(order: OrderDetails): string {
    const itemLines = order.items
        .map((item) => {
            const variants = [item.size, item.flavor].filter(Boolean).join(', ');
            const variantText = variants ? ` [${variants}]` : '';
            return `• ${item.quantity}x ${item.name}${variantText} - $${(item.price * item.quantity).toFixed(2)}`;
        })
        .join('\n');

    const message = `📦 New Order #${order.orderId}

${itemLines}

💰 Total: $${order.subtotal.toFixed(2)}
📱 Phone: ${order.phone}
${order.address ? `📍 Address: ${order.address}` : ''}

---
Sent from deposito626.com`;

    return message;
}

export function getInstagramDMUrl(): string {
    return `https://ig.me/m/${INSTAGRAM_HANDLE}`;
}

export async function openInstagramDM(order: OrderDetails): Promise<boolean> {
    const message = formatOrderMessage(order);

    try {
        // Copy message to clipboard
        await navigator.clipboard.writeText(message);

        // Open Instagram DM (message is in clipboard for user to paste)
        window.open(getInstagramDMUrl(), '_blank');

        return true; // Clipboard copy succeeded
    } catch (err) {
        console.error('Failed to copy to clipboard:', err);

        // Fallback: just open Instagram without clipboard
        window.open(getInstagramDMUrl(), '_blank');

        return false; // Clipboard copy failed
    }
}


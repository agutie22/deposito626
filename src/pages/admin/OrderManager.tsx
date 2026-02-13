import { useState, useEffect } from 'react';
// import { useAdmin } from '../../context/AdminContext';
import { supabase } from '../../supabaseClient';
import type { Order } from '../../types';
import { CheckCircle, XCircle, Clock, Search, MapPin, Phone, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const OrderManager = () => {
    // const { service } = useAdmin(); // Unused for now as we use supabase directly
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'cancelled'>('all');
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(data || []);
        } catch (err) {
            console.error("Error fetching orders:", err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: number, newStatus: 'pending' | 'completed' | 'cancelled') => {
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;

            // Optimistic update
            setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
        } catch (err) {
            console.error("Error updating status:", err);
            alert("Failed to update status");
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesFilter = filter === 'all' || order.status === filter;
        const matchesSearch =
            order.customer_name.toLowerCase().includes(search.toLowerCase()) ||
            order.id.toString().includes(search) ||
            (order.phone && order.phone.includes(search));
        return matchesFilter && matchesSearch;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'text-green-400 bg-green-400/10 border-green-400/20';
            case 'cancelled': return 'text-red-400 bg-red-400/10 border-red-400/20';
            default: return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-dark)] text-[var(--text-primary)] p-6 md:p-8 pb-20">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <Link to="/admin/dashboard" className="text-[var(--text-secondary)] hover:text-white flex items-center gap-2 mb-2 transition-colors">
                            <ArrowLeft size={16} /> Back to Dashboard
                        </Link>
                        <h1 className="text-3xl font-bold text-white font-[var(--font-heading)]">Order Manager</h1>
                    </div>

                    {/* Search & Filter */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
                            <input
                                type="text"
                                placeholder="Search orders..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="bg-[var(--bg-card)] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-[var(--accent-gold)] w-full md:w-64"
                            />
                        </div>
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value as any)}
                            className="bg-[var(--bg-card)] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[var(--accent-gold)]"
                        >
                            <option value="all">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>

                {/* Orders List */}
                <div className="grid gap-4">
                    {loading ? (
                        <div className="text-center py-12 text-[var(--text-secondary)]">Loading orders...</div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="text-center py-12 text-[var(--text-secondary)] bg-[var(--bg-card)] rounded-xl border border-white/5">
                            No orders found matching your criteria.
                        </div>
                    ) : (
                        filteredOrders.map(order => (
                            <div key={order.id} className="bg-[var(--bg-card)] border border-white/5 rounded-xl p-6 hover:border-white/10 transition-colors">
                                <div className="flex flex-col md:flex-row justify-between gap-6">
                                    {/* Order Info */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="font-mono text-[var(--text-secondary)]">#{order.id}</span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                            <span className="text-[var(--text-secondary)] text-sm">
                                                {new Date(order.created_at).toLocaleString()}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-1">{order.customer_name}</h3>

                                        <div className="flex flex-wrap gap-4 mt-3 text-sm text-[var(--text-secondary)]">
                                            {order.phone && (
                                                <div className="flex items-center gap-2">
                                                    <Phone size={14} /> {order.phone}
                                                </div>
                                            )}
                                            {order.address && (
                                                <div className="flex items-center gap-2">
                                                    <MapPin size={14} /> {order.address}
                                                </div>
                                            )}
                                        </div>

                                        {/* Items (if available in jsonb) */}
                                        {order.items && Array.isArray(order.items) && order.items.length > 0 && (
                                            <div className="mt-4 pt-4 border-t border-white/5">
                                                <div className="flex items-center gap-2 text-sm font-bold text-white mb-2">
                                                    <ShoppingBag size={14} /> Order Items
                                                </div>
                                                <ul className="space-y-1">
                                                    {order.items.map((item: any, idx: number) => (
                                                        <li key={idx} className="text-sm text-[var(--text-secondary)] flex justify-between max-w-md">
                                                            <span>{item.quantity}x {item.name} {item.size && `(${item.size})`}</span>
                                                            <span className="text-white">${(item.price * item.quantity).toFixed(2)}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions & Total */}
                                    <div className="flex flex-col justify-between items-end gap-4 min-w-[200px]">
                                        <div className="text-right">
                                            <span className="text-[var(--text-secondary)] text-sm">Total Amount</span>
                                            <div className="text-2xl font-bold text-[var(--accent-gold)]">
                                                ${Number(order.total_amount).toFixed(2)}
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            {order.status !== 'completed' && (
                                                <button
                                                    onClick={() => updateStatus(order.id, 'completed')}
                                                    className="p-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20 transition-colors"
                                                    title="Mark as Completed"
                                                >
                                                    <CheckCircle size={20} />
                                                </button>
                                            )}
                                            {order.status !== 'cancelled' && (
                                                <button
                                                    onClick={() => updateStatus(order.id, 'cancelled')}
                                                    className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors"
                                                    title="Mark as Cancelled"
                                                >
                                                    <XCircle size={20} />
                                                </button>
                                            )}
                                            {order.status !== 'pending' && (
                                                <button
                                                    onClick={() => updateStatus(order.id, 'pending')}
                                                    className="p-2 rounded-lg bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 border border-yellow-500/20 transition-colors"
                                                    title="Mark as Pending"
                                                >
                                                    <Clock size={20} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderManager;

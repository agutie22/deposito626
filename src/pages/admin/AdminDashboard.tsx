import { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import type { StoreStatus } from '../../types';
import { Link, useNavigate } from 'react-router-dom';
import { Store, Package, LogOut, Loader2, Power, TrendingUp, DollarSign, Bell, CheckCircle, XCircle } from 'lucide-react';

const AdminDashboard = () => {
    const { service, logout } = useAdmin();
    const [status, setStatus] = useState<StoreStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const [orderStats, setOrderStats] = useState<{ completed: number; cancelled: number; totalOrders: number; revenue: number } | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [storeStatus, stats] = await Promise.all([
                    service.getStoreStatus(),
                    service.getOrderStats()
                ]);
                setStatus(storeStatus);
                setOrderStats(stats);
            } catch (err) {
                console.error("Failed to load dashboard data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [service]);

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const toggleStore = async () => {
        if (!status) return;
        const newStatus = { ...status, isOpen: !status.isOpen };
        try {
            const updated = await service.updateStoreStatus(newStatus);
            setStatus(updated);
        } catch (err) {
            alert('Failed to update store status');
        }
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--bg-dark)] flex items-center justify-center text-[var(--text-secondary)]">
                <Loader2 className="animate-spin mr-2" /> Loading Dashboard...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--bg-dark)] text-[var(--text-primary)] pb-20">
            {/* Top Navigation Bar */}
            <nav className="border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 z-30 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-gradient-to-tr from-[var(--accent-gold)] to-yellow-200 flex items-center justify-center text-black font-bold text-xs">
                        D6
                    </div>
                    <span className="font-bold tracking-wider text-sm hidden md:block">ADMIN CONSOLE</span>
                </div>
                <div className="flex items-center gap-4">
                    <button className="p-2 text-[var(--text-secondary)] hover:text-white transition-colors relative">
                        <Bell size={18} />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>
                    <div className="h-6 w-px bg-white/10 mx-2"></div>
                    <button onClick={handleLogout} className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-red-400 transition-colors text-sm font-bold">
                        <LogOut size={16} />
                        <span className="hidden md:inline">Logout</span>
                    </button>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto p-6 md:p-8">
                {/* Header Section */}
                <header className="mb-10 animate-[fadeIn_0.5s_ease-out]">
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-fancy)' }}>
                        {getGreeting()}, Admin.
                    </h1>
                    <p className="text-[var(--text-secondary)] text-lg">
                        Here's what's happening at Deposito 626 today.
                    </p>
                </header>

                {/* Quick Stats Grid (Mock Data) */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-[var(--bg-card)] p-4 rounded-xl border border-white/5 flex flex-col justify-between h-32 hover:border-white/10 transition-colors group">
                        <div className="flex justify-between items-start">
                            <span className="text-[var(--text-secondary)] text-xs uppercase font-bold tracking-wider">Total Orders</span>
                            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg group-hover:scale-110 transition-transform"><TrendingUp size={16} /></div>
                        </div>
                        <span className="text-2xl font-bold">{orderStats?.totalOrders || 0}</span>
                    </div>
                    <div className="bg-[var(--bg-card)] p-4 rounded-xl border border-white/5 flex flex-col justify-between h-32 hover:border-white/10 transition-colors group">
                        <div className="flex justify-between items-start">
                            <span className="text-[var(--text-secondary)] text-xs uppercase font-bold tracking-wider">Revenue</span>
                            <div className="p-2 bg-green-500/10 text-green-400 rounded-lg group-hover:scale-110 transition-transform"><DollarSign size={16} /></div>
                        </div>
                        <span className="text-2xl font-bold">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(orderStats?.revenue || 0)}
                        </span>
                    </div>
                    <Link to="/admin/orders" className="bg-[var(--bg-card)] p-4 rounded-xl border border-white/5 flex flex-col justify-between h-32 hover:border-white/10 transition-colors group block">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-[var(--text-secondary)] text-xs uppercase font-bold tracking-wider">Order Status</span>
                        </div>
                        <div className="flex justify-between items-end gap-2">
                            <div className="flex flex-col">
                                <span className="text-2xl font-bold text-green-400">{orderStats?.completed || 0}</span>
                                <div className="flex items-center gap-1 text-[10px] text-green-400/80 font-bold uppercase tracking-wider">
                                    <CheckCircle size={10} /> Completed
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-xl font-bold text-red-400">{orderStats?.cancelled || 0}</span>
                                <div className="flex items-center gap-1 text-[10px] text-red-400/80 font-bold uppercase tracking-wider">
                                    <XCircle size={10} /> Cancelled
                                </div>
                            </div>
                        </div>
                    </Link>
                    <div className="bg-[var(--bg-card)] p-4 rounded-xl border border-white/5 flex flex-col justify-between h-32 hover:border-white/10 transition-colors group">
                        <div className="flex justify-between items-start">
                            <span className="text-[var(--text-secondary)] text-xs uppercase font-bold tracking-wider">Store Status</span>
                            <div className={`p-2 rounded-lg transition-colors ${status?.isOpen ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                <Store size={16} />
                            </div>
                        </div>
                        <span className={`text-xl font-bold ${status?.isOpen ? 'text-green-400' : 'text-red-400'}`}>
                            {status?.isOpen ? 'OPEN' : 'CLOSED'}
                        </span>
                    </div>
                </div>

                {/* Main Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Store Status Control */}
                    <div className="lg:col-span-2 bg-gradient-to-br from-[var(--bg-card)] to-black p-8 rounded-3xl border border-white/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-32 bg-[var(--accent-gold)]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2 font-[var(--font-heading)]">Store Availability</h2>
                                <p className="text-[var(--text-secondary)] max-w-md">
                                    Control whether the store is currently accepting orders. When closed, customers will see your custom message.
                                </p>
                            </div>

                            <button
                                onClick={toggleStore}
                                className={`
                                    relative px-8 py-4 rounded-2xl font-bold text-lg flex items-center gap-3 transition-all duration-300 shadow-xl overflow-hidden
                                    ${status?.isOpen
                                        ? 'bg-green-500/10 text-green-400 ring-1 ring-green-500/50 hover:bg-green-500/20 hover:scale-105'
                                        : 'bg-red-500/10 text-red-400 ring-1 ring-red-500/50 hover:bg-red-500/20 hover:scale-105'}
                                `}
                            >
                                <Power size={24} className={status?.isOpen ? 'animate-pulse' : ''} />
                                <span>{status?.isOpen ? 'STORE IS OPEN' : 'STORE IS CLOSED'}</span>
                                {status?.isOpen && <span className="absolute inset-0 bg-green-400/10 animate-pulse"></span>}
                            </button>
                        </div>

                        <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3 text-[var(--text-secondary)] text-sm">
                                <div className={`w-2 h-2 rounded-full ${status?.isOpen ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                Current Message: <span className="text-white italic">"{status?.closingMessage}"</span>
                            </div>
                            <Link to="/admin/store" className="text-[var(--accent-gold)] hover:text-white text-sm font-bold transition-colors">
                                Edit Settings &rarr;
                            </Link>
                        </div>
                    </div>

                    {/* Quick Actions / Inventory */}
                    <div className="bg-[var(--bg-card)] p-8 rounded-3xl border border-white/5 flex flex-col justify-between hover:border-[var(--accent-gold)]/30 transition-colors group relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 pointer-events-none"></div>

                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-[var(--accent-gold)] rounded-2xl flex items-center justify-center text-black mb-6 shadow-lg shadow-[var(--accent-gold)]/20 rotate-3 group-hover:rotate-6 transition-transform">
                                <Package size={24} />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2 font-[var(--font-heading)]">Inventory</h2>
                            <p className="text-[var(--text-secondary)] text-sm mb-8">
                                <span className="text-white font-bold">Running Low?</span> Manage products, prices, and stock levels.
                            </p>
                        </div>

                        <Link
                            to="/admin/products"
                            className="relative z-10 w-full bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all border border-white/5 group-hover:border-[var(--accent-gold)]/50 group-hover:bg-[var(--accent-gold)] group-hover:text-black"
                        >
                            Manage Products
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

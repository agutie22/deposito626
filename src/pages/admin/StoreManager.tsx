import { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { ArrowLeft, Save, Loader2, Monitor, Smartphone, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { StoreStatus } from '../../types';

const StoreManager = () => {
    const { service } = useAdmin();
    const [status, setStatus] = useState<StoreStatus>({ isOpen: false, closingMessage: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const data = await service.getStoreStatus();
                setStatus(data);
                setMessage(data.closingMessage);
            } catch (err) {
                console.error("Failed to load status", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStatus();
    }, [service]);

    const [error, setError] = useState<string | null>(null);

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        try {
            const updated = await service.updateStoreStatus({ ...status, closingMessage: message });
            setStatus(updated);
        } catch (err) {
            console.error('Failed to save settings', err);
            setError('Failed to save settings. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const toggleStatus = async () => {
        const newStatus = { ...status, isOpen: !status.isOpen };
        setStatus(newStatus); // Optimistic UI update
        setError(null);
        try {
            await service.updateStoreStatus(newStatus);
        } catch (err: any) {
            console.error('Failed to toggle status', err);
            setStatus(status); // Revert on fail
            setError(`Failed to update store status: ${err.message || 'Unknown error'}`);
        }
    };

    if (loading) return <div className="p-8 text-center text-[var(--text-secondary)]"><Loader2 className="animate-spin inline mr-2" />Loading...</div>;

    return (
        <div className="min-h-screen bg-[var(--bg-dark)] text-[var(--text-primary)] pb-20">
            {/* Header */}
            <div className="border-b border-white/5 bg-black/20 p-6 sticky top-0 z-30 backdrop-blur-md">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <Link to="/admin/dashboard" className="inline-flex items-center text-[var(--text-secondary)] hover:text-white transition-colors group">
                        <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-bold">Back</span>
                    </Link>
                    <h1 className="text-xl font-bold font-[var(--font-heading)] tracking-wide">
                        STORE SETTINGS
                    </h1>
                    <div className="w-16"></div> {/* Spacer for center alignment */}
                </div>
            </div>

            <div className="max-w-5xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">

                {/* Control Panel */}
                <div className="space-y-6">
                    {/* Status Toggle Card */}
                    <div className="bg-[var(--bg-card)] p-8 rounded-3xl border border-white/5 overflow-hidden relative">
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <Globe size={18} className="text-[var(--accent-gold)]" />
                            Global Availability
                        </h2>

                        <label className="flex items-center justify-between cursor-pointer group">
                            <div>
                                <div className="font-bold text-white text-lg group-hover:text-[var(--accent-gold)] transition-colors">Store {status.isOpen ? 'Open' : 'Closed'}</div>
                                <div className="text-sm text-[var(--text-secondary)]">
                                    {status.isOpen ? 'Accepting new orders.' : 'Not accepting orders.'}
                                </div>
                            </div>

                            <div className="relative" onClick={(e) => { e.preventDefault(); toggleStatus(); }}>
                                <div className={`w-16 h-8 rounded-full transition-colors duration-300 ${status.isOpen ? 'bg-green-500' : 'bg-white/10'}`}></div>
                                <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-lg transition-transform duration-300 ${status.isOpen ? 'translate-x-8' : 'translate-x-0'}`}></div>
                            </div>
                        </label>
                    </div>

                    {/* Message Editor */}
                    <div className="bg-[var(--bg-card)] p-8 rounded-3xl border border-white/5">
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <Smartphone size={18} className="text-[var(--accent-gold)]" />
                            Closing Message
                        </h2>

                        <div className="relative">
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="w-full h-40 bg-black/30 border border-white/10 rounded-2xl p-4 text-[var(--text-primary)] focus:border-[var(--accent-gold)] focus:ring-1 focus:ring-[var(--accent-gold)] focus:outline-none transition-all resize-none font-medium leading-relaxed"
                                placeholder="Enter the message customers will see when the store is closed..."
                            />
                            <div className="absolute bottom-4 right-4 text-xs text-[var(--text-secondary)]">
                                {message.length} chars
                            </div>
                        </div>

                        {error && (
                            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="bg-transparent border border-[var(--accent-gold)] text-[var(--accent-gold)] px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[var(--accent-gold)]/10 transition-all disabled:opacity-50 hover:shadow-lg hover:shadow-[var(--accent-gold)]/20 active:scale-95"
                            >
                                {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Live Preview */}
                <div className="lg:pl-8">
                    <div className="sticky top-32">
                        <div className="flex items-center justify-center gap-2 mb-4 text-[var(--text-secondary)] text-sm font-bold uppercase tracking-widest">
                            <Monitor size={14} /> Live Preview
                        </div>

                        {/* Phone Mockup */}
                        <div className="mx-auto w-[300px] h-[600px] bg-[#111] rounded-[3rem] border-8 border-[#333] shadow-2xl overflow-hidden relative">
                            {/* Notch */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-6 w-32 bg-[#333] rounded-b-xl z-20"></div>

                            {/* Screen Content */}
                            <div className="w-full h-full bg-[var(--bg-dark)] overflow-y-auto relative">
                                {/* Mock Site Header */}
                                <div className="h-16 flex items-center justify-center border-b border-white/10">
                                    <div className="w-8 h-8 rounded-full bg-[var(--accent-gold)]"></div>
                                </div>

                                {/* Mock Content */}
                                <div className="p-4 space-y-4 opacity-50 filter grayscale blur-[1px]">
                                    <div className="h-32 bg-white/5 rounded-xl"></div>
                                    <div className="h-32 bg-white/5 rounded-xl"></div>
                                </div>

                                {/* The Actual Message Overlay (when closed) */}
                                {!status.isOpen && (
                                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center animate-[fadeIn_0.3s_ease-out]">
                                        <div className="mb-4 p-4 rounded-full bg-red-500/10 text-red-400">
                                            <Globe size={32} />
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2 font-[var(--font-heading)]">Store Closed</h3>
                                        <p className="text-gray-300 text-sm leading-relaxed">
                                            "{message || 'We are currently closed.'}"
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StoreManager;

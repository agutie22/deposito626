import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Plus, Edit, Trash2, X, ArrowLeft, Loader2, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Product } from '../../types';

const ProductManager = () => {
    const { service } = useAdmin();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Search & Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');

    // Form State
    const [formData, setFormData] = useState<Partial<Product>>({
        name: '',
        price: 0,
        description: '',
        category: 'Ready to Drink',
        imageUrl: '',
        stockStatus: 'in_stock',
        stockQuantity: 0,
        availableFlavors: [],
        flavorStock: {}
    });

    // Helper state for text inputs (comma separated)
    const [flavorsInput, setFlavorsInput] = useState('');

    const fetchData = async () => {
        try {
            const data = await service.getProducts();
            setProducts(data);
        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [service]);

    // Filter Logic
    const filteredProducts = products.filter(product => {
        if (!product) return false;
        const matchesSearch = (product.name || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'All' || (product.category || 'Other') === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const categories = ['All', ...Array.from(new Set(products.map(p => p.category || 'Other')))];

    const handleOpenModal = (product: Product | null = null) => {
        setSelectedFile(null);
        setPreviewUrl(null);
        if (product) {
            setEditingProduct(product);
            setFormData({ ...product });
            setPreviewUrl(product.imageUrl);
            setFlavorsInput(product.availableFlavors ? product.availableFlavors.join(', ') : '');
        } else {
            setEditingProduct(null);
            setFormData({
                name: '',
                price: 0,
                description: '',
                category: 'Ready to Drink',
                imageUrl: '',
                stockStatus: 'in_stock',
                stockQuantity: 0,
                availableFlavors: []
            });
            setFlavorsInput('');
        }
        setIsModalOpen(true);
    };

    // Keep flavorStock in sync with flavorsInput and calculate total stock
    useEffect(() => {
        const flavors = flavorsInput.split(',').map(s => s.trim()).filter(s => s.length > 0);
        setFormData(prev => {
            const newStock = { ...(prev.flavorStock || {}) };

            // Sync entries
            flavors.forEach(f => {
                if (newStock[f] === undefined) newStock[f] = 0;
            });
            Object.keys(newStock).forEach(k => {
                if (!flavors.includes(k)) delete newStock[k];
            });

            // Calculate total
            const total = flavors.length > 0
                ? Object.values(newStock).reduce((sum, qty) => sum + qty, 0)
                : prev.stockQuantity || 0;

            return {
                ...prev,
                flavorStock: newStock,
                availableFlavors: flavors,
                stockQuantity: total
            };
        });
    }, [flavorsInput]);

    // Recalculate total if individual flavor stocks change
    useEffect(() => {
        if (formData.availableFlavors && formData.availableFlavors.length > 0) {
            const total = Object.values(formData.flavorStock || {}).reduce((sum, qty) => sum + qty, 0);
            if (total !== formData.stockQuantity) {
                setFormData(prev => ({ ...prev, stockQuantity: total }));
            }
        }
    }, [formData.flavorStock, formData.availableFlavors, formData.stockQuantity]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation without Image URL strict check since file upload might be pending or existing
        if (!formData.name?.trim()) {
            alert('Product name is required');
            return;
        }
        if ((formData.price ?? 0) <= 0) {
            alert('Price must be greater than 0');
            return;
        }

        try {
            let finalImageUrl = formData.imageUrl;

            // Check if there is a file to upload
            // We need a state for the selected file
            if (selectedFile) {
                // Upload file
                try {
                    const uploadedUrl = await service.uploadProductImage(selectedFile);
                    finalImageUrl = uploadedUrl;
                } catch (uploadError) {
                    alert('Failed to upload image');
                    return;
                }
            }

            if (!finalImageUrl?.trim()) {
                alert('Image is required');
                return;
            }

            const productToSave = {
                ...formData,
                name: formData.name?.trim(),
                description: formData.description?.trim(),
                imageUrl: finalImageUrl,
                id: editingProduct ? editingProduct.id : undefined,
                availableFlavors: formData.availableFlavors,
                flavorStock: formData.flavorStock,
                stockQuantity: formData.stockQuantity || 0
            } as Product;

            await service.saveProduct(productToSave);
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            alert('Failed to save product');
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Delete this product?')) {
            await service.deleteProduct(id);
            fetchData();
        }
    };

    if (loading) return <div className="p-8 text-center text-[var(--text-secondary)]"><Loader2 className="animate-spin inline mr-2" />Loading Inventory...</div>;

    return (
        <div className="min-h-screen bg-[var(--bg-dark)] text-[var(--text-primary)] pb-20">
            {/* Header */}
            <div className="border-b border-white/5 bg-black/20 p-6 sticky top-0 z-30 backdrop-blur-md">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link to="/admin/dashboard" className="p-2 rounded-full hover:bg-white/10 transition-colors">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold font-[var(--font-heading)] tracking-wide">
                                INVENTORY
                            </h1>
                            <p className="text-xs text-[var(--text-secondary)]">{products.length} Items Total</p>
                        </div>
                    </div>

                    <button
                        onClick={() => handleOpenModal()}
                        className="bg-transparent border border-[var(--accent-gold)] text-[var(--accent-gold)] px-6 py-2 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-[var(--accent-gold)]/10 transition-all shadow-lg shadow-[var(--accent-gold)]/20 active:scale-95"
                    >
                        <Plus size={18} />
                        <span className="uppercase text-xs tracking-wider">Add Product</span>
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-4 md:p-8">
                {/* Search & Filter Bar */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[var(--bg-card)] border border-white/5 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-[var(--accent-gold)] transition-colors"
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFilterCategory(cat)}
                                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${filterCategory === cat
                                    ? 'bg-[var(--accent-gold)] text-black border-[var(--accent-gold)]'
                                    : 'bg-white/5 text-[var(--text-secondary)] border-white/5 hover:border-white/20'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden grid gap-4">
                    {filteredProducts.map(product => (
                        <div key={product.id} className="bg-[var(--bg-card)] p-4 rounded-2xl border border-white/5 flex gap-4 shadow-sm">
                            <img src={product.imageUrl} alt={product.name} className="w-20 h-20 object-cover rounded-xl bg-black/50" />
                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                                <div>
                                    <h3 className="font-bold truncate text-lg leading-tight">{product.name || 'Unnamed Product'}</h3>
                                    <p className="text-xs text-[var(--text-secondary)]">{product.category || 'Uncategorized'}</p>
                                </div>
                                <div className="flex justify-between items-end mt-2">
                                    <span className="text-[var(--accent-gold)] font-bold text-lg">${product.price || 0}</span>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleOpenModal(product)} className="p-2 bg-white/5 rounded-lg active:scale-95 text-blue-400"><Edit size={16} /></button>
                                        <button onClick={() => handleDelete(product.id)} className="p-2 bg-white/5 rounded-lg active:scale-95 text-red-400"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {filteredProducts.length === 0 && (
                        <div className="text-center py-10 text-[var(--text-secondary)]">No products found.</div>
                    )}
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block bg-[var(--bg-card)] rounded-2xl border border-white/5 overflow-hidden shadow-xl">
                    <table className="w-full text-left">
                        <thead className="bg-black/20 text-[var(--text-secondary)] uppercase text-xs tracking-wider border-b border-white/5">
                            <tr>
                                <th className="p-6 font-medium">Product</th>
                                <th className="p-6 font-medium">Category</th>
                                <th className="p-6 font-medium">Price</th>
                                <th className="p-6 font-medium">Status</th>
                                <th className="p-6 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredProducts.map(product => (
                                <tr key={product.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="p-6 flex items-center gap-4">
                                        <img src={product.imageUrl || ''} className="w-12 h-12 rounded-lg object-cover bg-black/50 shadow-sm group-hover:scale-105 transition-transform" alt="" />
                                        <div className="flex flex-col">
                                            <span className="font-bold text-white">{product.name || 'Unnamed Product'}</span>
                                            <span className="text-xs text-[var(--text-secondary)] truncate max-w-[200px]">{product.description || ''}</span>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <span className="px-3 py-1 bg-white/5 rounded-full text-xs font-bold text-[var(--text-secondary)]">
                                            {product.category || 'Other'}
                                        </span>
                                    </td>
                                    <td className="p-6 font-bold text-[var(--accent-gold)] font-mono text-lg">${product.price}</td>
                                    <td className="p-6">
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${(product.stockStatus || 'out_of_stock') === 'in_stock' ? 'text-green-400' :
                                            (product.stockStatus || 'out_of_stock') === 'limited' ? 'text-yellow-400' :
                                                'text-red-400'
                                            }`}>
                                            <span className={`inline-block w-2 h-2 rounded-full mr-2 ${(product.stockStatus || 'out_of_stock') === 'in_stock' ? 'bg-green-500' :
                                                (product.stockStatus || 'out_of_stock') === 'limited' ? 'bg-yellow-500' :
                                                    'bg-red-500'
                                                }`}></span>
                                            {(product.stockStatus || 'unknown').replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="p-6 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleOpenModal(product)} className="p-2 hover:bg-blue-500/10 hover:text-blue-400 rounded-lg transition-colors"><Edit size={18} /></button>
                                            <button onClick={() => handleDelete(product.id)} className="p-2 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-colors"><Trash2 size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredProducts.length === 0 && (
                                <tr><td colSpan={5} className="p-10 text-center text-[var(--text-secondary)]">No products found matching your search.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Slide-over Modal / Sheet */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)}></div>

                    <div className="relative w-full max-w-md bg-[var(--bg-card)] h-full overflow-y-auto border-l border-white/10 shadow-2xl animate-[slideInRight_0.3s_ease-out]">
                        <header className="p-6 border-b border-white/10 flex justify-between items-center bg-[var(--bg-dark)] sticky top-0 z-10">
                            <h2 className="text-xl font-bold font-[var(--font-heading)]">
                                {editingProduct ? 'Edit Product' : 'Add New Product'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
                        </header>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs uppercase tracking-wider text-[var(--text-secondary)] mb-2 font-bold">Product Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-black/30 border border-white/10 rounded-xl p-4 focus:border-[var(--accent-gold)] outline-none transition-colors"
                                        placeholder="e.g. BeatBox Blue Razz"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs uppercase tracking-wider text-[var(--text-secondary)] mb-2 font-bold">Price ($)</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]">$</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                required
                                                value={formData.price}
                                                onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                                className="w-full bg-black/30 border border-white/10 rounded-xl p-4 pl-8 focus:border-[var(--accent-gold)] outline-none transition-colors font-mono"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs uppercase tracking-wider text-[var(--text-secondary)] mb-2 font-bold">Stock Qty</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.stockQuantity}
                                            onChange={e => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) || 0 })}
                                            disabled={formData.availableFlavors && formData.availableFlavors.length > 0}
                                            className={`w-full bg-black/30 border border-white/10 rounded-xl p-4 focus:border-[var(--accent-gold)] outline-none transition-colors font-mono ${formData.availableFlavors && formData.availableFlavors.length > 0 ? 'opacity-50 cursor-not-allowed bg-black/50' : ''}`}
                                        />
                                        {formData.availableFlavors && formData.availableFlavors.length > 0 && (
                                            <p className="text-[10px] text-[var(--accent-gold)] mt-1 font-bold italic">Auto-calculated from flavors</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs uppercase tracking-wider text-[var(--text-secondary)] mb-2 font-bold">Category</label>
                                    <div className="relative">
                                        <select
                                            value={formData.category}
                                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-[var(--text-primary)] focus:border-[var(--accent-gold)] outline-none transition-colors appearance-none"
                                        >
                                            <option value="Ready to Drink">Ready to Drink</option>
                                            <option value="Cervezas">Cervezas</option>
                                            <option value="Spirits">Spirits</option>
                                            <option value="Mixers">Mixers</option>
                                            <option value="Other">Other</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-secondary)]">▼</div>
                                    </div>
                                </div>


                                <div>
                                    <label className="block text-xs uppercase tracking-wider text-[var(--text-secondary)] mb-2 font-bold">Available Flavors (Comma Separated)</label>
                                    <input
                                        type="text"
                                        value={flavorsInput}
                                        onChange={e => setFlavorsInput(e.target.value)}
                                        className="w-full bg-black/30 border border-white/10 rounded-xl p-4 focus:border-[var(--accent-gold)] outline-none transition-colors"
                                        placeholder="e.g. Blue, Red, Lemon"
                                    />
                                </div>

                                {formData.availableFlavors && formData.availableFlavors.length > 0 && (
                                    <div className="p-4 bg-white/5 rounded-xl space-y-3">
                                        <p className="text-[10px] uppercase font-bold text-[var(--text-secondary)] mb-1">Stock per Flavor</p>
                                        <div className="grid grid-cols-2 gap-3">
                                            {formData.availableFlavors.map(flavor => (
                                                <div key={flavor} className="flex flex-col gap-1">
                                                    <label className="text-[10px] text-[var(--text-secondary)] truncate">{flavor}</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={formData.flavorStock?.[flavor] || 0}
                                                        onChange={e => {
                                                            const val = parseInt(e.target.value) || 0;
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                flavorStock: {
                                                                    ...prev.flavorStock,
                                                                    [flavor]: val
                                                                }
                                                            }));
                                                        }}
                                                        className="bg-black/40 border border-white/10 rounded-lg p-2 text-sm focus:border-[var(--accent-gold)] outline-none transition-colors font-mono"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs uppercase tracking-wider text-[var(--text-secondary)] mb-2 font-bold">Description & Flavor</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full h-32 bg-black/30 border border-white/10 rounded-xl p-4 focus:border-[var(--accent-gold)] outline-none resize-none transition-colors"
                                        placeholder="Describe the taste, ABV, etc."
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs uppercase tracking-wider text-[var(--text-secondary)] mb-2 font-bold">Product Image</label>

                                    <div className="space-y-4">
                                        {/* File Input */}
                                        <div className="relative border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-[var(--accent-gold)] transition-colors group cursor-pointer bg-black/20">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileSelect}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                            <div className="pointer-events-none">
                                                <p className="text-[var(--text-secondary)] group-hover:text-[var(--accent-gold)] transition-colors font-bold mb-1">
                                                    {selectedFile ? selectedFile.name : "Click to Upload Image"}
                                                </p>
                                                <p className="text-xs text-[var(--text-secondary)]">PNG, JPG up to 5MB</p>
                                            </div>
                                        </div>

                                        {/* Preview */}
                                        {(previewUrl || formData.imageUrl) && (
                                            <div className="relative w-full h-48 bg-black/50 rounded-xl overflow-hidden border border-white/10">
                                                <img
                                                    src={previewUrl || formData.imageUrl}
                                                    alt="Preview"
                                                    className="w-full h-full object-contain"
                                                />
                                                {selectedFile && (
                                                    <div className="absolute top-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                                                        New Upload
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                            </div>

                            <div className="pt-4 border-t border-white/10">
                                <button type="submit" className="w-full bg-transparent border border-[var(--accent-gold)] text-[var(--accent-gold)] font-bold py-4 rounded-xl hover:bg-[var(--accent-gold)]/10 shadow-lg shadow-[var(--accent-gold)]/20 transition-all active:scale-95 text-lg uppercase tracking-wide">
                                    {editingProduct ? 'Save Changes' : 'Add to Inventory'}
                                </button>
                            </div>
                        </form>
                    </div >
                </div >
            )}
        </div >
    );
};

export default ProductManager;

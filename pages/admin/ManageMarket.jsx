import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { toast } from 'react-toastify';
import axios from 'axios';
import { MdDelete } from 'react-icons/md';

const ManageMarket = () => {
    const [category, setCategory] = useState("");
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');

    // Fetch Products
    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:3000/admin/products');
            if (response.ok) {
                const data = await response.json();
                setProducts(data);
            } else {
                toast.error('Failed to fetch products');
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Server error while fetching products');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // Category Management
    const handleCategoryAdd = async () => {
        const trimmedCategory = category.trim();
        if (trimmedCategory === "") {
            toast.error("❌ Please enter a category");
            return;
        }
        try {
            const res = await axios.post('http://localhost:3000/category/addCategory', 
                { category: trimmedCategory },
                { headers: { Authorization: `Bearer ${adminData.token}` } }
            );
            if (res.status === 201 || res.status === 200) {
                setCategory("");
                toast.success("✅ Category added successfully");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "❌ Category not added");
        }
    };

    const handleCategoryRemove = async () => {
        const trimmedCategory = category.trim();
        if (trimmedCategory === "") {
            toast.error("❌ Please enter a category");
            return;
        }
        try {
            const res = await axios.delete('http://localhost:3000/category/deleteCategory', {
                headers: { Authorization: `Bearer ${adminData.token}` },
                data: { category: trimmedCategory }
            });
            if (res.status === 200) {
                setCategory("");
                toast.success("✅ Category removed successfully");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "❌ Category not found");
        }
    };

    // Product Deletion
    const handleDeleteProduct = async (id) => {
        if (!window.confirm("Are you sure you want to delete this listing from the marketplace?")) return;

        try {
            const response = await fetch(`http://localhost:3000/admin/products/${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                toast.success('Listing deleted successfully');
                setProducts(products.filter(p => p._id !== id));
            } else {
                toast.error('Failed to delete listing');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Server error');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <AdminSidebar />
            
            <div className="flex-grow p-4 md:p-8 pt-28">
                <div className="max-w-7xl mx-auto space-y-8">
                    
                    {/* Header Configuration Panel */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <h1 className="text-3xl font-bold font-serif text-gray-800">Manage Market</h1>
                            <p className="text-gray-500 mt-1">Moderate user listings and configure market categories.</p>
                        </div>

                        {/* Category Config */}
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 w-full md:w-auto flex-1 max-w-lg">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Category Configuration</label>
                            <div className='flex items-center shadow-sm rounded-lg overflow-hidden border border-gray-300'>
                                <button
                                    onClick={handleCategoryRemove}
                                    disabled={category.trim() === ""}
                                    className='bg-red-50 hover:bg-red-100 transition px-4 py-2 text-red-600 font-medium text-sm disabled:opacity-50 border-r border-gray-300'>
                                    Remove
                                </button>
                                <input
                                    type='text'
                                    placeholder='Category name...'
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className='flex-grow px-4 py-2 text-sm outline-none'
                                />
                                <button
                                    onClick={handleCategoryAdd}
                                    disabled={category.trim() === ""}
                                    className='bg-green-50 hover:bg-green-100 transition px-4 py-2 text-green-700 font-medium text-sm disabled:opacity-50 border-l border-gray-300'>
                                    Add
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Active Listings Grid */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-xl font-bold font-serif text-gray-800 mb-6 border-b pb-3">Active Listings ({products.length})</h2>
                        
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-600"></div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {products.length === 0 ? (
                                    <p className="col-span-full py-12 text-center text-gray-500 text-lg">No active marketplace listings found.</p>
                                ) : (
                                    products.map(product => (
                                        <div key={product._id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition bg-white flex flex-col group">
                                            <div className="h-48 overflow-hidden bg-gray-100 relative">
                                                <img 
                                                    src={product.imageURL} 
                                                    alt={product.title} 
                                                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
                                                    onError={(e) => { e.target.src='https://via.placeholder.com/400x300?text=No+Image'}} 
                                                />
                                                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded font-bold text-gray-800 shadow-sm text-sm">
                                                    ${product.price}
                                                </div>
                                            </div>
                                            <div className="p-4 flex-grow">
                                                <p className="text-xs text-pink-600 font-bold uppercase tracking-wider mb-1">{product.category}</p>
                                                <h3 className="font-bold text-gray-900 leading-tight mb-2 line-clamp-2">{product.title}</h3>
                                                <p className="text-gray-500 text-xs line-clamp-2 mb-3">{product.description}</p>
                                                
                                                <div className="flex items-center gap-2 mt-auto text-xs text-gray-500 bg-gray-50 p-2 rounded">
                                                    <span>Seller:</span>
                                                    <span className="font-semibold text-gray-700 truncate">{product.createdBy?.username || 'Unknown'}</span>
                                                </div>
                                            </div>
                                            <div className="p-3 border-t border-gray-100 bg-gray-50/50">
                                                <button 
                                                    onClick={() => handleDeleteProduct(product._id)}
                                                    className="w-full flex items-center justify-center gap-2 bg-white border border-red-200 hover:bg-red-50 text-red-600 font-medium py-2 rounded-lg transition text-sm"
                                                >
                                                    <MdDelete className="text-lg" /> Delete Listing
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ManageMarket;

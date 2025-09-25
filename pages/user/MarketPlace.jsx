import React, { useState, useEffect } from 'react';
import SideBar from '../../components/user/SideBar';
import { FiSearch } from "react-icons/fi";
import { FaCartArrowDown } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
const images = ["equipment.png", "gadgets.png", "technology.png"];

const MarketPlace = () => {
    const navigate = useNavigate();
    const [imageIndex, setImageIndex] = useState(0);
    const [categories, setCategories] = useState([]); // List of categories
    const [products, setProducts] = useState([]); // Products by category
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [search, setSearch] = useState("");
    const [searchItems, setSearchItems] = useState([]);
    const [boolSearch, setBoolSearch] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("all");

    const categoryBgColors = [
        'bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-yellow-400',
        'bg-purple-400', 'bg-orange-400', 'bg-pink-400', 'bg-amber-400'
    ];

    useEffect(() => {
        // Fetch categories
        axios.get('http://localhost:3000/category/allCategories')
            .then(response => setCategories(response.data.categories))
            .catch(error => console.error("Error fetching categories:", error));

        // Fetch products by category
        axios.get('http://localhost:3000/products/getProductByCategory')
            .then(response => setProducts(response.data.categories))
            .catch(error => console.error("Error fetching products:", error));

        const interval = setInterval(() => {
            setImageIndex(prev => (prev + 1) % images.length);
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    const userData = JSON.parse(localStorage.getItem('userData'));
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleSellProduct = async () => {
        setIsLoading(true);
        setErrorMessage('');

        try {
            if (!userData || !userData.userId) {
                setErrorMessage('You must be logged in to sell products');
                setIsLoading(false);
                return;
            }

            const res = await fetch('http://localhost:3000/stripe/create-account', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ userId: userData.userId })
            });

            const data = await res.json();

            // If user is already onboarded, status is 200
            if (res.status === 200 && data.onboarded) {
                navigate('/sellProduct');
                return;
            }

            // New account or onboarding not completed
            if (data?.url) {
                // Store that we're in the onboarding process
                localStorage.setItem('stripeOnboarding', 'true');
                window.location.href = data.url; // Redirect to Stripe onboarding
            } else {
                setErrorMessage(data.message || 'Stripe onboarding failed. Please try again.');
            }
        } catch (error) {
            console.error('Stripe Error:', error);
            setErrorMessage('An error occurred while linking Stripe account. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = () => {
        const trimmedSearch = search.trim();

        // If nothing is searched and category is 'all', reset view
        if (!trimmedSearch && selectedCategory === 'all') {
            setBoolSearch(false);
            setSearchItems([]);
            return;
        }

        const searchParams = new URLSearchParams();
        if (trimmedSearch) searchParams.append('search', trimmedSearch);
        if (selectedCategory && selectedCategory !== 'all') {
            searchParams.append('category', selectedCategory);
        }

        axios
            .get(`http://localhost:3000/products/searchProduct?${searchParams.toString()}`)
            .then((response) => {
                setSearchItems(response.data);
                setBoolSearch(true);
            })
            .catch((error) => console.error("Search failed:", error));
    };

useEffect(() => {
    const trimmedSearch = search.trim();

    // If both category is 'all' and search is empty => reset to original view
    if (!trimmedSearch && selectedCategory === 'all') {
        setBoolSearch(false);
        setSearchItems([]);
        return;
    }

    const searchParams = new URLSearchParams();
    if (trimmedSearch) searchParams.append('search', trimmedSearch);
    if (selectedCategory && selectedCategory !== 'all') {
        searchParams.append('category', selectedCategory);
    }

    axios
        .get(`http://localhost:3000/products/searchProduct?${searchParams.toString()}`)
        .then((response) => {
            setSearchItems(response.data);
            setBoolSearch(true);
        })
        .catch((error) => console.error("Search failed:", error));
}, [search, selectedCategory]); // Re-run search when either changes

    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <>
            <div className="">
                {/* Sidebar at top */}
                {sidebarOpen && (
                    <div className="shadow-md">
                        <SideBar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                    </div>
                )}

                {/* Page Content */}
                <div className="flex-1 p-4 md:p-6 space-y-6">
                    {/* Error Message Display */}
                    {errorMessage && (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded shadow-md">
                            <div className="flex items-center">
                                <svg className="h-6 w-6 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <p>{errorMessage}</p>
                            </div>
                            <button
                                onClick={() => setErrorMessage('')}
                                className="mt-2 text-sm text-red-700 hover:text-red-900 underline"
                            >
                                Dismiss
                            </button>
                        </div>
                    )}

                    {/* Top Search + Cart Area */}
                    <div className='grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4'>
                        {/* Search and Filter */}
                        <div className='flex flex-col md:flex-row justify-end items-center gap-2'>
                            <select
                                className='h-12 bg-blue-400 text-white rounded-l-2xl w-full md:w-1/3 pl-4 pr-2'
                                value={selectedCategory}
                               onChange={(e) => setSelectedCategory(e.target.value)}

                               >
                                <option value='all'>All Categories</option>
                                {Array.isArray(categories) && categories.map((cat) => (
                                    <option key={cat._id} value={cat.category} className='text-black bg-white'>
                                        {cat.category}
                                    </option>
                                ))}
                            </select>

                            <input
                                type='text'
                                placeholder='Search items here...'
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    if (e.target.value.trim() === '') {
                                        setBoolSearch(false);
                                        setSearchItems([]);
                                    }
                                }}
                                onKeyDown={handleSearchKeyDown}
                                className='h-12 bg-gray-100 w-full md:w-2/3 pl-4'
                            />

                            
                        </div>
                        {/* Buttons */}
                        <div className='grid grid-cols-2 gap-2'>
                            <button
                                onClick={() => navigate('/viewCart')}
                                className='flex justify-center items-center bg-red-500 hover:bg-red-600 border-2 border-black rounded-2xl h-12 text-white px-4'>
                                View cart <FaCartArrowDown size={24} className='ml-2' />
                            </button>
                            <button
                                onClick={handleSellProduct}
                                disabled={isLoading}
                                className={`flex justify-center items-center ${isLoading ? 'bg-blue-300' : 'bg-blue-500 hover:bg-blue-600'} border-2 border-black rounded-2xl h-12 text-white px-4`}>
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </>
                                ) : 'Sell a product'}
                            </button>
                        </div>
                    </div>
                    {boolSearch ? (
                        <div>
                            <div className="space-y-8">
                                {searchItems.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 w-full">
                                        {searchItems.map((item, idx) => (
                                            <div
                                                key={item._id || idx}
                                                onClick={() => navigate(`/products/${item._id}`)}
                                                className="border border-white hover:border-black p-4 rounded shadow bg-white flex flex-col cursor-pointer w-full h-full justify-between"
                                            >
                                                <img
                                                    src={item.imageURL}
                                                    alt={item.title}
                                                    className="w-auto h-40 rounded mb-2 object-cover"
                                                />
                                                <h2 className="text-2xl font-semibold">${item.price}</h2>
                                                <p className="text-lg font-semibold mt-2">{item.title}</p>
                                                <p className="text-sm mb-2 mt-1 text-blue-700">{item.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-white italic">No products found.</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div className="w-full h-[200px] md:h-[340px]">
                                <img src={`/${images[imageIndex]}`} alt='marketplace' className="w-full h-full object-cover rounded-2xl" />
                            </div>
                            <div className="space-y-8">
                                {Array.isArray(products) && products.map((cat, catIdx) => {
                                    const catProducts = cat.products || [];
                                    const bgColorClass = categoryBgColors[catIdx % categoryBgColors.length];

                                    return (
                                        <div key={catIdx} className={`p-4 flex flex-col items-start ${bgColorClass} rounded-xl shadow`}>
                                            <h2 className="text-2xl font-bold mb-4 text-white">{cat.category}</h2>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 w-full">
                                                {catProducts.length > 0 ? (
                                                    catProducts.map((product, idx) => (
                                                        <div
                                                            key={product._id || idx}
                                                            onClick={() => navigate(`/products/${product._id}`)}
                                                            className="border border-white hover:border-black p-4 rounded shadow bg-white flex flex-col cursor-pointer w-full h-full justify-between"
                                                        >
                                                            <img src={product.imageURL} alt={product.title} className="w-auto h-40 rounded mb-2 object-cover" />
                                                            <h2 className='text-2xl font-semibold'>${product.price}</h2>
                                                            <p className='text-lg font-semibold mt-2'>{product.title}</p>
                                                            <p className='text-sm mb-2 mt-1 text-blue-700'>{product.description}</p>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-white italic">No products in this category.</p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default MarketPlace;

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';

const ViewCart = () => {
    const [products, setProducts] = useState([]);
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCartItems = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/cart/getCartItems/${userData.userId}`, {
                    headers: {
                        Authorization: `Bearer ${userData.token}`
                    }
                });
                setProducts(response.data);
            } catch (error) {
                console.error('Error fetching cart items:', error);
            }
        };

        if (userData?.token) {
            fetchCartItems();
        }
    }, [userData.userId, userData.token]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header message1="Cart" message2="Your shopping cart" />
            <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">
                <h2 className="text-2xl font-bold mb-4">Your Cart</h2>

                {products.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-xl text-gray-500">Your cart is empty.</p>
                    </div>
                ) : (
                    <div className={`p-4 flex flex-col items-start bg-gradient-to-br from-blue-600 to-indigo-800 rounded-xl shadow`}>
                        <h2 className="text-2xl font-bold mb-4 text-white">Cart Items</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 w-full">
                            {products.map((item, idx) => (
                                <div
                                    key={item._id || idx}
                                    onClick={() => navigate(`/products/${item.productId?._id}`)}
                                    className="border border-white hover:border-black p-4 rounded shadow bg-white flex flex-col cursor-pointer w-full h-full justify-between"
                                >
                                    <img
                                        src={item.productId?.imageURL || '/default-product.png'}
                                        alt={item.productId?.title}
                                        className="w-auto h-40 rounded mb-2 object-cover"
                                    />
                                    <h2 className="text-2xl font-semibold">${item.productId?.price}</h2>
                                    <p className="text-lg font-semibold mt-2">{item.productId?.title}</p>
                                    <p className="text-sm mb-2 mt-1 text-blue-700">{item.productId?.description}</p>
                                    <p className="text-sm font-medium mt-1 text-gray-600">Quantity: {item.quantity}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ViewCart;

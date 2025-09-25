import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { FaCartArrowDown } from "react-icons/fa";
import { toast, ToastContainer } from 'react-toastify';
// Using a different icon as a replacement
import { IoEllipsisVertical } from 'react-icons/io5';
// Import getStripe function from utils
import getStripe from '../../src/utils/stripe';

const SpecificProduct = () => {
    const [product, setProduct] = useState({});
    const [selectedImage, setSelectedImage] = useState('');
    const { id } = useParams();
    const [reviews, setReviews] = useState([]);
    const [reviewSelected, setReviewSelected] = useState(true);
    const [relatedProductSelected, setRelatedProductSelected] = useState(false);
    const [provideReview, setProvideReview] = useState(false);
    const [review, setReview] = useState("");
    const userData = JSON.parse(localStorage.getItem('userData'));
    const [activeMenu, setActiveMenu] = useState(null); // for 3 dots
    //Taking values of cart
    const [productCount, setProductCount] = useState(1);
    //Total proced of all products
    const [total, setTotal] = useState(product.price);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);



    useEffect(() => {
        axios
            .get(`http://localhost:3000/products/${id}`)
            .then((res) => {
                setProduct(res.data);
                setSelectedImage(res.data.imageURL);
            })
            .catch((err) => console.log(err));
    }, [id]);

    useEffect(() => {
        axios
            .get(`http://localhost:3000/products/getReviews/${id}`)
            .then((res) => setReviews(res.data))
            .catch((err) => console.log(err));
    }, [id]);

    //Setting total price of products added to cart
    useEffect(() => {
        setTotal(product.price * productCount);
    }, [product.price, productCount]);


    const handleSendReview = async () => {
        try {
            if (!review.trim()) {
                toast.error("Please enter a review");
                return;
            }
            
            await axios.post(
                'http://localhost:3000/products/addReview',
                {
                    userId: userData.userId,
                    productId: id,
                    comment: review
                },
                {
                    headers: {
                        Authorization: `Bearer ${userData.token}`
                    }
                }
            );

            setReview("");
            setProvideReview(false);
            toast.success("Review added");

            const res = await axios.get(`http://localhost:3000/products/getReviews/${id}`);
            setReviews(res.data);

        } catch (error) {
            console.error("Error submitting review:", error);
            toast.error("Failed to add review");
        }
    };

    const handleDeleteReview = async (reviewId) => {
        try {
            await axios.delete(`http://localhost:3000/products/${reviewId}`, {
                headers: {
                    Authorization: `Bearer ${userData.token}`
                }
            });
            toast.success("Review deleted");

            // Refresh the reviews list
            const res = await axios.get(`http://localhost:3000/products/getReviews/${id}`);
            setReviews(res.data);
        } catch (error) {
            console.error("Error deleting review:", error);
            toast.error("Failed to delete review");
        }
    };

    const handleCart = async (e) => {
        const cartData = {
            quantity: Number(productCount),
            userId: userData.userId,
            productId: id,
        };

        // Save to localStorage
        localStorage.setItem('cartData', JSON.stringify(cartData));
        toast.success("Product added to cart");

        // Send to backend
        try {
            await axios.post(
                'http://localhost:3000/cart/addToCart',
                cartData,
                {
                    headers: {
                        Authorization: `Bearer ${userData.token}`,
                    },
                }
            );
        } catch (error) {
            console.error("Error adding to cart:", error);
            toast.error("Failed to add product to cart");
        }
        localStorage.removeItem('cartData');
    };

    const handleBuyNow = async () => {
        try {
            setIsProcessingPayment(true);
            toast.info("Preparing checkout...");
            
            // Get Stripe instance
            const stripe = await getStripe();
            if (!stripe) {
                throw new Error("Could not initialize Stripe");
            }
            
            // Create checkout session
            const response = await axios.post(
                'http://localhost:3000/checkout/create-checkout-session',
                {
                    items: [{
                        productId: product._id,
                        name: product.title,
                        price: product.price,
                        quantity: Number(productCount),
                        image: product.imageURL
                    }]
                },
                {
                    headers: {
                        Authorization: `Bearer ${userData.token}`
                    }
                }
            );
            
            // Check if we have a session ID
            const { sessionId, url } = response.data;
            
            if (sessionId) {
                // If we have a session ID, redirect using Stripe.js for better tracking
                const { error } = await stripe.redirectToCheckout({ sessionId });
                if (error) {
                    console.error("Stripe redirect error:", error);
                    toast.error(error.message);
                    setIsProcessingPayment(false);
                }
            } else if (url) {
                // Fallback to direct URL redirect
                window.location.href = url;
            } else {
                throw new Error("Invalid response from server");
            }
        } catch (error) {
            console.error("Error creating checkout session:", error);
            toast.error(error.message || "Failed to process payment. Please try again.");
            setIsProcessingPayment(false);
        }
    };


    return (
        <>
            <div className='grid grid-cols-2 p-12 gap-4'>
                {/* Product Info */}
                <div className='grid grid-rows-5 bg-gray-100 rounded-2xl h-full border-2 border-black'>
                    <div className='text-black text-4xl flex justify-center items-center'>Name: {product.title}</div>
                    <div className='flex justify-center items-center text-black text-3xl'>Description: {product.description}</div>
                    <div className='flex justify-center items-center'><p className='text-black text-4xl font-bold'>Price: ${product.price}</p></div>
                    <div className='flex justify-center items-center'>
                        <button
                            onClick={handleCart}
                            className='w-70 text-2xl flex justify-center items-center bg-red-500 hover:bg-red-600 border-2 border-black rounded-2xl h-12 text-white px-4'>
                            Add to cart <FaCartArrowDown size={24} className='ml-2' />
                        </button>
                    </div>
                    <div>
                        <input
                            id="quantity"
                            type="number"
                            min="1"
                            value={productCount}
                            onChange={(e) => setProductCount(e.target.value)}
                            className="border px-2 py-1 w-20"
                        />
                    </div>
                    <div>
                        <p className='font-bold text-lg'>Total price ${total}</p>
                    </div>
                    <div className='flex justify-center items-center'>
                        <button 
                            onClick={handleBuyNow}
                            disabled={isProcessingPayment}
                            className='text-2xl w-70 flex justify-center items-center bg-blue-500 hover:bg-blue-600 border-2 border-black rounded-2xl h-12 text-white px-4 disabled:bg-gray-400 disabled:cursor-not-allowed'
                        >
                            {isProcessingPayment ? 'Processing...' : 'Buy now'}
                        </button>
                    </div>
                </div>

                {/* Product Images */}
                <div className='grid grid-rows-[7fr_2fr] gap-2'>
                    <div className='h-full w-full flex justify-center items-center bg-gray-100 border-2 gap-2 border-black rounded-2xl p-4'>
                        {selectedImage ? (
                            <img src={selectedImage} alt="Selected" className='max-h-[400px] object-contain' />
                        ) : (
                            <p>No image selected</p>
                        )}
                    </div>

                    <div className='grid grid-cols-4 gap-2'>
                        {[product.imageURL, product.imageURL1, product.imageURL2, product.imageURL3].map((img, idx) => (
                            <div key={idx} className='flex justify-center items-center'>
                                <img
                                    src={img || '/default product image.png'}
                                    alt={`product-${idx}`}
                                    onClick={() => setSelectedImage(img || '/default product image.png')}
                                    className='h-24 w-24 object-cover cursor-pointer rounded-2xl border-black border-2'
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tabs: Review & Related Products */}
                <div className='grid grid-rows-[1fr_7fr] col-span-2 mt-8'>
                    <div className='grid grid-cols-2 gap-4'>
                        <button
                            onClick={() => {
                                setReviewSelected(true);
                                setRelatedProductSelected(false);
                            }}
                            className={`py-2 px-4 rounded-lg ${reviewSelected ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}
                        >
                            Reviews
                        </button>
                        <button
                            onClick={() => {
                                setReviewSelected(false);
                                setRelatedProductSelected(true);
                            }}
                            className={`py-2 px-4 rounded-lg ${relatedProductSelected ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}
                        >
                            Related Products
                        </button>
                    </div>

                    <div className='mt-4'>
                        {reviewSelected && (
                            <div className="flex flex-col items-start gap-4">
                                <div className="text-lg text-black font-semibold">User Reviews:</div>
                                {reviews?.length > 0 ? (
                                    reviews.map((r, i) => (
                                        <div
                                            key={r._id}
                                            className="flex items-start gap-4 p-4 rounded-xl shadow-md border border-gray-300 bg-white w-full relative"
                                        >
                                            {/* Avatar */}
                                            <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold text-lg">
                                                {r.userId?.username?.charAt(0).toUpperCase() || 'U'}
                                            </div>

                                            {/* Review Content */}
                                            <div className="flex flex-col w-full">
                                                <div className="flex justify-between items-center">
                                                    <div className="flex gap-2">
                                                        <p className="font-semibold text-black">{r.userId?.username || 'Anonymous'}</p>
                                                        <p className="text-sm text-gray-500">({r.userId?.role})</p>
                                                    </div>
                                                    {r.userId?._id === userData.userId && (
                                                        <div className="relative">
                                                            <button onClick={() => setActiveMenu(activeMenu === r._id ? null : r._id)}>
                                                                <IoEllipsisVertical />
                                                            </button>
                                                            {activeMenu === r._id && (
                                                                <div className="absolute right-0 mt-2 bg-white shadow border rounded z-10">
                                                                    <button
                                                                        className="text-red-600 hover:bg-gray-100 px-4 py-2 w-full text-left"
                                                                        onClick={() => handleDeleteReview(r._id)}
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="mt-1 bg-gray-100 p-3 rounded-lg text-black">
                                                    {r.comment}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500">No reviews yet.</p>
                                )}

                                {/* Review input */}
                                <button
                                    onClick={() => setProvideReview(!provideReview)}
                                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg border-2 border-black"
                                >
                                    Provide Review
                                </button>

                                {provideReview && (
                                    <div className='w-full p-4 bg-gray-200 rounded-lg'>
                                        <input
                                            type="text"
                                            placeholder='Enter your review...'
                                            value={review}
                                            onChange={(e) => setReview(e.target.value)}
                                            className='w-full p-2 rounded border border-gray-400 mb-2'
                                        />
                                        <button
                                            onClick={handleSendReview}
                                            className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600'
                                        >
                                            Send Review
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {relatedProductSelected && (
                            <div className="text-lg text-black">Show related products here...</div>
                        )}
                    </div>
                </div>
            </div>
            <ToastContainer position="top-right" autoClose={2000} />
        </>
    );
};

export default SpecificProduct;

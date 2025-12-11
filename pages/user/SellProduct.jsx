import Header from '../../components/Header'

import { useState, useEffect } from 'react'
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios'

const SellProduct = () => {
    const [categories, setCategories] = useState([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [image, setImage] = useState(null);
    const [image1, setImage1] = useState(null);
    const [image2, setImage2] = useState(null);
    const [image3, setImage3] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [poorInternet, setPoorInternet] = useState(false);

    useEffect(() => {
        fetch('http://localhost:3000/category/allCategories')
            .then((res) => res.json())
            .then((data) => setCategories(data.categories))
            .catch(() => console.log("error in fetching"))
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault();
        const userData = JSON.parse(localStorage.getItem("userData"));

        if (!image) {
            toast.error("❌ Main product image is required!");
            return;
        }
        if (!selectedCategory) {
            toast.error("❌ Please select a category!");
            return;
        }
        const userId = userData.userId;
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('price', price);
        formData.append('userId', userId);
        formData.append('category', selectedCategory);
        if (image) formData.append('image', image);
        if (image1) formData.append('image1', image1);
        if (image2) formData.append('image2', image2);
        if (image3) formData.append('image3', image3);

        setUploading(true);
        setUploadProgress(0);
        setPoorInternet(false);

        const poorInternetTimer = setTimeout(() => {

            setPoorInternet(true);
            toast.warn("Poor internet connection!");

        }, 6000);

        try {
            const response = await axios.post(
                'http://localhost:3000/sell/uploadProduct',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    onUploadProgress: (progressEvent) => {
                        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setUploadProgress(percent);
                    }
                }
            );
            if (response.status === 201 || response.status === 200) {
                toast.success("✅ Product posted successfully");
                setTitle("");
                setDescription("");
                setPrice("");
                setImage(null);
                setImage1(null);
                setImage2(null);
                setImage3(null);
                setSelectedCategory("");
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error("❌ Error in uploading file!");
        } finally {
            clearTimeout(poorInternetTimer); // Clear timer if upload finishes
            setTimeout(() => {
                setUploading(false);
                setUploadProgress(0);
                setPoorInternet(false);
            }, 800);
        }
    }

    return (
        <>

            {uploading && (
                <div className="fixed top-0 left-0 w-full z-50">
                    <div className="w-full h-2 bg-gray-200 rounded-b-2xl overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-200"
                            style={{ width: `${uploadProgress}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-center mt-2">
                        <span className="text-blue-600 font-semibold bg-white px-4 py-1 rounded-xl shadow">
                            Uploading please wait... {uploadProgress}%
                        </span>
                    </div>
                </div>
            )}

            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Header message1="Sell product" message2="You can post product to sell by providing details below" />
                <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 overflow-y-auto">
                    <form onSubmit={handleSubmit}>
                        <div className='grid grid-cols-2'>
                            <div className='grid grid-rows-10'>
                                <div className='flex items-center pl-18 mt-4'>
                                    <label className='font-semibold text-2xl'>Product title</label>
                                </div>
                                <div className='flex justify-center items-center mb-4'>
                                    <input
                                        type='text'
                                        placeholder='Enter product title here...'
                                        className='border-2 border-black h-12 bg-gray-100 rounded-2xl w-3/4 pl-4 mt-2'
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className='flex items-center pl-18 mt-4'>
                                    <label className='font-semibold text-2xl'>Add description</label>
                                </div>
                                <div className='flex justify-center items-center mb-4'>
                                    <input
                                        type='text'
                                        placeholder='Enter product description here...'
                                        className='border-2 border-black h-12 bg-gray-100 rounded-2xl w-3/4 pl-4 mt-2'
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className='flex items-center pl-18 mt-4'>
                                    <label className='font-semibold text-2xl'>Enter price in dollars</label>
                                </div>
                                <div className='flex justify-center items-center mb-4'>
                                    <input
                                        type='number'
                                        placeholder='Enter product price'
                                        className='border-2 border-black h-12 bg-gray-100 rounded-2xl w-2/4 pl-4 mt-2'
                                        value={price}
                                        onChange={e => setPrice(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className='flex items-center pl-18 mt-4'>
                                    <label className='font-semibold text-2xl'>Select category</label>
                                </div>
                                <div className='flex justify-center items-center mb-4'>
                                    <select
                                        value={selectedCategory}
                                        onChange={e => setSelectedCategory(e.target.value)}
                                        className='border-2 border-black h-12 bg-gray-100 rounded-2xl w-2/4 pl-4 mt-2 text-black'
                                        required
                                    >
                                        <option value="" disabled>Select category</option>
                                        {
                                            categories.map((category) => (
                                                <option key={category._id} value={category.category} className='text-2xl text-black'>{category.category}</option>
                                            ))
                                        }
                                    </select>
                                </div>

                            </div>
                            <div className='grid grid-rows-[1fr_4fr]'>

                                <div className='flex justify-end items-start mr-17'>
                                    <button
                                        type="submit"
                                        className='cursor-pointer bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-2xl'
                                    >
                                        Submit to sell
                                    </button>
                                </div>
                                <div className='grid grid-cols-2 grid-rows-2'>
                                    {/* Main Image */}
                                    <div className='grid grid-rows-[2fr_1fr]'>
                                        <div className='flex justify-center items-end border-2 border-black rounded-2xl'>
                                            <img
                                                src={image ? URL.createObjectURL(image) : '/default product image.png'}
                                                alt='Product Preview'
                                                className='w-3/4 h-48 object-cover rounded-2xl mb-2'
                                            />
                                        </div>
                                        <div className='flex justify-center items-center mb-4'>
                                            <label className='flex justify-center items-center overflow-hidden w-3/4 h-12 bg-red-500 hover:bg-red-600 cursor-pointer rounded-2xl text-white border-2 border-black'>
                                                {image ? image.name : "Upload Main image here"}
                                                <input
                                                    type='file'
                                                    accept='image/*'
                                                    style={{ display: 'none' }}
                                                    onChange={e => {
                                                        if (e.target.files && e.target.files[0]) setImage(e.target.files[0]);
                                                    }}
                                                />
                                            </label>
                                        </div>
                                    </div>

                                    {/* 2nd Image */}
                                    <div className='grid grid-rows-[2fr_1fr]'>
                                        <div className='flex justify-center items-end border-2 border-black rounded-2xl'>
                                            <img
                                                src={image1 ? URL.createObjectURL(image1) : '/default product image.png'}
                                                alt='Product Preview'
                                                className='w-3/4 h-48 object-cover rounded-2xl mb-2'
                                            />
                                        </div>
                                        <div className='flex justify-center items-center mb-4'>
                                            <label className='flex justify-center items-center overflow-hidden w-3/4 h-12 bg-red-500 hover:bg-red-600 cursor-pointer rounded-2xl text-white border-2 border-black'>
                                                {image1 ? image1.name : "Upload 2nd image here"}
                                                <input
                                                    type='file'
                                                    accept='image/*'
                                                    style={{ display: 'none' }}
                                                    onChange={e => {
                                                        if (e.target.files && e.target.files[0]) setImage1(e.target.files[0]);
                                                    }}
                                                />
                                            </label>
                                        </div>
                                    </div>

                                    {/* 3rd Image */}
                                    <div className='grid grid-rows-[2fr_1fr]'>
                                        <div className='flex justify-center items-end border-2 border-black rounded-2xl'>
                                            <img
                                                src={image2 ? URL.createObjectURL(image2) : '/default product image.png'}
                                                alt='Product Preview'
                                                className='w-3/4 h-48 object-cover rounded-2xl mb-2'
                                            />
                                        </div>
                                        <div className='flex justify-center items-center mb-4'>
                                            <label className='flex justify-center items-center overflow-hidden w-3/4 h-12 bg-red-500 hover:bg-red-600 cursor-pointer rounded-2xl text-white border-2 border-black'>
                                                {image2 ? image2.name : "Upload 3rd image here"}
                                                <input
                                                    type='file'
                                                    accept='image/*'
                                                    style={{ display: 'none' }}
                                                    onChange={e => {
                                                        if (e.target.files && e.target.files[0]) setImage2(e.target.files[0]);
                                                    }}
                                                />
                                            </label>
                                        </div>
                                    </div>

                                    {/* 4th Image */}
                                    <div className='grid grid-rows-[2fr_1fr]'>
                                        <div className='flex justify-center items-end border-2 border-black rounded-2xl'>
                                            <img
                                                src={image3 ? URL.createObjectURL(image3) : '/default product image.png'}
                                                alt='Product Preview'
                                                className='w-3/4 h-48 object-cover rounded-2xl mb-2'
                                            />
                                        </div>
                                        <div className='flex justify-center items-center mb-4'>
                                            <label className='flex justify-center items-center overflow-hidden w-3/4 h-12 bg-red-500 hover:bg-red-600 cursor-pointer rounded-2xl text-white border-2 border-black'>
                                                {image3 ? image3.name : "Upload 4th image here"}
                                                <input
                                                    type='file'
                                                    accept='image/*'
                                                    style={{ display: 'none' }}
                                                    onChange={e => {
                                                        if (e.target.files && e.target.files[0]) setImage3(e.target.files[0]);
                                                    }}
                                                />
                                            </label>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </form>
                </div>

            </div>
            <ToastContainer position="top-right" autoClose={2000} />
        </>
    )
}
export default SellProduct;
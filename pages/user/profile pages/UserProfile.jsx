import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Header from '../../../components/Header';
import {
    IoCamera, IoLocationOutline, IoLinkOutline, IoSettingsOutline,
    IoImageOutline, IoHeart, IoHeartOutline, IoChatbubbleOutline,
    IoTrashOutline, IoClose, IoCalendarOutline, IoMaleFemaleOutline,
    IoMailOutline, IoPersonOutline, IoShieldCheckmarkOutline, IoCheckmarkCircle
} from 'react-icons/io5';

const UserProfile = () => {
    const { username } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isOwnProfile, setIsOwnProfile] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [activeTab, setActiveTab] = useState('posts');

    // Edit Modal State
    const [showEditModal, setShowEditModal] = useState(false);
    const [editTab, setEditTab] = useState('basic');
    const [saving, setSaving] = useState(false);

    // Edit Form State
    const [editForm, setEditForm] = useState({
        username: '',
        userEmail: '',
        gender: '',
        birthdate: '',
        bio: '',
        location: '',
        website: '',
        profileVisibility: 'public',
        messagePermission: 'everyone'
    });

    // Posts state
    const [posts, setPosts] = useState([]);
    const [newPostContent, setNewPostContent] = useState('');
    const [selectedMedia, setSelectedMedia] = useState([]);
    const [mediaPreview, setMediaPreview] = useState([]);
    const [activeCommentId, setActiveCommentId] = useState(null);
    const [commentText, setCommentText] = useState('');

    const coverInputRef = useRef(null);
    const mediaInputRef = useRef(null);
    const profilePicInputRef = useRef(null);
    const userData = JSON.parse(localStorage.getItem('userData'));
    const currentUserId = userData?.userId;

    useEffect(() => {
        fetchProfile();
    }, [username]);

    useEffect(() => {
        if (user && activeTab === 'posts') {
            fetchPosts();
        }
    }, [user, activeTab]);

    const fetchProfile = async () => {
        try {
            const res = await axios.get(`http://localhost:3000/social/profile/${username}`);
            if (res.data.success) {
                const userData = res.data.user;
                setUser(userData);

                // Initialize edit form with user data
                setEditForm({
                    username: userData.username || '',
                    userEmail: userData.userEmail || '',
                    gender: userData.gender || '',
                    birthdate: userData.birthdate ? new Date(userData.birthdate).toISOString().split('T')[0] : '',
                    bio: userData.bio || '',
                    location: userData.location || '',
                    website: userData.website || '',
                    profileVisibility: userData.privacy?.profileVisibility || 'public',
                    messagePermission: userData.privacy?.messagePermission || 'everyone'
                });

                setIsOwnProfile(userData._id === currentUserId);
                setIsFollowing(userData.followers?.some(f => f._id === currentUserId));
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const fetchPosts = async () => {
        try {
            const res = await axios.get(`http://localhost:3000/profile-posts/user/${user._id}`);
            if (res.data.success) {
                setPosts(res.data.posts);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleMediaSelect = (e) => {
        if (e.target.files) {
            const files = Array.from(e.target.files).slice(0, 5);
            setSelectedMedia(files);
            const previews = files.map(file => URL.createObjectURL(file));
            setMediaPreview(previews);
        }
    };

    const handleCreatePost = async () => {
        if (!newPostContent.trim() && selectedMedia.length === 0) {
            return toast.error('Post must have content or media');
        }

        try {
            const formData = new FormData();
            formData.append('author', currentUserId);
            formData.append('content', newPostContent);
            selectedMedia.forEach(file => {
                formData.append('media', file);
            });

            const res = await axios.post('http://localhost:3000/profile-posts/create', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.success) {
                setNewPostContent('');
                setSelectedMedia([]);
                setMediaPreview([]);
                toast.success('Posted!');
                fetchPosts();
            }
        } catch (error) {
            toast.error('Failed to create post');
        }
    };

    const handleLikePost = async (postId) => {
        try {
            const res = await axios.post(`http://localhost:3000/profile-posts/like/${postId}`, {
                userId: currentUserId
            });
            if (res.data.success) {
                setPosts(posts.map(p => p._id === postId ? { ...p, likes: res.data.likes } : p));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleCommentPost = async (postId) => {
        if (!commentText.trim()) return;
        try {
            const res = await axios.post(`http://localhost:3000/profile-posts/comment/${postId}`, {
                userId: currentUserId,
                text: commentText
            });
            if (res.data.success) {
                setPosts(posts.map(p => {
                    if (p._id === postId) {
                        return { ...p, comments: [...p.comments, res.data.comment] };
                    }
                    return p;
                }));
                setCommentText('');
            }
        } catch (error) {
            toast.error('Failed to comment');
        }
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm('Delete this post?')) return;
        try {
            const res = await axios.delete(`http://localhost:3000/profile-posts/${postId}`, {
                data: { userId: currentUserId }
            });
            if (res.data.success) {
                setPosts(posts.filter(p => p._id !== postId));
                toast.success('Post deleted');
            }
        } catch (error) {
            toast.error('Failed to delete post');
        }
    };

    const handleFollow = async () => {
        try {
            const endpoint = isFollowing ? 'unfollow' : 'follow';
            const res = await axios.post(`http://localhost:3000/social/${endpoint}/${user._id}`, {
                userId: currentUserId
            });

            if (res.data.success) {
                setIsFollowing(!isFollowing);
                fetchProfile();
                toast.success(isFollowing ? 'Unfollowed' : 'Following!');
            }
        } catch (error) {
            toast.error('Action failed');
        }
    };

    const handleCoverUpload = async (e) => {
        if (!e.target.files || !e.target.files[0]) return;

        const formData = new FormData();
        formData.append('cover', e.target.files[0]);
        formData.append('userId', currentUserId);

        try {
            const res = await axios.post('http://localhost:3000/social/profile/upload-cover', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.success) {
                setUser({ ...user, coverPhoto: res.data.coverPhoto });
                toast.success('Cover photo updated!');

                const storedUserData = JSON.parse(localStorage.getItem('userData'));
                if (storedUserData && storedUserData.userId === currentUserId) {
                    storedUserData.coverPhoto = res.data.coverPhoto;
                    localStorage.setItem('userData', JSON.stringify(storedUserData));
                }
            }
        } catch (error) {
            toast.error('Failed to upload cover photo');
        }
    };

    const handleProfilePicUpload = async (e) => {
        if (!e.target.files || !e.target.files[0]) return;

        const formData = new FormData();
        formData.append('picture', e.target.files[0]);
        formData.append('userId', currentUserId);

        try {
            const res = await axios.post('http://localhost:3000/social/profile/upload-picture', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.success) {
                setUser({ ...user, profilePicture: res.data.profilePicture });
                toast.success('Profile picture updated!');

                const storedUserData = JSON.parse(localStorage.getItem('userData'));
                if (storedUserData && storedUserData.userId === currentUserId) {
                    storedUserData.profilePic = res.data.profilePicture;
                    localStorage.setItem('userData', JSON.stringify(storedUserData));
                }
            }
        } catch (error) {
            toast.error('Failed to upload profile picture');
        }
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            const res = await axios.put('http://localhost:3000/social/profile/update', {
                userId: currentUserId,
                username: editForm.username,
                userEmail: editForm.userEmail,
                gender: editForm.gender,
                birthdate: editForm.birthdate,
                bio: editForm.bio,
                location: editForm.location,
                website: editForm.website,
                privacy: {
                    profileVisibility: editForm.profileVisibility,
                    messagePermission: editForm.messagePermission
                }
            });

            if (res.data.success) {
                setUser(res.data.user);
                setShowEditModal(false);
                toast.success('Profile updated successfully!');

                // Update localStorage
                const storedUserData = JSON.parse(localStorage.getItem('userData'));
                if (storedUserData && storedUserData.userId === currentUserId) {
                    const updatedUserData = {
                        ...storedUserData,
                        username: res.data.user.username,
                        userEmail: res.data.user.userEmail,
                        bio: res.data.user.bio,
                        location: res.data.user.location,
                        website: res.data.user.website
                    };
                    localStorage.setItem('userData', JSON.stringify(updatedUserData));
                }

                // If username changed, navigate to new profile URL
                if (editForm.username !== username) {
                    navigate(`/profile/${editForm.username}`);
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-xl text-gray-700 font-semibold">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-2xl text-gray-700 font-bold">User not found</p>
                    <button onClick={() => navigate('/')} className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
            <Header message1={user.username} message2="Profile" />

            <div className="max-w-6xl mx-auto pb-8 px-4">
                {/* Cover Photo with Glassmorphism */}
                <div className="relative h-96 rounded-3xl overflow-hidden shadow-2xl group mt-4">
                    {user.coverPhoto ? (
                        <img src={user.coverPhoto} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500" />
                    )}

                    {/* Glassmorphism Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>

                    {isOwnProfile && (
                        <button
                            onClick={() => coverInputRef.current.click()}
                            className="absolute bottom-6 right-6 bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-2xl shadow-xl hover:bg-white/30 transition-all duration-300 opacity-0 group-hover:opacity-100 flex items-center gap-2 font-semibold border border-white/30 z-50"
                        >
                            <IoCamera size={20} /> Edit Cover
                        </button>
                    )}
                    <input
                        type="file"
                        ref={coverInputRef}
                        onChange={handleCoverUpload}
                        className="hidden"
                        accept="image/*"
                    />
                </div>

                {/* Profile Info Card with Glassmorphism */}
                <div className="bg-white/70 backdrop-blur-xl shadow-2xl -mt-24 mx-4 rounded-3xl p-8 border border-white/50">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        {/* Profile Picture */}
                        <div className="relative -mt-20 group">
                            <div className="relative">
                                <img
                                    src={user.profilePicture || '/male default avatar.png'}
                                    alt={user.username}
                                    className="w-40 h-40 rounded-full border-8 border-white shadow-2xl object-cover ring-4 ring-purple-200"
                                />
                                {isOwnProfile && (
                                    <button
                                        onClick={() => profilePicInputRef.current.click()}
                                        className="absolute bottom-2 right-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-3 rounded-full shadow-xl hover:from-purple-700 hover:to-pink-700 opacity-0 group-hover:opacity-100 transition-all duration-300 transform hover:scale-110"
                                    >
                                        <IoCamera size={24} />
                                    </button>
                                )}
                            </div>
                            <input
                                type="file"
                                ref={profilePicInputRef}
                                onChange={handleProfilePicUpload}
                                className="hidden"
                                accept="image/*"
                            />
                        </div>

                        {/* User Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                <div>
                                    <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                        {user.username}
                                    </h1>
                                    <p className="text-gray-600 text-lg mt-1">@{user.username.toLowerCase().replace(/\s/g, '')}</p>
                                    {user.userEmail && (
                                        <div className="flex items-center gap-2 mt-2 text-gray-700">
                                            <IoMailOutline className="text-purple-600" />
                                            <span className="text-sm">{user.userEmail}</span>
                                        </div>
                                    )}
                                </div>

                                {isOwnProfile ? (
                                    <button
                                        onClick={() => setShowEditModal(true)}
                                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                                    >
                                        <IoSettingsOutline size={20} /> Edit Profile
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleFollow}
                                        className={`px-8 py-3 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg ${isFollowing
                                            ? 'bg-white/50 hover:bg-white/70 text-gray-800 border-2 border-gray-300'
                                            : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                                            }`}
                                    >
                                        {isFollowing ? 'Following' : 'Follow'}
                                    </button>
                                )}
                            </div>

                            {/* Stats */}
                            <div className="flex flex-wrap gap-8 mt-6">
                                <div className="text-center">
                                    <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{posts.length}</p>
                                    <p className="text-sm text-gray-600 font-semibold">Posts</p>
                                </div>
                                <div className="text-center cursor-pointer hover:scale-110 transition-transform">
                                    <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{user.followers?.length || 0}</p>
                                    <p className="text-sm text-gray-600 font-semibold">Followers</p>
                                </div>
                                <div className="text-center cursor-pointer hover:scale-110 transition-transform">
                                    <p className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">{user.following?.length || 0}</p>
                                    <p className="text-sm text-gray-600 font-semibold">Following</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-3xl font-bold">⭐ {user.reputationPoints || 0}</p>
                                    <p className="text-sm text-gray-600 font-semibold">Reputation</p>
                                </div>
                            </div>

                            {/* Bio and Details */}
                            <div className="mt-6 space-y-3">
                                {user.bio && (
                                    <p className="text-gray-800 text-lg leading-relaxed">{user.bio}</p>
                                )}
                                <div className="flex flex-wrap gap-6 text-gray-700">
                                    {user.location && (
                                        <span className="flex items-center gap-2 bg-purple-100 px-4 py-2 rounded-full">
                                            <IoLocationOutline className="text-purple-600" size={18} />
                                            <span className="font-medium">{user.location}</span>
                                        </span>
                                    )}
                                    {user.website && (
                                        <a
                                            href={user.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-full text-blue-700 hover:bg-blue-200 transition"
                                        >
                                            <IoLinkOutline size={18} />
                                            <span className="font-medium">{user.website}</span>
                                        </a>
                                    )}
                                    {user.birthdate && (
                                        <span className="flex items-center gap-2 bg-pink-100 px-4 py-2 rounded-full">
                                            <IoCalendarOutline className="text-pink-600" size={18} />
                                            <span className="font-medium">{new Date(user.birthdate).toLocaleDateString()}</span>
                                        </span>
                                    )}
                                    {user.gender && (
                                        <span className="flex items-center gap-2 bg-indigo-100 px-4 py-2 rounded-full">
                                            <IoMaleFemaleOutline className="text-indigo-600" size={18} />
                                            <span className="font-medium capitalize">{user.gender}</span>
                                        </span>
                                    )}
                                </div>
                                {user.badges?.length > 0 && (
                                    <div className="flex flex-wrap gap-3 mt-4">
                                        {user.badges.map((badge, idx) => (
                                            <span
                                                key={idx}
                                                className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2"
                                            >
                                                <IoCheckmarkCircle /> {badge}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white/70 backdrop-blur-xl shadow-xl mx-4 mt-6 rounded-3xl border border-white/50 overflow-hidden">
                    <div className="flex border-b border-gray-200">
                        {['posts', 'about', 'photos'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 py-5 font-bold text-lg transition-all duration-300 ${activeTab === tab
                                    ? 'text-purple-600 border-b-4 border-purple-600 bg-purple-50'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        {activeTab === 'posts' && (
                            <div className="space-y-6">
                                {/* Post Composer */}
                                {isOwnProfile && (
                                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200 shadow-lg">
                                        <textarea
                                            value={newPostContent}
                                            onChange={(e) => setNewPostContent(e.target.value)}
                                            placeholder="What's on your mind?"
                                            className="w-full border-none bg-white/70 backdrop-blur-sm rounded-xl p-4 focus:ring-2 focus:ring-purple-500 resize-none text-lg"
                                            rows={3}
                                        />
                                        {mediaPreview.length > 0 && (
                                            <div className="grid grid-cols-3 gap-3 mt-4">
                                                {mediaPreview.map((preview, idx) => (
                                                    <img key={idx} src={preview} alt="Preview" className="w-full h-32 object-cover rounded-xl shadow-md" />
                                                ))}
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center mt-4 pt-4 border-t border-purple-200">
                                            <button
                                                onClick={() => mediaInputRef.current.click()}
                                                className="text-purple-600 hover:bg-purple-100 p-3 rounded-full transition"
                                            >
                                                <IoImageOutline size={28} />
                                            </button>
                                            <input
                                                type="file"
                                                ref={mediaInputRef}
                                                onChange={handleMediaSelect}
                                                className="hidden"
                                                accept="image/*,video/*"
                                                multiple
                                            />
                                            <button
                                                onClick={handleCreatePost}
                                                disabled={!newPostContent.trim() && selectedMedia.length === 0}
                                                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all duration-300 transform hover:scale-105"
                                            >
                                                Post
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Posts List */}
                                {posts.map(post => (
                                    <div key={post._id} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                                        <div className="flex justify-between items-start">
                                            <div className="flex gap-4">
                                                <img src={post.author?.profilePicture || '/male default avatar.png'} className="w-14 h-14 rounded-full object-cover ring-2 ring-purple-200" />
                                                <div>
                                                    <p className="font-bold text-lg text-gray-900">{post.author?.username}</p>
                                                    <p className="text-sm text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            {isOwnProfile && (
                                                <button onClick={() => handleDeletePost(post._id)} className="text-red-500 hover:bg-red-50 p-2 rounded-full transition">
                                                    <IoTrashOutline size={20} />
                                                </button>
                                            )}
                                        </div>
                                        <p className="mt-4 text-gray-800 text-lg whitespace-pre-wrap leading-relaxed">{post.content}</p>
                                        {post.media?.length > 0 && (
                                            <div className="grid grid-cols-2 gap-3 mt-4">
                                                {post.media.map((url, idx) => (
                                                    <img key={idx} src={url} alt="Post media" className="w-full rounded-xl object-cover max-h-80 shadow-md" />
                                                ))}
                                            </div>
                                        )}
                                        <div className="flex gap-8 mt-6 text-gray-600">
                                            <button
                                                onClick={() => handleLikePost(post._id)}
                                                className={`flex items-center gap-2 font-semibold transition-all ${post.likes?.includes(currentUserId) ? 'text-red-500' : 'hover:text-red-500'
                                                    }`}
                                            >
                                                {post.likes?.includes(currentUserId) ? <IoHeart size={24} /> : <IoHeartOutline size={24} />}
                                                <span>{post.likes?.length || 0}</span>
                                            </button>
                                            <button
                                                onClick={() => setActiveCommentId(activeCommentId === post._id ? null : post._id)}
                                                className="flex items-center gap-2 hover:text-blue-500 font-semibold transition"
                                            >
                                                <IoChatbubbleOutline size={24} />
                                                <span>{post.comments?.length || 0}</span>
                                            </button>
                                        </div>

                                        {/* Comments */}
                                        {activeCommentId === post._id && (
                                            <div className="mt-6 pt-6 border-t border-gray-100 space-y-4">
                                                {post.comments?.map((comment, idx) => (
                                                    <div key={idx} className="flex gap-3">
                                                        <img src={comment.user?.profilePicture || '/male default avatar.png'} className="w-10 h-10 rounded-full object-cover" />
                                                        <div className="bg-gray-100 px-5 py-3 rounded-2xl rounded-tl-none flex-1">
                                                            <p className="text-sm font-bold text-gray-900">{comment.user?.username}</p>
                                                            <p className="text-gray-800 mt-1">{comment.text}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                                <div className="flex gap-3 mt-4">
                                                    <input
                                                        type="text"
                                                        value={commentText}
                                                        onChange={(e) => setCommentText(e.target.value)}
                                                        placeholder="Write a comment..."
                                                        className="flex-1 border-2 border-gray-200 rounded-full px-6 py-3 text-sm focus:outline-none focus:border-purple-500 transition"
                                                        onKeyDown={(e) => e.key === 'Enter' && handleCommentPost(post._id)}
                                                    />
                                                    <button
                                                        onClick={() => handleCommentPost(post._id)}
                                                        disabled={!commentText.trim()}
                                                        className="text-purple-600 font-bold px-6 disabled:opacity-50 hover:bg-purple-50 rounded-full transition"
                                                    >
                                                        Post
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {posts.length === 0 && (
                                    <div className="text-center py-20">
                                        <p className="text-2xl text-gray-400 font-semibold">No posts yet{isOwnProfile ? '. Share something!' : '.'}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'about' && (
                            <div className="space-y-6">
                                <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">About</h3>
                                {user.bio && (
                                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-200">
                                        <p className="text-gray-800 text-lg leading-relaxed">{user.bio}</p>
                                    </div>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {user.location && (
                                        <div className="flex items-center gap-4 bg-white p-5 rounded-2xl shadow-md border border-gray-100">
                                            <IoLocationOutline className="text-purple-600" size={28} />
                                            <div>
                                                <p className="text-sm text-gray-500 font-semibold">Location</p>
                                                <p className="text-gray-900 font-bold text-lg">{user.location}</p>
                                            </div>
                                        </div>
                                    )}
                                    {user.website && (
                                        <div className="flex items-center gap-4 bg-white p-5 rounded-2xl shadow-md border border-gray-100">
                                            <IoLinkOutline className="text-blue-600" size={28} />
                                            <div>
                                                <p className="text-sm text-gray-500 font-semibold">Website</p>
                                                <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-bold text-lg">
                                                    {user.website}
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                    {user.birthdate && (
                                        <div className="flex items-center gap-4 bg-white p-5 rounded-2xl shadow-md border border-gray-100">
                                            <IoCalendarOutline className="text-pink-600" size={28} />
                                            <div>
                                                <p className="text-sm text-gray-500 font-semibold">Birthday</p>
                                                <p className="text-gray-900 font-bold text-lg">{new Date(user.birthdate).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    )}
                                    {user.gender && (
                                        <div className="flex items-center gap-4 bg-white p-5 rounded-2xl shadow-md border border-gray-100">
                                            <IoMaleFemaleOutline className="text-indigo-600" size={28} />
                                            <div>
                                                <p className="text-sm text-gray-500 font-semibold">Gender</p>
                                                <p className="text-gray-900 font-bold text-lg capitalize">{user.gender}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'photos' && (
                            <div className="text-center py-20">
                                <p className="text-2xl text-gray-400 font-semibold">Photo gallery coming soon...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Edit Profile Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 flex justify-between items-center">
                            <h2 className="text-3xl font-bold text-white">Edit Profile</h2>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="text-white hover:bg-white/20 p-2 rounded-full transition"
                            >
                                <IoClose size={32} />
                            </button>
                        </div>

                        {/* Modal Tabs */}
                        <div className="flex border-b border-gray-200 bg-gray-50">
                            {[
                                { id: 'basic', label: 'Basic Info', icon: <IoPersonOutline /> },
                                { id: 'details', label: 'Profile Details', icon: <IoSettingsOutline /> },
                                { id: 'privacy', label: 'Privacy', icon: <IoShieldCheckmarkOutline /> }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setEditTab(tab.id)}
                                    className={`flex-1 py-4 font-bold flex items-center justify-center gap-2 transition ${editTab === tab.id
                                        ? 'text-purple-600 border-b-4 border-purple-600 bg-white'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    {tab.icon}
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Modal Content */}
                        <div className="p-8 overflow-y-auto flex-1">
                            {editTab === 'basic' && (
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Username</label>
                                        <input
                                            type="text"
                                            value={editForm.username}
                                            onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                                            className="w-full border-2 border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-lg"
                                            placeholder="Enter username"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                                        <input
                                            type="email"
                                            value={editForm.userEmail}
                                            onChange={(e) => setEditForm({ ...editForm, userEmail: e.target.value })}
                                            className="w-full border-2 border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-lg"
                                            placeholder="Enter email"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Gender</label>
                                        <select
                                            value={editForm.gender}
                                            onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                                            className="w-full border-2 border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-lg"
                                        >
                                            <option value="">Select gender</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Birthdate</label>
                                        <input
                                            type="date"
                                            value={editForm.birthdate}
                                            onChange={(e) => setEditForm({ ...editForm, birthdate: e.target.value })}
                                            className="w-full border-2 border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-lg"
                                        />
                                    </div>
                                </div>
                            )}

                            {editTab === 'details' && (
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Bio</label>
                                        <textarea
                                            value={editForm.bio}
                                            onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                                            className="w-full border-2 border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition text-lg"
                                            rows={4}
                                            maxLength={500}
                                            placeholder="Write a bio..."
                                        />
                                        <p className="text-sm text-gray-500 mt-2">{editForm.bio.length}/500 characters</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Location</label>
                                        <input
                                            type="text"
                                            value={editForm.location}
                                            onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                                            className="w-full border-2 border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-lg"
                                            placeholder="Enter location"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Website</label>
                                        <input
                                            type="url"
                                            value={editForm.website}
                                            onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                                            className="w-full border-2 border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-lg"
                                            placeholder="https://example.com"
                                        />
                                    </div>
                                </div>
                            )}

                            {editTab === 'privacy' && (
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Profile Visibility</label>
                                        <select
                                            value={editForm.profileVisibility}
                                            onChange={(e) => setEditForm({ ...editForm, profileVisibility: e.target.value })}
                                            className="w-full border-2 border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-lg"
                                        >
                                            <option value="public">Public - Anyone can view</option>
                                            <option value="private">Private - Only followers</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Who can message you?</label>
                                        <select
                                            value={editForm.messagePermission}
                                            onChange={(e) => setEditForm({ ...editForm, messagePermission: e.target.value })}
                                            className="w-full border-2 border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-lg"
                                        >
                                            <option value="everyone">Everyone</option>
                                            <option value="followers">Only followers</option>
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="bg-gray-50 p-6 flex justify-end gap-4 border-t border-gray-200 shrink-0">
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="px-8 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-bold transition shadow-md"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveProfile}
                                disabled={saving}
                                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-bold disabled:opacity-50 shadow-lg transition-all duration-300 transform hover:scale-105"
                            >
                                {saving ? 'Saving...' : 'Save All Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserProfile;

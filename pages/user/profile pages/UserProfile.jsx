import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Header from '../../../components/Header';
import { IoCamera, IoLocationOutline, IoLinkOutline, IoSettingsOutline, IoImageOutline, IoHeart, IoHeartOutline, IoChatbubbleOutline, IoTrashOutline } from 'react-icons/io5';

const UserProfile = () => {
    const { username } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isOwnProfile, setIsOwnProfile] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [activeTab, setActiveTab] = useState('posts');
    const [editMode, setEditMode] = useState(false);

    // Edit state
    const [bio, setBio] = useState('');
    const [location, setLocation] = useState('');
    const [website, setWebsite] = useState('');

    // Posts state
    const [posts, setPosts] = useState([]);
    const [newPostContent, setNewPostContent] = useState('');
    const [selectedMedia, setSelectedMedia] = useState([]);
    const [mediaPreview, setMediaPreview] = useState([]);
    const [activeCommentId, setActiveCommentId] = useState(null);
    const [commentText, setCommentText] = useState('');

    const coverInputRef = useRef(null);
    const mediaInputRef = useRef(null);
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
                setUser(res.data.user);
                setBio(res.data.user.bio || '');
                setLocation(res.data.user.location || '');
                setWebsite(res.data.user.website || '');
                setIsOwnProfile(res.data.user._id === currentUserId);
                setIsFollowing(res.data.user.followers?.some(f => f._id === currentUserId));
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
            }
        } catch (error) {
            toast.error('Failed to upload cover photo');
        }
    };

    const handleSaveProfile = async () => {
        try {
            const res = await axios.put('http://localhost:3000/social/profile/update', {
                userId: currentUserId,
                bio,
                location,
                website
            });

            if (res.data.success) {
                setUser(res.data.user);
                setEditMode(false);
                toast.success('Profile updated!');
            }
        } catch (error) {
            toast.error('Failed to update profile');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <p className="text-xl text-gray-600">Loading profile...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <p className="text-xl text-gray-600">User not found</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <Header message1={user.username} message2="Profile" />

            <div className="max-w-5xl mx-auto pb-8">
                {/* Cover Photo */}
                <div className="relative h-80 bg-gradient-to-r from-blue-400 to-purple-500 overflow-hidden group">
                    {user.coverPhoto ? (
                        <img src={user.coverPhoto} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-r from-blue-400 to-purple-500" />
                    )}

                    {isOwnProfile && (
                        <button
                            onClick={() => coverInputRef.current.click()}
                            className="absolute bottom-4 right-4 bg-white text-gray-800 px-4 py-2 rounded-lg shadow-lg hover:bg-gray-100 transition opacity-0 group-hover:opacity-100 flex items-center gap-2"
                        >
                            <IoCamera /> Edit Cover
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

                {/* Profile Info */}
                <div className="bg-white shadow-md -mt-20 mx-4 rounded-xl p-6">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        <div className="relative -mt-16">
                            <img
                                src={user.profilePicture || '/male default avatar.png'}
                                alt={user.username}
                                className="w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover"
                            />
                        </div>

                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">{user.username}</h1>
                                    <p className="text-gray-500">@{user.username.toLowerCase().replace(/\s/g, '')}</p>
                                </div>

                                {isOwnProfile ? (
                                    <button
                                        onClick={() => setEditMode(!editMode)}
                                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
                                    >
                                        <IoSettingsOutline /> {editMode ? 'Cancel' : 'Edit Profile'}
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleFollow}
                                        className={`px-6 py-2 rounded-lg font-semibold transition ${isFollowing
                                                ? 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                                            }`}
                                    >
                                        {isFollowing ? 'Following' : 'Follow'}
                                    </button>
                                )}
                            </div>

                            <div className="flex gap-6 mt-4">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-gray-900">{posts.length}</p>
                                    <p className="text-sm text-gray-500">Posts</p>
                                </div>
                                <div className="text-center cursor-pointer hover:underline">
                                    <p className="text-2xl font-bold text-gray-900">{user.followers?.length || 0}</p>
                                    <p className="text-sm text-gray-500">Followers</p>
                                </div>
                                <div className="text-center cursor-pointer hover:underline">
                                    <p className="text-2xl font-bold text-gray-900">{user.following?.length || 0}</p>
                                    <p className="text-sm text-gray-500">Following</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-yellow-600">⭐ {user.reputationPoints || 0}</p>
                                    <p className="text-sm text-gray-500">Reputation</p>
                                </div>
                            </div>

                            {editMode ? (
                                <div className="mt-4 space-y-3">
                                    <textarea
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        placeholder="Write a bio..."
                                        className="w-full border border-gray-300 rounded-lg p-3 resize-none"
                                        rows={3}
                                        maxLength={500}
                                    />
                                    <input
                                        type="text"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        placeholder="Location"
                                        className="w-full border border-gray-300 rounded-lg p-3"
                                    />
                                    <input
                                        type="url"
                                        value={website}
                                        onChange={(e) => setWebsite(e.target.value)}
                                        placeholder="Website"
                                        className="w-full border border-gray-300 rounded-lg p-3"
                                    />
                                    <button
                                        onClick={handleSaveProfile}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            ) : (
                                <div className="mt-4 space-y-2">
                                    {user.bio && <p className="text-gray-700">{user.bio}</p>}
                                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                        {user.location && (
                                            <span className="flex items-center gap-1">
                                                <IoLocationOutline /> {user.location}
                                            </span>
                                        )}
                                        {user.website && (
                                            <a href={user.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                                                <IoLinkOutline /> {user.website}
                                            </a>
                                        )}
                                    </div>
                                    {user.badges?.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {user.badges.map((badge, idx) => (
                                                <span key={idx} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-bold">
                                                    {badge}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white shadow-sm mx-4 mt-4 rounded-xl">
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('posts')}
                            className={`flex-1 py-4 font-semibold transition ${activeTab === 'posts'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Posts
                        </button>
                        <button
                            onClick={() => setActiveTab('about')}
                            className={`flex-1 py-4 font-semibold transition ${activeTab === 'about'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            About
                        </button>
                        <button
                            onClick={() => setActiveTab('photos')}
                            className={`flex-1 py-4 font-semibold transition ${activeTab === 'photos'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Photos
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        {activeTab === 'posts' && (
                            <div className="space-y-4">
                                {/* Post Composer (Own Profile Only) */}
                                {isOwnProfile && (
                                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                        <textarea
                                            value={newPostContent}
                                            onChange={(e) => setNewPostContent(e.target.value)}
                                            placeholder="What's on your mind?"
                                            className="w-full border-none bg-transparent focus:ring-0 resize-none"
                                            rows={3}
                                        />
                                        {mediaPreview.length > 0 && (
                                            <div className="grid grid-cols-3 gap-2 mt-3">
                                                {mediaPreview.map((preview, idx) => (
                                                    <img key={idx} src={preview} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                                                ))}
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
                                            <button
                                                onClick={() => mediaInputRef.current.click()}
                                                className="text-blue-600 hover:bg-blue-50 p-2 rounded-full"
                                            >
                                                <IoImageOutline size={24} />
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
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50"
                                            >
                                                Post
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Posts List */}
                                {posts.map(post => (
                                    <div key={post._id} className="bg-white border border-gray-200 rounded-xl p-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex gap-3">
                                                <img src={post.author?.profilePicture || '/male default avatar.png'} className="w-12 h-12 rounded-full object-cover" />
                                                <div>
                                                    <p className="font-bold">{post.author?.username}</p>
                                                    <p className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            {isOwnProfile && (
                                                <button onClick={() => handleDeletePost(post._id)} className="text-red-500 hover:bg-red-50 p-2 rounded-full">
                                                    <IoTrashOutline />
                                                </button>
                                            )}
                                        </div>
                                        <p className="mt-3 text-gray-800 whitespace-pre-wrap">{post.content}</p>
                                        {post.media?.length > 0 && (
                                            <div className="grid grid-cols-2 gap-2 mt-3">
                                                {post.media.map((url, idx) => (
                                                    <img key={idx} src={url} alt="Post media" className="w-full rounded-lg object-cover max-h-64" />
                                                ))}
                                            </div>
                                        )}
                                        <div className="flex gap-6 mt-4 text-gray-600">
                                            <button
                                                onClick={() => handleLikePost(post._id)}
                                                className={`flex items-center gap-2 ${post.likes?.includes(currentUserId) ? 'text-red-500' : 'hover:text-red-500'}`}
                                            >
                                                {post.likes?.includes(currentUserId) ? <IoHeart /> : <IoHeartOutline />}
                                                <span>{post.likes?.length || 0}</span>
                                            </button>
                                            <button
                                                onClick={() => setActiveCommentId(activeCommentId === post._id ? null : post._id)}
                                                className="flex items-center gap-2 hover:text-blue-500"
                                            >
                                                <IoChatbubbleOutline />
                                                <span>{post.comments?.length || 0}</span>
                                            </button>
                                        </div>

                                        {/* Comments */}
                                        {activeCommentId === post._id && (
                                            <div className="mt-4 pt-4 border-t border-gray-100">
                                                {post.comments?.map((comment, idx) => (
                                                    <div key={idx} className="flex gap-3 mb-3">
                                                        <img src={comment.user?.profilePicture || '/male default avatar.png'} className="w-8 h-8 rounded-full object-cover" />
                                                        <div className="bg-gray-100 px-4 py-2 rounded-2xl rounded-tl-none">
                                                            <p className="text-xs font-bold">{comment.user?.username}</p>
                                                            <p className="text-sm">{comment.text}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                                <div className="flex gap-2 mt-2">
                                                    <input
                                                        type="text"
                                                        value={commentText}
                                                        onChange={(e) => setCommentText(e.target.value)}
                                                        placeholder="Write a comment..."
                                                        className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
                                                        onKeyDown={(e) => e.key === 'Enter' && handleCommentPost(post._id)}
                                                    />
                                                    <button
                                                        onClick={() => handleCommentPost(post._id)}
                                                        disabled={!commentText.trim()}
                                                        className="text-blue-500 font-bold text-sm px-2 disabled:opacity-50"
                                                    >
                                                        Post
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {posts.length === 0 && (
                                    <div className="text-center py-10 text-gray-500">
                                        <p>No posts yet{isOwnProfile ? '. Share something!' : '.'}</p>
                                    </div>
                                )}
                            </div>
                        )}
                        {activeTab === 'about' && (
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold">About</h3>
                                {user.bio && <p className="text-gray-700">{user.bio}</p>}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                    {user.location && (
                                        <div className="flex items-center gap-2">
                                            <IoLocationOutline className="text-gray-400" />
                                            <span>Lives in <strong>{user.location}</strong></span>
                                        </div>
                                    )}
                                    {user.website && (
                                        <div className="flex items-center gap-2">
                                            <IoLinkOutline className="text-gray-400" />
                                            <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                {user.website}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        {activeTab === 'photos' && (
                            <div className="text-center py-10 text-gray-500">
                                <p>Photo gallery coming soon...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;

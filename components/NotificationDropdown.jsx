import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { IoCheckmarkCircle, IoCloseCircle } from 'react-icons/io5';

const NotificationDropdown = ({ userId, isOpen, onClose }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            if (userId) {
                setLoading(true);
                fetchNotifications();
            } else {
                setLoading(false);
            }
        }
    }, [isOpen, userId]);

    const fetchNotifications = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/notifications/get/${userId}`);
            if (response.data.success) {
                setNotifications(response.data.notifications);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (notificationId, action, clubId, requestUserId) => {
        try {
            // notification has sender field which is the user who sent the request
            // We need clubId from relatedId
            // And we need adminId (current userId)

            const endpoint = action === 'approve' ? 'approveRequest' : 'rejectRequest';
            const response = await axios.post(`http://localhost:3000/clubRequest/${endpoint}`, {
                clubId: clubId,
                userId: requestUserId,
                adminId: userId
            });

            if (response.data.success) {
                // Mark notification as read or remove it? maybe just refresh
                fetchNotifications();
                alert(response.data.message);
            }
        } catch (error) {
            console.error(`Error ${action} request:`, error);
            alert(`Failed to ${action} request`);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await axios.post('http://localhost:3000/notifications/markAsRead', { notificationId });
            // Update local state to show read
            setNotifications(prev => prev.map(n => n._id === notificationId ? { ...n, read: true } : n));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    }

    if (!isOpen) return null;

    return (
        <div className="absolute top-16 right-10 w-96 max-h-96 overflow-y-auto bg-white border border-gray-200 shadow-xl rounded-lg z-50">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-800">Notifications</h3>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700">&times;</button>
            </div>

            {loading ? (
                <div className="p-4 text-center text-gray-500">Loading...</div>
            ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">No notifications</div>
            ) : (
                <div className="divide-y divide-gray-100">
                    {notifications.map((notification) => (
                        <div key={notification._id} className={`p-4 hover:bg-gray-50 transition-colors ${notification.read ? 'opacity-70' : 'bg-blue-50'}`}>
                            <div className="flex gap-3">
                                <div className="flex-shrink-0">
                                    {notification.sender && notification.sender.profilePicture ? (
                                        <img src={notification.sender.profilePicture} alt="User" className="w-10 h-10 rounded-full object-cover" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                            <span className="text-gray-500 text-sm">?</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-grow">
                                    <p className="text-sm text-gray-800">{notification.message}</p>
                                    <p className="text-xs text-gray-500 mt-1">{new Date(notification.createdAt).toLocaleString()}</p>

                                    {notification.type === 'JOIN_REQUEST' && !notification.read && (
                                        <div className="mt-2 flex gap-2">
                                            <button
                                                onClick={() => handleAction(notification._id, 'approve', notification.relatedId?._id || notification.relatedId, notification.sender._id)}
                                                className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                                            >
                                                <IoCheckmarkCircle /> Approve
                                            </button>
                                            <button
                                                onClick={() => handleAction(notification._id, 'reject', notification.relatedId?._id || notification.relatedId, notification.sender._id)}
                                                className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                                            >
                                                <IoCloseCircle /> Reject
                                            </button>
                                        </div>
                                    )}
                                </div>
                                {!notification.read && (
                                    <button onClick={() => markAsRead(notification._id)} className="text-blue-500 text-xs self-start whitespace-nowrap">
                                        Mark read
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;

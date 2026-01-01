import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { IoCheckmarkCircle, IoCloseCircle, IoEye } from 'react-icons/io5';

const NotificationDropdown = ({ userId, isOpen, onClose, incomingNotification }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewingEvent, setViewingEvent] = useState(null); // Event details for modal
    const [currentNotificationId, setCurrentNotificationId] = useState(null); // For event modal actions

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

    // If an incoming notification arrived via socket, insert it into the list immediately
    useEffect(() => {
        if (!incomingNotification) return;
        try {
            const recipientId = incomingNotification.recipient?._id || incomingNotification.recipient || incomingNotification.recipient?.toString();
            if (recipientId && userId && recipientId.toString() !== userId.toString()) return;

            setNotifications(prev => {
                if (prev.some(n => n._id === incomingNotification._id)) return prev;
                return [incomingNotification, ...prev];
            });
        } catch (err) {
            console.error('Error handling incoming notification:', err);
        }
    }, [incomingNotification, userId]);

    const handleClubAction = async (notificationId, action, clubId, requestUserId) => {
        try {
            const endpoint = action === 'approve' ? 'approveRequest' : 'rejectRequest';
            const response = await axios.post(`http://localhost:3000/clubRequest/${endpoint}`, {
                clubId: clubId,
                userId: requestUserId,
                adminId: userId,
                notificationId: notificationId // Pass notificationId to mark as read
            });

            if (response.data.success) {
                fetchNotifications();
                alert(response.data.message);
            }
        } catch (error) {
            console.error(`Error ${action} request:`, error);
            alert(`Failed to ${action} request`);
        }
    };

    const handleViewEvent = async (notification) => {
        try {
            const eventId = notification.relatedId?._id || notification.relatedId;
            setCurrentNotificationId(notification._id);

            // Fetch event details
            const response = await axios.get(`http://localhost:3000/eventFunctions/getEvent/${eventId}`);
            if (response.data.success) {
                setViewingEvent(response.data.event);
            } else {
                alert('Could not fetch event details');
            }
        } catch (error) {
            console.error("Error fetching event details:", error);
            alert('Error loading event details');
        }
    };

    const handleEventAction = async (action) => {
        if (!viewingEvent || !currentNotificationId) return;

        try {
            const endpoint = action === 'approve' ? 'approveEvent' : 'rejectEvent';
            const response = await axios.post(`http://localhost:3000/eventFunctions/${endpoint}`, {
                eventId: viewingEvent._id,
                adminId: userId,
                notificationId: currentNotificationId
            });

            if (response.data.success) {
                fetchNotifications();
                setViewingEvent(null);
                setCurrentNotificationId(null);
                alert(response.data.message);
            }
        } catch (error) {
            console.error(`Error ${action} event:`, error);
            alert(`Failed to ${action} event`);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await axios.post('http://localhost:3000/notifications/markAsRead', { notificationId });
            setNotifications(prev => prev.map(n => n._id === notificationId ? { ...n, read: true } : n));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    }

    if (!isOpen) return null;

    return (
        <div className="absolute top-16 right-10 w-96 z-50">
            {/* Notification List */}
            <div className="bg-white border border-gray-200 shadow-xl rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
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

                                        {/* Join Request Actions */}
                                        {notification.type === 'JOIN_REQUEST' && !notification.read && (
                                            <div className="mt-2 flex gap-2">
                                                <button
                                                    onClick={() => handleClubAction(notification._id, 'approve', notification.relatedId?._id || notification.relatedId, notification.sender._id)}
                                                    className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                                                >
                                                    <IoCheckmarkCircle /> Approve
                                                </button>
                                                <button
                                                    onClick={() => handleClubAction(notification._id, 'reject', notification.relatedId?._id || notification.relatedId, notification.sender._id)}
                                                    className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                                                >
                                                    <IoCloseCircle /> Reject
                                                </button>
                                            </div>
                                        )}

                                        {/* Event Request Actions */}
                                        {notification.type === 'EVENT_REQUEST' && !notification.read && (
                                            <div className="mt-2 flex gap-2">
                                                <button
                                                    onClick={() => handleViewEvent(notification)}
                                                    className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                                                >
                                                    <IoEye /> View Request
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

            {/* Event Details Modal */}
            {viewingEvent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl relative">
                        <button
                            onClick={() => { setViewingEvent(null); setCurrentNotificationId(null); }}
                            className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
                        >
                            &times;
                        </button>
                        <h2 className="text-xl font-bold mb-4">Event Request</h2>

                        <div className="space-y-3 mb-6">
                            <div>
                                <span className="text-xs text-gray-500 uppercase font-bold">Event Title</span>
                                <p className="font-semibold">{viewingEvent.title}</p>
                            </div>
                            <div>
                                <span className="text-xs text-gray-500 uppercase font-bold">Created By</span>
                                <div className="flex items-center gap-2 mt-1">
                                    {viewingEvent.createdBy?.profilePicture && (
                                        <img src={viewingEvent.createdBy.profilePicture} className="w-6 h-6 rounded-full" />
                                    )}
                                    <p>{viewingEvent.createdBy?.username || viewingEvent.createdBy?.email || 'Unknown User'}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-xs text-gray-500 uppercase font-bold">Start Date</span>
                                    <p className="text-sm">{new Date(viewingEvent.startDate).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-500 uppercase font-bold">End Date</span>
                                    <p className="text-sm">{new Date(viewingEvent.endDate).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div>
                                <span className="text-xs text-gray-500 uppercase font-bold">Venue</span>
                                <p className="text-sm">{viewingEvent.venue}</p>
                            </div>
                            <div>
                                <span className="text-xs text-gray-500 uppercase font-bold">Description</span>
                                <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">{viewingEvent.description}</p>
                            </div>
                        </div>

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => handleEventAction('reject')}
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center gap-2"
                            >
                                <IoCloseCircle /> Reject
                            </button>
                            <button
                                onClick={() => handleEventAction('approve')}
                                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-2"
                            >
                                <IoCheckmarkCircle /> Approve
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;

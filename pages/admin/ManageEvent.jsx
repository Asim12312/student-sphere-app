import React, { useEffect, useState } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { toast } from 'react-toastify';

const ManageEvent = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('pending'); // 'pending' or 'all'

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const url = tab === 'pending' 
                        ? 'http://localhost:3000/admin/events/pending' 
                        : 'http://localhost:3000/admin/events';
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setEvents(data);
            } else {
                toast.error('Failed to fetch events');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Server error while fetching events');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [tab]);

    const handleUpdateStatus = async (id, status) => {
        try {
            const response = await fetch(`http://localhost:3000/admin/events/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            if (response.ok) {
                toast.success(`Event marked as ${status}`);
                // Remove from pending list or update in all list
                if (tab === 'pending') {
                    setEvents(events.filter(e => e._id !== id));
                } else {
                    setEvents(events.map(e => e._id === id ? { ...e, status } : e));
                }
            } else {
                toast.error('Failed to update event status');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Server error');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) return;

        try {
            const response = await fetch(`http://localhost:3000/admin/events/${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                toast.success('Event deleted successfully');
                setEvents(events.filter(e => e._id !== id));
            } else {
                toast.error('Failed to delete event');
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
                <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-lg p-6">
                    <div className="flex justify-between items-center mb-6 border-b pb-4">
                        <h1 className="text-3xl font-bold font-serif text-gray-800">Manage Events</h1>
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            <button 
                                onClick={() => setTab('pending')}
                                className={`px-4 py-2 rounded-md font-medium text-sm transition ${tab === 'pending' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
                            >
                                Pending Review
                            </button>
                            <button 
                                onClick={() => setTab('all')}
                                className={`px-4 py-2 rounded-md font-medium text-sm transition ${tab === 'all' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
                            >
                                All Events
                            </button>
                        </div>
                    </div>
                    
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {events.length === 0 ? (
                                <p className="col-span-full py-8 text-center text-gray-500 text-lg">No {tab} events found.</p>
                            ) : (
                                events.map((event) => (
                                    <div key={event._id} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition bg-white flex flex-col">
                                        {event.bannerImage && (
                                            <div className="h-40 overflow-hidden">
                                                <img src={event.bannerImage} alt={event.title} className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                        <div className="p-5 flex-grow">
                                            <div className="flex justify-between items-start mb-2">
                                                <h2 className="text-xl font-bold font-serif text-gray-800 leading-tight">{event.title}</h2>
                                                <span className={`text-xs px-2 py-1 rounded-full font-semibold uppercase ${event.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : event.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {event.status}
                                                </span>
                                            </div>
                                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>
                                            
                                            <div className="space-y-1 mb-4 text-sm text-gray-500">
                                                <p><span className="font-medium text-gray-700">Venue:</span> {event.venue}</p>
                                                <p><span className="font-medium text-gray-700">Date:</span> {new Date(event.startDate).toLocaleDateString()}</p>
                                                <p><span className="font-medium text-gray-700">Club:</span> {event.createdInClub?.name || 'Unknown'}</p>
                                                <p><span className="font-medium text-gray-700">Creator:</span> {event.createdBy?.username || 'Unknown'}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-between gap-2">
                                            {event.status === 'pending' && (
                                                <>
                                                    <button onClick={() => handleUpdateStatus(event._id, 'approved')} className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-2 rounded-lg transition text-sm">
                                                        Approve
                                                    </button>
                                                    <button onClick={() => handleUpdateStatus(event._id, 'rejected')} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 rounded-lg transition text-sm">
                                                        Reject
                                                    </button>
                                                </>
                                            )}
                                            <button onClick={() => handleDelete(event._id)} className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-medium py-2 rounded-lg transition text-sm border border-red-200">
                                                Delete
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
    );
};

export default ManageEvent;

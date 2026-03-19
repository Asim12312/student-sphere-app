import React, { useEffect, useState } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { toast } from 'react-toastify';

const ManageClub = () => {
    const [clubs, setClubs] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchClubs = async () => {
        try {
            const response = await fetch('http://localhost:3000/admin/clubs');
            if (response.ok) {
                const data = await response.json();
                setClubs(data);
            } else {
                toast.error('Failed to fetch clubs');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Server error while fetching clubs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClubs();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to forcibly delete this club? This action cannot be undone and will remove all associated events and posts.")) return;

        try {
            const response = await fetch(`http://localhost:3000/admin/clubs/${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                toast.success('Club deleted successfully');
                setClubs(clubs.filter(c => c._id !== id));
            } else {
                toast.error('Failed to delete club');
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
                    <h1 className="text-3xl font-bold font-serif mb-6 text-gray-800 border-b pb-4">Manage Clubs</h1>
                    
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fuchsia-600"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {clubs.length === 0 ? (
                                <p className="col-span-full py-8 text-center text-gray-500 text-lg">No clubs found.</p>
                            ) : (
                                clubs.map((club) => (
                                    <div key={club._id} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition bg-white flex flex-col">
                                        <div className="h-32 overflow-hidden bg-gray-200">
                                            <img src={club.imageURL} alt={club.name} className="w-full h-full object-cover" onError={(e) => { e.target.src='https://via.placeholder.com/400x200?text=No+Image'}} />
                                        </div>
                                        <div className="p-5 flex-grow">
                                            <div className="flex justify-between items-start mb-2">
                                                <h2 className="text-xl font-bold font-serif text-gray-800 leading-tight">{club.name}</h2>
                                                <span className="text-xs px-2 py-1 rounded-full font-semibold uppercase bg-gray-100 text-gray-600">
                                                    {club.privacy}
                                                </span>
                                            </div>
                                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{club.description}</p>
                                            
                                            <div className="space-y-1 mb-4 text-sm text-gray-500">
                                                <p><span className="font-medium text-gray-700">Members:</span> {club.members?.length || 0}</p>
                                                <p><span className="font-medium text-gray-700">Creator:</span> {club.createdBy?.username || 'Unknown'}</p>
                                                <p><span className="font-medium text-gray-700">Created:</span> {new Date(club.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-end">
                                            <button onClick={() => handleDelete(club._id)} className="px-4 bg-red-50 hover:bg-red-100 text-red-600 font-medium py-2 rounded-lg transition text-sm border border-red-200 w-full">
                                                Force Delete Club
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

export default ManageClub;

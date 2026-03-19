import React, { useEffect, useState } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { toast } from 'react-toastify';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            const response = await fetch('http://localhost:3000/admin/users');
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            } else {
                toast.error('Failed to fetch users');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Server error while fetching users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const toggleBan = async (id, currentStatus) => {
        try {
            const response = await fetch(`http://localhost:3000/admin/users/${id}/ban`, {
                method: 'PUT',
            });
            if (response.ok) {
                const data = await response.json();
                toast.success(data.message);
                // Update local state
                setUsers(users.map(u => u._id === id ? { ...u, isBanned: !currentStatus } : u));
            } else {
                toast.error('Failed to update ban status');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Server error');
        }
    };

    const changeRole = async (id, newRole) => {
        try {
            const response = await fetch(`http://localhost:3000/admin/users/${id}/role`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ role: newRole })
            });
            if (response.ok) {
                toast.success(`Role updated to ${newRole}`);
                setUsers(users.map(u => u._id === id ? { ...u, role: newRole } : u));
            } else {
                toast.error('Failed to update role');
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
                    <h1 className="text-3xl font-bold font-serif mb-6 text-gray-800 border-b pb-4">Manage Users</h1>
                    
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-100 text-gray-600 text-sm uppercase tracking-wider">
                                        <th className="p-4 rounded-tl-lg">User</th>
                                        <th className="p-4">Email</th>
                                        <th className="p-4">Role</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4 rounded-tr-lg border-l border-gray-200">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 text-gray-800">
                                    {users.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="p-8 text-center text-gray-500">No users found.</td>
                                        </tr>
                                    ) : (
                                        users.map((user) => (
                                            <tr key={user._id} className="hover:bg-gray-50 transition">
                                                <td className="p-4 flex items-center gap-3">
                                                    <img src={user.profilePicture || "https://www.gravatar.com/avatar/"} className="w-10 h-10 rounded-full object-cover" alt="avatar" />
                                                    <span className="font-medium">{user.username}</span>
                                                </td>
                                                <td className="p-4 text-sm">{user.userEmail}</td>
                                                <td className="p-4">
                                                    <select 
                                                        value={user.role} 
                                                        onChange={(e) => changeRole(user._id, e.target.value)}
                                                        className="bg-white border text-sm rounded-lg block p-2 outline-none cursor-pointer focus:ring-2 focus:ring-blue-500"
                                                    >
                                                        <option value="user">User</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${user.isBanned ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                        {user.isBanned ? 'Banned' : 'Active'}
                                                    </span>
                                                </td>
                                                <td className="p-4 border-l border-gray-100">
                                                    <button 
                                                        onClick={() => toggleBan(user._id, user.isBanned)}
                                                        className={`text-sm px-4 py-2 rounded-lg font-medium transition ${user.isBanned ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}
                                                    >
                                                        {user.isBanned ? 'Unban User' : 'Ban User'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageUsers;

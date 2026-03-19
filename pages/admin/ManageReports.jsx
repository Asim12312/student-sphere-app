import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { MdOutlineReportProblem, MdCheckCircle, MdCancel } from 'react-icons/md';

const ManageReports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');

    const fetchReports = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:3000/admin/reports', {
                headers: { Authorization: `Bearer ${adminData.token}` }
            });
            setReports(res.data);
        } catch (error) {
            console.error('Error fetching reports:', error);
            toast.error('Failed to load pending reports');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const handleResolve = async (id, status) => {
        try {
            const res = await axios.put(`http://localhost:3000/admin/reports/${id}/resolve`, { status }, {
                headers: { Authorization: `Bearer ${adminData.token}` }
            });
            if (res.status === 200) {
                toast.success(`Report marked as ${status}`);
                setReports(prev => prev.filter(r => r._id !== id));
            }
        } catch (error) {
            console.error('Error updating report:', error);
            toast.error('Failed to update report status');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <AdminSidebar />
            
            <div className="flex-grow p-4 md:p-8 pt-28">
                <div className="max-w-6xl mx-auto space-y-8">
                    
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold font-serif text-gray-800 flex items-center gap-2">
                                <MdOutlineReportProblem className="text-red-500" /> Manage Reports
                            </h1>
                            <p className="text-gray-500 mt-1">Review and resolve content flagged by the community.</p>
                        </div>
                        <div className="bg-red-50 px-4 py-2 rounded-xl border border-red-100">
                            <span className="text-red-800 font-bold">{reports.length}</span>
                            <span className="text-red-600 text-sm ml-2 font-medium">Pending Review</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-500"></div>
                            </div>
                        ) : reports.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 mb-4">
                                    <MdCheckCircle className="text-3xl text-green-500" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800">All caught up!</h3>
                                <p className="text-gray-500 mt-2">There are no pending reports to review at the moment.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {reports.map((report) => (
                                    <div key={report._id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition bg-gray-50/50">
                                        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                            <div className="space-y-2 flex-grow">
                                                <div className="flex items-center gap-3">
                                                    <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wide">
                                                        {report.itemType}
                                                    </span>
                                                    <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-md">ID: {report.itemId}</span>
                                                    <span className="text-xs text-gray-400">Reported on {new Date(report.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                
                                                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mt-3">
                                                    <p className="text-sm font-bold text-gray-700 mb-1">Reason for report:</p>
                                                    <p className="text-gray-900 italic font-serif">"{report.reason}"</p>
                                                </div>
                                                
                                                <p className="text-xs text-gray-500">
                                                    Reported by: <span className="font-semibold text-gray-700">{report.reporterId?.username || 'Unknown User'}</span>
                                                </p>
                                            </div>
                                            
                                            <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto mt-4 md:mt-0">
                                                <button
                                                    onClick={() => handleResolve(report._id, 'Resolved')}
                                                    className="flex-1 md:w-32 flex items-center justify-center gap-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 rounded-lg transition shadow-sm text-sm"
                                                >
                                                    <MdOutlineReportProblem /> Action Taken
                                                </button>
                                                <button
                                                    onClick={() => handleResolve(report._id, 'Dismissed')}
                                                    className="flex-1 md:w-32 flex items-center justify-center gap-1 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-bold py-2 px-3 rounded-lg transition shadow-sm text-sm"
                                                >
                                                    <MdCancel /> Dismiss
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageReports;

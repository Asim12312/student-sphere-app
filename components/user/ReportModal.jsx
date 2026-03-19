import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { MdClose } from 'react-icons/md';

const ReportModal = ({ isOpen, onClose, itemType, itemId }) => {
    const [reason, setReason] = useState('');
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (reason.trim().length < 10) {
            toast.error('Please provide a more detailed reason (min 10 characters)');
            return;
        }

        const userData = JSON.parse(localStorage.getItem('userData'));
        const reporterId = userData?.userId || localStorage.getItem('id');

        if (!reporterId) {
            toast.error('You must be logged in to submit a report');
            return;
        }

        setSubmitting(true);
        try {
            await axios.post('http://localhost:3000/report', {
                reporterId,
                itemType,
                itemId,
                reason
            });
            toast.success('Report submitted successfully. Thank you for keeping out community safe!');
            setReason('');
            onClose();
        } catch (error) {
            console.error('Error submitting report:', error);
            toast.error('Failed to submit report. Please try again later.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in">
                <div className="flex justify-between items-center p-4 border-b border-gray-100">
                    <h2 className="text-xl font-bold font-serif text-gray-800">Report Inappropriate Content</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition">
                        <MdClose className="text-2xl text-gray-500" />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-5">
                    <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Why are you reporting this {itemType}?
                        </label>
                        <p className="text-xs text-gray-500 mb-3">
                            Your report will be reviewed by administrators. Please provide as much detail as possible to help us investigate.
                        </p>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="e.g. This post contains spam, harassment, or violates community guidelines..."
                            className="w-full h-32 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none resize-none"
                            required
                        ></textarea>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-5 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-lg transition shadow-md"
                        >
                            {submitting ? 'Submitting...' : 'Submit Report'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReportModal;

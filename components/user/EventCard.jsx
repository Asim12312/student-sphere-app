import React from 'react';
import { FaMapMarkerAlt, FaCalendarAlt, FaTicketAlt } from 'react-icons/fa';

const EventCard = ({ event }) => {
    if (!event) return null;

    const {
        title,
        description,
        venue,
        startDate,
        endDate,
        bannerImage,
        ticketPrice,
        status
    } = event;

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100 flex flex-col h-full">
            {/* Banner Image */}
            <div className="h-48 overflow-hidden relative group">
                <img
                    src={bannerImage || "https://via.placeholder.com/400x200?text=No+Banner"}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 text-xs font-bold rounded-full uppercase ${status === 'approved' ? 'bg-green-100 text-green-800' :
                            status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {status}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-5 flex-grow flex flex-col">
                <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1" title={title}>
                    {title}
                </h3>

                <p className="text-gray-600 mb-4 line-clamp-3 text-sm flex-grow">
                    {description}
                </p>

                <div className="space-y-2 text-sm text-gray-500 mt-auto">
                    <div className="flex items-center gap-2">
                        <FaCalendarAlt className="text-blue-500" />
                        <span>{formatDate(startDate)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <FaMapMarkerAlt className="text-red-500" />
                        <span className="line-clamp-1">{venue}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <FaTicketAlt className="text-green-500" />
                        <span className="font-semibold text-green-700">
                            {ticketPrice > 0 ? `$${ticketPrice}` : 'Free'}
                        </span>
                    </div>
                </div>

                <button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200">
                    View Details
                </button>
            </div>
        </div>
    );
};

export default EventCard;

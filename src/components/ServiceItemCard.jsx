import React from 'react';
import { Clock } from 'lucide-react';

const ServiceItemCard = ({ service, onRemove, getServiceIcon }) => {
    return (
        <div className="border rounded-md mb-4 overflow-hidden">
            <div className="flex items-center gap-4 px-4 py-3">
                {getServiceIcon(service.name)}
                <span className="font-medium text-gray-900 text-sm sm:text-base truncate">
                    {service.name}
                </span>
            </div>
            <div className="flex justify-between items-center flex-wrap px-4 py-2 border-t text-sm text-gray-600">
                <div className="flex gap-4 items-center mb-2 sm:mb-0">
                    <Clock className="w-4 h-4" />
                    <span>{service.durationInMinutes || '30'} Minutes</span>
                    <span>${service.price.toFixed(2)}</span>
                </div>
                <button
                    onClick={() => onRemove(service.name)}
                    className="text-purple-600 hover:underline text-sm"
                >
                    Delete
                </button>
            </div>
        </div>
    );
};

export default ServiceItemCard;

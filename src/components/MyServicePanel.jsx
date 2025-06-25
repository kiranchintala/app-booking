import React from 'react';
import { Scissors, Clock, Sparkles, Hand, Wand2 } from 'lucide-react';
import ServiceItemCard from './ServiceItemCard';

const getServiceIcon = (name) => {
    if (name.toLowerCase().includes('hair')) return <Scissors className="w-5 h-5 text-purple-600 shrink-0" />;
    if (name.toLowerCase().includes('facial')) return <Sparkles className="w-5 h-5 text-purple-600 shrink-0" />;
    if (name.toLowerCase().includes('manicure')) return <Hand className="w-5 h-5 text-purple-600 shrink-0" />;
    if (name.toLowerCase().includes('makeup')) return <Wand2 className="w-5 h-5 text-purple-600 shrink-0" />;
    return <Scissors className="w-5 h-5 text-purple-600 shrink-0" />; // default
};

const MyServicePanel = ({ services = [], onRemove, onProceed, totalCost }) => {
    return (
        <div className="bg-white border rounded-lg p-4 shadow-sm mb-6 w-full max-w-md mx-auto sm:max-w-lg md:max-w-xl lg:max-w-2xl">
            <h3 className="text-md font-semibold text-gray-800 mb-3">My Selected Services</h3>

            {services.map((service, index) => (
                <ServiceItemCard
                    key={index}
                    service={service}
                    onRemove={onRemove}
                    getServiceIcon={getServiceIcon}
                />
            ))}

            <div className="flex justify-between items-center mt-4 text-md font-semibold text-purple-700">
                <span>Total</span>
                <span>${totalCost.toFixed(2)}</span>
            </div>

            <button
                onClick={onProceed}
                className="mt-4 w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded"
            >
                PROCEED
            </button>
        </div>
    );
};

export default MyServicePanel;

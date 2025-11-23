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

            <div className="flex justify-between items-center mt-8 text-md font-semibold text-purple-700">
                <span>Total</span>
                <span>${totalCost.toFixed(2)}</span>
            </div>

            <button
                onClick={onProceed}
                className="w-full py-2 mt-6 text-lg font-semibold rounded-xl
    bg-gradient-to-r from-[#8b65ff] to-[#c87dff]
    text-white shadow-lg
    hover:brightness-110 active:scale-[0.98]
    transition-all"
            >
                Proceed
            </button>
        </div>
    );
};

export default MyServicePanel;

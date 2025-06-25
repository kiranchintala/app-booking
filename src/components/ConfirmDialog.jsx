import React, { useState, useEffect } from 'react';

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel }) => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShow(true); // Start showing animation
        } else {
            const timeout = setTimeout(() => setShow(false), 200); // Delay hiding after fade-out
            return () => clearTimeout(timeout);
        }
    }, [isOpen]);

    if (!isOpen && !show) return null; // Don't render at all when fully closed

    return (
        <div className={`fixed inset-0 flex justify-center items-center z-50 transition-opacity duration-200 ${isOpen ? 'bg-black bg-opacity-30 opacity-100' : 'opacity-0'}`}>
            <div className={`bg-white p-6 rounded-lg shadow-lg w-80 text-center transform transition-all duration-300 ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
                <h2 className="text-lg font-bold mb-4">{title}</h2>
                <p className="mb-6">{message}</p>
                <div className="flex justify-center gap-4">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 rounded bg-gray-400 text-white hover:bg-gray-500"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                    >
                        Yes, Remove
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;

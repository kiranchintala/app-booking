import React, { createContext, useContext, useState } from 'react';

const BookingContext = createContext(null);

export const BookingProvider = ({ children }) => {
    const [services, setServices] = useState([]);
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [notes, setNotes] = useState('');

    return (
        <BookingContext.Provider
            value={{
                services,
                setServices,
                date,
                setDate,
                time,
                setTime,
                notes,
                setNotes,
            }}
        >
            {children}
        </BookingContext.Provider>
    );
};

export const useBooking = () => {
    const ctx = useContext(BookingContext);
    if (!ctx) {
        throw new Error("useBooking must be used inside <BookingProvider>");
    }
    return ctx;
};

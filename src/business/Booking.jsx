import { useState } from 'react';

export const useBooking = () => {
    const [services, setServices] = useState([]);
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [guests, setGuests] = useState(0);
    const [notes, setNotes] = useState('');

    return {
        services,
        date,
        time,
        guests,
        notes,
        setServices,
        setDate,
        setTime,
        setGuests,
        setNotes,
    };
};

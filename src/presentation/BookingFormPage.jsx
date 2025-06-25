import React, { useState, useMemo, useEffect } from 'react';
import { useBooking } from '../business/Booking';
import { useNavigate } from 'react-router-dom';
import { axios } from '@mtbs/shared-lib';
import { useAuth } from '@mtbs/shared-lib';
import ConfirmDialog from '../components/ConfirmDialog';
import MyServicePanel from '../components/MyServicePanel';
import { Box, Select, MenuItem, ListItemText, ListItemIcon, InputLabel, FormControl, Chip, Avatar, Checkbox, CircularProgress, Alert } from '@mui/material';
import { useServices } from '../hooks/useServices';

const BookingFormPage = () => {
    const { data: availableServices, isLoading, isError } = useServices();
    const { user } = useAuth();
    const { services: initialServices, date, time, guests, notes, setServices, setDate, setTime, setGuests, setNotes } = useBooking();
    const [selectedNames, setSelectedNames] = useState(() => initialServices?.map(s => s.name) ?? []);

    const selectedServices = useMemo(() =>
        (availableServices ?? []).filter(s => selectedNames.includes(s.name)),
        [availableServices, selectedNames]
    );

    useEffect(() => {
        setServices(selectedServices);
    }, [selectedServices, setServices]);

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [serviceToRemove, setServiceToRemove] = useState(null);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const handleRemoveClick = (serviceName) => {
        setServiceToRemove(serviceName);
        setConfirmOpen(true);
    };

    const confirmRemoveService = () => {
        setSelectedNames(prev => prev.filter(name => name !== serviceToRemove));
        setConfirmOpen(false);
        setServiceToRemove(null);
    };

    const cancelRemoveService = () => {
        setConfirmOpen(false);
        setServiceToRemove(null);
    };

    const totalCost = selectedServices.reduce((sum, service) => sum + service.price, 0) + (guests * 20);

    const validateForm = () => {
        const newErrors = {};
        if (selectedNames.length === 0) newErrors.services = "Please add at least one service.";
        if (!date) {
            newErrors.date = "Please select a date.";
        } else {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const selectedDate = new Date(date);
            selectedDate.setMinutes(selectedDate.getMinutes() + selectedDate.getTimezoneOffset());
            selectedDate.setHours(0, 0, 0, 0);

            if (selectedDate < today) {
                newErrors.date = "Date cannot be in the past.";
            }
        }
        if (!time) newErrors.time = "Please select a time.";
        if (guests < 0) newErrors.guests = "Guests cannot be negative.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const payload = {
            userId: user.uid,
            serviceIds: selectedServices.map(service => service.id),
            dateTime: `${date}T${time}:00`,
            guests: guests,
            notes: notes,
            status: 'Pending'
        };

        try {
            const response = await axios.post('http://localhost:8080/api/v1/appointments', payload);
            const newAppointmentId = response.data.id;
            navigate(`/booking/confirmation/${newAppointmentId}`);
        } catch (err) {
            console.error(err);
        }
    };

    // --- 3. HANDLE LOADING AND ERROR STATES BEFORE RENDERING THE FORM ---
    if (isLoading) {
        return <div className="flex justify-center items-center min-h-screen text-lg font-semibold">Loading Services...</div>;
    }

    if (isError) {
        return <div className="flex justify-center items-center min-h-screen"><Alert severity="error">Failed to load services. Please try again later.</Alert></div>;
    }

    if (!user) {
        return <div className="flex justify-center items-center min-h-screen text-lg font-semibold">Loading user information...</div>;
    }

    return (
        <div className="flex justify-center items-start min-h-screen bg-gray-100 px-4 py-10">
            <div className="flex flex-col lg:flex-row gap-12 w-full max-w-6xl mx-auto px-4">
                <div className="w-full lg:w-2/3 mt-14">
                    <div className={`sticky top-24 bg-white p-6 rounded-xl shadow-md border transition-opacity duration-300 ${confirmOpen ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                        <h2 className="text-3xl font-semibold text-purple-700 mb-6 tracking-wide">Book Your Appointment</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <FormControl fullWidth variant="outlined" error={!!errors.services}>
                                    <InputLabel id="service-label">Select Services</InputLabel>
                                    <Select
                                        labelId="service-label"
                                        label="Select Services"
                                        multiple
                                        value={selectedNames}
                                        onChange={(e) => setSelectedNames(e.target.value)}
                                        renderValue={(names) => (
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {names.map((name) => {
                                                    const service = availableServices.find(s => s.name === name);
                                                    return <Chip key={name} label={name} avatar={<Avatar src={service?.image} />} />;
                                                })}
                                            </Box>
                                        )}>
                                        {availableServices.map((service) => (
                                            // --- 4. USE DATABASE ID FOR THE KEY ---
                                            <MenuItem key={service.id} value={service.name}>
                                                <Checkbox checked={selectedNames.includes(service.name)} />
                                                <ListItemIcon>
                                                    <Avatar src={service.image || ''} onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/40x40/cccccc/ffffff?text=${service.name[0]}` }}>{service.name[0]}</Avatar>
                                                </ListItemIcon>
                                                <ListItemText primary={`${service.name} ($${service.price})`} secondary={service.description} />
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {errors.services && <p className="text-red-500 text-sm mt-1">{errors.services}</p>}
                                </FormControl>
                            </div>

                            {/* The rest of the form remains the same */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Guests</label>
                                <input type="number" min="0" value={guests} onChange={(e) => setGuests(Number(e.target.value))} className={`w-full p-3 border rounded ${errors.guests ? 'border-red-500' : 'border-gray-300'}`} />
                                {errors.guests && <p className="text-red-500 text-sm mt-1">{errors.guests}</p>}
                                <small className="text-gray-500">($20 per guest)</small>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <input type="date" className={`w-full p-3 border rounded ${errors.date ? 'border-red-500' : 'border-gray-300'}`} value={date} onChange={(e) => setDate(e.target.value)} required />
                                {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                                <input type="time" className={`w-full p-3 border rounded ${errors.time ? 'border-red-500' : 'border-gray-300'}`} value={time} onChange={(e) => setTime(e.target.value)} required />
                                {errors.time && <p className="text-red-500 text-sm mt-1">{errors.time}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Special Notes (Optional)</label>
                                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows="4" placeholder="Enter any special requests or instructions..." className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500 border-gray-300" />
                            </div>
                            <button type="submit" disabled={confirmOpen} className="w-full p-3 bg-purple-700 text-gray-100 font-semibold rounded-md shadow-md hover:bg-purple-800 transition disabled:opacity-50 disabled:cursor-not-allowed">
                                Book Appointment
                            </button>
                        </form>
                    </div>
                </div>
                <ConfirmDialog isOpen={confirmOpen} title="Remove Service" message={`Are you sure you want to remove the ${serviceToRemove} service from your booking?`} onConfirm={confirmRemoveService} onCancel={cancelRemoveService} />
                <div className="w-full lg:w-1/3 mt-6 lg:mt-0">
                    <div className={`sticky top-24 bg-white p-6 rounded-xl shadow-md border transition-opacity duration-300 ${confirmOpen ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                        <MyServicePanel services={selectedServices} totalCost={totalCost} onRemove={handleRemoveClick} onProceed={handleSubmit} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingFormPage;
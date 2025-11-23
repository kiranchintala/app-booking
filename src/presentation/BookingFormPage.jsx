// app-booking-services/src/SelectServicesPage.jsx
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../business/Booking';
import { useAuth } from '@mtbs/shared-lib';
import { useServices } from '../hooks/useServices';
import ConfirmDialog from '../components/ConfirmDialog';
import MyServicePanel from '../components/MyServicePanel';

import {
    Box,
    Chip,
    Avatar,
    Checkbox,
    Alert,
    TextField,
    Card,
    CardContent,
    Typography,
    Divider,
    Stack
} from '@mui/material';

const BookingFormPage = () => {
    const { data: availableServices, isLoading, isError } = useServices();
    const { user } = useAuth();
    const { services: initialServices, setServices } = useBooking();

    const [selectedNames, setSelectedNames] = useState(
        () => initialServices?.map((s) => s.name) ?? []
    );
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [serviceToRemove, setServiceToRemove] = useState(null);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const categories = useMemo(() => {
        const set = new Set();
        (availableServices ?? []).forEach((s) => s.category && set.add(s.category));
        return ['All', ...Array.from(set)];
    }, [availableServices]);

    const filteredServices = useMemo(
        () =>
            (availableServices ?? []).filter((s) => {
                const matchesCategory =
                    activeCategory === 'All' || s.category === activeCategory;
                const matchesSearch = s.name
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase());
                return matchesCategory && matchesSearch;
            }),
        [availableServices, activeCategory, searchTerm]
    );

    const selectedServices = useMemo(
        () => (availableServices ?? []).filter((s) => selectedNames.includes(s.name)),
        [availableServices, selectedNames]
    );

    const toggleService = (name) => {
        setSelectedNames((prev) =>
            prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
        );
    };

    // 🔹 When "remove" clicked in side panel -> open confirm dialog
    const handleRemoveClick = (serviceName) => {
        setServiceToRemove(serviceName);
        setConfirmOpen(true);
    };

    // 🔹 Confirm removal
    const handleConfirmRemove = () => {
        setSelectedNames((prev) => prev.filter((n) => n !== serviceToRemove));
        setConfirmOpen(false);
        setServiceToRemove(null);
    };

    // 🔹 Cancel removal
    const handleCancelRemove = () => {
        setConfirmOpen(false);
        setServiceToRemove(null);
    };

    const validateStep = () => {
        const newErrors = {};
        if (selectedNames.length === 0)
            newErrors.services = 'Please select at least one service.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleProceed = () => {
        if (!validateStep()) return;
        setServices(selectedServices);
        navigate('/booking/schedule');
    };

    if (isLoading)
        return (
            <div className="flex justify-center items-center min-h-screen text-lg">
                Loading Services...
            </div>
        );

    if (isError)
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Alert severity="error">Failed to load services.</Alert>
            </div>
        );

    if (!user)
        return (
            <div className="flex justify-center items-center min-h-screen text-lg">
                Loading user info...
            </div>
        );

    return (
        <div
            className="
        min-h-screen 
        px-4 py-10 
        flex justify-center items-start
        bg-gradient-to-br from-[#dfe5ff] via-[#e3dfff] to-[#fde2ff]
      "
        >
            <div className="flex flex-col lg:flex-row gap-12 w-full max-w-6xl items-start">
                {/* LEFT – GLASS PANEL */}
                <div className="w-full lg:w-2/3">
                    <div
                        className={`
              p-8 rounded-3xl shadow-xl border border-white/40
              backdrop-blur-xl bg-white/30
              transition-opacity ${confirmOpen ? 'opacity-30 pointer-events-none' : 'opacity-100'
                            }
            `}
                    >
                        <h1 className="text-4xl font-extrabold tracking-wide text-gray-800 drop-shadow-sm mb-6">
                            What service would you like to schedule?
                        </h1>

                        {/* Search */}
                        <Box sx={{ mb: 3 }}>
                            <TextField
                                fullWidth
                                placeholder="Search for a service"
                                variant="outlined"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '14px',
                                        backdropFilter: 'blur(14px)',
                                        background: 'rgba(255,255,255,0.5)',
                                        border: '1px solid rgba(255,255,255,0.7)'
                                    }
                                }}
                            />
                        </Box>

                        {/* Category Chips */}
                        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mb: 2 }}>
                            {categories.map((cat) => (
                                <Chip
                                    key={cat}
                                    label={cat}
                                    clickable
                                    onClick={() => setActiveCategory(cat)}
                                    sx={{
                                        backdropFilter: 'blur(10px)',
                                        borderRadius: '22px',
                                        px: 1.5,
                                        background:
                                            cat === activeCategory
                                                ? 'linear-gradient(135deg,#9d79ff,#7e5cff)'
                                                : 'rgba(255,255,255,0.4)',
                                        color: cat === activeCategory ? 'white' : 'black',
                                        fontWeight: 500,
                                        border: '1px solid rgba(255,255,255,0.7)'
                                    }}
                                />
                            ))}
                        </Stack>

                        <Divider
                            className="mb-4"
                            sx={{ borderColor: 'rgba(255,255,255,0.5)' }}
                        />

                        {/* SERVICE LIST */}
                        <Box sx={{ maxHeight: 360, overflowY: 'auto', pr: 1 }}>
                            {filteredServices.map((service) => {
                                const selected = selectedNames.includes(service.name);
                                const initial = service.name?.[0] ?? '?';

                                return (
                                    <Card
                                        key={service.id}
                                        onClick={() => toggleService(service.name)}
                                        sx={{
                                            mb: 2,
                                            cursor: 'pointer',
                                            bgcolor: 'rgba(255,255,255,0.35)',
                                            backdropFilter: 'blur(16px)',
                                            borderRadius: 3,
                                            border: selected
                                                ? '1.5px solid #8a65ff'
                                                : '1px solid rgba(255,255,255,0.6)',
                                            boxShadow: selected
                                                ? '0 0 18px rgba(140,110,255,0.4)'
                                                : '0 4px 14px rgba(0,0,0,0.08)',
                                            '&:hover': { boxShadow: '0 0 20px rgba(0,0,0,0.15)' }
                                        }}
                                    >
                                        <CardContent
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}
                                        >
                                            <Box
                                                sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
                                            >
                                                <Avatar>{initial}</Avatar>
                                                <Box>
                                                    <Typography fontWeight={700}>
                                                        {service.name}
                                                    </Typography>
                                                    <Typography fontSize={13} color="text.secondary">
                                                        {service.description}
                                                    </Typography>
                                                    <Typography fontSize={13} color="text.secondary">
                                                        ${service.price.toFixed(2)}
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            {/* IMPORTANT: checkbox must toggle service AND stop event bubbling */}
                                            <Checkbox
                                                checked={selected}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleService(service.name);
                                                }}
                                            />
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </Box>

                        {/* ERROR */}
                        {errors.services && (
                            <p className="text-red-500 text-sm mt-2">{errors.services}</p>
                        )}

                        {/* BUTTON */}
                        <button
                            onClick={handleProceed}
                            className="
                w-full mt-6 p-3 text-lg font-semibold rounded-xl
                bg-gradient-to-r from-[#8b65ff] to-[#c87dff]
                text-white shadow-lg
                hover:brightness-110 active:scale-[0.98]
                transition-all
              "
                        >
                            Proceed → Date & Time
                        </button>
                    </div>
                </div>

                {/* CONFIRM REMOVE */}
                <ConfirmDialog
                    isOpen={confirmOpen}
                    title="Remove Service"
                    message={
                        serviceToRemove
                            ? `Remove ${serviceToRemove} from your booking?`
                            : 'Remove this service?'
                    }
                    onConfirm={handleConfirmRemove}
                    onCancel={handleCancelRemove}
                />

                {/* RIGHT PANEL – GLASS SUMMARY */}
                <div className="w-full lg:w-1/3 mt-8 lg:mt-0">
                    <div
                        className={`
              sticky top-24 p-6 rounded-3xl shadow-xl
              border border-white/40 backdrop-blur-xl bg-white/30
              transition-opacity ${confirmOpen ? 'opacity-30 pointer-events-none' : 'opacity-100'
                            }
            `}
                    >
                        <MyServicePanel
                            services={selectedServices}
                            totalCost={selectedServices.reduce(
                                (sum, s) => sum + s.price,
                                0
                            )}
                            onRemove={handleRemoveClick}
                            onProceed={handleProceed}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingFormPage;

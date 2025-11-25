import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../business/Booking';
import { useAuth, axios } from '@mtbs/shared-lib';
import MyServicePanel from '../components/MyServicePanel';
import ConfirmDialog from '../components/ConfirmDialog';
import { Alert, TextField } from '@mui/material';

// MUI Date picker
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

/* ===================== helpers ===================== */

// convert Date -> local date-only (midnight, no time component)
const toDateOnly = (d) => {
    if (!d) return null;
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

// format local date-only -> "yyyy-MM-dd"
const formatDateToISO = (d) => {
    if (!d) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// parse "yyyy-MM-dd" -> local Date (midnight)
const parseISODateOnly = (str) => {
    if (!str) return null;
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, m - 1, d);
};

// Generate 30-minute slots between [start, end)
const generateHalfHourSlots = (start = '06:00', end = '21:00') => {
    const slots = [];
    let [h, m] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);

    while (h < endH || (h === endH && m < endM)) {
        const value = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

        const d = new Date();
        d.setHours(h, m, 0, 0);
        const label = d.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });

        slots.push({ value, label });

        m += 30;
        if (m >= 60) {
            m = 0;
            h += 1;
        }
    }
    return slots;
};

/* ===================== component ===================== */

const SchedulePage = () => {
    const { user } = useAuth();
    const {
        services,
        date,
        time,
        guests,
        notes,
        setDate,
        setTime,
        setNotes,
        setServices
    } = useBooking();

    const navigate = useNavigate();

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [serviceToRemove, setServiceToRemove] = useState(null);
    const [errors, setErrors] = useState({});
    const [submitError, setSubmitError] = useState(null);

    // slots from backend
    const [bookedSlots, setBookedSlots] = useState(new Set());
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [slotsError, setSlotsError] = useState(null);

    const selectedServices = useMemo(() => services ?? [], [services]);
    const totalCost = selectedServices.reduce(
        (sum, service) => sum + service.price,
        0
    );

    // All possible 30-min slots for a day: 06:00–21:00
    const allSlots = useMemo(
        () => generateHalfHourSlots('06:00', '21:00'),
        []
    );

    // Today / current-time helpers (for disabling past slots)
    const todayIso = formatDateToISO(toDateOnly(new Date()));
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const isToday = date === todayIso;

    // Fetch booked slots whenever the date changes
    useEffect(() => {
        if (!date) {
            setBookedSlots(new Set());
            return;
        }

        const fetchBookedSlots = async () => {
            setLoadingSlots(true);
            setSlotsError(null);

            try {
                // `date` is already "yyyy-MM-dd"
                const isoDate = date;

                const res = await axios.get(
                    'http://localhost:8080/api/v1/appointments/slots',
                    {
                        params: { date: isoDate }
                    }
                );

                const booked = res.data?.bookedSlots ?? [];
                setBookedSlots(new Set(booked));
            } catch (err) {
                console.error('Failed to load booked slots', err);
                setSlotsError(
                    'Unable to load available times. You can still pick a time, but some conflicts may not be shown.'
                );
                setBookedSlots(new Set());
            } finally {
                setLoadingSlots(false);
            }
        };

        fetchBookedSlots();
    }, [date]);

    // If there are no services, show message + button
    if (!selectedServices || selectedServices.length === 0) {
        return (
            <div
                className="
                    min-h-screen flex justify-center items-center px-4 py-10
                    bg-gradient-to-br from-[#dfe5ff] via-[#e3dfff] to-[#fde2ff]
                "
            >
                <div
                    className="
                        max-w-lg w-full p-8 text-center
                        rounded-3xl shadow-xl border border-white/40
                        bg-white/30 backdrop-blur-xl
                    "
                >
                    <h2 className="text-2xl font-semibold text-purple-800 mb-4">
                        No services selected
                    </h2>
                    <p className="text-gray-700 mb-6">
                        Please select at least one service before choosing a date and
                        time.
                    </p>
                    <button
                        type="button"
                        onClick={() => navigate('/booking/services')}
                        className="
                            w-full py-4 text-lg font-semibold rounded-xl
                            bg-gradient-to-r from-[#8b65ff] to-[#c87dff]
                            text-white shadow-lg
                            hover:brightness-110 active:scale-[0.98]
                            transition-all
                        "
                    >
                        Back to Services
                    </button>
                </div>
            </div>
        );
    }

    const handleRemoveClick = (serviceName) => {
        setServiceToRemove(serviceName);
        setConfirmOpen(true);
    };

    const confirmRemoveService = () => {
        const updated = selectedServices.filter(
            (s) => s.name !== serviceToRemove
        );
        setServices(updated);
        setConfirmOpen(false);
        setServiceToRemove(null);
    };

    const cancelRemoveService = () => {
        setConfirmOpen(false);
        setServiceToRemove(null);
    };

    const validateForm = () => {
        const newErrors = {};

        if (!date) {
            newErrors.date = 'Please select a date.';
        } else {
            const today = toDateOnly(new Date());
            today.setHours(0, 0, 0, 0);

            const selectedDate = parseISODateOnly(date);
            selectedDate.setHours(0, 0, 0, 0);

            if (selectedDate < today) {
                newErrors.date = 'Date cannot be in the past.';
            }
        }

        if (!time) {
            newErrors.time = 'Please select a time.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        setSubmitError(null);

        if (!validateForm()) return;
        if (!user) return;

        const payload = {
            userId: user.uid,
            serviceIds: selectedServices.map((s) => s.id),
            dateTime: `${date}T${time}:00`,
            guests,
            notes,
            status: 'Pending'
        };

        try {
            const response = await axios.post(
                'http://localhost:8080/api/v1/appointments',
                payload
            );
            const newAppointmentId = response.data.id;
            navigate(`/booking/confirmation/${newAppointmentId}`);
        } catch (err) {
            console.error(err);
            setSubmitError('Failed to create appointment. Please try again.');
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <div
                className="
                    min-h-screen 
                    px-4 py-10 
                    flex justify-center items-start
                    bg-gradient-to-br from-[#dfe5ff] via-[#e3dfff] to-[#fde2ff]
                "
            >
                <div className="flex flex-col lg:flex-row gap-12 w-full max-w-6xl items-start">
                    {/* LEFT COLUMN – schedule form */}
                    <div className="w-full lg:w-2/3">
                        <div
                            className="
                                p-8 rounded-3xl shadow-xl border border-white/40
                                bg-white/30 backdrop-blur-xl
                            "
                        >
                            {/* header with subtitle */}
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-3xl font-semibold text-gray-800 tracking-wide">
                                        Choose Date &amp; Time
                                    </h2>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Pick a date and time that works best for your visit.
                                    </p>
                                </div>
                                <div
                                    className="
                                        hidden sm:flex items-center gap-2
                                        px-3 py-1.5 rounded-full
                                        bg-gradient-to-r from-[#8b65ff]/10 to-[#c87dff]/10
                                        border border-white/60
                                        text-xs font-medium text-purple-700
                                    "
                                >
                                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                                    <span>Instant confirmation</span>
                                </div>
                            </div>

                            {submitError && (
                                <div className="mb-4">
                                    <Alert severity="error">{submitError}</Alert>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Date & Time as a responsive grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Date */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-800 mb-1">
                                            Date
                                        </label>
                                        <DatePicker
                                            value={date ? parseISODateOnly(date) : null}
                                            onChange={(newValue) => {
                                                const onlyDate = toDateOnly(newValue);
                                                setDate(formatDateToISO(onlyDate));
                                                // reset chosen time when date changes
                                                setTime('');
                                                setErrors((prev) => ({
                                                    ...prev,
                                                    time: undefined
                                                }));
                                            }}
                                            disablePast
                                            slotProps={{
                                                textField: {
                                                    fullWidth: true,
                                                    size: 'medium',
                                                    error: Boolean(errors.date),
                                                    helperText: errors.date || ' ',
                                                    InputLabelProps: {
                                                        shrink: false
                                                    },
                                                    placeholder: 'Select a date',
                                                    InputProps: {
                                                        sx: {
                                                            borderRadius: 3,
                                                            background:
                                                                'rgba(255,255,255,0.7)',
                                                            backdropFilter:
                                                                'blur(12px)',
                                                            '& fieldset': {
                                                                borderColor: errors.date
                                                                    ? '#f97373'
                                                                    : 'rgba(255,255,255,0.9)'
                                                            },
                                                            '&:hover fieldset': {
                                                                borderColor:
                                                                    '#a855f7'
                                                            },
                                                            '&.Mui-focused fieldset':
                                                            {
                                                                borderColor:
                                                                    '#a855f7',
                                                                boxShadow:
                                                                    '0 0 0 3px rgba(168,85,247,0.25)'
                                                            }
                                                        }
                                                    }
                                                }
                                            }}
                                            sx={{
                                                '& .MuiPaper-root': {
                                                    borderRadius: '20px',
                                                    padding: '8px',
                                                    background:
                                                        'rgba(255,255,255,0.95)',
                                                    backdropFilter: 'blur(20px)',
                                                    boxShadow:
                                                        '0 20px 45px rgba(147, 112, 219, 0.35)'
                                                },
                                                '& .MuiPickersDay-root.Mui-selected':
                                                {
                                                    background:
                                                        'linear-gradient(135deg,#8b65ff,#c87dff)',
                                                    color: '#fff'
                                                },
                                                '& .MuiPickersDay-root.Mui-selected:hover':
                                                {
                                                    background:
                                                        'linear-gradient(135deg,#7c3aed,#a855f7)'
                                                }
                                            }}
                                        />
                                    </div>

                                    {/* Time as 30-min slot grid */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-800 mb-1">
                                            Time
                                        </label>

                                        {slotsError && (
                                            <div className="mb-1">
                                                <Alert severity="warning">
                                                    {slotsError}
                                                </Alert>
                                            </div>
                                        )}

                                        {loadingSlots && (
                                            <p className="text-xs text-gray-500 mb-2">
                                                Loading available time slots…
                                            </p>
                                        )}

                                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 mt-1">
                                            {allSlots.map((slot) => {
                                                const [h, m] = slot.value
                                                    .split(':')
                                                    .map(Number);
                                                const slotMinutes =
                                                    h * 60 + m;

                                                const isPast =
                                                    isToday &&
                                                    slotMinutes <= nowMinutes;

                                                const disabled =
                                                    bookedSlots.has(
                                                        slot.value
                                                    ) || isPast;

                                                const isSelected =
                                                    time === slot.value;

                                                return (
                                                    <button
                                                        key={slot.value}
                                                        type="button"
                                                        disabled={disabled}
                                                        onClick={() => {
                                                            if (!disabled) {
                                                                setTime(
                                                                    slot.value
                                                                );
                                                                setErrors(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        time: undefined
                                                                    })
                                                                );
                                                            }
                                                        }}
                                                        className={[
                                                            'px-3 py-1.5 rounded-full text-xs sm:text-sm border transition-all',
                                                            disabled
                                                                ? 'bg-gray-200/60 text-gray-400 cursor-not-allowed'
                                                                : isSelected
                                                                    ? 'bg-gradient-to-r from-[#8b65ff] to-[#c87dff] text-white border-transparent shadow-md'
                                                                    : 'bg-white/70 text-gray-800 border-white/80 hover:border-purple-400 hover:bg-purple-50/80'
                                                        ].join(' ')}
                                                    >
                                                        {slot.label}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {errors.time && (
                                            <p className="mt-1 text-xs text-rose-500">
                                                {errors.time}
                                            </p>
                                        )}

                                        {/* Legend */}
                                        <div className="flex flex-wrap items-center gap-4 mt-3">
                                            <div className="flex items-center gap-1">
                                                <span className="w-3 h-3 rounded-full bg-gradient-to-r from-[#8b65ff] to-[#c87dff]" />
                                                <span className="text-xs text-gray-600">
                                                    Selected
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span className="w-3 h-3 rounded-full bg-gray-300" />
                                                <span className="text-xs text-gray-600">
                                                    Unavailable (booked / past)
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span className="w-3 h-3 rounded-full bg-white border border-gray-300" />
                                                <span className="text-xs text-gray-600">
                                                    Available
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Notes */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-800 mb-1">
                                        Special Notes (Optional)
                                    </label>
                                    <TextField
                                        multiline
                                        minRows={4}
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Enter any special requests or instructions..."
                                        fullWidth
                                        variant="outlined"
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 3,
                                                background:
                                                    'rgba(255,255,255,0.75)',
                                                backdropFilter: 'blur(12px)',
                                                '& fieldset': {
                                                    borderColor:
                                                        'rgba(255,255,255,0.9)'
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: '#a855f7'
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: '#a855f7',
                                                    boxShadow:
                                                        '0 0 0 3px rgba(168,85,247,0.2)'
                                                }
                                            }
                                        }}
                                    />
                                </div>

                                {/* Small reassurance line */}
                                <p className="text-xs text-gray-500">
                                    You’ll receive an email and SMS confirmation once
                                    your appointment is booked.
                                </p>

                                {/* Buttons */}
                                <div className="flex items-center justify-between gap-4 pt-2">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            navigate('/booking/services')
                                        }
                                        className="
                                            flex-1 py-2 rounded-xl font-semibold
                                            border border-purple-600 text-purple-700
                                            bg-white/40 backdrop-blur-md
                                            hover:bg-purple-50/80
                                            transition-all shadow-sm
                                        "
                                    >
                                        Back to Services
                                    </button>

                                    <button
                                        type="submit"
                                        className="
                                            flex-1 py-2 text-lg font-semibold rounded-xl
                                            bg-gradient-to-r from-[#8b65ff] to-[#c87dff]
                                            text-white shadow-lg
                                            hover:brightness-110 active:scale-[0.98]
                                            transition-all disabled:opacity-50 disabled:cursor-not-allowed
                                        "
                                    >
                                        Confirm Booking
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* CONFIRM DIALOG + RIGHT SUMMARY PANEL */}
                    <ConfirmDialog
                        isOpen={confirmOpen}
                        title="Remove Service"
                        message={`Are you sure you want to remove the ${serviceToRemove} service from your booking?`}
                        onConfirm={confirmRemoveService}
                        onCancel={cancelRemoveService}
                    />

                    {/* Right – glass summary card */}
                    <div className="w-full lg:w-1/3">
                        <div
                            className="
                                sticky top-24 p-6 rounded-3xl shadow-xl
                                border border-white/40 bg-white/30 backdrop-blur-xl
                            "
                        >
                            <MyServicePanel
                                services={selectedServices}
                                totalCost={totalCost}
                                onRemove={handleRemoveClick}
                                onProceed={handleSubmit}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </LocalizationProvider>
    );
};

export default SchedulePage;

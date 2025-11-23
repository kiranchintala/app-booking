import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../business/Booking';
import { useAuth, axios } from '@mtbs/shared-lib';
import MyServicePanel from '../components/MyServicePanel';
import ConfirmDialog from '../components/ConfirmDialog';
import { Alert, TextField } from '@mui/material';

// ⬇️ NEW: MUI Date/Time pickers
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';

// Helpers to convert between string state and Date objects
const formatDateToISO = (dateObj) => {
    if (!dateObj) return '';
    // yyyy-MM-dd
    return dateObj.toISOString().split('T')[0];
};

const formatTimeToHHMM = (dateObj) => {
    if (!dateObj) return '';
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
};

const parseTimeStringToDate = (timeStr) => {
    if (!timeStr) return null;
    const [h, m] = timeStr.split(':').map(Number);
    const d = new Date();
    d.setHours(h, m || 0, 0, 0);
    return d;
};

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

    const selectedServices = useMemo(() => services ?? [], [services]);
    const totalCost = selectedServices.reduce(
        (sum, service) => sum + service.price,
        0
    );

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
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const selectedDate = new Date(date);
            // keep your previous TZ adjustment logic
            selectedDate.setMinutes(
                selectedDate.getMinutes() + selectedDate.getTimezoneOffset()
            );
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
            dateTime: `${date}T${time}:00`, // unchanged
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
                    {/* LEFT COLUMN – premium glass schedule form */}
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
                                            value={date ? new Date(date) : null}
                                            onChange={(newValue) => {
                                                setDate(formatDateToISO(newValue));
                                            }}
                                            disablePast
                                            slotProps={{
                                                textField: {
                                                    fullWidth: true,
                                                    size: 'medium',
                                                    error: Boolean(errors.date),
                                                    helperText:
                                                        errors.date || ' ',
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

                                    {/* Time */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-800 mb-1">
                                            Time
                                        </label>
                                        <TimePicker
                                            value={parseTimeStringToDate(time)}
                                            onChange={(newValue) => {
                                                setTime(formatTimeToHHMM(newValue));
                                            }}
                                            minutesStep={15}
                                            slotProps={{
                                                textField: {
                                                    fullWidth: true,
                                                    size: 'medium',
                                                    error: Boolean(errors.time),
                                                    helperText:
                                                        errors.time || ' ',
                                                    InputLabelProps: {
                                                        shrink: false
                                                    },
                                                    placeholder: 'Select a time',
                                                    InputProps: {
                                                        sx: {
                                                            borderRadius: 3,
                                                            background:
                                                                'rgba(255,255,255,0.7)',
                                                            backdropFilter:
                                                                'blur(12px)',
                                                            '& fieldset': {
                                                                borderColor: errors.time
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
                                        />
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
                    <div className="w-full lg:w-1/3 mt-6 lg:mt-0">
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

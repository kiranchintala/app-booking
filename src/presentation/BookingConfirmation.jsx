import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { useParams } from 'react-router-dom';
import { useAppointmentDetails } from '../hooks/useAppointmentDetails';
import { useAuth } from '@mtbs/shared-lib';
import { ConfirmationLayout } from '@mtbs/shared-lib';
import {
    CalendarCheck,
    Users,
    StickyNote,
    Scissors,
    FileText,
    CheckCircle,
    Hash,
} from 'lucide-react';
import { CircularProgress, Alert } from '@mui/material';

const BookingConfirmation = () => {
    const { user } = useAuth();
    const { width, height } = useWindowSize();
    const [showConfetti, setShowConfetti] = useState(true);

    const { appointmentId } = useParams();
    const {
        data: appointment,
        isLoading,
        isError,
    } = useAppointmentDetails(appointmentId);

    useEffect(() => {
        const timer = setTimeout(() => setShowConfetti(false), 5000);
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <CircularProgress />
            </div>
        );
    }

    if (isError || !appointment) {
        return (
            <div className="min-h-screen px-4 py-10 flex justify-center items-start bg-gradient-to-br from-[#dfe5ff] via-[#e3dfff] to-[#fde2ff]">
                <div className="w-full lg:w-5/6 max-w-6xl">
                    <ConfirmationLayout
                        title="Something Went Wrong"
                        message="We could not find the details for this booking. Please check the link or contact support."
                        user={user}
                    />
                </div>
            </div>
        );
    }

    const formattedDateTime = new Date(appointment.dateTime).toLocaleString(
        'en-US',
        {
            dateStyle: 'full',
            timeStyle: 'short',
        }
    );

    return (
        <>
            {showConfetti && (
                <Confetti width={width} height={height} numberOfPieces={300} />
            )}

            {/* Page background matches other booking screens */}
            <div className="min-h-screen px-4 py-10 flex justify-center items-start bg-gradient-to-br from-[#dfe5ff] via-[#e3dfff] to-[#fde2ff]">
                <div className="w-full lg:w-5/6 max-w-6xl">
                    <ConfirmationLayout
                        title={
                            <div className="flex items-center justify-center gap-2 text-emerald-600">
                                <CheckCircle className="w-6 h-6" />
                                <span>Appointment {appointment.status}!</span>
                            </div>
                        }
                        message="Thank you! Your appointment has been successfully scheduled."
                        user={user}
                    >
                        {/* Glassmorphism card – same feel as Schedule page */}
                        <div className="mt-6">
                            <div className="rounded-3xl shadow-xl border border-white/40 bg-white/70 backdrop-blur-xl p-6 sm:p-8">
                                <div className="flex justify-center items-center gap-2 mb-4 text-purple-600">
                                    <FileText className="w-5 h-5" />
                                    <h3 className="text-md font-semibold">Appointment Summary</h3>
                                </div>

                                <div className="space-y-3 text-sm text-gray-800">
                                    <div className="flex items-center gap-2">
                                        <Hash className="w-4 h-4 text-purple-500" />
                                        <span>
                                            <strong>Confirmation ID:</strong> {appointment.id}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <CalendarCheck className="w-4 h-4 text-purple-500" />
                                        <span>
                                            <strong>Date &amp; Time:</strong> {formattedDateTime}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-purple-500" />
                                        <span>
                                            <strong>Guests:</strong> {appointment.guests}
                                        </span>
                                    </div>

                                    {appointment.services?.length > 0 && (
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <Scissors className="w-4 h-4 text-purple-500" />
                                                <span>
                                                    <strong>Services:</strong>
                                                </span>
                                            </div>
                                            <ul className="list-disc list-inside pl-6 text-gray-700">
                                                {appointment.services.map((s) => (
                                                    <li key={s.id}>
                                                        {s.name} (${s.price.toFixed(2)})
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {appointment.notes && (
                                        <div className="flex items-start gap-2">
                                            <StickyNote className="w-4 h-4 text-purple-500 mt-1" />
                                            <span>
                                                <strong>Special Notes:</strong> {appointment.notes}
                                            </span>
                                        </div>
                                    )}

                                    <div className="border-t border-purple-200 my-4" />

                                    <div className="flex justify-between items-center text-md">
                                        <span className="font-bold">Total Cost:</span>
                                        <span className="font-bold text-purple-700">
                                            ${appointment.totalCost.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ConfirmationLayout>
                </div>
            </div>
        </>
    );
};

export default BookingConfirmation;

import { useQuery } from '@tanstack/react-query';
import { axios } from '@mtbs/shared-lib';

const fetchAppointmentDetails = async (appointmentId) => {
    if (!appointmentId) return null;
    const { data } = await axios.get(`http://localhost:8080/api/v1/appointments/${appointmentId}`);
    return data;
};

export const useAppointmentDetails = (appointmentId) => {
    return useQuery({
        queryKey: ['appointment', appointmentId],
        queryFn: () => fetchAppointmentDetails(appointmentId),
        enabled: !!appointmentId,
    });
};
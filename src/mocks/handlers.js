import { http, HttpResponse } from 'msw';

export const handlers = [

    //POST /appointments
    http.post('/appointments', async ({ request }) => {
        const body = await request.json();
        console.log('📦 Mock intercepted POST /appointments with:', body);

        return new HttpResponse(
            JSON.stringify({
                message: 'Appointment booked successfully (mocked)',
                appointmentId: 'mock-appointment-123',
                ...body
            }),
            { status: 201, headers: { 'Content-Type': 'application/json' } }
        );

    }),

];
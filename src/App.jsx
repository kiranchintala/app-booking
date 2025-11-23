import React from 'react';
import { Routes, Route } from 'react-router-dom';
import BookingConfirmation from './presentation/BookingConfirmation';
import BookingFormPage from './presentation/BookingFormPage';
import SchedulePage from './presentation/SchedulePage';

const App = () => (
  <Routes>
    {/* /booking -> BookingFormPage */}
    <Route index element={<BookingFormPage />} />
    {/* /booking/services */}
    <Route path="services" element={<BookingFormPage />} />
    {/* /booking/schedule */}
    <Route path="schedule" element={<SchedulePage />} />
    {/* /booking/confirmation/:appointmentId */}
    <Route path="confirmation/:appointmentId" element={<BookingConfirmation />} />
  </Routes>
);

export default App;

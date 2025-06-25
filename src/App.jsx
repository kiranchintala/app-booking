import React from 'react';
import { Routes, Route } from 'react-router-dom';
import BookingConfirmation from './presentation/BookingConfirmation';
import BookingFormPage from './presentation/BookingFormPage';

const App = () => (
  <Routes>
    <Route path="/" element={<BookingFormPage />} />
    <Route path="/booking/confirmation/:appointmentId" element={<BookingConfirmation />} />
  </Routes>
);

export default App;
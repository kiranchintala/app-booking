import React from 'react';
import './index.css';
import App from './App.jsx';
import { RootProviders } from './RootProviders';

const BookingRemote = () => (
    <RootProviders>
        <App />
    </RootProviders>
);

export default BookingRemote;

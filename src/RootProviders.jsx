// src/RootProviders.jsx
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, MockAuthProvider } from '@mtbs/shared-lib';
import { BookingProvider } from './business/Booking';

// Create a QueryClient for React Query
const queryClient = new QueryClient();

export const RootProviders = ({ children }) => {
    // Choose Auth provider based on env
    const Provider = process.env.MOCK_AUTH === 'true'
        ? MockAuthProvider
        : AuthProvider;

    return (
        <QueryClientProvider client={queryClient}>
            <Provider>
                <BookingProvider>
                    {children}
                </BookingProvider>
            </Provider>
        </QueryClientProvider>
    );
};

import './index.css';

if (
    process.env.NODE_ENV === 'development' &&
    process.env.MOCK_API === 'true'
) {
    console.log('🧪 Enabling MSW mocks (booking standalone)');
    import('./mocks/browser').then(({ worker }) =>
        worker.start({
            onUnhandledRequest: 'warn',
        })
    );
}

// This is the actual app bootstrap for standalone mode
import('./bootstrap');

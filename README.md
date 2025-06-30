# App Booking

A modern React-based booking application built with Material-UI and TailwindCSS for creating and managing appointments.

## 🚀 Features

- **Booking Form**: Interactive form for creating new appointments
- **Booking Confirmation**: Confirmation page with appointment details
- **Responsive Design**: Mobile-friendly interface using Material-UI and TailwindCSS
- **React Router**: Client-side routing for seamless navigation
- **React Query**: Efficient data fetching and caching
- **Confetti Animation**: Celebratory animations for successful bookings

## 🛠️ Tech Stack

- **Frontend**: React 18.3.1
- **UI Libraries**: 
  - Material-UI (@mui/material) 5.15.14
  - TailwindCSS 3.4.17
  - Lucide React (icons)
- **State Management**: @tanstack/react-query 5.45.1
- **Routing**: React Router DOM 6.20.0
- **Build Tool**: Webpack 5.88.0
- **Styling**: Emotion (CSS-in-JS)

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn package manager

## 🚀 Getting Started

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd app-booking
```

2. Install dependencies:
```bash
npm install --legacy-peer-deps
```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:8080` (or the port specified in webpack config).

### Production Build

Build the application for production:
```bash
npm run build
```

This will create a `dist/` folder with optimized production files.

## 🏗️ Project Structure

```
src/
├── App.jsx                 # Main application component with routing
├── bootstrap.jsx           # Application bootstrap and setup
├── main.jsx               # Entry point
├── index.css              # Global styles
├── business/              # Business logic and services
├── components/            # Reusable UI components
├── hooks/                 # Custom React hooks
├── mocks/                 # Mock data for development/testing
└── presentation/          # Page components
    ├── BookingFormPage.jsx      # Main booking form
    └── BookingConfirmation.jsx  # Booking confirmation page
```

## 🛣️ Routes

- `/` - Booking form page
- `/booking/confirmation/:appointmentId` - Booking confirmation page

## 🚀 Deployment

This project includes Jenkins CI/CD pipeline configuration for automated deployment to AWS S3.

### Deployment Environments

- **Development**: `dev` environment
- **Production**: `prod` environment

### Manual Deployment

The Jenkins pipeline handles:
1. Environment variable injection
2. Dependency installation
3. Production build
4. S3 deployment with CloudFront invalidation

## 🔧 Configuration

- **Webpack**: Custom configuration in `webpack.config.js`
- **Babel**: React and ES6+ transpilation via `.babelrc`
- **TailwindCSS**: Configuration in `tailwind.config.js`
- **PostCSS**: Configuration in `postcss.config.js`

## 📦 Dependencies

### Production Dependencies
- React ecosystem (React, React DOM, React Router)
- UI libraries (Material-UI, TailwindCSS, Lucide React)
- Data fetching (@tanstack/react-query)
- Utility libraries (react-use, react-confetti)
- Shared libraries (@mtbs/shared-lib)

### Development Dependencies
- Build tools (Webpack, Babel)
- CSS processing (PostCSS, Autoprefixer)
- Development server and hot reloading

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary.

## 🆘 Support

For support and questions, please contact the development team or create an issue in the repository.
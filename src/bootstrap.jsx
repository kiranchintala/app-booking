// src/bootstrap.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import { RootProviders } from './RootProviders';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <RootProviders>
        <App />
      </RootProviders>
    </BrowserRouter>
  </React.StrictMode>
);

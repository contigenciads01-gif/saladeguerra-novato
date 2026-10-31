// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#0D1117',
              color: '#F0F9FF',
              border: '1px solid #00E5FF44',
              fontFamily: 'Inter, sans-serif',
            },
            success: { iconTheme: { primary: '#00E5FF', secondary: '#05070A' } },
            error: { iconTheme: { primary: '#FF4444', secondary: '#05070A' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App';
import OsciArtPage from './pages/OsciArtPage';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/osci-art" element={<OsciArtPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();

// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

import LandingPage from './pages/LandingPage';
import TrackComplaint from './pages/TrackComplaint';
import SubmitComplaint from './pages/SubmitComplaint';
import ComplaintRegarding from './pages/ComplaintRegarding';
import Complaints from './pages/Complaints';
import Policy from './pages/Policy';
import FAQS from './pages/FAQS';
import LoginPage from './pages/LoginPage';
import ForgotPassword from './pages/ForgotPassword';
function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/track-complaint" element={<TrackComplaint />} />
          <Route path="/submit-complaint" element={<SubmitComplaint />} />
          <Route path="/complaints" element={<Complaints />} />
          <Route path="/complaint-regarding" element={<ComplaintRegarding />} />
          <Route path="/policy" element={<Policy />} />
          <Route path="/faqs" element={<FAQS />} />
          <Route path="/admin-login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;
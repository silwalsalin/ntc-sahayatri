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
import Verifyotp from './pages/Verifyotp';
import ResetPassword from './pages/ResetPassword';
import AdminDashboard from './pages/AdminDashboard';
import AdminComplaints from './pages/AdminComplaints';
import AdminComplaintsPending from './pages/AdminComplaintsPending';
import AdminComplaintsInProgress from './pages/AdminComplaintsInprogress';
import AdminComplaintsResolved from './pages/AdminComplaintsResolved';
import AdminUsers from './pages/AdminUsers';
import AdminReportsComplaints from './pages/AdminReportsComplaints';
import AdminReportsUsers from './pages/AdminReportsUsers';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminNotifications from './pages/AdminNotifications';
import AdminSettingsGeneral from './pages/AdminSettingsGeneral';
import AdminSettingsSecurity from './pages/AdminSettingsSecurity';
import AdminDocumentation from './pages/AdminDocumentation';
import AdminContact from './pages/AdminContact';
import StaffDashboard from './pages/StaffDashboard';
import StaffComplaintsAssigned from './pages/StaffComplaintsAssigned';
import StaffComplaintSolve from './pages/StaffComplaintSolve';
import StaffComplaintsMy from './pages/StaffComplaintsMy';
import StaffComplaintsAll from './pages/StaffComplaintsAll';
import StaffCmplaintsPending from './pages/StaffComplaintsPending';
import StaffComplaintsInprogress from './pages/StaffComplaintsInprogress';
import StaffComplaintsResolved from './pages/StaffComplaintsResolved';
import StaffTasks from './pages/StaffTasks';
import StaffTasksPending from './pages/StaffTasksPending';
import StaffTasksCompleted from './pages/StaffTasksCompleted';
import StaffReportsDaily from './pages/StaffReportsDaily';
import StaffReportsWeekly from './pages/StaffReportsWeekly';
import StaffReportsMonthly from './pages/StaffReportsMonthly';
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
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-otp" element={<Verifyotp />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/admin-complaints" element={<AdminComplaints />} />
          <Route path="/admin-complaints/pending" element={<AdminComplaintsPending />} />
          <Route path="/admin-complaints/in-progress" element={<AdminComplaintsInProgress />} />
          <Route path="/admin-complaints/resolved" element={<AdminComplaintsResolved />} />
          <Route path="/admin-users" element={<AdminUsers />} />  
          <Route path="/admin-reports/complaints" element={<AdminReportsComplaints />} />
          <Route path="/admin-reports/users" element={<AdminReportsUsers />} />
          <Route path="/admin-analytics" element={<AdminAnalytics />} />
          <Route path="/admin-notifications" element={<AdminNotifications />} />
          <Route path="/admin-settings/general" element={<AdminSettingsGeneral />} />
          <Route path="/admin-settings/security" element={<AdminSettingsSecurity />} />
          <Route path="/admin-documentation" element={<AdminDocumentation />} />
          <Route path="/admin-contact" element={<AdminContact />} />
          <Route path="/staff-dashboard" element={<StaffDashboard />} />
          <Route path="/staff/complaints/assigned" element={<StaffComplaintsAssigned />} />
          <Route path="/staff/complaints/solve/:id" element={<StaffComplaintSolve />} />
          <Route path="/staff/complaints/my" element={<StaffComplaintsMy />} />
          <Route path="/staff/complaints/all" element={<StaffComplaintsAll />} />
          <Route path="/staff/complaints/pending" element={<StaffCmplaintsPending />} />
          <Route path="/staff/complaints/in-progress" element={<StaffComplaintsInprogress />} />
          <Route path="/staff/complaints/resolved" element={<StaffComplaintsResolved />} />
          <Route path="/staff/tasks" element={<StaffTasks />} />
          <Route path="/staff/tasks/pending" element={<StaffTasksPending />} />
          <Route path="/staff/tasks/completed" element={<StaffTasksCompleted />} />
          <Route path="/staff/reports/daily" element={<StaffReportsDaily />} />
          <Route path="/staff/reports/weekly" element={<StaffReportsWeekly />} />
          <Route path="/staff/reports/monthly" element={<StaffReportsMonthly />} />
                  </Routes>
      </div>
    </Router>
  );
}

export default App;
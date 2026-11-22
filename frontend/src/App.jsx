import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import HomePage from './pages/HomePage';
import SubmitComplaintPage from './pages/SubmitComplaintPage';
import TrackComplaintPage from './pages/TrackComplaintPage';
import PublicDashboardPage from './pages/PublicDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import HotspotsAnalyticsPage from './pages/HotspotsAnalyticsPage';
import MyComplaintsPage from './pages/MyComplaintsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AboutPage from './pages/AboutPage';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/submit" element={<SubmitComplaintPage />} />
                <Route path="/track" element={<TrackComplaintPage />} />
                <Route path="/track/:id" element={<TrackComplaintPage />} />
                <Route path="/dashboard" element={<PublicDashboardPage />} />
                <Route path="/hotspots" element={<HotspotsAnalyticsPage />} />
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="/my-complaints" element={<MyComplaintsPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

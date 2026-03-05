import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Menu, X } from 'lucide-react'; // Icons for the toggle
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyPage from './pages/verifypage';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import MovieDetails from './pages/MovieDetails'; 
import ChatPage from './pages/ChatPage';
import ReportsPage from './pages/ReportsPage';
import StaffManagementPage from './pages/StaffManagementPage';
import Sidebar from './components/Sidebar';
import AdminUsers from './pages/AdminUsers';

// --- Updated Responsive Layout ---
const DashboardLayout = ({ role, handleLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-zinc-950 text-white overflow-hidden relative">
      
      {/* 1. Mobile Overlay (Blurs background when sidebar is open) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 2. Sidebar - Slides in on mobile, fixed on desktop */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-300 ease-in-out bg-zinc-900
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:relative lg:translate-x-0
      `}>
        <Sidebar 
          role={role} 
          handleLogout={handleLogout} 
          onClose={() => setIsSidebarOpen(false)} // Pass close function to sidebar
        />
      </div>
      
      {/* 3. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Mobile Header (Only visible on Phone/Tablet) */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-zinc-900 border-b border-zinc-800">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-zinc-800 rounded-lg">
            <Menu size={24} />
          </button>
          <h1 className="text-xl font-bold text-red-500">MovieClub</h1>
          <div className="w-10" /> {/* Spacer to center the title */}
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <Outlet />
        </main>
      </div>
    </div>
  );
};

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role'));

  const handleLogout = () => {
    localStorage.clear();
    setToken(null);
    setRole(null);
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={token ? <Navigate to="/" /> : <Login setToken={setToken} setRole={setRole} />} />
        <Route path="/signup" element={token ? <Navigate to="/" /> : <Signup />} />
        <Route path="/verify/:token" element={<VerifyPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Private Routes wrapped in the updated Layout */}
        <Route path="/" element={token ? <DashboardLayout role={role} handleLogout={handleLogout} /> : <Navigate to="/login" />}>
            <Route index element={<Dashboard role={role} />} />
            <Route path="dashboard" element={<Dashboard role={role} />} />
            <Route path="movie/:id" element={<MovieDetails />} />
            <Route path="chat" element={<ChatPage />} /> 
            <Route path="admin/reports" element={<ReportsPage />} />
            <Route path="admin/staff" element={<StaffManagementPage />} />
            <Route path="admin/users" element={<AdminUsers />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
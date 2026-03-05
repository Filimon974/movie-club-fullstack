import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';

import { LayoutDashboard, MessageSquare, ChevronDown, ChevronUp, Users, FileText, UserPlus, LogOut, ShieldCheck } from 'lucide-react'; // Added ShieldCheck
import axios from 'axios';

export default function Sidebar({ role, handleLogout }) {
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [genres, setGenres] = useState([]);

  useEffect(() => {
    const fetchGenres = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/genres`);
            setGenres(res.data);
        } catch (err) {
            console.error("Failed to fetch genres", err);
        }
    };
    fetchGenres();
  }, []);

  const navLinkClass = "flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-800 text-zinc-300 hover:text-white transition";
  const activeLinkClass = "flex items-center gap-3 p-3 rounded-lg bg-red-600 text-white font-semibold";

  return (
    <div className="w-64 max-w-full bg-zinc-900 h-full p-4 border-r border-zinc-800 flex flex-col overflow-y-auto">                
      <h1 className="text-2xl font-bold text-red-500 mb-10 text-center">MovieClub</h1>
      
      <nav className="flex-grow space-y-2">
        <NavLink to="/dashboard" className={({isActive}) => isActive ? activeLinkClass : navLinkClass}>
          <LayoutDashboard size={20} /> Dashboard
        </NavLink>

        {/* Categories Dropdown */}
        <div>
            <button 
                onClick={() => setCategoriesOpen(!categoriesOpen)} 
                className={`${navLinkClass} w-full`}
            >
                <div className='flex items-center gap-3'><FileText size={20} /> Categories</div>
                {categoriesOpen ? <ChevronUp size={16} className='ml-auto' /> : <ChevronDown size={16} className='ml-auto' />}
            </button>
            
            {categoriesOpen && (
                <div className="pl-11 space-y-2 mt-1 text-sm text-zinc-400 max-h-60 overflow-y-auto">
                    {genres.map(genre => (
                        <NavLink 
                            key={genre.id} 
                            to={`/category/${genre.name.toLowerCase()}`}
                            className={({isActive}) => isActive ? "text-white block" : "hover:text-white block"}
                        >
                            {genre.name}
                        </NavLink>
                    ))}
                </div>
            )}
        </div>

        <NavLink to="/chat" className={({isActive}) => isActive ? activeLinkClass : navLinkClass}>
          <MessageSquare size={20} /> Chat Room
        </NavLink>

        {/* Admin Section */}
        {role === 'admin' && (
          <div className="border-t border-zinc-700 pt-4 mt-6 space-y-2">
            <h3 className="text-xs text-zinc-500 uppercase font-bold pl-3 mb-2">Admin</h3>
            
            {/* UPDATED: Admin Links */}
            <NavLink to="/admin/reports" className={({isActive}) => isActive ? activeLinkClass : navLinkClass}>
              <FileText size={20} /> Reports
            </NavLink>
            {/* NEW: User Management Link */}
            <NavLink to="/admin/users" className={({isActive}) => isActive ? activeLinkClass : navLinkClass}>
              <Users size={20} /> User Management
            </NavLink>
            <NavLink to="/admin/staff" className={({isActive}) => isActive ? activeLinkClass : navLinkClass}>
              <UserPlus size={20} /> Staff Management
            </NavLink>
          </div>
        )}
      </nav>

      {/* Logout Button */}
      <div className="mt-auto border-t border-zinc-800 pt-4">
        <button onClick={handleLogout} className="flex w-full items-center gap-3 p-3 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-zinc-800">
            <LogOut size={20} /> Logout
        </button>
      </div>
    </div>
  );
}
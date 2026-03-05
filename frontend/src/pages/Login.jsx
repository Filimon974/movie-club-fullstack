import { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, Loader2 } from 'lucide-react'; // 1. Added Loader2
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2'; // 2. Added Swal

export default function Login({ setToken, setRole }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); // 3. Added loading state
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); // 4. Set loading to true
    try {
        const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, { email, password });
        
        // Store user data
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('role', res.data.role);
        localStorage.setItem('userId', res.data.userId); 
        localStorage.setItem('username', res.data.username); 
        
        setToken(res.data.token);
        setRole(res.data.role);
        navigate('/');
    } catch (err) {
        // 5. Use Swal for error alert
        Swal.fire({
            icon: 'error',
            title: 'Login Failed',
            text: err.response?.data?.error || "An error occurred",
            background: '#18181b',
            color: '#fff',
            confirmButtonColor: '#dc2626'
        });
    } finally {
        setLoading(false); // 6. Set loading to false
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
      <form onSubmit={handleLogin} className="bg-zinc-900 p-8 rounded-2xl w-96 border border-zinc-800 shadow-xl">
        <h2 className="text-2xl font-bold mb-6 text-red-500">Sign In</h2>
        
        <div className="relative mb-4">
          <Mail className="absolute left-3 top-3 text-zinc-500" size={20} />
          <input 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            placeholder="Email" 
            className="w-full bg-zinc-800 p-3 pl-10 rounded-lg outline-none focus:ring-1 focus:ring-red-600 transition-all" 
            required
          />
        </div>

        <div className="relative mb-2">
          <Lock className="absolute left-3 top-3 text-zinc-500" size={20} />
          <input 
            type={showPassword ? "text" : "password"} 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            placeholder="Password" 
            className="w-full bg-zinc-800 p-3 pl-10 rounded-lg outline-none focus:ring-1 focus:ring-red-600 transition-all" 
            required
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-zinc-500 hover:text-white transition-colors">
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {/* Forgot Password Link */}
        <div className="flex justify-end mb-6">
            <Link to="/forgot-password" size="sm" className="text-zinc-500 hover:text-red-500 text-sm transition-colors">
                Forgot password?
            </Link>
        </div>

        {/* 7. Added loading state to button */}
        <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-red-600 py-3 rounded-lg font-bold hover:bg-red-700 transition transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
        >
            {loading ? (
                <><Loader2 className="animate-spin" size={20} /> Signing In...</>
            ) : (
                'Sign In'
            )}
        </button>

        <p className="text-center text-sm text-zinc-400 mt-6">
            Don't have an account? <Link to="/signup" className="text-red-500 hover:underline">Sign Up</Link>
        </p>
      </form>
    </div>
  );
}
import { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState(''); // NEW: For success message
  const [loading, setLoading] = useState(false); // NEW: For loading state
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    
    // --- FRONTEND VALIDATION ---
    const usernameRegex = /^[a-zA-Z0-9]+$/;

    if (username.length > 10) {
        return alert("Username must be 10 characters or less.");
    }

    if (!usernameRegex.test(username)) {
        return alert("Username can only contain letters and numbers.");
    }

    setLoading(true);
    setMessage('');
    
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/signup`, { 
        username, 
        email, 
        password 
      });
      
      setMessage(res.data.message); 
      // Clear inputs on success so user knows it's done
      setUsername('');
      setEmail('');
      setPassword('');

    } catch (err) {
      // Use the specific error message from the backend
      const errorMsg = err.response?.data?.error || "Unknown error";
      alert("Signup failed: " + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
      <form onSubmit={handleSignup} className="bg-zinc-900 p-8 rounded-2xl w-96 border border-zinc-800">
        <h2 className="text-2xl font-bold mb-6 text-red-500">Create Account</h2>
        
        {/* --- NEW: SUCCESS MESSAGE UI --- */}
        {message && (
          <div className="bg-green-950 border border-green-700 text-green-200 p-4 rounded-lg mb-6 text-sm text-center">
            {message}
          </div>
        )}
        {/* --------------------------------- */}

        {!message && (
          <>
            {/* Username */}
            <div className="relative mb-4">
  <User className="absolute left-3 top-3 text-zinc-500" size={20} />
  <input 
    type="text" 
    value={username} 
    onChange={e => setUsername(e.target.value)} 
    placeholder="Username" 
    className={`w-full bg-zinc-800 p-3 pl-10 rounded-lg outline-none focus:ring-1 ${username.length > 10 ? 'focus:ring-red-500 border border-red-500' : 'focus:ring-red-600'}`} 
    required
  />
  {/* Character Counter */}
  <span className={`absolute right-3 top-3 text-[10px] ${username.length > 10 ? 'text-red-500' : 'text-zinc-500'}`}>
    {username.length}/10
  </span>
</div>

            {/* Email */}
            <div className="relative mb-4">
              <Mail className="absolute left-3 top-3 text-zinc-500" size={20} />
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="Email" 
                className="w-full bg-zinc-800 p-3 pl-10 rounded-lg outline-none focus:ring-1 focus:ring-red-600" 
                required
              />
            </div>

            {/* Password */}
            <div className="relative mb-6">
              <Lock className="absolute left-3 top-3 text-zinc-500" size={20} />
              <input 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="Password" 
                className="w-full bg-zinc-800 p-3 pl-10 rounded-lg outline-none focus:ring-1 focus:ring-red-600" 
                required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-zinc-500">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-red-600 py-3 rounded-lg font-bold hover:bg-red-700 transition disabled:opacity-50">
              {loading ? "Signing up..." : "Sign Up"}
            </button>
          </>
        )}

        <p className="text-center text-sm text-zinc-400 mt-6">
            Already have an account? <Link to="/login" className="text-red-500 hover:underline">Sign In</Link>
        </p>
      </form>
    </div>
  );
}
import { useState } from 'react';
import { Mail, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, { email });
            setMessage(res.data.message);
        } catch (err) { setMessage("Something went wrong."); }
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4">
            <div className="bg-zinc-900 p-8 rounded-2xl w-96 border border-zinc-800">
                <Link to="/login" className="flex items-center gap-2 text-zinc-500 hover:text-white mb-6 text-sm">
                    <ArrowLeft size={16} /> Back to Login
                </Link>
                <h2 className="text-2xl font-bold mb-2 text-red-500">Forgot Password?</h2>
                <p className="text-zinc-400 text-sm mb-6">Enter your email and we'll send you a reset link.</p>
                
                <form onSubmit={handleSubmit}>
                    <div className="relative mb-6">
                        <Mail className="absolute left-3 top-3 text-zinc-500" size={20} />
                        <input 
                            type="email" 
                            value={email} 
                            onChange={e => setEmail(e.target.value)} 
                            placeholder="Email Address" 
                            className="w-full bg-zinc-800 p-3 pl-10 rounded-lg outline-none focus:ring-1 focus:ring-red-600" 
                            required
                        />
                    </div>
                    <button type="submit" className="w-full bg-red-600 py-3 rounded-lg font-bold hover:bg-red-700 transition">
                        Send Reset Link
                    </button>
                </form>
                {message && <p className="mt-4 text-center text-sm text-green-400 bg-green-400/10 p-2 rounded">{message}</p>}
            </div>
        </div>
    );
}
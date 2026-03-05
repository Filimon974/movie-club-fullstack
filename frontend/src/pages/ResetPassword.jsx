import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';

export default function ResetPassword() {
    const { token } = useParams();
    const [newPassword, setNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleReset = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Updated to ensure it hits the /api/auth path
            const apiUrl = import.meta.env.VITE_API_URL; // e.g., http://10.141.184.226:5000/api
            await axios.post(`${apiUrl}/auth/reset-password`, { 
                token, 
                newPassword 
            });

            alert("Password reset successful!");
            navigate('/login');
        } catch (err) { 
            console.error("Reset error:", err);
            alert(err.response?.data?.error || "Reset failed. The link may be expired."); 
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4">
            <form onSubmit={handleReset} className="bg-zinc-900 p-8 rounded-2xl w-96 border border-zinc-800">
                <h2 className="text-2xl font-bold mb-6 text-red-500">New Password</h2>
                
                <div className="relative mb-6">
                    <Lock className="absolute left-3 top-3 text-zinc-500" size={20} />
                    <input 
                        type={showPassword ? "text" : "password"} 
                        value={newPassword} 
                        onChange={e => setNewPassword(e.target.value)} 
                        placeholder="Enter new password" 
                        className="w-full bg-zinc-800 p-3 pl-10 rounded-lg outline-none focus:ring-1 focus:ring-red-600" 
                        required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-zinc-500">
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-red-600 py-3 rounded-lg font-bold hover:bg-red-700 transition disabled:opacity-50"
                >
                    {loading ? "Updating..." : "Update Password"}
                </button>
            </form>
        </div>
    );
}
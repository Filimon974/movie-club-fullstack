import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

export default function VerifyPage() {
    const { token } = useParams(); // Get token from URL
    const [status, setStatus] = useState('loading'); // loading, success, error
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                // Send token to backend
                // const res = await axios.post('http://localhost:5000/api/auth/verify', { token });
                // const res = await axios.post('http://10.14.21.226:5000/api/auth/verify', { token });
                const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/verify`, { token });
                setMessage(res.data.message);
                setStatus('success');
            } catch (err) {

                
                console.log(err)
                setMessage(err.response?.data?.error || '');
                setStatus('error');
            }
        };

        if (token) {
            verifyEmail();
        }
    }, [token]);

    return (
        <div className="min-h-screen bg-zinc-950 text-white flex flex-col justify-center items-center p-4">
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl w-full max-w-md text-center shadow-lg">
                
                {status === 'loading' && (
                    <div className="flex flex-col items-center gap-4">
                        <Loader className="animate-spin text-red-500" size={48} />
                        <h2 className="text-2xl font-bold">Verifying your email...</h2>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center gap-4">
                        <CheckCircle className="text-green-500" size={48} />
                        <h2 className="text-2xl font-bold text-green-400">Success!</h2>
                        <p className="text-zinc-300">{message}</p>
                        <Link to="/login" className="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 w-full">
                            Go to Login
                        </Link>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center gap-4">
                        <XCircle className="text-red-500" size={48} />
                        <h2 className="text-2xl font-bold text-red-400">Verification Failed</h2>
                        <p className="text-zinc-300">{message}</p>
                        <Link to="/signup" className="mt-4 bg-zinc-700 text-white px-6 py-2 rounded-lg hover:bg-zinc-600 w-full">
                            Back to Signup
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
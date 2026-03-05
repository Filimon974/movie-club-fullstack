import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Loader2 } from 'lucide-react';

export default function ReportsPage() {
    const [userCount, setUserCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // You will need to create this endpoint in server.js
                const res = await axios.get('http://localhost:5000/api/admin/stats');
                setUserCount(res.data.userCount);
            } catch (err) {
                console.error("Failed to fetch stats", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="text-white">
            <h1 className="text-3xl font-bold mb-8">System Reports</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 flex items-center gap-4">
                    <div className="bg-red-950 p-4 rounded-full">
                        <Users className="text-red-500" size={32} />
                    </div>
                    <div>
                        <p className="text-zinc-400 text-sm">Total Registered Users</p>
                        {loading ? (
                            <Loader2 className="animate-spin text-red-500" />
                        ) : (
                            <p className="text-4xl font-bold">{userCount}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
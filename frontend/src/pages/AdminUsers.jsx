import { useEffect, useState } from 'react';
import axios from 'axios';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import Swal from 'sweetalert2';

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            // Fetch users from the backend
            const res = await axios.get(`http://localhost:5000/api/admin/users`);
            setUsers(res.data);
        } catch (err) {
            Swal.fire('Error', 'Failed to fetch users.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="text-white">
            <h1 className="text-3xl font-bold mb-8">User Management</h1>

            <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
                {loading ? (
                    <div className="flex justify-center items-center gap-2 text-zinc-400 py-10">
                        <Loader2 className="animate-spin" /> Loading users...
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="text-zinc-400 border-b border-zinc-700">
                                <tr>
                                    <th className="p-4">Username</th>
                                    <th className="p-4">Email</th>
                                    <th className="p-4">Role</th>
                                    <th className="p-4">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user._id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                                        <td className="p-4">{user.username}</td>
                                        <td className="p-4">{user.email}</td>
                                        <td className="p-4 capitalize">{user.role}</td>
                                        <td className="p-4">
                                            {user.isVerified ? (
                                                <span className="flex items-center gap-2 text-green-400">
                                                    <CheckCircle size={18} /> Verified
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-2 text-red-400">
                                                    <XCircle size={18} /> Not Verified
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
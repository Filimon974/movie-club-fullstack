import { useState, useEffect } from 'react';
import axios from 'axios';
import { UserPlus, ShieldCheck, Mail, Loader2, X } from 'lucide-react';
import Swal from 'sweetalert2';

export default function StaffManagementPage() {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [newAdmin, setNewAdmin] = useState({ username: '', email: '', password: '' });
    const [submitting, setSubmitting] = useState(false); // 1. NEW: State for form submission

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        setLoading(true);
        try {
            // const res = await axios.get(`http://localhost:5000/api/admin/staff`);
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/staff`);

            setAdmins(res.data);
        } catch (err) {
            console.error("Failed to fetch admins", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAdmin = async (e) => {
        e.preventDefault();
        setSubmitting(true); // 2. Start loading
        try {
            // await axios.post('http://localhost:5000/api/admin/create-admin', newAdmin);
            await axios.post(`${import.meta.env.VITE_API_URL}/admin/create-admin`, newAdmin);

            setNewAdmin({ username: '', email: '', password: '' });
            setShowForm(false);
            fetchAdmins();
            Swal.fire('Success', 'Admin created successfully', 'success');
        } catch (err) {
            Swal.fire('Error', err.response?.data?.error || 'Failed to create admin', 'error');
        } finally {
            setSubmitting(false); // 3. Stop loading
        }
    };

    return (
        <div className="text-white">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Staff Management</h1>
                <button 
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 bg-red-600 px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition"
                >
                    {showForm ? <X size={20} /> : <UserPlus size={20} />}
                    {showForm ? "Cancel" : "Create New Admin"}
                </button>
            </div>

            {showForm && (
                <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 mb-8">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <UserPlus className="text-red-500" /> Enter Admin Details
                    </h2>
                    <form onSubmit={handleCreateAdmin} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <input
                            type="text"
                            placeholder="Username"
                            value={newAdmin.username}
                            onChange={e => setNewAdmin({...newAdmin, username: e.target.value})}
                            className="bg-zinc-800 p-3 rounded-lg border border-zinc-700"
                            required
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            value={newAdmin.email}
                            onChange={e => setNewAdmin({...newAdmin, email: e.target.value})}
                            className="bg-zinc-800 p-3 rounded-lg border border-zinc-700"
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={newAdmin.password}
                            onChange={e => setNewAdmin({...newAdmin, password: e.target.value})}
                            className="bg-zinc-800 p-3 rounded-lg border border-zinc-700"
                            required
                        />
                        {/* 4. Updated button to show loading state */}
                        <button 
                            type="submit" 
                            disabled={submitting}
                            className="bg-red-600 rounded-lg font-bold hover:bg-red-700 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {submitting ? (
                                <><Loader2 className="animate-spin" size={20} /> Creating...</>
                            ) : (
                                "Create"
                            )}
                        </button>
                    </form>
                </div>
            )}

            <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
                <div className="p-6 border-b border-zinc-800">
                    <h2 className="text-xl font-semibold">Active Admins</h2>
                </div>
                {loading ? (
                    <div className="flex justify-center p-10"><Loader2 className="animate-spin text-red-500" /></div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-zinc-800 text-left">
                            <tr>
                                <th className="p-4">Username</th>
                                <th className="p-4">Email</th>
                                <th className="p-4">Role</th>
                            </tr>
                        </thead>
                        <tbody>
                            {admins.map(admin => (
                                <tr key={admin._id} className="border-b border-zinc-800">
                                    <td className="p-4 flex items-center gap-2">
                                        <div className="bg-zinc-700 p-2 rounded-full"><ShieldCheck size={16} /></div>
                                        {admin.username}
                                    </td>
                                    <td className="p-4 text-zinc-400">{admin.email}</td>
                                    <td className="p-4 text-red-400 font-bold">Admin</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
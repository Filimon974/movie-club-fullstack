import { useState, useEffect } from 'react';
import axios from 'axios';
import { MessageSquarePlus, MessageSquare, LogOut, Loader2 } from 'lucide-react';
import ChatRoom from '../components/ChatRoom'; 
import Swal from 'sweetalert2';

export default function ChatPage() {
    const [activeRoom, setActiveRoom] = useState(null);
    const [adminRoomName, setAdminRoomName] = useState('');
    const [rooms, setRooms] = useState([]); 
    const [loadingRooms, setLoadingRooms] = useState(true);
    const [creating, setCreating] = useState(false); // 1. Added creating state
    
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role');

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        setLoadingRooms(true);
        try {
            const res = await axios.get(`http://localhost:5000/api/rooms`);
            setRooms(res.data);
        } catch (err) {
            console.error("Failed to fetch rooms", err);
        } finally {
            setLoadingRooms(false);
        }
    };

    const handleCreateRoom = async (e) => {
        e.preventDefault();
        if (adminRoomName) {
            setCreating(true); // 2. Start loading
            try {
                await axios.post(`http://localhost:5000/api/rooms`, { name: adminRoomName });
                setAdminRoomName('');
                fetchRooms(); 
                Swal.fire('Room Created', `Chat room "${adminRoomName}" is now active.`, 'success');
            } catch (err) {
                Swal.fire('Error', err.response?.data?.error || 'Failed to create room', 'error');
            } finally {
                setCreating(false); // 3. Stop loading
            }
        }
    };

    const enterRoom = (roomName) => {
        setActiveRoom(roomName);
    };

    if (activeRoom) {
        return (
            <div className="text-white">
                <button 
                    onClick={() => setActiveRoom(null)}
                    className="flex items-center gap-2 text-zinc-400 hover:text-white mb-4"
                >
                    <LogOut size={16} /> Back to Rooms
                </button>
                <ChatRoom
                    roomName={activeRoom}
                    username={username}
                    onLeave={() => setActiveRoom(null)}
                />
            </div>
        );
    }

    return (
        <div className="text-white">
            <h1 className="text-3xl font-bold mb-8">Movie Discussion Rooms</h1>

            {role === 'admin' && (
                <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 mb-8">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <MessageSquarePlus className="text-red-500" /> Create New Room
                    </h2>
                    <form onSubmit={handleCreateRoom} className="flex gap-4">
                        <input
                            type="text"
                            value={adminRoomName}
                            onChange={(e) => setAdminRoomName(e.target.value)}
                            placeholder="Enter Movie Name..."
                            className="flex-1 bg-zinc-800 text-white p-3 rounded-lg border border-zinc-700 outline-none focus:ring-1 focus:ring-red-600"
                            required
                        />
                        {/* 4. Updated button with conditional loading state */}
                        <button 
                            type="submit" 
                            disabled={creating}
                            className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed min-w-[140px]"
                        >
                            {creating ? (
                                <><Loader2 className="animate-spin" size={20} /> Creating...</>
                            ) : (
                                "Create Room"
                            )}
                        </button>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loadingRooms ? (
                    <div className="col-span-full text-center py-10 flex justify-center items-center gap-2 text-zinc-400">
                        <Loader2 className="animate-spin" /> Loading rooms...
                    </div>
                ) : rooms.length > 0 ? rooms.map(room => (
                    <div key={room._id} className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 flex flex-col items-center">
                        <MessageSquare size={40} className="text-red-500 mb-4" />
                        <h3 className="text-xl font-bold mb-4 text-center">{room.name}</h3>
                        <button
                            onClick={() => enterRoom(room.name)}
                            className="mt-auto w-full bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-semibold"
                        >
                            Enter Room
                        </button>
                    </div>
                )) : (
                    <p className="text-zinc-400 col-span-full text-center py-10">No rooms active right now.</p>
                )}
            </div>
        </div>
    );
}
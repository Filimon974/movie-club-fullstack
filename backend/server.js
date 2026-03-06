const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const http = require('http');
const { Server } = require("socket.io");
const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
app.use(express.json());


console.log("Allowed Origin:", process.env.FRONTEND_URL);
app.use(cors({
    origin: process.env.FRONTEND_URL, 
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));


// --- SOCKET.IO SETUP ---
const server = http.createServer(app);
const io = new Server(server, {
    cors: { 
        origin: process.env.FRONTEND_URL, 
        methods: ["GET", "POST"] 
    }
});

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.log("❌ Connection Error:", err));

// --- EMAIL CONFIGURATION ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// --- SCHEMAS ---
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true},
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isVerified: { type: Boolean, default: false },
    verificationToken: String,
    verificationTokenExpires: Date
});
const User = mongoose.model('User', userSchema);

const voteSchema = new mongoose.Schema({
    userId: String,
    movieId: String,
    title: String,
    poster: String,
    week: String,
});
const Vote = mongoose.model('Vote', voteSchema);

const roomSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now }
});
const Room = mongoose.model('Room', roomSchema);

const messageSchema = new mongoose.Schema({
    room: String,
    username: String,
    message: String,
    timestamp: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', messageSchema);

// --- SOCKET.IO LOGIC ---
io.on('connection', (socket) => {
    console.log(`User Connected: ${socket.id}`);

    socket.on("join_room", (roomName) => {
        socket.join(roomName);
        console.log(`User joined room: ${roomName}`);
    });

    socket.on("send_message", async (data) => {
        try {
            const newMessage = new Message({
                room: data.room,
                username: data.username,
                message: data.message
            });
            await newMessage.save();
            io.to(data.room).emit("receive_message", data);
        } catch (err) {
            console.error("Chat saving error:", err);
        }
    });

    socket.on('disconnect', () => {
        console.log('User Disconnected', socket.id);
    });
});


app.post('/api/auth/verify', async (req, res) => {
    const { token } = req.body;
    try {
        // 1. First, check if there is a user with this token
        const user = await User.findOne({
            verificationToken: token,
            verificationTokenExpires: { $gt: Date.now() }
        });

        // 2. If no user found with that token, check if they are already verified
        if (!user) {
            // This handles the case where the user is already verified but clicks the link again
            const alreadyVerified = await User.findOne({ isVerified: true }); 
            if (alreadyVerified) {
                return res.json({ message: 'Account already verified! You can log in.' });
            }
            return res.status(400).json({ error: 'Token invalid or expired.' });
        }

        // 3. If found, verify them
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;
        await user.save();

        res.json({ message: 'Verified! You can now log in.' });
    } catch (err) { 
        res.status(500).json({ error: 'Verification failed.' }); 
    }
});

// 1. Signup with Email Verification
app.post('/api/auth/signup', async (req, res) => {
    const { username, email, password } = req.body;

    // --- NEW VALIDATION RULES ---
    // 1. Max 10 characters
    if (username.length > 10) {
        return res.status(400).json({ error: "Username must be 10 characters or less." });
    }

    // 2. Only letters and numbers (Regex)
    const usernameRegex = /^[a-zA-Z0-9]+$/;
    if (!usernameRegex.test(username)) {
        return res.status(400).json({ error: "Username can only contain letters and numbers (no spaces or symbols)." });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const token = crypto.randomBytes(32).toString('hex');
        const tokenExpires = Date.now() + 3600000; // 1 hour

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            verificationToken: token,
            verificationTokenExpires: tokenExpires
        });

        await newUser.save();

        const url = `${process.env.FRONTEND_URL}/verify/${token}`;
        await transporter.sendMail({
            from: `"MovieVote" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Verify your MovieVote Account',
            html: `<p>Welcome to MovieVote! Click <a href="${url}">here</a> to verify your account.</p>`
        });

        res.json({ message: "Registration successful. Please check your email to verify." });

    }catch (err) {
    // Check for MongoDB Duplicate Key Error (Code 11000)
    if (err.code === 11000 || (err.name === 'MongoServerError' && err.code === 11000)) {
        const field = Object.keys(err.keyValue)[0];
        // This will say "Username already in use" or "Email already in use"
        return res.status(400).json({ 
            error: `${field.charAt(0).toUpperCase() + field.slice(1)} is already taken.` 
        });
    }
    console.error("Signup Error:", err);
    res.status(500).json({ error: "Signup failed. Please try again." });
}
});

// 3. Login
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) return res.status(400).json({ error: "Invalid Credentials" });
        if (!user.isVerified) return res.status(400).json({ error: "Please verify your email first." });

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
        res.json({ token, role: user.role, userId: user._id, username: user.username });
    } catch (err) { res.status(500).json({ error: "Login error" }); }
});

// 4. Forgot Password
app.post('/api/auth/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.json({ message: "If email exists, link sent." });

        const token = crypto.randomBytes(32).toString('hex');
        user.verificationToken = token;
        user.verificationTokenExpires = Date.now() + 3600000;
        await user.save();

        // const url = `http://localhost:5173/reset-password/${token}`;
        const url = `${process.env.FRONTEND_URL}/reset-password/${token}`;
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset',
            html: `<p>Reset link: <a href="${url}">${url}</a></p>`
        });
        res.json({ message: "Reset link sent." });
    } catch (err) { res.status(500).json({ error: "Error sending reset email." }); }
});

// 5. Reset Password
app.post('/api/auth/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;
    try {
        const user = await User.findOne({
            verificationToken: token,
            verificationTokenExpires: { $gt: Date.now() }
        });
        if (!user) return res.status(400).json({ error: "Expired/Invalid token." });

        user.password = await bcrypt.hash(newPassword, 10);
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;
        await user.save();
        res.json({ message: "Password updated." });
    } catch (err) { res.status(500).json({ error: "Reset failed." }); }
});

// --- MOVIE & VOTE ROUTES ---
app.get('/api/genres', async (req, res) => {
    try {
        const response = await axios.get(`https://api.themoviedb.org/3/genre/movie/list?api_key=${process.env.TMDB_API_KEY}&language=en-US`);
        res.json(response.data.genres);
    } catch (error) { res.status(500).json({ error: "Failed to fetch genres" }); }
});

app.get('/api/search', async (req, res) => {
    const { query } = req.query;
    try {
        const response = await axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${process.env.TMDB_API_KEY}&query=${query}`);
        res.json(response.data.results);
    } catch (error) { res.status(500).json({ error: "Failed to search movies" }); }
});

app.post('/api/vote', async (req, res) => {
    const { userId, movieId, title, poster, week } = req.body;
    if (!userId) return res.status(400).json({ error: "User ID required." });

    try {
        const existingVote = await Vote.findOne({ userId, week });
        if (existingVote) {
            if (existingVote.movieId !== movieId) {
                return res.json({ promptUpdate: true, message: "Already voted." });
            }
            return res.json({ message: "Already voted for this movie", vote: existingVote });
        }
        const newVote = new Vote({ userId, movieId, title, poster, week });
        await newVote.save();
        res.json({ message: "Vote cast successfully", vote: newVote });
    } catch (error) { res.status(500).json({ error: "Voting failed" }); }
});

app.post('/api/vote/update', async (req, res) => {
    const { userId, movieId, title, poster, week } = req.body;
    try {
        const updatedVote = await Vote.findOneAndUpdate(
            { userId, week },
            { movieId, title, poster },
            { returnDocument: 'after' }
        );
        res.json({ message: "Vote updated", vote: updatedVote });
    } catch (error) { res.status(500).json({ error: "Update failed" }); }
});

app.get('/api/leaderboard', async (req, res) => {
    const { week } = req.query;
    try {
        const counts = await Vote.aggregate([
            { $match: { week } },
            { $group: { _id: "$movieId", title: { $first: "$title" }, poster: { $first: "$poster" }, voteCount: { $sum: 1 } } },
            { $sort: { voteCount: -1 } },
            { $limit: 5 }
        ]);
        res.json(counts);
    } catch (error) { res.status(500).json({ error: "Leaderboard error" }); }
});

// --- CHAT API ROUTES ---
app.post('/api/rooms', async (req, res) => {
    const { name } = req.body;
    try {
        const newRoom = new Room({ name });
        await newRoom.save();
        res.json(newRoom);
    } catch (error) {
        res.status(400).json({ error: "Room already exists or invalid name" });
    }
});

app.get('/api/rooms', async (req, res) => {
    try {
        const rooms = await Room.find().sort({ createdAt: -1 });
        res.json(rooms);
    } catch (error) { res.status(500).json({ error: "Failed to fetch rooms" }); }
});

app.get('/api/chat/:room', async (req, res) => {
    try {
        const messages = await Message.find({ room: req.params.room }).sort({ timestamp: 1 });
        res.json(messages);
    } catch (error) { res.status(500).json({ error: "Failed to fetch messages" }); }
});

// --- ADMIN MANAGEMENT ROUTES ---
app.get('/api/admin/stats', async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        res.json({ userCount });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch stats" });
    }
});

app.get('/api/admin/staff', async (req, res) => {
    try {
        const admins = await User.find({ role: 'admin' }).select('-password');
        res.json(admins);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch admins" });
    }
});

// --- ADMIN: Get All Users ---
app.get('/api/admin/users', async (req, res) => {
    try {
        // Fetch all users, excluding the password field for security
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch users" });
    }
});

app.post('/api/admin/create-admin', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // --- UPDATED: Generate verification token ---
        const token = crypto.randomBytes(32).toString('hex');
        const tokenExpires = Date.now() + 3600000; // 1 hour

        const newAdmin = new User({
            username,
            email,
            password: hashedPassword,
            role: 'admin',
            isVerified: false, // --- CHANGED: Set to false ---
            verificationToken: token,
            verificationTokenExpires: tokenExpires
        });
        await newAdmin.save();

        // --- UPDATED: Send Verification Email ---
        // const url = `http://localhost:5173/verify/${token}`;
        const url = `${process.env.FRONTEND_URL}/verify/${token}`;

        await transporter.sendMail({
            from: `"MovieVote Admin" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Verify your Admin Account',
            html: `<p>Welcome, Admin! Click <a href="${url}">here</a> to verify your account.</p>`
        });
        
        res.json({ message: "Admin created successfully. Verification email sent." });
    } catch (err) {
        res.status(400).json({ error: "Failed to create admin" });
    }
});

app.post('/api/admin/reset-votes', async (req, res) => {
    try {
        await Vote.deleteMany({});
        res.json({ message: 'All voting data cleared successfully.' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to clear voting data' });
    }
});

// server.listen(5000, () => console.log("🚀 Server running on port 5000"));
const PORT = process.env.PORT || 5000;
// server.listen(PORT, '0.0.0.0', () => {
//     console.log(`🚀 Server running on http://10.14.21.226:${PORT}`);
// });
// console.log("MONGO_URI:", process.env.MONGO_URI);

// server.listen(PORT, '0.0.0.0', () => {
//     console.log(`🚀 Server running at http://${process.env.SERVER_IP}:${PORT}`);
// });

server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
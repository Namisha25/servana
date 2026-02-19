require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(cors());

// --- 1. FILE SYSTEM SETUP ---
const uploadDir = path.join(__dirname, 'uploads'); 
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log("📁 Created 'uploads' directory at:", uploadDir);
}
app.use('/uploads', express.static(uploadDir));

// --- 2. MULTER CONFIGURATION ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); 
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        // Extract original extension if available, else default to .mp4
        const ext = path.extname(file.originalname) || (file.fieldname === 'video' ? '.mp4' : '.pdf');
        cb(null, uniqueSuffix + ext);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 100 * 1024 * 1024 } 
});

// --- 3. DATABASE CONNECTION ---
const dbURI = "mongodb+srv://warangnamisha_db_user:Servana1234@cluster0.718bdzt.mongodb.net/servana_db?retryWrites=true&w=majority";

mongoose.connect(dbURI)
    .then(() => console.log("✅ Connected to MongoDB: servana_db"))
    .catch(err => console.error("❌ MongoDB connection error:", err.message));

// --- 4. SCHEMAS & MODELS ---
const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, default: 'User' }
});
const User = mongoose.model('User', userSchema);

const providerSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, default: 'Provider' },
    serviceType: { type: String, required: true },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    experienceYears: { type: String, default: "0" },
    language: { type: String, default: "English" }, // ✅ Stores selected language
    aadhaarDocName: { type: String }, // ✅ Stores filename for Admin to view
    isOnline: { type: Boolean, default: true },
    videoIntroUrl: { type: String }, 
    bankAccount: { type: String },
    ifscCode: { type: String }
});
const Provider = mongoose.model('Provider', providerSchema);

const bookingSchema = new mongoose.Schema({
    providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider' },
    customerName: String,
    customerPhone: String,
    serviceType: String,
    planName: String,
    address: String,
    amount: { type: String, default: "0" }, 
    status: { type: String, default: 'pending' },
    bookingDate: String,
    serviceOtp: { type: String, default: null }, 
    workDuration: { type: String, default: "" }, 
    completedAt: { type: Date },    
    createdAt: { type: Date, default: Date.now }
});
const Booking = mongoose.model('Booking', bookingSchema);

// --- 5. ROUTES ---

// Registration
app.post('/api/register', upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'aadhaar', maxCount: 1 }
]), async (req, res) => {
    try {
        const { fullName, email, phone, password, role, serviceType, experienceYears, language, bankAccount, ifscCode } = req.body;
        const existing = await User.findOne({ email }) || await Provider.findOne({ email });
        if (existing) return res.status(400).json({ message: "Email already registered" });

        const hashedPassword = await bcrypt.hash(password, 10);
        // Update this to your current server IP for link generation
        const serverIp = '10.26.245.202'; 

        if (role === 'Provider') {
            const videoFile = req.files?.['video']?.[0];
            const aadhaarFile = req.files?.['aadhaar']?.[0];
            if (!videoFile || !aadhaarFile) return res.status(400).json({ message: "Documents and Video are required for KYC" });

            const newProvider = new Provider({ 
                fullName, email, phone, password: hashedPassword, role: 'Provider', 
                serviceType: serviceType || 'Nanny GoRound', 
                experienceYears: experienceYears || "0", 
                language: language || "English", 
                bankAccount, ifscCode,
                videoIntroUrl: `http://${serverIp}:5000/uploads/${videoFile.filename}`,
                aadhaarDocName: aadhaarFile.filename, // ✅ Saved for Admin viewing
                status: 'pending' 
            });
            await newProvider.save();
        } else {
            const newUser = new User({ fullName, email, phone, password: hashedPassword, role: 'User' });
            await newUser.save();
        }
        res.status(201).json({ message: "Registration successful!" });
    } catch (error) {
        res.status(500).json({ message: "Server error", details: error.message });
    }
});

// Login
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        let account = await User.findOne({ email }) || await Provider.findOne({ email });
        if (!account) return res.status(404).json({ message: "User not found" });
        const isMatch = await bcrypt.compare(password, account.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });
        res.status(200).json({ user: account });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// Get Single Booking by ID
app.get('/api/bookings/:id', async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id).populate('providerId');
        if (!booking) return res.status(404).json({ message: "Booking not found" });
        res.status(200).json(booking);
    } catch (error) {
        res.status(500).json({ message: "Error fetching booking" });
    }
});

// Get Bookings for User
app.get('/api/bookings/user/:phone', async (req, res) => {
    try {
        const bookings = await Booking.find({ customerPhone: req.params.phone })
            .populate('providerId')
            .sort({ createdAt: -1 });
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: "Error fetching user bookings" });
    }
});

// Get Bookings for Provider
app.get('/api/bookings/provider/:id', async (req, res) => {
    try {
        const bookings = await Booking.find({ providerId: req.params.id })
            .populate('providerId')
            .sort({ createdAt: -1 });
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: "Error fetching provider bookings" });
    }
});

// Assign Provider Logic
app.post('/api/assign-provider', async (req, res) => {
    try {
        const { 
            serviceType, customerName, customerPhone, address, 
            amount, planName, dateString, excludeId 
        } = req.body;

        let query = { serviceType, isOnline: true, status: 'accepted' };

        if (excludeId && mongoose.Types.ObjectId.isValid(excludeId)) {
            query._id = { $ne: new mongoose.Types.ObjectId(excludeId) };
        }

        const provider = await Provider.findOne(query);
        
        if (!provider) {
            return res.status(404).json({ 
                message: excludeId 
                    ? "No other professionals are available for this service right now." 
                    : "No available providers." 
            });
        }

        const newBooking = new Booking({
            providerId: provider._id,
            customerName, customerPhone, serviceType, planName, address, 
            amount: amount ? amount.toString() : "0",
            bookingDate: dateString,
            status: 'pending'
        });
        await newBooking.save();
        res.status(200).json({ message: "Booking Created", bookingId: newBooking._id, provider });
    } catch (error) {
        res.status(500).json({ message: "Server error while assigning" });
    }
});

// Admin Stats
app.get('/api/admin/stats', async (req, res) => {
    try {
        const accepted = await Provider.countDocuments({ status: 'accepted' });
        const pending = await Provider.countDocuments({ status: 'pending' });
        const totalBookings = await Booking.countDocuments();
        const serviceDemand = await Booking.aggregate([{ $group: { _id: "$serviceType", count: { $sum: 1 } } }, { $sort: { count: -1 } }]);
        const revenueData = await Booking.aggregate([
            { $project: { amountNumeric: { $convert: { input: "$amount", to: "double", onError: 0.0, onNull: 0.0 } } } },
            { $group: { _id: null, total: { $sum: "$amountNumeric" } } }
        ]);
        res.status(200).json({ accepted, pending, totalBookings, serviceDemand, totalRevenue: Math.round(revenueData[0]?.total || 0) });
    } catch (error) {
        res.status(500).json({ message: "Error" });
    }
});

// Booking Updates
app.patch('/api/update-booking-otp', async (req, res) => {
    const { bookingId, serviceOtp, amount } = req.body;
    try {
        const updated = await Booking.findByIdAndUpdate(
            bookingId, 
            { serviceOtp: String(serviceOtp).trim(), amount: amount ? String(amount) : "0" }, 
            { new: true }
        );
        res.status(200).json({ message: "Synced", amount: updated.amount });
    } catch (error) {
        res.status(500).json({ message: "Error" });
    }
});

app.post('/api/verify-service-otp', async (req, res) => {
    const { bookingId, otp } = req.body;
    try {
        const booking = await Booking.findById(bookingId);
        if (String(booking.serviceOtp).trim() === String(otp).trim()) {
            booking.status = "in-progress";
            await booking.save();
            return res.status(200).json({ message: "Verified", amount: booking.amount });
        }
        res.status(400).json({ message: "Invalid OTP" });
    } catch (error) {
        res.status(500).json({ message: "Error" });
    }
});

app.patch('/api/complete-service', async (req, res) => {
    try {
        const { bookingId, duration } = req.body;
        await Booking.findByIdAndUpdate(bookingId, { status: 'completed', workDuration: duration, completedAt: new Date() });
        res.status(200).json({ message: "Completed" });
    } catch (err) {
        res.status(500).json({ error: "Failed" });
    }
});

// Admin Management
app.get('/api/admin/list/:status', async (req, res) => {
    try {
        const list = await Provider.find({ status: req.params.status.toLowerCase() });
        res.status(200).json(list);
    } catch (error) {
        res.status(500).json({ message: "Error" });
    }
});

app.patch('/api/admin/approve/:id', async (req, res) => {
    try {
        await Provider.findByIdAndUpdate(req.params.id, { status: req.body.status });
        res.status(200).json({ message: "Updated" });
    } catch (error) {
        res.status(500).json({ message: "Error" });
    }
});

app.use((req, res) => res.status(404).json({ message: "Route not found" }));

const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://192.168.0.102:${PORT}`);
});
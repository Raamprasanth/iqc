const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const dns = require('dns');

// Force Node.js to use Google's DNS servers (fixes querySrv ECONNREFUSED on restrictive networks)
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

// Load env vars
dotenv.config();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Serve static frontend files
const path = require('path');
const frontendPath = path.resolve(__dirname, '..', 'public', 'frontend');
console.log('Serving static files from:', frontendPath);
app.use(express.static(frontendPath));

// Route files
const auth = require('./routes/auth');
const users = require('./routes/users');
const iqc = require('./routes/iqc');
const production = require('./routes/production');

const inward = require('./routes/inward');
const parts = require('./routes/parts');
const acceptedIqc = require('./routes/acceptedIqc');
const rejectedIqc = require('./routes/rejectedIqc');
const inwardp = require('./routes/inwardp');
const acceptedpro = require('./routes/acceptedpro');
const rejectedpro = require('./routes/rejectedpro');
const inwardip = require('./routes/inwardip');
const acceptedip = require('./routes/acceptedip');
const rejectedip = require('./routes/rejectedip');
const reinward = require('./routes/reinward');
const reinwardpro = require('./routes/reinwardpro');
const reinwardip = require('./routes/reinwardip');
const history = require('./routes/history');
const spares = require('./routes/spares');
const exportRoute = require('./routes/export');

// Mount routers
app.use('/api/auth', auth);
app.use('/api/users', users);
app.use('/api/iqc', iqc);
app.use('/api/production', production);

app.use('/api/inward', inward);
app.use('/api/parts', parts);
app.use('/api/accepted-iqc', acceptedIqc);
app.use('/api/rejected-iqc', rejectedIqc);
app.use('/api/inwardp', inwardp);
app.use('/api/acceptedpro', acceptedpro);
app.use('/api/rejectedpro', rejectedpro);
app.use('/api/inwardip', inwardip);
app.use('/api/history', history);
app.use('/api/acceptedip', acceptedip);
app.use('/api/rejectedip', rejectedip);
app.use('/api/reinward', reinward);
app.use('/api/reinwardpro', reinwardpro);
app.use('/api/reinwardip', reinwardip);
app.use('/api/spares', spares);
app.use('/api/export', exportRoute);
// Health check API route
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'IQC Backend API is running 🚀', version: '1.0.0' });
});

// Fallback: serve index.html for any unmatched route
app.get('/{*path}', (req, res) => {
    res.sendFile(path.resolve(frontendPath, 'index.html'));
});

// Connect to database
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            family: 4   // Force IPv4 - fixes querySrv ECONNREFUSED on some networks
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Seed Default Admin User
        const User = require('./models/User');
        const adminExists = await User.findOne({ email: 'admin@admin.com' });
        if (!adminExists) {
            await User.create({
                name: 'System Admin',
                email: 'admin@admin.com',
                password: 'password123',
                role: 'admin'
            });
            console.log('Default admin user created: admin@admin.com / password123');
        } else if (adminExists.role !== 'admin') {
            adminExists.role = 'admin';
            await adminExists.save();
            console.log('Updated existing admin@admin.com to admin role.');
        }
    } catch (err) {
        console.error(`MongoDB connection error: ${err.message}`);
        console.error('Server will continue running but database features will not work.');
    }
};

connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

import express from 'express';
import http, { Server } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeSocket } from './service/socket.io.js';
import cors from 'cors';

import dbConnection from './database/dbConnection.js';
import bookingRouter  from './routes/bookings.route.js';
import slotsRouter from './routes/slot.route.js';

const app = express();
app.use(express.json());
// For URL-encoded data (e.g., from forms):
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use('/api/v1', bookingRouter);
app.use('/api/v1', slotsRouter);

// Create HTTP server and attach Socket.IO
const server = http.createServer(app);  
// Initialize Socket.IO
const io = initializeSocket(server);

// Get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files (e.g., HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/myAppointment', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'myAppointment.html'));
});

app.set('env', 'production');

const PORT = '3000';

dbConnection().then(()=>{
    server.listen(PORT, () => {
        console.log(`Server is running on port http://localhost:${PORT}`);
    })
}).catch((err)=>{
    console.log(err)
});



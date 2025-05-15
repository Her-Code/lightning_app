
// const express = require('express');
// const { createInvoice, subscribeToInvoices } = require('./invoice');
// const cors = require('cors');
// require('dotenv').config();
// const path = require('path');

// const app = express();
// app.use(cors());
// app.use(express.json());


// // Serve static files (e.g., app.js, styles, etc.)
// app.use(express.static(path.join(__dirname, '../client')));

// const PORT = 3000;

// // Serve HTML file from the correct location
// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, '../client', 'index.html')); // Adjusted path
// });

// // Create Invoice endpoint
// app.post('/create-invoice', async (req, res) => {
//     const { amount } = req.body;
//     try {
//         const invoice = await createInvoice(amount);
//         res.json(invoice);
//     } catch (err) {
//         console.error(err);
//         res.status(500).send('Error creating invoice');
//     }
// });

// app.listen(PORT, () => {
//     console.log(`Server listening at http://localhost:${PORT}`);
//     subscribeToInvoices(); // start payment listener
// });

const express = require('express');
const { createInvoice, subscribeToInvoices } = require('./invoice');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, '../client')));

// Serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client', 'index.html'));
});

// API to generate invoice
app.post('/create-invoice', async (req, res) => {
    const { amount } = req.body;
    try {
        const invoice = await createInvoice(amount);
        res.json(invoice);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error creating invoice');
    }
});

// Start server and listen to invoice events
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`🚀 Server listening at http://localhost:${PORT}`);
    subscribeToInvoices(io);
});


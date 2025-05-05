const express = require('express');
const cors = require("cors")
const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors())
// Global error handling middleware for uncaught errors
app.use((err, req, res, next) => {
    console.error('Global error:', err.stack);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message
    });
});

// Handle all HTTP methods for any route
app.all('/products', (req, res) => {
    try {
        // Log the request details for debugging
        console.log(`Received ${req.method} request at ${req.path}`);
        console.log('Query:', req.query);
        console.log('Body:', req.body);
        console.log('Headers:', req.headers);

        // Send a basic response
        res.status(200).json({
            message: `Handled ${req.method} request`,
            path: req.path,
            body: req.body,
            query: req.query
        });
    } catch (error) {
        // Error handling
        console.error('Error processing request:', error.stack);
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
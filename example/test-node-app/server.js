require('dotenv').config();
const jwt = require('jsonwebtoken');
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

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Expecting "Bearer <token>"

    if (!token) return res.status(401).json({ message: 'Access token required' });

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid or expired token' });
        req.user = user; // Attach decoded user info to request
        next();
    });
};


// Handle all HTTP methods for any route
app.all('/products', verifyToken, (req, res) => {
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

app.get('/longtimedata', (req, res) => {
    setTimeout(() => {
        res.json({ data: `Recieved random num: ${Math.floor(Math.random() * 1000)}` })
    }, 1000 * 5)
})

const mockUser = {
    id: 1,
    username: 'admin',
    password: '123' // Never store plain passwords in production
};

const activeRefreshTokens = []

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Validate user (replace with real DB check)
    if (username !== mockUser.username || password !== mockUser.password) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate tokens
    const accessToken = jwt.sign(
        { userId: mockUser.id, username: mockUser.username },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '10s' }
    );

    const refreshToken = jwt.sign(
        { userId: mockUser.id, username: mockUser.username },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '20s' }
    );

    activeRefreshTokens.push(refreshToken)

    res.json({ accessToken, refreshToken });
});


// 🔄 Refresh token endpoint
app.post('/refresh', (req, res) => {
    console.log(req.body)
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: 'Missing token' });
    if (!activeRefreshTokens.includes(refreshToken)) {
        return res.status(404).json({ message: 'Invalid refresh token' });
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Token verification failed' });

        const newAccessToken = jwt.sign(
            { userId: user.userId, username: user.username },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '10s' }
        );
        res.json({ accessToken: newAccessToken });
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
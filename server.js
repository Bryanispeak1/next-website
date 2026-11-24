const express = require('express');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 3000;
const USERS_FILE = path.join(__dirname, 'users.json');

// Middleware to parse incoming request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve all your static frontend files directly from the current directory
app.use(express.static(__dirname));
// Add this route to explicitly serve your landing page
app.get('/', (req, res) => {
    // If your file is named something else like 'home.html', change 'index.html' below to match it!
    res.sendFile(path.join(__dirname, 'jsblogindex.html')); 
});


// Helper function to read local JSON file database
const readUsers = () => {
    if (!fs.existsSync(USERS_FILE)) return [];
    const data = fs.readFileSync(USERS_FILE);
    return JSON.parse(data);
};

// Helper function to write to local JSON file database
const writeUsers = (users) => {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
};

// --- SIGN UP ENDPOINT ---
app.post('/api/signup', async (req, res) => {
    const { fullname, email, password } = req.body;
    const users = readUsers();

    // Check if the user already exists
    if (users.find(u => u.email === email.toLowerCase())) {
        return res.status(400).json({ success: false, message: 'Email is already registered.' });
    }

    try {
        // Securely hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newUser = {
            id: Date.now(),
            fullname,
            email: email.toLowerCase(),
            password: hashedPassword
        };

        users.push(newUser);
        writeUsers(users);

        res.status(201).json({ success: true, message: 'User registered successfully!', user: { id: newUser.id, name: newUser.fullname } });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error during registration.' });
    }
});

// --- LOG IN ENDPOINT ---
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const users = readUsers();

    const user = users.find(u => u.email === email.toLowerCase());
    if (!user) {
        return res.status(400).json({ success: false, message: 'Invalid email or password.' });
    }

    try {
        // Compare entered plain text with the hashed security key
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid email or password.' });
        }

        // Successfully logged in
        res.json({ success: true, message: 'Login successful!', user: { id: user.id, name: user.fullname } });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error during authentication.' });
    }
});

// Run server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

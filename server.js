const express = require('express');
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library');
const mysql = require('mysql2');
const path = require('path');

const app = express();

// 1. IMPROVED CORS: Allows your GitHub page to talk to Render
app.use(cors({ origin: '*' })); 
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const CLIENT_ID = "318717217301-kot0gq3l7amhtfphhvsbjh4ehau9heb4.apps.googleusercontent.com";
const googleClient = new OAuth2Client(CLIENT_ID);

const dbPool = mysql.createPool({
    host: 'mysql-32a5e69e-sivanagu7771-74ba.d.aivencloud.com',
    port: 17949,           
    user: 'avnadmin',         
    password: 'AVNS_x5GIyjOoanVqXlKMi0w',         
    database: 'defaultdb',
    ssl: { rejectUnauthorized: false } 
});
const promisePool = dbPool.promise();

// 2. HEALTH CHECK: Open https://login-o753.onrender.com/health in your browser to test
app.get('/health', (req, res) => res.json({ status: "Online", message: "Backend is reachable!" }));

app.post('/api/admin/update-student', async (req, res) => {
    const { adminToken, targetEmail, updates } = req.body;
    try {
        const ticket = await googleClient.verifyIdToken({ idToken: adminToken, audience: CLIENT_ID });
        const adminEmail = ticket.getPayload().email;

        // AUTHENTICATION
        const authorizedAdmins = ['sivanagu7771@gmail.com']; 
        if (!authorizedAdmins.includes(adminEmail)) {
            return res.status(403).json({ success: false, message: "Not an authorized admin." });
        }

        const query = `UPDATE student_profile SET cgpa=?, sgpa=?, reward_points=?, arrears=?, leaves=? WHERE LOWER(email)=LOWER(?)`;
        await promisePool.query(query, [updates.cgpa, updates.sgpa, updates.reward, updates.arrears, updates.leaves, targetEmail]);

        res.json({ success: true, message: `Database Updated for ${targetEmail}` });
    } catch (error) {
        console.error("Update Error:", error);
        res.status(500).json({ success: false, message: "Database error or Invalid Token" });
    }
});

const PORT = process.env.PORT || 10000; // Matches your Render log
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
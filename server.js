const express = require('express');
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library');
const mysql = require('mysql2');
const path = require('path');

const app = express();
app.use(cors()); 
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
    waitForConnections: true,
    connectionLimit: 10,
    ssl: { rejectUnauthorized: false } 
});
const promisePool = dbPool.promise();

app.get('/health', (req, res) => res.json({ status: "Online" }));

app.post('/api/get-dashboard-data', async (req, res) => {
    try {
        const ticket = await googleClient.verifyIdToken({ idToken: req.body.token, audience: CLIENT_ID });
        const userEmail = ticket.getPayload().email; 

        // CASE-INSENSITIVE SEARCH FIX
        const [profile] = await promisePool.query(
            "SELECT * FROM student_profile WHERE LOWER(email) = LOWER(?)", 
            [userEmail]
        );
        
        if (profile.length === 0) {
            return res.status(404).json({ success: false, message: "Email not found in database." });
        }

        const email = profile[0].email;
        const [courses] = await promisePool.query("SELECT * FROM student_courses WHERE student_email = ?", [email]);
        
        res.json({ 
            success: true, 
            profile: profile[0], 
            courses, 
            picture: ticket.getPayload().picture     
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ success: false, message: "Authentication Failed." });
    }
});

// Admin Sync Route
app.post('/api/admin/update-student', async (req, res) => {
    const { adminToken, targetEmail, updates } = req.body;
    try {
        const ticket = await googleClient.verifyIdToken({ idToken: adminToken, audience: CLIENT_ID });
        if (ticket.getPayload().email !== 'sivanagu7771@gmail.com') return res.status(403).json({ success: false });
        
        const query = `UPDATE student_profile SET cgpa=?, sgpa=?, reward_points=?, arrears=?, leaves=? WHERE LOWER(email)=LOWER(?)`;
        await promisePool.query(query, [updates.cgpa, updates.sgpa, updates.reward, updates.arrears, updates.leaves, targetEmail]);
        res.json({ success: true, message: "Data Synced Successfully" });
    } catch (error) { res.status(500).json({ success: false }); }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server live on port ${PORT}`));
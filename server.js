const express = require('express');
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library');
const mysql = require('mysql2');
const path = require('path');

const app = express();

// 1. MIDDLEWARE: Essential for GitHub Pages and cross-domain talk
app.use(cors()); 
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const CLIENT_ID = "318717217301-kot0gq3l7amhtfphhvsbjh4ehau9heb4.apps.googleusercontent.com";
const googleClient = new OAuth2Client(CLIENT_ID);

// 2. DATABASE POOL: Maintains the connection to Aiven
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

// 3. HEALTH CHECK: Verify server is awake at /health
app.get('/health', (req, res) => res.json({ status: "Online", message: "Backend is reachable!" }));

// 4. STUDENT LOGIN: Handles index.html dashboard requests
app.post('/api/get-dashboard-data', async (req, res) => {
    try {
        const ticket = await googleClient.verifyIdToken({ idToken: req.body.token, audience: CLIENT_ID });
        const userEmail = ticket.getPayload().email; 

        // CASE-INSENSITIVE SEARCH: Prevents "Student not found" errors
        const [profile] = await promisePool.query(
            "SELECT * FROM student_profile WHERE LOWER(email) = LOWER(?)", 
            [userEmail]
        );
        
        if (profile.length === 0) {
            return res.status(404).json({ success: false, message: "Access Denied: Email not in database." });
        }

        const email = profile[0].email;
        const [courses] = await promisePool.query("SELECT * FROM student_courses WHERE student_email = ?", [email]);
        const [projects] = await promisePool.query("SELECT * FROM student_projects WHERE student_email = ?", [email]);
        const [skills] = await promisePool.query("SELECT * FROM student_skills WHERE student_email = ?", [email]);
        const [drives] = await promisePool.query("SELECT * FROM student_drives WHERE student_email = ?", [email]);
        
        res.json({ 
            success: true, 
            profile: profile[0], 
            courses, projects, skills, drives, 
            picture: ticket.getPayload().picture     
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ success: false, message: "Authentication Failed." });
    }
});

// 5. ADMIN SYNC: Dedicated route for frequently updating data via admin.html
app.post('/api/admin/update-student', async (req, res) => {
    const { adminToken, targetEmail, updates } = req.body;
    try {
        const ticket = await googleClient.verifyIdToken({ idToken: adminToken, audience: CLIENT_ID });
        const adminEmail = ticket.getPayload().email;

        // AUTHENTICATION: Only your email can perform updates
        const authorizedAdmins = ['sivanagu7771@gmail.com']; 
        if (!authorizedAdmins.includes(adminEmail)) {
            return res.status(403).json({ success: false, message: "Unauthorized admin account." });
        }

        const query = `
            UPDATE student_profile 
            SET cgpa = ?, sgpa = ?, reward_points = ?, arrears = ?, leaves = ? 
            WHERE LOWER(email) = LOWER(?)
        `;
        
        // Executes the live update in Aiven
        await promisePool.query(query, [
            updates.cgpa, updates.sgpa, updates.reward, updates.arrears, updates.leaves, targetEmail
        ]);

        res.json({ success: true, message: `Successfully synced data for ${targetEmail}` });
    } catch (error) {
        console.error("Update Error:", error);
        res.status(500).json({ success: false, message: "Database Update Failed." });
    }
});

// 6. SERVER START: Matches port 10000 used by Render
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server live on port ${PORT}`));
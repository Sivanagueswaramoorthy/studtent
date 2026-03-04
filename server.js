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
    ssl: { rejectUnauthorized: false } 
});
const promisePool = dbPool.promise();

// Health Check route
app.get('/health', (req, res) => res.json({ status: "Online", message: "Backend is reachable!" }));

// Standard login route for index.html
app.post('/api/get-dashboard-data', async (req, res) => {
    try {
        const ticket = await googleClient.verifyIdToken({ idToken: req.body.token, audience: CLIENT_ID });
        const userEmail = ticket.getPayload().email; 

        // Case-insensitive search
        const [profile] = await promisePool.query("SELECT * FROM student_profile WHERE LOWER(email) = LOWER(?)", [userEmail]);
        
        if (profile.length === 0) return res.status(404).json({ success: false, message: "Student record not found." });

        const [courses] = await promisePool.query("SELECT * FROM student_courses WHERE student_email = ?", [profile[0].email]);
        
        res.json({ 
            success: true, 
            profile: profile[0], 
            courses, 
            picture: ticket.getPayload().picture     
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error during authentication." });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
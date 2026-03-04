const express = require('express');
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library');
const mysql = require('mysql2');
const path = require('path');

const app = express();
app.use(express.static(path.join(__dirname)));
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

const CLIENT_ID = "318717217301-kot0gq3l7amhtfphhvsbjh4ehau9heb4.apps.googleusercontent.com";
const googleClient = new OAuth2Client(CLIENT_ID);

const dbPool = mysql.createPool({
    host: 'mysql-32a5e69e-sivanagu7771-74ba.d.aivencloud.com',
    port: 17949,           
    user: 'avnadmin',         
    password: 'AVNS_x5GIyjOoanVqXlKMi0w',         
    database: 'defaultdb',
    waitForConnections: true, connectionLimit: 10, queueLimit: 0,
    ssl: { rejectUnauthorized: false } 
});
const promisePool = dbPool.promise();

app.post('/api/get-dashboard-data', async (req, res) => {
    try {
        const ticket = await googleClient.verifyIdToken({ idToken: req.body.token, audience: CLIENT_ID });
        const userEmail = ticket.getPayload().email; 

        // Fetch all tables 100% dynamically
        // Replace your existing profile query with this one:
const [profile] = await promisePool.query(
    "SELECT * FROM student_profile WHERE LOWER(email) = LOWER(?)", 
    [userEmail]
);
        if (profile.length === 0) return res.status(404).json({ success: false, message: "Student not found in DB." });

        const [courses] = await promisePool.query("SELECT * FROM student_courses WHERE student_email = ?", [userEmail]);
        const [projects] = await promisePool.query("SELECT * FROM student_projects WHERE student_email = ?", [userEmail]);
        const [skills] = await promisePool.query("SELECT * FROM student_skills WHERE student_email = ?", [userEmail]);
        const [drives] = await promisePool.query("SELECT * FROM student_drives WHERE student_email = ?", [userEmail]);
        
        // Fetch Biometrics & format date
        const [biometrics] = await promisePool.query("SELECT DATE_FORMAT(log_date, '%Y-%m-%d') as log_date, log_time, device, log_type FROM student_biometrics WHERE student_email = ? ORDER BY log_date DESC, log_time DESC", [userEmail]);

        res.json({ 
            success: true, 
            profile: profile[0], courses, projects, skills, drives, biometrics, 
            picture: ticket.getPayload().picture     
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
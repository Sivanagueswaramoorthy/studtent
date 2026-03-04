const express = require('express');
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library');
const mysql = require('mysql2');
const path = require('path');

const app = express();

// 1. MIDDLEWARE: Essential for GitHub Pages and cross-domain communication
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

// 3. HEALTH CHECK: Verify server is awake
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
        const [skills] = await promisePool.query("SELECT * FROM student_skills WHERE student_email = ?", [email]);
        const [drives] = await promisePool.query("SELECT * FROM student_drives WHERE student_email = ?", [email]);
        
        res.json({ 
            success: true, 
            profile: profile[0], 
            courses, skills, drives, 
            picture: ticket.getPayload().picture     
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ success: false, message: "Authentication Failed." });
    }
});

// 5. MASTER SYNC: Dedicated route for your Master Admin Portal
app.post('/api/admin/master-sync', async (req, res) => {
    const { adminToken, targetEmail, profile, skills, academics } = req.body;
    try {
        const ticket = await googleClient.verifyIdToken({ idToken: adminToken, audience: CLIENT_ID });
        const adminEmail = ticket.getPayload().email;

        // AUTHENTICATION: Only your email can perform master updates
        const authorizedAdmins = ['sivanagu7771@gmail.com']; 
        if (!authorizedAdmins.includes(adminEmail)) {
            return res.status(403).json({ success: false, message: "Unauthorized admin account." });
        }

        // A. Update Main Profile (includes Placement & Dashboard Stats)
        await promisePool.query(`
            UPDATE student_profile SET 
            roll_no=?, department=?, cgpa=?, sgpa=?, attendance=?, reward_points=?, arrears=?, leaves=?, 
            applied=?, shortlisted=?, offers=?, highest_ctc=?
            WHERE LOWER(email)=LOWER(?)`, 
            [profile.roll_no, profile.dept, profile.cgpa, profile.sgpa, profile.attendance, profile.reward, profile.arrears, profile.leaves, profile.applied, profile.shortlisted, profile.offers, profile.highest_ctc, targetEmail]
        );

        // B. Refresh PCDP Skills (Delete existing and insert new ones)
        await promisePool.query("DELETE FROM student_skills WHERE student_email=?", [targetEmail]);
        for (let s of skills) {
            if(s.name) {
                await promisePool.query("INSERT INTO student_skills (student_email, skill_name, total_levels, completed_levels, category, image_url) VALUES (?,?,?,?,?,?)", 
                [targetEmail, s.name, s.total, s.comp, s.cat, s.img]);
            }
        }

        // C. Refresh Academics (Delete existing and insert new semesters)
        await promisePool.query("DELETE FROM student_courses WHERE student_email=?", [targetEmail]);
        for (let a of academics) {
            if(a.course) {
                await promisePool.query("INSERT INTO student_courses (student_email, semester, course_name, marks, grade) VALUES (?,?,?,?,?)", 
                [targetEmail, a.sem, a.course, a.marks, a.grade]);
            }
        }

        res.json({ success: true, message: `MASTER SYNC SUCCESSFUL for ${targetEmail}` });
    } catch (error) {
        console.error("Sync Error:", error);
        res.status(500).json({ success: false, message: "Database Sync Failed. Check Aiven status." });
    }
});

// 6. SERVER START: Standard Render Port
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
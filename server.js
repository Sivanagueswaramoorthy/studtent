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

// LOGIN: Dashboard Data Retrieval
app.post('/api/get-dashboard-data', async (req, res) => {
    try {
        const ticket = await googleClient.verifyIdToken({ idToken: req.body.token, audience: CLIENT_ID });
        const userEmail = ticket.getPayload().email; 
        const [profile] = await promisePool.query("SELECT * FROM student_profile WHERE LOWER(email) = LOWER(?)", [userEmail]);
        if (profile.length === 0) return res.status(404).json({ success: false, message: "Email not found." });
        
        const email = profile[0].email;
        const [courses] = await promisePool.query("SELECT * FROM student_courses WHERE student_email = ?", [email]);
        const [skills] = await promisePool.query("SELECT * FROM student_skills WHERE student_email = ?", [email]);
        
        res.json({ success: true, profile: profile[0], courses, skills, picture: ticket.getPayload().picture });
    } catch (error) { res.status(500).json({ success: false }); }
});

// ADMIN: List All Students
app.get('/api/admin/list-students', async (req, res) => {
    try {
        const [rows] = await promisePool.query("SELECT * FROM student_profile ORDER BY full_name ASC");
        res.json({ success: true, students: rows });
    } catch (e) { res.status(500).json({ success: false }); }
});

// ADMIN: Master Sync (Update or Create)
app.post('/api/admin/master-sync', async (req, res) => {
    const { adminToken, targetEmail, profile, skills, academics } = req.body;
    try {
        const ticket = await googleClient.verifyIdToken({ idToken: adminToken, audience: CLIENT_ID });
        if (ticket.getPayload().email !== 'sivanagu7771@gmail.com') return res.status(403).json({ success: false });

        const profileSql = `
            INSERT INTO student_profile (email, full_name, roll_no, department, cgpa, sgpa, attendance, reward_points, arrears, leaves, applied, shortlisted, offers, highest_ctc)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
            full_name=VALUES(full_name), roll_no=VALUES(roll_no), department=VALUES(department), cgpa=VALUES(cgpa), 
            sgpa=VALUES(sgpa), attendance=VALUES(attendance), reward_points=VALUES(reward_points), 
            arrears=VALUES(arrears), leaves=VALUES(leaves), applied=VALUES(applied), 
            shortlisted=VALUES(shortlisted), offers=VALUES(offers), highest_ctc=VALUES(highest_ctc)
        `;
        
        await promisePool.query(profileSql, [targetEmail, profile.name, profile.roll, profile.dept, profile.cgpa, profile.sgpa, profile.attendance, profile.reward, profile.arrears, profile.leaves, profile.applied, profile.shortlisted, profile.offers, profile.highest_ctc]);

        // Refresh Sub-Tables
        await promisePool.query("DELETE FROM student_skills WHERE student_email=?", [targetEmail]);
        for (let s of skills) if(s.name) await promisePool.query("INSERT INTO student_skills (student_email, skill_name, total_levels, completed_levels, category, image_url) VALUES (?,?,?,?,?,?)", [targetEmail, s.name, s.total, s.comp, s.cat, s.img]);

        await promisePool.query("DELETE FROM student_courses WHERE student_email=?", [targetEmail]);
        for (let a of academics) if(a.course) await promisePool.query("INSERT INTO student_courses (student_email, semester, course_name, marks, grade) VALUES (?,?,?,?,?)", [targetEmail, a.sem, a.course, a.marks, a.grade]);

        res.json({ success: true, message: "Records Synced Successfully!" });
    } catch (error) { res.status(500).json({ success: false }); }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Backend live on ${PORT}`));
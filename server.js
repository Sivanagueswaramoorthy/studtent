const express = require('express');
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library');
const mysql = require('mysql2');

const app = express();
app.use(cors()); 
app.use(express.json());

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

// ==========================================
// 1. SMART LOGIN ROUTE
// ==========================================
app.post('/api/auth', async (req, res) => {
    try {
        const ticket = await googleClient.verifyIdToken({ idToken: req.body.token, audience: CLIENT_ID });
        const email = ticket.getPayload().email;

        if (email.toLowerCase() === 'sivanagu7771@gmail.com') {
            return res.json({ success: true, isAdmin: true, profile: { full_name: ticket.getPayload().name, email: email, picture: ticket.getPayload().picture } });
        }

        const [profile] = await promisePool.query("SELECT * FROM student_profile WHERE LOWER(email) = LOWER(?)", [email]);
        if (profile.length === 0) return res.status(404).json({ success: false, message: "Student record not found." });

        const [courses] = await promisePool.query("SELECT * FROM student_courses WHERE student_email = ? ORDER BY semester ASC", [profile[0].email]);
        const [skills] = await promisePool.query("SELECT * FROM student_skills WHERE student_email = ?", [profile[0].email]);
        
        res.json({ success: true, isAdmin: false, profile: profile[0], courses, skills, picture: ticket.getPayload().picture });
    } catch (error) { res.status(500).json({ success: false, message: "Server authentication failed." }); }
});

// ==========================================
// 2. ADMIN SECURE ROUTES
// ==========================================
async function verifyAdmin(token) {
    const ticket = await googleClient.verifyIdToken({ idToken: token, audience: CLIENT_ID });
    if (ticket.getPayload().email.toLowerCase() !== 'sivanagu7771@gmail.com') throw new Error("Unauthorized");
    return true;
}

app.post('/api/admin/list', async (req, res) => {
    try {
        await verifyAdmin(req.body.adminToken);
        const [rows] = await promisePool.query("SELECT email, full_name, roll_no, department FROM student_profile ORDER BY full_name ASC");
        res.json({ success: true, students: rows });
    } catch (e) { res.status(403).json({ success: false }); }
});

app.post('/api/admin/student-data', async (req, res) => {
    try {
        await verifyAdmin(req.body.adminToken);
        const [profile] = await promisePool.query("SELECT * FROM student_profile WHERE LOWER(email) = LOWER(?)", [req.body.targetEmail]);
        const [courses] = await promisePool.query("SELECT * FROM student_courses WHERE student_email = ? ORDER BY semester ASC", [req.body.targetEmail]);
        const [skills] = await promisePool.query("SELECT * FROM student_skills WHERE student_email = ?", [req.body.targetEmail]);
        res.json({ success: true, profile: profile[0], courses, skills });
    } catch (e) { res.status(500).json({ success: false }); }
});

app.post('/api/admin/update-field', async (req, res) => {
    try {
        await verifyAdmin(req.body.adminToken);
        const { targetEmail, field, value } = req.body;
        const allowed = ['full_name', 'roll_no', 'department', 'cgpa', 'sgpa', 'attendance', 'reward_points', 'arrears', 'leaves'];
        if (!allowed.includes(field)) return res.status(400).json({ success: false });
        await promisePool.query(`UPDATE student_profile SET ${field} = ? WHERE LOWER(email) = LOWER(?)`, [value, targetEmail]);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ success: false }); }
});

app.post('/api/admin/add-student', async (req, res) => {
    try {
        await verifyAdmin(req.body.adminToken);
        const { email, full_name, roll_no, department } = req.body;
        const sql = `INSERT INTO student_profile (email, full_name, roll_no, department) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE full_name=VALUES(full_name), roll_no=VALUES(roll_no), department=VALUES(department)`;
        await promisePool.query(sql, [email.toLowerCase(), full_name, roll_no, department]);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ success: false }); }
});

// --- NEW: ACTIVITIES (SKILLS) ROUTES ---
app.post('/api/admin/add-skill', async (req, res) => {
    try {
        await verifyAdmin(req.body.adminToken);
        const { targetEmail, skill_name, total_levels, completed_levels, category } = req.body;
        await promisePool.query("INSERT INTO student_skills (student_email, skill_name, total_levels, completed_levels, category) VALUES (?, ?, ?, ?, ?)", [targetEmail, skill_name, total_levels, completed_levels, category]);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ success: false }); }
});

app.post('/api/admin/update-skill', async (req, res) => {
    try {
        await verifyAdmin(req.body.adminToken);
        const { id, field, value } = req.body;
        const allowed = ['skill_name', 'completed_levels', 'total_levels', 'category'];
        if (!allowed.includes(field)) return res.status(400).json({ success: false });
        await promisePool.query(`UPDATE student_skills SET ${field} = ? WHERE id = ?`, [value, id]);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ success: false }); }
});

app.post('/api/admin/delete-skill', async (req, res) => {
    try {
        await verifyAdmin(req.body.adminToken);
        await promisePool.query("DELETE FROM student_skills WHERE id = ?", [req.body.id]);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ success: false }); }
});

// --- NEW: ACADEMICS (COURSES) ROUTES ---
app.post('/api/admin/add-course', async (req, res) => {
    try {
        await verifyAdmin(req.body.adminToken);
        const { targetEmail, semester, course_name, marks, grade } = req.body;
        await promisePool.query("INSERT INTO student_courses (student_email, semester, course_name, marks, grade) VALUES (?, ?, ?, ?, ?)", [targetEmail, semester, course_name, marks, grade]);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ success: false }); }
});

app.post('/api/admin/update-course', async (req, res) => {
    try {
        await verifyAdmin(req.body.adminToken);
        const { id, field, value } = req.body;
        const allowed = ['course_name', 'marks', 'grade'];
        if (!allowed.includes(field)) return res.status(400).json({ success: false });
        await promisePool.query(`UPDATE student_courses SET ${field} = ? WHERE id = ?`, [value, id]);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ success: false }); }
});

app.post('/api/admin/delete-course', async (req, res) => {
    try {
        await verifyAdmin(req.body.adminToken);
        await promisePool.query("DELETE FROM student_courses WHERE id = ?", [req.body.id]);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ success: false }); }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`UNIFIED BACKEND ACTIVE ON PORT ${PORT}`));
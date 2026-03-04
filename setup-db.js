const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'mysql-32a5e69e-sivanagu7771-74ba.d.aivencloud.com',
    port: 17949,           
    user: 'avnadmin',         
    password: 'AVNS_x5GIyjOoanVqXlKMi0w',         
    database: 'defaultdb',
    multipleStatements: true, 
    ssl: { rejectUnauthorized: false } 
});

db.connect((err) => {
    if (err) return console.error('FAILED! Use Hotspot. Error:', err.message);
    console.log('Building Master Feature Database...');

    const masterSQL = `
        DROP TABLE IF EXISTS student_drives;
        DROP TABLE IF EXISTS student_skills;
        DROP TABLE IF EXISTS student_courses;
        DROP TABLE IF EXISTS student_profile;

        CREATE TABLE student_profile (
            email VARCHAR(255) PRIMARY KEY, 
            full_name VARCHAR(255) NOT NULL,
            roll_no VARCHAR(50), 
            department VARCHAR(100),
            cgpa DECIMAL(5,2) DEFAULT 0.00, 
            sgpa DECIMAL(5,2) DEFAULT 0.00, 
            attendance DECIMAL(5,2) DEFAULT 0.00,
            reward_points INT DEFAULT 0, 
            arrears INT DEFAULT 0, 
            leaves INT DEFAULT 0,
            applied INT DEFAULT 0,
            shortlisted INT DEFAULT 0,
            offers INT DEFAULT 0,
            highest_ctc VARCHAR(20) DEFAULT '0 LPA'
        );

        CREATE TABLE student_courses (
            id INT AUTO_INCREMENT PRIMARY KEY, 
            student_email VARCHAR(255), 
            semester INT,
            course_name VARCHAR(255), 
            marks INT, 
            grade VARCHAR(5),
            FOREIGN KEY (student_email) REFERENCES student_profile(email) ON DELETE CASCADE
        );

        CREATE TABLE student_skills (
            id INT AUTO_INCREMENT PRIMARY KEY,
            student_email VARCHAR(255),
            skill_name VARCHAR(100),
            total_levels INT,
            completed_levels INT,
            category VARCHAR(100),
            image_url TEXT,
            FOREIGN KEY (student_email) REFERENCES student_profile(email) ON DELETE CASCADE
        );

        INSERT INTO student_profile (email, full_name, roll_no, department, cgpa, sgpa, attendance) VALUES 
        ('sivanagu7771@gmail.com', 'Sivanagu E', '737624IT123', 'Information Tech', 8.92, 8.75, 92.5),
        ('kvabhinanthan@gmail.com', 'Abhinanthan K V', '737624IT005', 'Information Tech', 9.10, 8.90, 95.0);
    `;

    db.query(masterSQL, (err) => {
        if (err) console.error("Error:", err.message);
        else console.log("SUCCESS! Database ready for Master Admin.");
        process.exit();
    });
});
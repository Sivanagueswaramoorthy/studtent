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
    if (err) return console.error('FAILED! Use a Hotspot. Error:', err.message);
    console.log('Building clean, error-free database...');

    const masterSQL = `
        DROP TABLE IF EXISTS student_courses;
        DROP TABLE IF EXISTS student_profile;

        CREATE TABLE student_profile (
            email VARCHAR(255) PRIMARY KEY, 
            full_name VARCHAR(255) NOT NULL,
            roll_no VARCHAR(50), 
            department VARCHAR(100),
            cgpa DECIMAL(5,2) DEFAULT 0.00, -- Size increased to prevent Out of Range errors
            sgpa DECIMAL(5,2) DEFAULT 0.00, -- Size increased to prevent Out of Range errors
            reward_points INT DEFAULT 0, 
            arrears INT DEFAULT 0, 
            leaves INT DEFAULT 0,
            placement_applied INT DEFAULT 0, 
            placement_offers INT DEFAULT 0, 
            placement_highest_ctc VARCHAR(20) DEFAULT '0 LPA'
        );

        CREATE TABLE student_courses (
            id INT AUTO_INCREMENT PRIMARY KEY, 
            student_email VARCHAR(255), 
            semester INT,
            course_name VARCHAR(255), 
            marks INT, 
            grade VARCHAR(5),
            FOREIGN KEY (student_email) REFERENCES student_profile(email)
        );

        INSERT INTO student_profile VALUES 
        ('sivanagu7771@gmail.com', 'Sivanagu E', '737624IT123', 'Information Tech', 8.92, 8.75, 450, 0, 3, 12, 1, '8 LPA'),
        ('kvabhinanthan@gmail.com', 'Abhinanthan K V', '737624IT005', 'Information Tech', 9.10, 8.90, 600, 0, 1, 8, 0, '0 LPA'),
        ('sivanague@gmail.com', 'Sivanagu Personal', '737624IT123', 'Information Tech', 8.92, 8.75, 450, 0, 3, 12, 1, '8 LPA');
        
        INSERT INTO student_courses (student_email, semester, course_name, marks, grade) VALUES 
        ('sivanagu7771@gmail.com', 4, 'Database Management', 88, 'A'),
        ('kvabhinanthan@gmail.com', 4, 'Database Management', 95, 'O');
    `;

    db.query(masterSQL, (err) => {
        if (err) console.error("DB Error:", err.message);
        else console.log("SUCCESS! Database rebuilt. All users can now login via index.html.");
        process.exit();
    });
});
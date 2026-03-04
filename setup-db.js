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
    if (err) return console.error('Failed to connect:', err.message);
    console.log('Rebuilding Database for multiple users...');

    const masterSQL = `
        DROP TABLE IF EXISTS student_biometrics;
        DROP TABLE IF EXISTS student_drives;
        DROP TABLE IF EXISTS student_skills;
        DROP TABLE IF EXISTS student_projects;
        DROP TABLE IF EXISTS student_courses;
        DROP TABLE IF EXISTS student_profile;

        CREATE TABLE student_profile (
            email VARCHAR(255) PRIMARY KEY, full_name VARCHAR(255) NOT NULL,
            roll_no VARCHAR(50), department VARCHAR(100),
            cgpa DECIMAL(3,2), sgpa DECIMAL(3,2) DEFAULT 0.00,
            activity_points INT, reward_points INT, arrears INT DEFAULT 0, 
            fees_pending INT DEFAULT 0, leaves INT DEFAULT 0,
            placement_applied INT DEFAULT 0, placement_shortlisted INT DEFAULT 0, 
            placement_offers INT DEFAULT 0, placement_highest_ctc VARCHAR(20) DEFAULT '0 LPA'
        );

        CREATE TABLE student_courses (
            id INT AUTO_INCREMENT PRIMARY KEY, student_email VARCHAR(255), semester INT,
            course_code VARCHAR(50), course_name VARCHAR(255), attendance_percentage DECIMAL(5,2), 
            marks INT, grade VARCHAR(5),
            FOREIGN KEY (student_email) REFERENCES student_profile(email)
        );

        CREATE TABLE student_projects (
            id INT AUTO_INCREMENT PRIMARY KEY, student_email VARCHAR(255),
            title VARCHAR(255), status VARCHAR(50), description TEXT, tags VARCHAR(255),
            FOREIGN KEY (student_email) REFERENCES student_profile(email)
        );

        CREATE TABLE student_skills (
            id INT AUTO_INCREMENT PRIMARY KEY, student_email VARCHAR(255),
            name VARCHAR(100), levels INT, completed_levels INT, category VARCHAR(100), img_url VARCHAR(255),
            FOREIGN KEY (student_email) REFERENCES student_profile(email)
        );

        CREATE TABLE student_drives (
            id INT AUTO_INCREMENT PRIMARY KEY, student_email VARCHAR(255),
            company VARCHAR(100), role VARCHAR(100), drive_date VARCHAR(50), status VARCHAR(50),
            FOREIGN KEY (student_email) REFERENCES student_profile(email)
        );

        CREATE TABLE student_biometrics (
            id INT AUTO_INCREMENT PRIMARY KEY, student_email VARCHAR(255),
            log_date DATE, log_time TIME, device VARCHAR(100), log_type VARCHAR(10),
            FOREIGN KEY (student_email) REFERENCES student_profile(email)
        );

        -- INSERT DATA
        INSERT INTO student_profile VALUES 
        ('sivanagu7771@gmail.com', 'Sivanagu E', '737624IT123', 'Information Tech', 8.92, 8.75, 120, 450, 0, 0, 3, 12, 4, 1, '8 LPA'),
        ('kvabhinathan@gmail.com', 'Abhinathan K V', '737624IT005', 'Information Tech', 9.10, 8.90, 150, 600, 0, 1500, 1, 8, 2, 0, '0 LPA');

        INSERT INTO student_courses (student_email, semester, course_code, course_name, attendance_percentage, marks, grade) VALUES 
        ('sivanagu7771@gmail.com', 4, 'CS401', 'Database Management', 88.00, 88, 'A'),
        ('sivanagu7771@gmail.com', 4, 'CS402', 'Web Architecture', 92.00, 92, 'A+'),
        ('kvabhinathan@gmail.com', 4, 'CS401', 'Database Management', 95.00, 90, 'O'),
        ('kvabhinathan@gmail.com', 4, 'CS402', 'Web Architecture', 88.00, 85, 'A');

        INSERT INTO student_projects (student_email, title, status, description, tags) VALUES
        ('sivanagu7771@gmail.com', 'Worker Maintenance App', 'In Progress', 'Management App', 'Mobile'),
        ('kvabhinathan@gmail.com', 'AI Chatbot', 'Completed', 'ML Agent', 'AI');

        INSERT INTO student_skills (student_email, name, levels, completed_levels, category, img_url) VALUES
        ('sivanagu7771@gmail.com', 'IPR', 1, 1, 'GENERAL', 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=400&q=80'),
        ('kvabhinathan@gmail.com', 'Python', 5, 4, 'Core', 'https://images.unsplash.com/photo-1526379095098-d400fd0bfce8?auto=format&fit=crop&w=400&q=80');

        INSERT INTO student_drives (student_email, company, role, drive_date, status) VALUES
        ('sivanagu7771@gmail.com', 'TCS', 'SDE', 'Mar 15', 'Registered'),
        ('kvabhinathan@gmail.com', 'Infosys', 'SE', 'Mar 18', 'Registered');

        INSERT INTO student_biometrics (student_email, log_date, log_time, device, log_type) VALUES
        ('sivanagu7771@gmail.com', '2026-03-04', '13:05:00', 'MECH HKV3', 'IN'),
        ('kvabhinathan@gmail.com', '2026-03-04', '09:15:00', 'MAIN GATE', 'IN');
    `;

    db.query(masterSQL, (err) => {
        if (err) console.error("DB Error:", err.message);
        else console.log("SUCCESS! Both Sivanagu and Abhinathan can now log in.");
        process.exit();
    });
});
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
    console.log('Connected! Rebuilding the entire database with dynamic page data...');

    const masterSQL = `
        DROP TABLE IF EXISTS student_drives;
        DROP TABLE IF EXISTS student_skills;
        DROP TABLE IF EXISTS student_projects;
        DROP TABLE IF EXISTS student_courses;
        DROP TABLE IF EXISTS student_profile;

        CREATE TABLE student_profile (
            email VARCHAR(255) PRIMARY KEY,
            full_name VARCHAR(255) NOT NULL,
            cgpa DECIMAL(3,2), sgpa DECIMAL(3,2) DEFAULT 0.00,
            activity_points INT, reward_points INT, arrears INT DEFAULT 0, fees_pending INT DEFAULT 0,
            placement_applied INT DEFAULT 0, placement_shortlisted INT DEFAULT 0, 
            placement_offers INT DEFAULT 0, placement_highest_ctc VARCHAR(20) DEFAULT '0 LPA'
        );

        CREATE TABLE student_courses (
            id INT AUTO_INCREMENT PRIMARY KEY, student_email VARCHAR(255), semester INT,
            course_code VARCHAR(50), course_name VARCHAR(255), attendance_percentage DECIMAL(5,2), grade VARCHAR(5),
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

        -- ==========================================
        -- INSERT DYNAMIC DATA FOR SIVANAGU
        -- ==========================================
        INSERT INTO student_profile VALUES 
        ('sivanagu7771@gmail.com', 'Sivanagu E', 8.92, 8.75, 120, 450, 0, 0, 12, 4, 1, '8 LPA');
        
        INSERT INTO student_courses (student_email, semester, course_code, course_name, attendance_percentage, grade) VALUES 
        ('sivanagu7771@gmail.com', 4, 'CS401', 'Database Management', 88.00, 'A'),
        ('sivanagu7771@gmail.com', 4, 'CS402', 'Web Architecture', 92.00, 'A+'),
        ('sivanagu7771@gmail.com', 3, 'AI301', 'Artificial Intelligence', 96.00, 'O'),
        ('sivanagu7771@gmail.com', 3, 'DS302', 'Data Structures', 85.00, 'A');

        INSERT INTO student_projects (student_email, title, status, description, tags) VALUES
        ('sivanagu7771@gmail.com', 'Worker Maintenance App', 'In Progress', 'Cross-platform mobile application designed for comprehensive workforce management.', 'Mobile App, Management'),
        ('sivanagu7771@gmail.com', 'College Placement Software', 'In Progress', 'Full-stack enterprise web portal enabling seamless communication for placements.', 'Full-Stack, Database'),
        ('sivanagu7771@gmail.com', 'Personal Portfolio Webpage', 'Completed', 'Responsive, aesthetically driven personal website built to showcase academic achievements.', 'Frontend, Design');

        INSERT INTO student_skills (student_email, name, levels, completed_levels, category, img_url) VALUES
        ('sivanagu7771@gmail.com', 'IPR', 1, 1, 'GENERAL Skill', 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=400&q=80'),
        ('sivanagu7771@gmail.com', 'HTML / CSS', 1, 1, 'Software', 'https://images.unsplash.com/photo-1621839673705-6617adf9e890?auto=format&fit=crop&w=400&q=80'),
        ('sivanagu7771@gmail.com', 'C Programming', 3, 2, 'Core', 'https://images.unsplash.com/photo-1550439062-609e1531270e?auto=format&fit=crop&w=400&q=80');

        INSERT INTO student_drives (student_email, company, role, drive_date, status) VALUES
        ('sivanagu7771@gmail.com', 'TCS', 'SDE Intern', 'Mar 15, 2026', 'Registered'),
        ('sivanagu7771@gmail.com', 'Cognizant', 'Digital Engineer', 'Mar 22, 2026', 'Shortlisted'),
        ('sivanagu7771@gmail.com', 'Zoho', 'Analyst', 'Apr 05, 2026', 'Not Applied');
    `;

    db.query(masterSQL, (err) => {
        if (err) console.error("DB Build Error:", err.message);
        else console.log("SUCCESS! Your database is completely ready for the full site.");
        process.exit();
    });
});
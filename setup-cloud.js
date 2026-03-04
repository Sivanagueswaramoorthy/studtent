const mysql = require('mysql2');

// 1. FIXED Cloud Database credentials!
const db = mysql.createConnection({
    host: 'mysql-32a5e69e-sivanagu7771-74ba.d.aivencloud.com', // JUST the domain name
    port: 17949,                                               // Your specific Aiven port
    user: 'avnadmin', 
    password: 'AVNS_x5GIyjOoanVqXlKMi0w',
    database: 'defaultdb',  
    multipleStatements: true,        
    ssl: { rejectUnauthorized: false } 
});

db.connect((err) => {
    if (err) {
        console.error('Failed to connect to cloud database:', err.stack);
        return;
    }
    console.log('Successfully connected to the Cloud Database! Building tables...');

    // 2. The exact same SQL from earlier
    const setupSQL = `
        DROP TABLE IF EXISTS student_courses;
        DROP TABLE IF EXISTS student_profile;

        CREATE TABLE student_profile (
            email VARCHAR(255) PRIMARY KEY,
            full_name VARCHAR(255) NOT NULL,
            cgpa DECIMAL(3,2),
            activity_points INT,
            reward_points INT
        );

        CREATE TABLE student_courses (
            id INT AUTO_INCREMENT PRIMARY KEY,
            student_email VARCHAR(255),
            course_code VARCHAR(50),
            course_name VARCHAR(255),
            attendance_percentage DECIMAL(5,2),
            grade VARCHAR(5),
            FOREIGN KEY (student_email) REFERENCES student_profile(email)
        );

        INSERT INTO student_profile (email, full_name, cgpa, activity_points, reward_points) 
        VALUES ('sivanagu7771@gmail.com', 'Sivanagu', 3.85, 120, 450);

        INSERT INTO student_courses (student_email, course_code, course_name, attendance_percentage, grade) VALUES 
        ('sivanagu7771@gmail.com', 'CS401', 'Advanced Web Architecture', 92.50, 'A'),
        ('sivanagu7771@gmail.com', 'DB305', 'Database Management', 88.00, 'B+');
    `;

    db.query(setupSQL, (err, results) => {
        if (err) console.error("Error creating tables:", err);
        else console.log("SUCCESS! Your Cloud Database is fully built and ready to go.");
        process.exit();
    });
});
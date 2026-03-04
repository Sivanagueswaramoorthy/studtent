-- 1. Create and use the database
CREATE DATABASE IF NOT EXISTS university_db;
USE university_db;

-- 2. The "Magic Eraser": Safely delete old tables to clear previous mistakes
DROP TABLE IF EXISTS student_courses;
DROP TABLE IF EXISTS student_profile;

-- 3. Create the parent table: student_profile
CREATE TABLE student_profile (
    email VARCHAR(255) PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    cgpa DECIMAL(3,2),
    activity_points INT,
    reward_points INT
);

-- 4. Create the child table: student_courses
CREATE TABLE student_courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_email VARCHAR(255),
    course_code VARCHAR(50),
    course_name VARCHAR(255),
    attendance_percentage DECIMAL(5,2),
    grade VARCHAR(5),
    FOREIGN KEY (student_email) REFERENCES student_profile(email)
);

-- ==========================================
-- STUDENT 1 DATA (Your Main Email)
-- ==========================================
INSERT INTO student_profile (email, full_name, cgpa, activity_points, reward_points) 
VALUES ('sivanagu7771@gmail.com', 'Sivanagu', 3.85, 120, 450);

INSERT INTO student_courses (student_email, course_code, course_name, attendance_percentage, grade) VALUES 
('sivanagu7771@gmail.com', 'CS401', 'Advanced Web Architecture', 92.50, 'A'),
('sivanagu7771@gmail.com', 'DB305', 'Database Management', 88.00, 'B+'),
('sivanagu7771@gmail.com', 'AI502', 'Artificial Intelligence', 96.50, 'A'),
('sivanagu7771@gmail.com', 'ENG210', 'Technical Writing', 82.00, 'B');

-- ==========================================
-- STUDENT 2 DATA (Your Test/Backup Email)
-- ==========================================
INSERT INTO student_profile (email, full_name, cgpa, activity_points, reward_points) 
VALUES ('sivagokulc18@gmail.com', 'Siv Gokul C', 3.85, 120, 450);

INSERT INTO student_courses (student_email, course_code, course_name, attendance_percentage, grade) VALUES 
('sivagokulc18@gmail.com', 'CS401', 'Web technology', 92.50, 'A'),
('sivagokulc18@gmail.com', 'DB305', 'Database Management', 88.00, 'B+'),
('sivagokulc18@gmail.com', 'AI502', 'Artificial Intelligence', 96.50, 'A'),
('sivagokulc18@gmail.com', 'ENG210', 'Technical Writing', 82.00, 'B');
INSERT INTO student_profile (email, full_name, cgpa, activity_points, reward_points) 
VALUES ('kvabhinanthan@gmail.com', 'Abhinanthan K V', 3.85, 120, 450);

INSERT INTO student_courses (student_email, course_code, course_name, attendance_percentage, grade) VALUES 
('kvabhinanthan@gmail.com', 'CS401', 'Web technology', 92.50, 'A'),
('kvabhinanthan@gmail.com', 'DB305', 'Database Management', 88.00, 'B+'),
('kvabhinanthan@gmail.com', 'AI502', 'Artificial Intelligence', 96.50, 'A'),
('kvabhinanthan@gmail.com', 'ENG210', 'Technical Writing', 82.00, 'B');
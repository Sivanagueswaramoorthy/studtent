const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'mysql-32a5e69e-sivanagu7771-74ba.d.aivencloud.com',
    port: 17949, 
    user: 'avnadmin', 
    password: 'AVNS_x5GIyjOoanVqXlKMi0w',
    database: 'defaultdb', 
    ssl: { rejectUnauthorized: false } 
});

db.connect((err) => {
    if (err) return console.error('Connection Failed! Please connect to your Mobile Hotspot.', err.message);
    
    // This forces the email into the database safely
    const sql = `
        INSERT INTO student_profile (email, full_name, roll_no, department) 
        VALUES ('sivanage@gmail.com', 'Sivanagu E', '737624IT124', 'Information Tech')
        ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);
    `;
    
    db.query(sql, (error) => { 
        if (error) {
            console.error("Database Error:", error.message);
        } else {
            console.log("SUCCESS! Your email is now officially registered in the Aiven Cloud Database."); 
        }
        process.exit(); 
    });
});
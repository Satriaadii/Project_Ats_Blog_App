import mysql from "mysql2/promise";

const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "db_blog_app",
    // password: "password_kalian"
});

export default connection;
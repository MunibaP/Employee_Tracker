const mysql = require('mysql2');

require('dotenv').config();

// Connect to database//
const db = mysql.createConnection(
  {
    host: "localhost",
    user: process.env.DB_USER,
    password: process.env.DB_PW,
  },

  console.log("Connected to the SQL database!")
);

module.exports = db; 

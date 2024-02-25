// Importing Required framwork for creating the server
const db = require("./db/connection");
const express = require("express");
const inquirer = require("./lib/departments");

// Define the PORT and where the server will listen for request
const PORT = process.env.PORT || 3001;
const app = express();

// express Middleware
app.use(express.urlencoded({extended: false}));
app.use(express.json());

// By Default response for any other request (Which are Not found)
app.use((req, res) => {
  res.status(404).end();
});

// Start server after Database connection
db.connect((err) => {
  if (err) throw err;
  console.log('Database Connected.');
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    start();
  });
});
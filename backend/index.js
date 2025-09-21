const express = require('express');

const cors = require('cors');

const app = express();
const db = require('./database');

app.route('/').get(async (req , res) => {
    const response = await db.query("SELECT * FROM USERS");
    res.send("DATABASE QUERIED THIS : " , response);
});

app.listen(3000 , () => {
    console.log("APP IS RUNNING ON PORT 3000");
});
const express = require("express");
const path = require("path");
const mysql = require("mysql2");
const dotenv = require("dotenv");

dotenv.config({path: './.env'})
const app = express();
const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

// We defined this to use any styling or javascript code
const publicdirectory = path.join(__dirname, './public');
app.use(express.static(publicdirectory))

// Parsing URL-encoded bodies (as send by HTML forms)
app.use(express.urlencoded({extended: false}));

// Parse JSON bodies (as sent by API clients)
app.use(express.json());
app.set('view engine', 'hbs');

// id, firstName, lastName, username, email, password
db.connect( (error) => {
    if(error){
        console.log("Oops ", error);
    }
    else{
        console.log("MYSQL Conncted....")
    }
})

// Define Routes
app.use('/', require('./routes/pages'));
app.use('/auth', require('./routes/auth'));

app.listen(5000, () => {
    console.log("Server Connect to port 5000");
})
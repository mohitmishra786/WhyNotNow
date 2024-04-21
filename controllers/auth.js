const mysql = require("mysql2");
const jwt =  require("jsonwebtoken");
const bcrypt = require("bcryptjs");


const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

exports.register = (req, res) => {
    console.log(req.body);
    
    const { name, username, email, password, passwordConfirm} = req.body;
    db.query('SELECT email FROM users WHERE email = ?', [email], async (error, results) => {
        if(error){
            console.log(error);
        }
        if(results.length > 0){
            return res.render('register', {
                message: "That Email is already in use"
            })
        }
        else if(password !== passwordConfirm){
            return res.render('register', {
                message: "Passwords Doesn't Match"
            })
        }

        let hashedPassword = await bcrypt.hash(password, 8);

        db.query('INSERT INTO users SET ?', {name: name, username: username, email: email, password: hashedPassword}, (error, results) => {
            if(error){
                console.log(error);
            }
            else{
                console.log(results);
                return res.render('register', {
                    message: "User Registered Successfully"
                })
            }
        });
    });
}
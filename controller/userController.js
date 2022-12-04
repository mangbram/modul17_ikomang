const express = require('express')
const db = require('../db.config/db.config')
const jwt = require('jsonwebtoken');
// const Auth = require('./auth')
const cookieParser = require('cookie-parser');
require("dotenv").config();
const bcrypt = require('bcrypt');
const e = require('express');
SECRET = process.env.SECRET


const register = async(req, res, next) => {
    // * 7. silahkan ubah password yang telah diterima menjadi dalam bentuk hashing
    const {username, email, password}=req.body;
    try{
        const hashedPass= await bcrypt.hash(password,10);
    // 8. Silahkan coding agar pengguna bisa menyimpan semua data yang diinputkan ke dalam database
        await db.query(`INSERT INTO unhan_modul_17 VALUES(DEFAULT, $1,$2,$3)`,[username,email,hashedPass])
        res.status(200).send("Data input successfully")
    } catch(err){
        res.status(400).send("Data input failed")
    }
    
}

const login = async(req, res, next) => {
   
    // 9. komparasi antara password yang diinput oleh pengguna dan password yang ada didatabase
    const {email, password} = req.body;
    try{
        const data = await db.query(`SELECT * FROM unhan_modul_17 WHERE email= $1;`, [email])
        const userData = data.rows;
        if (userData.length === 0){
            res.status(400).send("User not found")
        }
        else{
            bcrypt.compare(password,userData[0].password, (err, result)=>{
                if(err){
                    res.status(500).send("Server Error")
                }
                else if(result=== true){
                    // 10. Generate token menggunakan jwt sign
                    const token=jwt.sign(
                        {
                            id: userData[0].id,
                            username: userData[0].username,
                            email: userData[0].email,
                            password:userData[0].password,
                        }, process.env.SECRET
                    )
                    res.cookie("tokenJWT",token,{httpOnly: true, sameSite:"strict",})
                    res.status(200).json({
                        message: "User logged in",
                      //11. kembalikan nilai id, email, dan username
                        id: userData[0].id,
                        username:userData[0].username,
                        email: userData[0].email,
                        token:token,
                    });
                }
                else{
                    if(result != false){
                        res.status.send("Wrong password")
                    }
                }
            })
        }
    } catch (err){
        console.log(err);
        res.status(500).send("Database error")
    }
}

const logout = async(req, res, next) => {
                
    try {
        // 14. code untuk menghilangkan token dari cookies dan mengembalikan pesan "sudah keluar dari aplikasi"  
        return res.clearCookie("tokenJWT").send("Cookie cleared")
    } catch (err) {
        console.log(err.message);
        return res.status(500).send(err)
    }
            
}

const verify = async(req, res, next) => {
    try {
        // 13. membuat verify
        const email=req.data.email;
        const userData = await db.query(`SELECT * FROM unhan_modul_17 WHERE email=$1;`, [email])
        return res.status(200).json({
            id: userData.rows[0].id,
            username: userData.rows[0].username,
            email: userData.rows[0].email,
            password: userData.rows[0].password
        })
    } catch (err) {
        console.log(err.message);
        return res.status(500).send(err)    
    }
}

module.exports = {
    register,
    login,
    logout,
    verify
}

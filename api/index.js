const express = require('express')
const cors = require('cors')
const { default: mongoose } = require('mongoose')
const User = require('./models/user')
const app = express()
const bcrypt = require('bcrypt');
const salt = bcrypt.genSaltSync(10);
const jwt = require('jsonwebtoken')
const secret = 'dhhiy4hdjk3jhkjd989hjkds'
const cookieParser = require('cookie-parser')

// const corsOptions = {
//     origin: 'http://localhost:3000', // Your frontend's URL
//     optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
// };

// app.use(cors(corsOptions));


app.use(cors({credentials:true,origin:'http://localhost:3000'}))
app.use(express.json())
app.use(cookieParser())

mongoose.connect('mongodb+srv://lifecanvas:lifecanvas@cluster0.ezefyqm.mongodb.net/?retryWrites=true&w=majority')

app.post('/register', async (req, res) => {
    const { username, password } = req.body
    try {
        const userDoc = await User.create({
            username,
            password: bcrypt.hashSync(password, salt)
        })
        res.json(userDoc)
    } catch (e) {
        res.status(400).json(e)
    }
})

app.post('/login', async (req, res) => {
    const { username, password } = req.body
    const userDoc = await User.findOne({ username })
    const passOk = bcrypt.compareSync(password, userDoc.password);
    // res.json(passOk)
    if (passOk) {
        // User is logged in
        jwt.sign({username,id:userDoc._id }, secret, {}, (err, token) => {
            if (err) throw err;
            res.cookie('token',token).json({
                id:userDoc._id,
                username,
            })
        })
    } else {
        res.status(400).json('Wrong Infomation')
    }
})
// mongodb+srv://lifecanvas:lifecanvas@cluster0.ezefyqm.mongodb.net/?retryWrites=true&w=majority

app.get('/profile', (req,res) => {
    const {token} = req.cookies;
    jwt.verify(token, secret, {}, (err,info) => {
        if(err) throw err
        res.json(info)
    })
})

app.post('/logout', (req,res) => {
    res.cookie('token','').json('ok')
})

app.listen(4000)
const express = require('express');
const mongoose = require('mongoose')
const app = express();
const bodyParser = require('body-parser')
const passport = require('passport')

//引入users.js
const users = require('./routes/api/users')
const profiles = require('./routes/api/profiles')
//引入db
const db = require('./config/keys').mongoURL

//使用bodyParse中间件
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// passport的初始化
app.use(passport.initialize())
require('./config/passport')(passport);

//connect to mongodb
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// app.get('/', (req, res) => {
//     res.send('Hello World!')
//     // res.send('{"schoolName":"xxx"}')
// });

//使用router
app.use('/api/profiles',profiles)
app.use('/api/users', users)

app.get('/', (req, res) => {
    console.log(req.url)
})
app.use((err,req,res,next) => {
    console.log(err)
    console.log(req.url)
})

const port = process.env.PORT || 5000
app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})
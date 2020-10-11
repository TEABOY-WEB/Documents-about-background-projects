//登陆和注册

const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const gravatar = require('gravatar')
const jwt = require('jsonwebtoken')
const keys = require('../../config/keys')
const passport = require('passport')

const User = require('../../models/User')


// router.get('/test', (req, res) => {
//   res.json({ msg: 'login works' })
// })

router.post('/register', (req, res) => {
  console.log(req.body)

  User.findOne({ email: req.body.email }).then((user) => {
    if (user) {
      return res.status(400).json( '邮箱已被注册' )
      // console.log(user)
    } else {
      const avatar = gravatar.url(req.body.email, {
        s: '200',
        r: 'pg',
        d: 'mm'
      })

      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        avatar,
        password: req.body.password,
        indentity:req.body.indentity
      })


      bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(newUser.password, salt, function (err, hash) {
          //将 哈希存储在密码数据库中。
          console.log(newUser.password, salt)
          if (err) throw err;
          newUser.password = hash

          newUser.save()
            .then(user => res.json(user))
            .catch(err => console.log(err))
        });
      });
    }
  })
})

//搭建登陆接口

router.post('/login', (req, res) => {
  const email = req.body.email
  const password = req.body.password
  //查询数据库

  User.findOne({ email }).then(user => {
    if (!user) {
      return res.status(404).json('用户不存在' )
    }

    //密码匹配
    bcrypt.compare(password, user.password)
      .then(isMatch => {
        if (isMatch) {
          const rule = { id: user.id, name: user.name,avatar:user.avatar,indentity:user.indentity }
          jwt.sign(rule, keys.secretOrKey, { expiresIn: 3600 }, (err, token) => {
            if (err) throw err
            res.json({
              success: true,
              token: 'Bearer ' + token
            })
          })
          //   res.json({msg:'success'})
        } else {
          return res.status(400).json( '密码错误' )
        }
      })

  })
})

//通过token获取数据，需要验证token是否正确，返回相应得信息

router.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    indentity:req.user.indentity
  })
})

// router.get('/current', (req, res) => {
//     res.json({
//         id: req.user.id,
//         name: req.user.name,
//         email: req.user.email
//     })
// })

module.exports = router
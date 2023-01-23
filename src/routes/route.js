const express = require('express')
const { book, getBooks } = require('../controllers/bookController')
const { user, login } = require('../controllers/userController')
const router = express.Router()

router.get('/test-me', function (req, res) {
    res.send({ test: "Test-API" })
})


router.post('/register',user)
router.post('/login',login)


router.post('/books',book)
router.get('/books',getBooks)


router.all("/*",function(req,res){res.status(404).send({status:false,msg:"Invalid HTTP request"})})

module.exports = router
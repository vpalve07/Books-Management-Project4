const express = require('express')
const { book, getBooks, getBooksById, updateBook, deleteBookById } = require('../controllers/bookController')
const { review, updateReview, deleteReview } = require('../controllers/reviewController')
const { user, login } = require('../controllers/userController')
const { tokenValidate } = require('../Middlewares/authMiddleware')
const router = express.Router()

router.get('/test-me', function (req, res) {
    res.send({ test: "Test-API" })
})


router.post('/register', user)
router.post('/login', login)


router.post('/books', tokenValidate, book)
router.get('/books', getBooks)
router.get('/books/:bookId', getBooksById)
router.put('/books/:bookId', tokenValidate, updateBook)
router.delete('/books/:bookId', tokenValidate, deleteBookById)


router.post('/books/:bookId/review', review)
router.put('/books/:bookId/review/:reviewId', updateReview)
router.delete('/books/:bookId/review/:reviewId', deleteReview)


// router.all("/*", function (req, res) { res.status(404).send({ status: false, msg: "Invalid HTTP request" }) })

module.exports = router
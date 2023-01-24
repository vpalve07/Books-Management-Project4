const jwt = require('jsonwebtoken')
const bookModel = require('../models/bookModel')
const mongoose = require('mongoose')

const tokenValidate = async function (req, res, next) {
    try {
        let token = req.headers.token
        if (!token) return res.status(400).send({ status: false, msg: "Token is required" })

        try {
            let decodedToken = jwt.verify(token, 'group12')
            req.decoded = decodedToken
        } catch (error) {
            if (error.message == 'invalid token') return res.status(400).send({ msg: "Token Is Invalid" })
            else if (error.message == 'jwt malformed') return res.status(400).send({ msg: "Token Is Invalid" })
            else return res.status(400).send({ msg: "Token Is Expired" })
        }

        if (req.body.userId) if (!mongoose.isValidObjectId(req.body.userId)) return res.status(400).send({ status: false, msg: "userId is invalid" })
        if (req.params.bookId) if (!mongoose.isValidObjectId(req.params.bookId)) return res.status(400).send({ status: false, msg: "bookId is invalid" })

        if (req.body.userId) if (req.decoded.userId != req.body.userId) return res.status(400).send({ status: false, msg: "Can not Create a book with provided userId" })

        let findBook
        if (req.params.bookId) findBook = await bookModel.findById(req.params.bookId)
        if (req.params.bookId) if (!findBook) return res.status(404).send({ status: false, msg: "Book not found" })
        if (req.params.bookId) if (req.decoded.userId != findBook.userId) return res.status(400).send({ status: false, msg: "Can not Update or Delete a book with provided bookId" })
        next()
    } catch (error) {
        return res.status(500).send({ errorMsg: error.message })
    }
}

module.exports = { tokenValidate }
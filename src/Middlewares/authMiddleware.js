const jwt = require('jsonwebtoken')
const bookModel = require('../models/bookModel')
const mongoose = require('mongoose')

const tokenValidate = async function (req, res, next) {
    try {
        let token = req.headers['x-api-key']
        if (!token) return res.status(400).send({ status: false, msg: "Token is required" })

        try {
            let decodedToken = jwt.verify(token, 'group12')
            req.decoded = decodedToken
        } catch (error) {
            if (error.message == 'invalid token') return res.status(400).send({ msg: "Token Is Invalid" })
            else if (error.message == 'jwt malformed') return res.status(400).send({ msg: "Token Is Invalid" })
            else return res.status(400).send({ msg: "Token Is Expired" })
        }

        req.body.userId = (req.body.userId).trim()
        if (req.body.userId) if (!mongoose.isValidObjectId(req.body.userId)) return res.status(400).send({ status: false, msg: "userId of req body is invalid" })
        if (req.params.bookId) if (!mongoose.isValidObjectId(req.params.bookId)) return res.status(400).send({ status: false, msg: "bookId of path params is invalid" })

        if (req.body.userId) if (req.decoded.userId != req.body.userId) return res.status(400).send({ status: false, msg: "Your userId and token is not matched" })

        let findBook
        if (req.params.bookId) findBook = await bookModel.findById(req.params.bookId)
        if (req.params.bookId) if (!findBook) return res.status(404).send({ status: false, msg: "Book not found with given bookId" })
        if (req.params.bookId) if (req.decoded.userId != findBook.userId) return res.status(400).send({ status: false, msg: "Can not Update or Delete a book with provided bookId" })
        next()
    } catch (error) {
        return res.status(500).send({ errorMsg: error.message })
    }
}

module.exports = { tokenValidate }
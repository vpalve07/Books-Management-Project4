const bookModel = require('../models/bookModel')
const userModel = require('../models/userModel')
const mongoose = require('mongoose')

const book = async function (req, res) {
    try {
        let data = req.body

        let { title, excerpt, userId, ISBN, category, subcategory, releasedAt } = data

        if (!title) return res.status(400).send({ status: false, msg: "title is mandatory" })
        if (!excerpt) return res.status(400).send({ status: false, msg: "excerpt is mandatory" })
        if (!ISBN) return res.status(400).send({ status: false, msg: "ISBN is mandatory" })
        if (!category) return res.status(400).send({ status: false, msg: "category is mandatory" })
        if (!subcategory) return res.status(400).send({ status: false, msg: "subcategory is mandatory" })
        if (!releasedAt) return res.status(400).send({ status: false, msg: "releasedAt is mandatory" })

        const titleRegex = /^[a-z A-Z_]{3,20}$/
        if (!titleRegex.test(title) || !titleRegex.test(category) || !titleRegex.test(subcategory)) return res.status(400).send({ status: false, Msg: "'title', 'category', 'subcategory' can not contain numerical values or special characters" })

        if (userId) if (!mongoose.isValidObjectId(userId)) return res.status(400).send({ status: false, msg: "userId is invalid" })
        let validUser = await userModel.findById({ _id: userId })
        if (!validUser) return res.status(400).send({ status: false, msg: "User not found with the provided UserID" })

        const isbnRegex = /^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/i
        if (!isbnRegex.test(data.ISBN)) return res.status(400).send({ status: false, msg: "ISBN number format is incorrecr 'ISBN number can be of either 10 or 13 digits and ISBN-13 starts with 978 or 979' some examples are - 1. (ISBN-10: 0-306-40615-2) 2. (ISBN-13: 978-0-306-40615-7) 3. (ISBN-13 with spaces: 978 0 306 40615 7)  4. (ISBN-13 with hyphens: 978-0-306-40615-7)  5. (ISBN-13 with ISBN prefix: ISBN 978-0-306-40615-7)  6. (ISBN-13 with ISBN-13 prefix: ISBN-13 978-0-306-40615-7)" })

        let createBook = await bookModel.create(data)
        return res.status(201).send({ status: true, message: 'Success', data: createBook })
    } catch (error) {
        return res.status(500).send({ errorMsg: error.message })
    }
}

const getBooks = async function (req, res) {
    try {
        let query = req.query
        let findBook = await bookModel.find(query, { isDeleted: false }).select({ createdAt: 0, updatedAt: 0, __v: 0 }).sort({ title: 1 })
        if (findBook.length == 0) return res.status(404).send({ status: false, msg: "No book found" })
        return res.status(200).send({ status: true, message: "Success", data: findBook })
    } catch (error) {
        return res.status(500).send({ errorMsg: error.message })
    }
}

module.exports = { book, getBooks }
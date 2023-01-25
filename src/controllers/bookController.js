const bookModel = require('../models/bookModel')
const userModel = require('../models/userModel')
const reviewModel = require('../models/reviewModel')
// const moment = require('moment')
const mongoose = require('mongoose')

const book = async function (req, res) {
    try {
        let data = req.body

        let dateFormat = /^(19|20)\d{2}\/(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])$/;

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
        if (!isbnRegex.test(data.ISBN)) return res.status(400).send({ status: false, msg: "ISBN number format is incorrect 'ISBN number can be of either 10 or 13 digits and ISBN-13 starts with 978 or 979' some examples are - 1. (ISBN-10: 0-306-40615-2) 2. (ISBN-13: 978-0-306-40615-7) 3. (ISBN-13 with spaces: 978 0 306 40615 7)  4. (ISBN-13 with hyphens: 978-0-306-40615-7)  5. (ISBN-13 with ISBN prefix: ISBN 978-0-306-40615-7)  6. (ISBN-13 with ISBN-13 prefix: ISBN-13 978-0-306-40615-7)" })

        let findISBN = await bookModel.findOne({$or:[{ISBN:ISBN},{title:title}]})
        if (findISBN) return res.status(400).send({ status: false, msg: "ISBN number or Title already exists" })

        if(!data.reviews==0) return res.status(400).send({ status: false, msg: "Review count can not be greater or lesser than 0 at the time of creation of book" })

        if(!dateFormat.test(releasedAt)) return res.status(400).send({ status: false, msg: "Date format is wrong" })

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


const getBooksById = async function (req, res) {
    try {
        let bookId = req.params.bookId
        if (!mongoose.isValidObjectId(bookId)) return res.status(400).send({ status: false, msg: "bookId is invalid" })
        let findBook = await bookModel.findById(bookId)
        if (!findBook) return res.status(404).send({ status: false, msg: "Book not found" })
        let { _id, title, excerpt, userId, category, subcategory, isDeleted, reviews, releasedAt, createdAt, updatedAt } = findBook
        let reviewsList = await reviewModel.find({ bookId: bookId }).select({ isDeleted: 0, createdAt: 0, updatedAt: 0, __v: 0 })
        return res.status(200).send({ status: true, message: "Book List", data: { _id, title, excerpt, userId, category, subcategory, isDeleted, reviews, releasedAt, createdAt, updatedAt, reviewsData: reviewsList } })
    } catch (error) {
        return res.status(500).send({ errorMsg: error.message })
    }
}


const updateBook = async function (req, res) {
    try {
        let data = req.body
        if (Object.keys(data).length == 0) return res.status(400).send({ status: false, msg: "Request body can't be empty" })
        let { title, excerpt, releasedAt, ISBN } = data
        let exist = await bookModel.findOne({ $or: [{ title: title }, { ISBN: ISBN }] })
        if (exist) return res.status(400).send({ status: false, msg: "Can not update unique fields which are already exist" })
        let finalData = await bookModel.findOneAndUpdate({ _id: req.params.bookId, isDeleted: false }, { $set: { title: title, excerpt: excerpt, releasedAt: releasedAt, ISBN: ISBN } }, { new: true })
        if (!finalData) return res.status(404).send({ status: false, msg: "Document not found for update" })
        return res.status(200).send({ status: true, data: finalData })
    } catch (error) {
        return res.status(500).send({ errorMsg: error.message })
    }
}


const deleteBookById = async function (req, res) {
    try {
        let bookId = req.params.bookId
        let deleteDoc = await bookModel.findOneAndUpdate({ _id: bookId, isDeleted: false }, { isDeleted: true }, { new: true })
        if (!deleteDoc) return res.status(404).send({ status: false, msg: "Document already deleted" })
        return res.status(200).send({ status: true, Info: "Document deleted successfully" })
    } catch (error) {
        return res.status(500).send({ errorMsg: error.message })
    }
}
module.exports = { book, getBooks, getBooksById, updateBook, deleteBookById }
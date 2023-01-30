const bookModel = require('../models/bookModel')
const userModel = require('../models/userModel')
const reviewModel = require('../models/reviewModel')
const mongoose = require('mongoose')

const book = async function (req, res) {
    try {
        let data = req.body

        let dateFormat = /^(19|20)\d{2}\-(0[1-9]|1[0-2])\-(0[1-9]|1\d|2\d|3[01])$/;

        let { title, excerpt, userId, ISBN, category, subcategory, releasedAt } = data

        if (!title) return res.status(400).send({ status: false, msg: "title is mandatory" })
        if (!excerpt) return res.status(400).send({ status: false, msg: "excerpt is mandatory" })
        if (!userId) return res.status(400).send({ status: false, msg: "userId is mandatory" })
        if (!ISBN) return res.status(400).send({ status: false, msg: "ISBN is mandatory" })
        if (!category) return res.status(400).send({ status: false, msg: "category is mandatory" })
        if (!subcategory) return res.status(400).send({ status: false, msg: "subcategory is mandatory" })
        if (!releasedAt) return res.status(400).send({ status: false, msg: "releasedAt is mandatory" })

        const titleRegex = /^[a-z A-Z_]{3,20}$/
        if (!titleRegex.test(title) || !titleRegex.test(category) || !titleRegex.test(subcategory)) return res.status(400).send({ status: false, Msg: "'title', 'category', 'subcategory' can not contain numerical values, special characters or empty spaces" })

        data.title = data.title.toLowerCase()
        if (userId) if (!mongoose.isValidObjectId(userId)) return res.status(400).send({ status: false, msg: "userId is invalid" })
        let validUser = await userModel.findById({ _id: userId })
        if (!validUser) return res.status(400).send({ status: false, msg: "User not found with the provided UserID" })

        const isbnRegex = (/^(?=(?:\D*\d){13}(?:(?:\D*\d){3})?$)[\d-]+$/g)
        if (!isbnRegex.test(data.ISBN.trim())) return res.status(400).send({ status: false, msg: "ISBN number format is incorrect" })

        let findISBN = await bookModel.findOne({ISBN:ISBN})
        let findTitle = await bookModel.findOne({title:data.title})

        if (findISBN) return res.status(400).send({ status: false, msg: "ISBN number already exists" })
        if (findTitle) return res.status(400).send({ status: false, msg: "Title already exists" })

        if(!data.reviews==0) return res.status(400).send({ status: false, msg: "Review count can not be greater or lesser than 0 at the time of creation of book" })
        if(!dateFormat.test(releasedAt.trim())) return res.status(400).send({ status: false, msg: "Date format is wrong" })

        let createBook = await bookModel.create(data)
        return res.status(201).send({ status: true, message: 'Success', data: createBook })
    } catch (error) {
        return res.status(500).send({ errorMsg: error.message })
    }
}

const getBooks = async function (req, res) {
    try {
        let query = req.query
        let {userId,category,subcategory,title,excerpt,ISBN,reviews} = query
        if(userId==""||category==""||subcategory=="") return res.status(400).send({ status: false, msg: "query params value can't be empty" })
        if(userId) if (!mongoose.isValidObjectId(userId)) return res.status(400).send({ status: false, msg: "userId is invalid" })
        if(Object.keys(query).length==0){
            let findBook = await bookModel.find({ isDeleted: false }).select({ createdAt: 0, updatedAt: 0, __v: 0 }).sort({ title: 1 })
            if (findBook.length == 0) return res.status(404).send({ status: false, msg: "No book found" })
            return res.status(200).send({ status: true, message: "Success", data: findBook })
        }
        if(title||excerpt||ISBN||reviews) return res.status(400).send({ status: false, msg: "You can only fetch books by its userId,category,subcategory" })

        if(userId||category||subcategory) {
            let findBook = await bookModel.find(query,{ isDeleted: false }).select({ createdAt: 0, updatedAt: 0, __v: 0 }).sort({ title: 1 })
            if (findBook.length == 0) return res.status(404).send({ status: false, msg: "No book found" })
            return res.status(200).send({ status: true, message: "Success", data: findBook })
        }
    } catch (error) {
        return res.status(500).send({ errorMsg: error.message })
    }
}


const getBooksById = async function (req, res) {
    try {
        let bookId = req.params.bookId
        if (!mongoose.isValidObjectId(bookId)) return res.status(400).send({ status: false, msg: "bookId is invalid" })
        let findBook = await bookModel.findOne({ _id: bookId , isDeleted:false})
        if (!findBook) return res.status(404).send({ status: false, msg: "Book not found" })
        let { _id, title, excerpt, userId, category, subcategory, isDeleted, reviews, releasedAt, createdAt, updatedAt } = findBook
        let reviewsList = await reviewModel.find({ bookId: bookId , isDeleted:false}).select({ isDeleted: 0, createdAt: 0, updatedAt: 0, __v: 0 })
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

        const isbnRegex = (/^(?=(?:\D*\d){13}(?:(?:\D*\d){3})?$)[\d-]+$/g)
        if (!isbnRegex.test(data.ISBN.trim())) return res.status(400).send({ status: false, msg: "ISBN number format is incorrect" })

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
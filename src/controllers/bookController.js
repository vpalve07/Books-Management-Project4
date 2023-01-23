const bookModel = require('../models/bookModel')
const userModel = require('../models/userModel')

const book = async function (req, res) {
    try {
        let data = req.body
        // const isbnRegex = (?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$)[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$
        let validUser = await userModel.findById({ _id: data.userId })
        if (!validUser) return res.status(400).send({ status: false, msg: "Invalid UserID" })
        let createBook = await bookModel.create(data)
        return res.status(201).send({ status: true, data: createBook })
    } catch (error) {
        return res.status(500).send({ errorMsg: error.message })
    }
}

const getBooks = async function (req, res) {
    try {
        let query = req.query
        let findBook = await bookModel.find(query,{ isDeleted: false} ).select({createdAt:0,updatedAt:0,__v:0}).sort({title:1})
        if (findBook.length == 0) return res.status(400).send({ status: false, msg: "No book found" })
        return res.status(200).send({ status: true, message: "Book List", data: findBook })
    } catch (error) {
        return res.status(500).send({ errorMsg: error.message })
    }
}

module.exports = { book, getBooks }
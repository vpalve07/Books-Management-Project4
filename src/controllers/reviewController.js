const reviewModel = require('../models/reviewModel')
const bookModel = require('../models/bookModel')
const mongoose = require('mongoose')

const review = async function (req, res) {
    try {
        let data = req.body
        let { bookId, reviewedBy, reviewedAt, rating, review } = data

        if (!bookId) return res.status(400).send({ status: false, msg: "bookId is mandatory" })
        if (!reviewedBy) return res.status(400).send({ status: false, msg: "reviewedBy is mandatory" })
        if (!reviewedAt) return res.status(400).send({ status: false, msg: "reviewedAt is mandatory" })
        if (!rating) return res.status(400).send({ status: false, msg: "rating is mandatory" })
        if (rating > 5 || rating < 1) return res.status(400).send({ status: false, msg: "please rate in between 1 to 5" })

        if (!mongoose.isValidObjectId(bookId)) return res.status(400).send({ status: false, msg: "bookId is invalid" })

        let findBook = await bookModel.findOneAndUpdate({ _id: bookId, isDeleted: false }, { $inc: { reviews: 1 } }, { new: true })
        if (!findBook) return res.status(404).send({ status: false, msg: "No book found" })
        let createReview = await reviewModel.create(data)
        return res.status(200).send({ status: true, message: "Success", data: findBook })
    } catch (error) {
        return res.status(500).send({ errorMsg: error.message })
    }

}


const updateReview = async function (req, res) {
    try {
        let data = req.body
        let { rating } = data
        if (rating > 5 || rating < 1) return res.status(400).send({ status: false, msg: "please rate in between 1 to 5" })
        let findBook = await bookModel.findOne({ _id: req.params.bookId, isDeleted: false })
        if (!findBook) return res.status(404).send({ status: false, msg: "No book found" })
        let { _id, title, excerpt, userId, category, subcategory, isDeleted, reviews, releasedAt, createdAt, updatedAt } = findBook
        let findReview = await reviewModel.findOneAndUpdate({ bookId: req.params.bookId, _id: req.params.reviewId }, data, { new: true }).select({ isDeleted: 0, createdAt: 0, updatedAt: 0, __v: 0 })
        if (!findReview) return res.status(404).send({ status: false, msg: "No review found" })
        return res.status(200).send({ status: true, message: 'Books list', data: { _id, title, excerpt, userId, category, subcategory, isDeleted, reviews, releasedAt, createdAt, updatedAt, reviewsData: findReview } })
    } catch (error) {
        return res.status(500).send({ errorMsg: error.message })
    }
}


const deleteReview = async function (req, res) {
    try {
        let bookId = req.params.bookId
        let reviewId = req.params.reviewId
        let findReview = await reviewModel.findOne({ bookId: bookId, _id: reviewId })
        if (!findReview) return res.status(404).send({ status: false, msg: "No review found" })
        let deleteReview = await reviewModel.findOneAndUpdate({ _id: reviewId, isDeleted: false }, { isDeleted: true }, { new: true })
        if (!deleteReview) return res.status(404).send({ status: false, msg: "Document already deleted" })
        let decBookReview = await bookModel.findOneAndUpdate({ _id: bookId, isDeleted: false }, { $inc: { reviews: -1 } }, { new: true })
        return res.status(200).send({ status: true, Info: "Document deleted successfully" })
    } catch (error) {
        return res.status(500).send({ errorMsg: error.message })
    }
}

module.exports = { review, updateReview, deleteReview }
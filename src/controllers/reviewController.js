const reviewModel = require('../models/reviewModel')
const bookModel = require('../models/bookModel')
const mongoose = require('mongoose')

const review = async function(req,res){
    let data = req.body
    let {bookId,reviewedBy,reviewedAt,rating,review} = data
    if(!bookId) return res.status(400).send({ status: false, msg: "bookId is mandatory" })
    if(!reviewedBy) return res.status(400).send({ status: false, msg: "reviewedBy is mandatory" })
    if(!reviewedAt) return res.status(400).send({ status: false, msg: "reviewedAt is mandatory" })
    if(!rating) return res.status(400).send({ status: false, msg: "rating is mandatory" })
    if(rating>5||rating<1) return res.status(400).send({ status: false, msg: "please rate in between 1 to 5" })

    if(!mongoose.isValidObjectId(bookId)) return res.status(400).send({ status: false, msg: "bookId is invalid" })
    let findBook = await bookModel.findOneAndUpdate({_id:bookId,isDeleted:false},{$inc:{reviews:1}},{new:true})
    if(!findBook) return res.status(404).send({ status: false, msg: "No book found" })
    let createReview = await reviewModel.create(data)
    return res.status(200).send({ status: true, message: "Success", data: findBook })

    // let updateBook = await bookModel.findOneAndUpdate()
}

module.exports = {review}
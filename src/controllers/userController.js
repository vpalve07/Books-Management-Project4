const userModel = require('../models/userModel')
const jwt = require('jsonwebtoken')

const user = async function (req, res) {
    try {
        let data = req.body
        let createUser = await userModel.create(data)
        return res.status(201).send({ status: true, data: createUser })
    } catch (error) {
        return res.status(500).send({ errorMsg: error.message })
    }
}

const login = async function (req, res) {
    try {
        let data = req.body
        let findUser = await userModel.findOne(data)
        if (!findUser) res.status(400).send({ status: false, msg: "Invalid credentials" })
        let payload = { userId: findUser._id.toString(), email: findUser.email, iat: Math.floor(Date.now() / 1000) }  //,iat: Math.floor(Date.now() / 1000),exp: Math.floor(Date.now() / 1000) + (30 * 60)
        let token = jwt.sign(payload, 'group12', { expiresIn: '10m' })
        return res.status(200).send({ status: true, data: token })
    } catch (error) {
        return res.status(500).send({ errorMsg: error.message })
    }
}

module.exports = { user, login }
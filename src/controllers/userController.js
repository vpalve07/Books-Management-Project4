const userModel = require('../models/userModel')
const jwt = require('jsonwebtoken')

const user = async function (req, res) {
    try {
        let phEmail = []
        let data = req.body
        if (Object.keys(data).length == 0) return res.status(400).send({ status: false, Msg: "Request Body can't be empty" })
        let { title, name, phone, email, password, address } = data

        if (!title) return res.status(400).send({ status: false, msg: "Title is mandatory" })
        if (!name) return res.status(400).send({ status: false, msg: "name is mandatory" })
        if (!phone) return res.status(400).send({ status: false, msg: "phone is mandatory" })
        if (!email) return res.status(400).send({ status: false, msg: "email is mandatory" })
        if (!password) return res.status(400).send({ status: false, msg: "password is mandatory" })
        if (!address) return res.status(400).send({ status: false, msg: "address is mandatory" })
        if (!address.street) return res.status(400).send({ status: false, msg: "street is mandatory in address" })
        if (!address.city) return res.status(400).send({ status: false, msg: "city is mandatory in address" })
        if (!address.pincode) return res.status(400).send({ status: false, msg: "pincode is mandatory in address" })

        let titleEnum = userModel.schema.obj.title.enum
        if (!titleEnum.includes(data.title)) {
            return res.status(400).send({ status: false, msg: "title should be Mr, Mrs or Miss" })
        }

        const validName = /^[a-z A-Z_]{3,20}$/
        const validNumber = (/^[6-9]\d{9}$/)
        const emailRegex = /^[a-z]{1}[a-z0-9._]{1,100}[@]{1}[a-z]{2,15}[.]{1}[a-z]{2,10}$/
        const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/;

        if (!validName.test(data.name)) return res.status(400).send({ status: false, Msg: "User Name can not contain numerical values or special characters" })
        if (!validNumber.test(data.phone)) return res.status(400).send({ status: false, Msg: "Phone Number should only contain 10 digits in it and should start with 6/7/8/9" })
        if (!emailRegex.test(data.email)) return res.status(400).send({ status: false, Msg: "email format is Invalid" })
        if (!passwordRegex.test(data.password)) return res.status(400).send({ status: false, Msg: "Password should contain at least 8 characters with 1 upper and lower case" })

        let createUser = await userModel.create(data)
        // let {phone,email} = createUser
        phEmail.push(createUser)
        console.log(phEmail)
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
        let token = jwt.sign(payload, 'group12', { expiresIn: '30s' })
        return res.status(200).send({ status: true, data: token })
    } catch (error) {
        return res.status(500).send({ errorMsg: error.message })
    }
}

module.exports = { user, login }
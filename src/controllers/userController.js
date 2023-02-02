const userModel = require('../models/userModel')
const jwt = require('jsonwebtoken')

const user = async function (req, res) {
    try {
        let data = req.body
        if (Object.keys(data).length == 0) return res.status(400).send({ status: true, message: "Request Body can't be empty" })
        let { title, name, phone, email, password, address } = data

        if (!title) return res.status(400).send({ status: true, message: "Title is mandatory" })
        if (!name) return res.status(400).send({ status: true, message: "name is mandatory" })
        if (!phone) return res.status(400).send({ status: true, message: "phone is mandatory" })
        if (!email) return res.status(400).send({ status: true, message: "email is mandatory" })
        if (!password) return res.status(400).send({ status: true, message: "password is mandatory" })

        let titleEnum = userModel.schema.obj.title.enum
        if (!titleEnum.includes(data.title)) return res.status(400).send({ status: true, message: "title should be Mr, Mrs or Miss" })

        const validName = /^[a-z A-Z_]{3,20}$/
        const validNumber = (/^[6-9]\d{9}$/)
        const emailRegex = /^[a-z]{1}[a-z0-9._]{1,100}[@]{1}[a-z]{2,15}[.]{1}[a-z]{2,10}$/
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/;

        if (!validName.test(data.name)) return res.status(400).send({ status: true, message: "User Name can not contain numerical values or special characters" })
        if (!validNumber.test(data.phone)) return res.status(400).send({ status: true, message: "Phone Number should only contain 10 digits in it and should start with 6/7/8/9" })
        if (!emailRegex.test(data.email)) return res.status(400).send({ status: true, message: "email format is Invalid" })
        if (!passwordRegex.test(data.password)) return res.status(400).send({ status: true, message: "Password should contain at least 8 and max 15 characters with 1 upper, lower case and special char" })

        let findEmailPhone = await userModel.findOne({ $or: [{ email: email }, { phone: phone }] })
        if (findEmailPhone) return res.status(400).send({ status: true, message: "Email Id or Phone Number is already exist" })
        if(address||address=="") if(!address.street||!address.city||!address.pincode) return res.status(400).send({ status: true, message: "address should contain 'street','city','pincode'" })

        let createUser = await userModel.create(data)
        return res.status(201).send({ status: true, message: 'Success', data: createUser })
    } catch (error) {
        return res.status(500).send({ errorMessage: error.message })
    }
}

const login = async function (req, res) {
    try {
        let data = req.body
        if (Object.keys(data).length == 0) return res.status(400).send({ status: true, message: "request body cant be empty" })

        let { password, email } = data
        if (!password) return res.status(400).send({ status: true, message: "password is mandatory" })
        if (!email) return res.status(400).send({ status: true, message: "email is mandatory" })
        if (Object.keys(data).length > 2) return res.status(400).send({ status: true, message: "request body can only contain email and password" })

        let findUser = await userModel.findOne(data)
        if (!findUser) return res.status(400).send({ status: true, message: "Invalid credentials" })
        let payload = { userId: findUser._id.toString(), email: findUser.email, iat: Math.floor(Date.now() / 1000) }  //,iat: Math.floor(Date.now() / 1000),exp: Math.floor(Date.now() / 1000) + (30 * 60)
        let token = jwt.sign(payload, 'group12', { expiresIn: '30m' })
        res.setHeader('x-api-key', token)
        return res.status(200).send({ status: true, message: 'Success', data: token })
    } catch (error) {
        return res.status(500).send({ errormessage: error.message })
    }
}

module.exports = { user, login }
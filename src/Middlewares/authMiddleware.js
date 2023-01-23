const jwt = require('jsonwebtoken')
// const jwtDecode = require('jwt-decode')

const tokenValidate = function (req, res, next) {
    try {
        let token = req.headers.token
        if (!token) return res.status(400).send({ status: false, msg: "Token is required" })
        try {
            let decodedToken = jwt.verify(token, 'group12')
        } catch (error) {
            if (error.message == 'invalid token') return res.status(400).send({ msg: "Token Is Invalid" })
            else if (error.message == 'jwt malformed') return res.status(400).send({ msg: "Token Is Invalid" })
            else return res.status(400).send({ msg: "Token Is Expired" })
        }
        next()
    } catch (error) {
        return res.status(500).send({ errorMsg: error.message })
    }
}

module.exports = { tokenValidate }
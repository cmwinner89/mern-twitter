const express = require("express");
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const keys = require('../../config/keys');
const jwt = require("jsonwebtoken");
const validateRegisterInput = require('../../validations/register');
const validateLoginInput = require('../../validations/login');
const { validate } = require("../../models/User");


// router.get("/test", (req, res) => {
//     res.json({msg: "This is the users routes"})

// });

router.post('/register', (req, res) => {
    const { errors, isValid } = validateRegisterInput(req.body);

    if (!isValid) {
        return res.status(400).json(errors);
    }

    User.findOne({ email: req.body.email })
        .then(user => {
            if (user) {

                //throw error if user email exists
                return res.status(400).json({ email: "A user has already registered with this address" })
            } else {
                //if email doesn't exist
                const newUser = new User({
                    handle: req.body.handle,
                    email: req.body.email,
                    password: req.body.password
                })
                // newUser.save()
                //     .then(user => res.send(user))
                //     .catch(err => res.send(err));

                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) {
                            throw err;
                        }
                        newUser.password = hash;
                        newUser.save()
                            .then(user => res.json(user))
                            .catch(err => console.log(err));
                    })
                })
            }
        })
})

router.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password

    const { errors, isValid } = validateLoginInput(req.body);

    if (!isValid) {
        return res.status(400).json(errors);
    }

    User.findOne({ email })
        .then(user => {
            if (!user) {
                return res.status(404).json({ email: "This user does not exist" })
            }

            bcrypt.compare(password, user.password)
                .then(isMatch => {
                    if (isMatch) {
                        const payload = {
                            id: user.id,
                            handle: user.handle,
                            email: user.email
                        }

                        jwt.sign(payload, keys.secretOrKey, {expiresIn: 3600}, (err, token) => {
                            res.json({
                                success: true,
                                token: `Bearer ${token}`
                            });
                        })

                    } else {
                        return res.status(404).json({ password: "password was incorrect"})
                    }
                })
        })
})

module.exports = router;
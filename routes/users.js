const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../config/keys");
const jwt_decode = require("jwt-decode");
// Load User model
const User = require("../models/User");

// Load input validation
const validateRegisterInput = require("../validation/register");
const validateLoginInput = require("../validation/login");


/* GET users listing. */
router.get('/list', function (req, res, next) {
    console.log("Vishal");
    console.log(req.get('Authorization'));
    console.log(jwt_decode(req.get('Authorization')));
    jwt.verify(req.get('Authorization'), keys.secretOrKey, (err, authorizedData) => {
        if (err) {
            //If error send Forbidden (403)
            console.log(err);
            console.log('ERROR: Could not connect to the protected route');
            // res.sendStatus(403);
        } else {
            //If token is successfully verified, we can send the autorized data
            // res.json({
            //     message: 'Successful log in',
            //     authorizedData
            // });
            console.log('SUCCESS: Connected to protected route');
        }
    });
});


// @route POST api/users/register
// @desc Register user
// @access Public
router.post("/register", (req, res) => {
    console.log(req.body);

    const {errors, isValid} = validateRegisterInput(req.body);

    User.findOne({email: req.body.email}).then(user => {
        if (user) {
            return res.status(404).json({message: "Email already exists"});
        }
        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            age: req.body.age
        });
        // Hash password before saving in database
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
                if (err) throw err;
                newUser.password = hash;
                newUser
                    .save()
                    .then(user => {
                        console.log(user);
                        return res.status(200).json(user)})
                    .catch(err => {
                        console.log(err);
                        return res.status(404).json({message: "Something is Wrong!"})
                    });
            });
        });
    });
});


// @route POST api/users/login
// @desc Login user and return JWT token
// @access Public
router.post("/login", (req, res) => {

    const email = req.body.email;
    const password = req.body.password;
    console.log(req.get('Authorization'));


    const {errors, isValid} = validateLoginInput(req.body);

    // Check validation
    if (!isValid) {
        return res.status(400).json(errors);
    }
    // Find user by email
    User.findOne({email}).then(user => {
        // Check if user exists
        if (!user) {
            return res.status(404).json({message: "Email not found"});
        }
        // Check password
        bcrypt.compare(password, user.password).then(isMatch => {
            if (isMatch) {
                // User matched
                // Create JWT Payload
                const payload = {
                    id: user.id,
                    username: user.username,
                    email: user.email
                };
                // Sign token
                jwt.sign(
                    payload,
                    keys.secretOrKey,
                    {
                        expiresIn: 18000 //
                    },
                    (err, token) => {
                        res.status(200).json({
                            success: true,
                            token: token
                        });
                    }
                );
            } else {
                return res
                    .status(404)
                    .json({message: "Password incorrect"});
            }
        });
    });
});


// jwt.verify(req.get('Authorization'), keys.secretOrKey, (err, authorizedData) => {
//     if(err){
//         //If error send Forbidden (403)
//         console.log(err);
//         console.log('ERROR: Could not connect to the protected route');
//         // res.sendStatus(403);
//     } else {
//         //If token is successfully verified, we can send the autorized data
//         // res.json({
//         //     message: 'Successful log in',
//         //     authorizedData
//         // });
//         console.log('SUCCESS: Connected to protected route');
//     }
// });


module.exports = router;



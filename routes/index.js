var express = require('express');
var router = express.Router();

const Availability = require("../models/availability");

const validateRegisterInput = require("../validation/register");

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});


router.post("/availability", (req, res) => {

    const {errors, isValid} = validateRegisterInput(req.body);

    const availability = new Availability({
        email: req.body.email,
        availability: req.body.availability,
    });

    Availability.findOne({email: req.body.email}).then(userAvailability => {
        // Check if user exists
        if (!userAvailability) {
            availability
                .save()
                .then(userAvailability => res.status(200).send(userAvailability))
                .catch(err => res.status(404).json({message: 'Server Error'}));
        } else {
            Availability
                .updateOne({email: req.body.email}, {availability: req.body.availability})
                .then(userAvailability => res.status(200).send(userAvailability))
                .catch(err => res.status(404).json({message: 'Server Error'}));
        }
    });
});

router.get("/availability", (req, res) => {

    console.log(req.param('email'));
    console.log(req.body);
    const {errors, isValid} = validateRegisterInput(req.body);

    Availability.findOne({email: req.param('email')}).then(userAvailability => {
        // Check if user exists
        if (!userAvailability) {
            console.log('error');
            res.status(404).json({message: 'Server Error'});
        } else {
            res.status(200).send(userAvailability);
        }
    });
});


module.exports = router;

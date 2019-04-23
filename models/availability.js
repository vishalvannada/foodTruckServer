const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// Create Schema
const AvailabilitySchema = new Schema({
    email: {
        type: String,
        required: true
    },
    availability: {
        type: Object,
    }
});
module.exports = User = mongoose.model("availability", AvailabilitySchema);

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//creating admin schema
const adminSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true
    },
    password : {
        type : String,
        required : true
    },
    resetToken: String,
    resetTokenExpiration: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Admin', adminSchema);
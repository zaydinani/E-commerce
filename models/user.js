const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// creating user schema 
const userSchema = new mongoose.Schema({
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
    address : {
        city : {
            type : String,
            required : false
        },
        street : {
            type : String,
            required : false
        },
        building : {
            type : String,
            required : false
        },
        apartmentNumber : {
            type : Number,
            required : false
        },
    },
    cart :{
        items : [
            {
                productId : {
                    type : mongoose.Schema.Types.ObjectId,
                    ref : 'Product',
                    required : false
                },
                quantity : {
                    type : Number,
                    required : false
                }
            }
        ]
    }
})

module.exports = mongoose.model('User', userSchema);
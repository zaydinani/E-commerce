const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//creating product schema
const deskPadsSchema = new mongoose.Schema({
    name : {
        type: String,
        required: true
    },
    material : {
        type: String,
        required: true
    },
    mainImagesPath : [
        {
            type: String,
            required: true
        }
    ],
    secondaryImagesPath : [
        {
            type: String,
            required: true
        }
    ],
    description : {
        type: String,
        required: true
    },
    priceBought : {
        type: Number,
        required: true
    },
    priceSold : {
        type: Number,
        required: true
    },
    quantity : {
        type: Number,
        required: true
    },
    sold : {
        type:   Number,
        required: true
    },
    color : {
        type: String,
        required: true
    },
    sellerId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'seller',
        required : false
    },
})

module.exports = mongoose.model('DeskPads', deskPadsSchema);
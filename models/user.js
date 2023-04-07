const mongoose = require('mongoose');
const product = require('../models/products');
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
    resetToken: String,
    resetTokenExpiration: Date,
    cart :{
        items : [
            {
                productId : {
                    type : mongoose.Schema.Types.ObjectId,
                    ref : 'products',
                    required : true
                },
                quantity : {
                    type : Number,
                    required : true,
                    default : 1
                }
            }
        ]
    }
})

//? add products to cart
userSchema.methods.addToCart = function(product) {
    const cartProductIndex = this.cart.items.findIndex(cp => {
      return cp.productId.toString() === product._id.toString();
    });
    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items];
  
    if (cartProductIndex >= 0) {
      newQuantity = this.cart.items[cartProductIndex].quantity + 1;
      updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
      updatedCartItems.push({
        productId: product._id,
        quantity: newQuantity
      });
    }
    const updatedCart = {
      items: updatedCartItems
    };
    this.cart = updatedCart;
    return this.save();
};

//? delete products from cart
userSchema.methods.removeFromCart = function(productId) {
    const updatedCartItems = this.cart.items.filter(item => {
        return item.productId.toString() !== productId.toString()
    })
    this.cart.items = updatedCartItems
    return this.save()
}

userSchema.methods.clearCart = function() {
    this.cart = {items: []}
    return this.save()
}





module.exports = mongoose.model('User', userSchema);
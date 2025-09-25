const mongoose = require('mongoose');

const sellProductSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    category:{
        type:String,
        required:true
    },
    imageURL:{
        type:String,
        required:true
    },
    imageURL1:{
        type:String,
       
    },
    imageURL2:{
        type:String,
        
    },
    imageURL3:{
        type:String,
        
    },
    originalName:{
        type:String
    },
    extension:{
        type:String
    },
    createdAt:{
        type:Date,
        default: Date.now
    },
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    }
});
const sellProduct = mongoose.model('sellProduct', sellProductSchema);
module.exports = sellProduct;
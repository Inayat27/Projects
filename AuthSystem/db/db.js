const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://inayat:inayat92@cluster0.texd150.mongodb.net/');

const userSchema = new mongoose.Schema(
    {
        username:{
            type:String,
            required:true,
            unique:true,
        },
        email:{
            type:String,
            required:true,
            unique:true,
        },
        password:{
            type:String,
            required:true
        }
    }, {timeStamps:true}
);


module.exports = userSchema;

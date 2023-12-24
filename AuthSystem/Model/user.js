const mongoose = require('mongoose');
const userSchema = require('../db/db');




const User  = mongoose.model('User',userSchema);


module.exports = User;
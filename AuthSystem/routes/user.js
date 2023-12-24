const express = require('express');
const { login ,register} = require('../controller/auth');
const { authenticate } = require('../Middleware/auth');
const router  = express.Router();



router.get('/profile', authenticate , (req,res) =>
{
    res.send('Welcome to the User Authentication System!')
});



module.exports=router;
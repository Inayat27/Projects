const User = require("../Model/user");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const register = async (req,res,next) =>
{

    const {username,email,password} = req.body;

   try {
    const hashPassword = await bcrypt.hash(password,20);
    User.create({username,email, password:hashPassword});
    res.json({"msg": "User created SuccessFully!"})
    
   } catch (error) {
    next(error)
   }
}




const login = async (req,res,next) =>
{
    const {username,password} = req.body;

    try {
        const user =await User.findOne({username:username});
        if (!user) {
            res.status(404).send('User not Found')
        }
        const passwordMatched  = await bcrypt.compare(password,user.password);

        if (!passwordMatched) {
            res.send(404)
        }
        const token  = jwt.sign({username:username,password:password},'Inayat@92');

        res.json({token})

    } catch (error) {
        next(error)
    }
}


module.exports={register,login};
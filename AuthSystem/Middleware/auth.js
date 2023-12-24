const jwt = require("jsonwebtoken");
const User = require("../Model/user");


const authenticate = async (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }
  try {
    const decodedToken = jwt.verify(token, "Inayat@92");

    const user  = await User.findOne({username:decodedToken.username});

    if (!user) {
        return res.status(404).json({ message: 'User not found' });

    }

    next();
  } catch (error) {
    res.send('Something Unexpected Happen')
  }
};



module.exports = {authenticate}
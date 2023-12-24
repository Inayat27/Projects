const express = require('express');

const userRoutes = require('./routes/user')
const authRoutes = require('./routes/auth')

const app = express();

app.use(express.json());

app.use('/auth',authRoutes);
app.use('/user',userRoutes);

app.listen(3000,() =>
{
    console.log('Server is Running on port 3000');
})

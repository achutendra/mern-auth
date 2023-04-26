const express = require('express');
const mongoose = require('mongoose');
const bodyparser = require('body-parser')
const router = require('./routes/userRoutes');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors({credentials: true, origin: "http://localhost:3000"}));
app.use(cookieParser());
app.use(express.json());

// Body-parser middleware
app.use(bodyparser.urlencoded({extended:false}))
app.use(bodyparser.json())

app.use('/api', router);

app.use('/', (req, res, next) =>{
    res.send("hello There!!");
});

mongoose.connect(process.env.MONGODB_URL)
        .then(() => {
            app.listen(5000);
            console.log("Database is connected! Listening to port 5000");
        })
        .catch((err) => console.log(err));

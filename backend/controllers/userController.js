const User = require('../model/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const signup = async(req, res, next) => {
    const { name, email, password } = req.body;
    let existingUser;
    try{
        existingUser = await User.findOne({email: email});
    }catch(err){
        console.log(err);
    }
    if(existingUser){
        return res.status(400).json({message: "User already exists! Login instead"});
    }

    const hashedPassword = bcrypt.hashSync(password);

    const user = new User({
        name,
        email,
        password: hashedPassword
    });

    try{
        await user.save();
    }catch(error){
        console.log(error);
    }

    return res.status(201).json({message: user});
}

const login = async(req, res, next) => {
    const { email, password } = req.body;

    let existingUser;
    try{
        existingUser = await User.findOne({email: email});
    }catch(err){
        console.log(err);
    }

    if(!existingUser){
        res.status(400).json({message: "User not found. Signup please"});
    }

    const isPasswordCorrect = bcrypt.compareSync(password, existingUser.password);
    if(!isPasswordCorrect){
        return res.status(400).json({message: 'Invalid email or Password!'});

    }

    const token = jwt.sign({id: existingUser._id}, process.env.JWT_SECRET_KEY, {
        expiresIn: "30s"
    });

    console.log("Generated Token\n", token);

    if(req.cookies[`${existingUser._id}`]){
        req.cookies[`${existingUser._id}`] = ""
    }

    res.cookie(String(existingUser._id), token, {
        path: "/",
        expires: new Date(Date.now()+ 1000 * 30),
        httpOnly: true,
        sameSite: 'lax',
    });

    return res.status(200).json({message: "You are signed in!!", user: existingUser, token})
    
};

const verifyToken = (req, res, next) => {
    // const headers = req.headers['authorization'];
    // const token = headers.split(" ")[1];
    const cookies = req.headers.cookie;
    const token = cookies.split("=")[1];
    console.log(token);
    if(!token){
        res.status(404).json({message: "no token found"});
    }
    jwt.verify(String(token), process.env.JWT_SECRET_KEY, (err, user) => {
        if(err){
            return res.status(400).json({message: "Invalid Token"});
        }
        console.log(user.id);
        req.id = user.id;
    });
    next();
};

const getUser = async(req, res, nect) => {
    const userId = req.id;
    let user;
    try{
        user = await User.findById(userId, "-password");
    }catch(err){
        return new Error(err);
    }
    if(!user){
        return res.status(404).json({message: "User Not Found"});
    }
    return res.status(200).json({user});
}

const refreshToken = (req, res, next) => {
    const cookies = req.headers.cookie;
    const prevToken = cookies.split("=")[1];
    if(!prevToken){
        return res.status(400).json({message: "couldn't find token"})
    }
    jwt.verify(String(prevToken), process.env.JWT_SECRET_KEY, (err, user) => {
        if(err){
            console.log(err);
            return res.status(403).json({message: 'Authentication failed'})
        }
        res.clearCookie(`${user.id}`);
        req.cookies[`${user.id}`] = "";


        const token = jwt.sign({id: user.id}, process.env.JWT_SECRET_KEY, {
            expiresIn: "30s"
        })

        console.log("Regenerated Token\n", token);

        res.cookie(String(user.id), token, {
            path: "/",
            expires: new Date(Date.now()+ 1000 * 30),
            httpOnly: true,
            sameSite: 'lax',
        });

        req.id = user.id;
        next();
    })
} 

const logout = (req, res, next) => {
    const cookies = req.headers.cookie;
    const prevToken = cookies.split("=")[1];
    if(!prevToken){
        return res.status(400).json({message: "couldn't find token"})
    }
    jwt.verify(String(prevToken), process.env.JWT_SECRET_KEY, (err, user) => {
        if(err){
            console.log(err);
            return res.status(403).json({message: 'Authentication failed'})
        }
        res.clearCookie(`${user.id}`);
        req.cookies[`${user.id}`] = "";

        return res.status(200).json({message: "Successfully Logged Out"});
    })
}

exports.logout = logout;
exports.signup = signup;
exports.login = login;
exports.verifyToken = verifyToken;
exports.getUser = getUser;
exports.refreshToken = refreshToken;
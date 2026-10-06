import { SignupRoute } from './Routers/signup.js';
import { LoginRouter } from './Routers/login.js';
import mongoose from 'mongoose';
import cors from 'cors'
import 'dotenv/config.js'
import express from 'express';

const app = express();

app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        console.log("Database connected")
        app.listen(5000, () => {
            console.log("listening at http://localhost:5000");
        })
    })
    .catch((err) => {
        console.error(err)
    }
);


export const verifyToken = (req, res, next) => {
    const authHeaders = req.headers.authorization

    if(!authHeaders || !authHeaders.startsWith('Bearer ')){
        return res.status(401).json({
            message: 'Token missing'
        })
    }
    const tokens = authHeaders.split(' ')[1];
    try{
        const decoded = jwt.verify(tokens, process.env.JWT_SECRET);
        req.User = decoded;
        next();
    }
    catch(err){
        res.status(401).json({
            message: "Invalid or expired token",
            error: err
        });
    }
}


app.use(LoginRouter);
app.use(SignupRoute);

app.listen(5000, () => {
    console.log("listening at http://localhost:5000");
});
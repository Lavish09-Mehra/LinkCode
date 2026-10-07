import { SignupRoute } from './Routers/signup.js';
import { LoginRouter } from './Routers/login.js';
import mongoose from 'mongoose';
import cors from 'cors'
import 'dotenv/config.js'
import express from 'express';
import jwt from 'jsonwebtoken';

const app = express();

app.use(express.json());
app.use(cors());

// Connect without owning a port: on Vercel the platform invokes the exported
// app, and listening on a fixed port there would fail.
mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        console.log("Database connected");
    })
    .catch((err) => {
        console.error(err);
    });


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


// mounted under /api because vercel.json routes /api/(.*) to this service and
// the service receives the original path (/api/login, not /login)
app.use(LoginRouter);
app.use(SignupRoute);

// Vercel sets VERCEL=1 — there we export the handler instead of binding a port
if (!process.env.VERCEL) {
    app.listen(5000, () => {
        console.log("listening at http://localhost:5000");
    });
}

export default app;

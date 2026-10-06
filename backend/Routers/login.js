import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserDetail } from '../Database/usersSchema.js';
export const LoginRouter = (express.Router());

LoginRouter.post('/login', async(req, res) => {
    try {
        const LoginData = req.body

        if (!LoginData.email || !LoginData.password)
            return res.status(400).json({
                message: "email and password are required"
            });

        const user = await UserDetail.findOne({ email: LoginData.email });
        if(!user){
            return res.status(401).json({
                message: `${LoginData.email} Not found..`
            })
        }
        const isMatched = await bcrypt.compare(LoginData.password, user.password);
        if(!isMatched){
            return res.status(401).json({
                message: `Nope Password is wrong`
            });
        }
        const token = jwt.sign(
            {
                userId: user._id,
                username: user.username
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '1h'
            }
        );

        res.status(201).json({
            message: "Successfully Logined..",
            token
        });
    }

    catch (err) {
        res.status(500).json({
            error: `oops.. something went wrong ${err}`
        });
    }
});
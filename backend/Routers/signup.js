import express from 'express';
import { UserDetail } from '../Database/usersSchema.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
export const SignupRoute = express.Router();

SignupRoute.post('/api/signup', async (req, res) => {
    try {
        // const userData = req.body;
        const { name, email, dob, password } = req.body
        if (!name || !email || !dob || !password)
            return res.status(400).json({
                message: "username, email, date of birth and password are required"
            });

        const hashedPass = await bcrypt.hash(password, 12);

        //UserData -> saved in mongoDB Atlas
        const SignupData = new UserDetail({ name, email, dob, password: hashedPass });
        await SignupData.save();

        const createdUser = SignupData.toObject();
        delete createdUser.password;

        const token = jwt.sign({
            userId: createdUser._id,
            name: createdUser.name
        },
        process.env.JWT_SECRET,
        {
            expiresIn: '1h'
        }
    );

        res.status(200).json({
            message: "Successfully created",
            token
        });
    }
    catch (err) {
        console.error(err);

        if(err.code === 11000){
            return res.status(409).json({
                message: "Username or email already exists"
            });
        }

        if(err.name === 'ValidationError'){
            return res.status(400).json({
                message: err.message
            });
        }

        res.status(500).json({
            message: "Failed to sign up",
            error: err.message
        });
    }
});

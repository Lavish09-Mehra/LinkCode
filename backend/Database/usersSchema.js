import mongoose from 'mongoose';

const UserDataSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    dob: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
}, { timestamps: true });

export const UserDetail = mongoose.model("UserDetail", UserDataSchema)
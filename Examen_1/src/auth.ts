import dotenv from 'dotenv';
import jwt from "jsonwebtoken";
import { getDB } from './db/db';
import { ObjectId } from 'mongodb';
import { User } from './types/user';

dotenv.config()


const SUPER_SECRETO = process.env.SECRET;

type TokenPayload = {
    userId: string;
    email: string
}


export const signToken = (userId: string, email: string) => jwt.sign({ userId, email } as TokenPayload, SUPER_SECRETO!, { expiresIn: "1h" });


export const verifyToken = (token: string): TokenPayload | null => {
    try {
        return jwt.verify(token, SUPER_SECRETO!) as TokenPayload;
    } catch (err) {
        return null;
    }
};

export const getUserFromToken = async (token: string) => {
    const payload = verifyToken(token);
    if (!payload) return null;
    const db = getDB();
    return await db.collection("userBooks").findOne({
        _id: new ObjectId(payload.userId)
    })
}
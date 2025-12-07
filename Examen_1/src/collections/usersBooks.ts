import { ObjectId } from "mongodb";
import { getDB } from "../db/db";
import bcrypt from "bcryptjs";



const COLLECTION = "userBooks";


export const createUser = async (email: string, password: string) => {
    const db = getDB();
    const findUserByEmail = await db.collection(COLLECTION).findOne({email});

    if(findUserByEmail) throw new Error ("Usuario con email ya registrado");

    const passwordEncriptada = await bcrypt.hash(password, 10);

    const result = await db.collection(COLLECTION).insertOne({
        email,
        password: passwordEncriptada
    });

    return result.insertedId.toString();
}

export const validateUser = async (email: string, password: string) => {
    const db = getDB();
    const user = await db.collection(COLLECTION).findOne({email});
    if( !user ) return null;

    const validatepassword = await bcrypt.compare(password, user.password);
    if(!validatepassword) return null;

    return user;
};


export const findUserById = async (id: string) => {
    const db = getDB();
    return await db.collection(COLLECTION).findOne({_id: new ObjectId(id)})
}
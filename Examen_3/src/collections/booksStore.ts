import { ObjectId } from "mongodb";
import { getDB } from "../db/db"
import { COLLECTION_PRODUCTS, COLLECTION_USERS } from "../utils";





export const getBooks = async (page?: number, size?: number) => {
    const db = getDB();
    page = page || 1;
    size = size || 10;
    return await db.collection(COLLECTION_PRODUCTS).find().skip((page - 1) * size).limit(size).toArray();
};

export const getBookById = async (id: string) => {
    const db = getDB();
    return await db.collection(COLLECTION_PRODUCTS).findOne({_id: new ObjectId(id)});
};

export const addBook = async (title: string, author: string, genre: string, price: number) => {
    const db = getDB();
    const result = await db.collection(COLLECTION_PRODUCTS).insertOne({
        title,
        author,
        genre,
        price
    });
    const newClothing = await getBookById(result.insertedId.toString());
    return newClothing;
};

export const buyBook = async (bookId: string, userId: string) => {
    const db = getDB();
    const localUserId = new ObjectId(userId);
    const localClothingId = new ObjectId(bookId);

    const clothingToAdd = await db.collection(COLLECTION_PRODUCTS).findOne({_id: localClothingId});
    if(!clothingToAdd) throw new Error("Book not found");

    await db.collection(COLLECTION_USERS).updateOne(
        { _id: localUserId },
        {
            $addToSet: { books: bookId }
        }
    );

    const updatedUser = await db.collection(COLLECTION_USERS).findOne({_id: localUserId});
    return updatedUser;
}
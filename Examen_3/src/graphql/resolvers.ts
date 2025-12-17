import { IResolvers } from "@graphql-tools/utils";
import { addBook, buyBook, getBooks, getBookById } from "../collections/booksStore";
import { createUser, validateUser } from "../collections/usersBooks";
import { signToken } from "../auth";
import { getDB } from "../db/db";
import { ObjectId } from "mongodb";
import { User } from "../types/user";





export const resolvers: IResolvers = {
    Query: {
        books: async (_, { page, size }) => {
            return await getBooks(page, size);
        },
        book: async (_, { id }) => {
            return await getBookById(id);
        },
        me: async (_, __, { user }) => {
            if(!user) return null;
            return {
                _id: user._id.toString(),
                ...user
            }
        }
    },
    Mutation: {
        addBook: async (_, { title, author, genre, price }) => {
            return await addBook(title, author, genre, price);
        },
        buyBook: async (_, { bookId }, { user }) => {
            if(!user) throw new Error("You must be logged in to buy clothes");
            return await buyBook(bookId, user._id.toString());
        },
        register: async (_, { email, password }) => {
            const userId = await createUser(email, password);
            return signToken(userId);
        },
        login: async (_, { email, password }) => {
            const user = await validateUser(email, password);
            if(!user) throw new Error("Invalid credentials");
            return signToken(user._id.toString());
        }
    },
    User: {
        books: async (parent: User) => {
            const db = getDB();
            const listaDeIdsDeRopa = parent.books;
            if(!listaDeIdsDeRopa) return [];
            const objectIds = listaDeIdsDeRopa.map((id) => new ObjectId(id));
            return db
                .collection("booksStore")
                .find({ _id: { $in: objectIds } })
                .toArray();
            
        }
    }
}
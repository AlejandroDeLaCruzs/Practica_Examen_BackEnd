import { IResolvers } from "@graphql-tools/utils";
import { signToken } from "../auth";
import { createUser, validateUser } from "../collections/usersBooks";
import { getDB } from "../db/db";
import { ObjectId } from "mongodb";
import { Book } from "../types/books";
import { User } from "../types/user";
import { Author } from "../types/author";

const authorColletion = "author";
const booksColletion = "books";
const userCollection = "user";

export const resolvers: IResolvers = {
  Query: {
    books: async (_, __, { user }) => {
      if (!user) throw new Error("Necistas validarte para usar esta API");
      return getDB().collection(booksColletion).find().toArray();
    },
    book: async (_, { id }: { id: string }, { user }) => {
      if (!user) throw new Error("Necistas validarte para usar esta API");
      const book = await getDB().collection(booksColletion).findOne({_id: new ObjectId(id)});
      if(!book) throw new Error("No hay book con ese ID");
      return book;
    },
    me: (_, __, {user}) => {
      return user;
    }
  },
  Mutation: {
    addAuthor: async (
      _,
      { name, nationality }: { name: string; nationality: string }
    ) => {
      const addAuthor = await getDB().collection(authorColletion).insertOne({
        name,
        nationality,
        books: [],
      });
      return getDB()
        .collection(authorColletion)
        .findOne({ _id: addAuthor.insertedId });
    },

    addBook: async (
      _,
      {
        title,
        authorId,
        publishedYear,
        genres,
      }: {
        title: string;
        authorId: string;
        publishedYear: number;
        genres: string[];
      }
    ) => {
      const existeID = await getDB()
        .collection(authorColletion)
        .findOne({ _id: new ObjectId(authorId) });

      if (!existeID) throw new Error("no existe es autor con ese ID");
      if (publishedYear < 1900)
        throw new Error("El publisherYear debe ser mayor que 1900");

      const insertBook = await getDB().collection(booksColletion).insertOne({
        title,
        authorId,
        publishedYear,
        genres,
        available: true,
      });
      await getDB()
        .collection(authorColletion)
        .updateOne(
          { _id: new ObjectId(authorId) },
          { $addToSet: { books: insertBook.insertedId } }
        );
      return getDB()
        .collection(booksColletion)
        .findOne({ _id: insertBook.insertedId });
    },

    borrowBook: async (_, { bookId }: { bookId: string }, { user }) => {
      if (!user) throw new Error("Debes autentificarte para usar esta API");

      const book = await getDB()
        .collection<Book>(booksColletion)
        .findOne({ _id: new ObjectId(bookId) });

      if (!book) throw new Error("No existe book con ese ID");

      if (!book.available)
        throw new Error("no esta disponible el libro" + book.title);

      await getDB()
        .collection<User>(userCollection)
        .updateOne(
          { _id: user._id },
          { $push: { borrowHistory: book._id.toString() } }
        );

      await getDB()
        .collection<Book>(booksColletion)
        .updateOne(
          { _id: new ObjectId(bookId) },
          { $set: { available: false } }
        );
      return getDB().collection(userCollection).findOne({ _id: user._id });
    },

    returnBook: async (_, { bookId }: { bookId: string }, { user }) => {
      await getDB()
        .collection<Book>(booksColletion)
        .updateOne(
          { _id: new ObjectId(bookId) },
          { $set: { available: true } }
        );
      return getDB().collection(userCollection).findOne({ _id: user._id });
    },

    register: async (
      _,
      { email, password }: { email: string; password: string }
    ) => {
      const userId = await createUser(email, password);
      return signToken(userId, email);
    },

    login: async (
      _,
      { email, password }: { email: string; password: string }
    ) => {
      const user = await validateUser(email, password);
      if (!user) throw new Error("Invalid credentials");
      return signToken(user._id.toString(), email);
    },
  },

  User: {
    borrowHistory: async (parent: User) => {
      const db = getDB();
      const objectIds = parent.borrowHistory.map((id) => new ObjectId(id));

      const books = await db
        .collection("books")
        .find({ _id: { $in: objectIds } })
        .toArray();

      return books;
    },
  },
  Author: {
    books: async (parent: Author) => {
      const db = getDB();
      if (!parent.books || parent.books.length === 0) return [];
      const ids = parent.books.map((id: any) => new ObjectId(id));
      return db
        .collection("books")
        .find({ _id: { $in: ids } })
        .toArray();
    },
  },

  Book: {
    // ESTE resolver es clave: devuelve el Author a partir de book.authorId
    author: async (parent: any) => {
      const db = getDB();
      if (!parent.authorId) return null;
      const authorId = new ObjectId(parent.authorId);
      return db.collection(authorColletion).findOne({ _id: authorId });
    },
  },
};

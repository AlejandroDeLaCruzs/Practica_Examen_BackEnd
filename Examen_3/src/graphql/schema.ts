import { gql } from "apollo-server";

export const typeDefs = gql`
    type User {
        _id: ID!
        email: String!
        books: [Book]!
    }

    type Book {
        _id: ID!
        title: String!
        author: String!
        genre: String!
        price: Float!
    }

    type Query {
        me: User
        books(page: Int, limit: Int): [Book]!
        book(id: ID!): Book
    }

    type Mutation {
        addBook(
            title: String!
            author: String!
            genre: String!
            price: Float!
        ): Book!

        buyBook(bookId: ID!): User!

        register(email: String!, password: String!): String!
        login(email: String!, password: String!): String!
    }
`;

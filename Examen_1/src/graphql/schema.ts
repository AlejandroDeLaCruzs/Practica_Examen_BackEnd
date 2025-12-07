import { gql } from "apollo-server";

export const typeDefs = gql`
  type User {
    _id: ID!
    username: String!
    email: String!
    borrowHistory: [Book!]!
  }

  type Author {
    _id: ID!
    name: String!
    nationality: String
    books: [Book!]!
  }

  type Book {
    _id: ID!
    title: String!
    author: Author!
    publishedYear: Int!
    genres: [String!]!
    available: Boolean!
  }

  type Query {
    books: [Book!]!
    book(id: ID!): Book
    authors: [Author!]!
    author(id: ID!): Author
    me: User
  }

  type Mutation {
    register(
      username: String!
      email: String!
      password: String!
    ): String!  # retorna token JWT

    login(
      email: String!
      password: String!
    ): String!   # token JWT

    addAuthor(
      name: String!
      nationality: String
    ): Author!

    addBook(
      title: String!
      authorId: ID!
      publishedYear: Int!
      genres: [String!]!
    ): Book!

    borrowBook(bookId: ID!): User!

    returnBook(bookId: ID!): User!
  }
`;

import { gql } from "apollo-server";

export const typeDefs = gql`
  type Director {
    _id: ID!
    name: String!
    nationality: String
    movies: [Movie!]!
  }

  type Actor {
    _id: ID!
    name: String!
    age: Int!
    filmography: [Movie!]!
  }

  type Movie {
    _id: ID!
    title: String!
    year: Int!
    director: Director!
    cast: [Actor!]!
    reviews: [Review!]!
  }

  type Review {
    _id: ID!
    movie: Movie!
    criticName: String!
    comment: String!
    rating: Float! # de 0 a 10
  }

  type Query {
    movies: [Movie!]!
    movie(id: ID!): Movie

    actors: [Actor!]!
    actor(id: ID!): Actor

    directors: [Director!]!
    director(id: ID!): Director
  }

  type Mutation {
    addDirector(name: String!, nationality: String): Director!
    addActor(name: String!, age: Int!): Actor!
    addMovie(
      title: String!
      year: Int!
      directorId: ID!
      castIds: [ID!]!
    ): Movie!
    addReview(
      movieId: ID!
      criticName: String!
      comment: String!
      rating: Float!
    ): Review!
  }
`;

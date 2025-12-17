import { gql } from "apollo-server";

export const typeDefs = gql`
  type User {
    _id: ID!
    email: String!
    recipes : [Recipe]!
  }

  type Ingredient {
    _id: ID!
    name: String!
    author: User!
  }

  type Recipe {
    _id: ID!
    name: String!
    description: String!
    ingredients: [Ingredient!]!
    author: String!
  }

  type Query {
    me: User
    getRecipe(id: String!): Recipe
    getRecipes(page: Int, size: Int, author: String, ingredient: [String]): [Recipe]!
  }

  type Mutation {
    login(email: String!, password: String!): String!
    register(email: String!, password: String!): String!

    AddIngredient(name: String!): Ingredient

    AddRecipe(
      name: String!
      description: String!
      ingredients: [String]!
    ): Recipe

    DeleteRecipe(id: String!): Boolean!

    UpdateRecipe(
      id: ID!
      name: String!
      description: String!
      ingredients: [String]!
    ): Recipe

    DeleteIngredient(id: String!): Boolean!
  }
`;

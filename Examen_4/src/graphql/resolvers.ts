import { IResolvers } from "@graphql-tools/utils";
import { getRecipes, getRecipe, AddRecipe } from "../collections/recipes";
import { AddIngredient } from "../collections/ingredients";
import { createUser, validateUser } from "../collections/usersRecipes";
import { signToken } from "../auth";
import { getDB } from "../db/db";
import { ObjectId } from "mongodb";
import { Recipe } from "../types/recipe";
import { User } from "../types/user";
import { COLLECTION_RECIPES } from "../utils";

export const resolvers: IResolvers = {
  Query: {
    getRecipes: async (_, { page, size, author, ingredient }) => {
      return await getRecipes(page, size, author, ingredient);
    },
    getRecipe: async (_, { id }) => {
      return await getRecipe(id);
    },
    me: async (_, __, { user }) => {
      if (!user) return null;
      return {
        _id: user._id.toString(),
        ...user,
      };
    },
  },
  Mutation: {
    AddIngredient: async (_, { name }, { user }) => {
      if (!user) throw new Error("You must be logged in to buy clothes");
      return await AddIngredient(name, user._id.toString());
    },
    AddRecipe: async (_, { name, description, ingredients }, { user }) => {
      if (!user) throw new Error("You must be logged in to buy clothes");
      return await AddRecipe(name, description, ingredients, user._id.toString());
    },
    register: async (_, { email, password }) => {
      const userId = await createUser(email, password);
      return signToken(userId);
    },
    login: async (_, { email, password }) => {
      const user = await validateUser(email, password);
      if (!user) throw new Error("Invalid credentials");
      return signToken(user._id.toString());
    },
  },

  User: {
    recipes: async (parent: User) => {
      const db = getDB();
      const listaDeIdsRecetas = parent.recipes;
      if (!listaDeIdsRecetas) return [];
      const objectIds = listaDeIdsRecetas.map((id) => new ObjectId(id));
      return db
        .collection(COLLECTION_RECIPES)
        .find({ _id: { $in: objectIds } })
        .toArray();
    },
  },

  Recipe: {
    ingredients: async (parent: Recipe) => {
      const idIngredinetes = parent.ingredients.map((id) => new ObjectId(id));
      return getDB()
        .collection("ingredients")
        .find({
          _id: { $in: idIngredinetes },
        })
        .toArray();
    },
  },
};

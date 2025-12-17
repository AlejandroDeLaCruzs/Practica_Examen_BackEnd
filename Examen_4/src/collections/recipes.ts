import { COLLECTION_RECIPES, COLLECTION_INGREDIENTS } from "../utils";
import { getDB } from "../db/db";
import { ObjectId } from "mongodb";
import { Recipe } from "../types/recipe";

export const getRecipes = async (
  page?: number,
  size?: number,
  author?: string,
  ingredient?: string[]
) => {
  const db = getDB();
  page = page || 1;
  size = size || 10;

  const query: any = {};

  if (author) {
    query.author = author;
  }

  if (ingredient && ingredient.length > 0) {
    query.ingredients = { $in: ingredient };
  }

  return await db
    .collection(COLLECTION_RECIPES)
    .find(query)
    .skip((page - 1) * size)
    .limit(size)
    .toArray();
};

export const getRecipe = async (id: string) => {
  const db = getDB();
  return await db
    .collection(COLLECTION_RECIPES)
    .findOne({ _id: new ObjectId(id) });
};

export const AddRecipe = async (
  name: string,
  description: string,
  ingredients: string[],
  id: string
) => {
  const db = getDB();
  const ingredient = await getDB()
    .collection(COLLECTION_RECIPES)
    .findOne({ name });
  if (ingredient) throw new Error("Receta ya existente");

  const ingredientIds = ingredients.map((id) => new ObjectId(id));

  const existingIngredients = await db
    .collection(COLLECTION_INGREDIENTS)
    .find({ _id: { $in: ingredientIds } })
    .toArray();

  if (existingIngredients.length !== ingredients.length) {
    throw new Error("Uno o más ingredientes no existen");
  }
  const recipe = {
    name,
    description,
    ingredients: ingredientIds,
    id,
  };

  const result = await db.collection(COLLECTION_RECIPES).insertOne(recipe);

  return {
    _id: result.insertedId,
    ...recipe,
  };
};

export const DeleteRecipe = async (id: string) => {
  const db = getDB();

  const result = await db
    .collection(COLLECTION_RECIPES)
    .deleteOne({ _id: new ObjectId(id) });

  if (result.deletedCount === 0) {
    throw new Error("Receta no encontrada");
  }
  return true;
};

export const UpdateRecipe = async (
  id: string,
  name: string,
  description: string,
  ingredients: string[]
) => {
  const db = getDB();

  const recipe = await db
    .collection(COLLECTION_RECIPES)
    .findOne({ _id: new ObjectId(id) });

  if (!recipe) {
    throw new Error("Receta no encontrada");
  }

  const ingredientIds = ingredients.map((i) => new ObjectId(i));

  const existingIngredients = await db
    .collection(COLLECTION_INGREDIENTS)
    .find({ _id: { $in: ingredientIds } })
    .toArray();

  if (existingIngredients.length !== ingredients.length) {
    throw new Error("Uno o más ingredientes no existen");
  }

  await db.collection(COLLECTION_RECIPES).updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        name,
        description,
        ingredients: ingredientIds,
      },
    }
  );

  return {
    id,
    name,
    description,
    ingredients: ingredientIds,
    author: recipe.author,
  };
};

export const DeleteIngredient = async (id: string) => {
  const db = getDB();
  const ingredientId = new ObjectId(id);

  // 1️⃣ Borrar el ingrediente de la colección
  const result = await db
    .collection(COLLECTION_INGREDIENTS)
    .deleteOne({ _id: ingredientId });

  if (result.deletedCount === 0) {
    throw new Error("Ingrediente no encontrado");
  }

  
  await db
    .collection<Recipe>(COLLECTION_RECIPES)
    .updateMany(
      { ingredients: id },
      { $pull: { ingredients: id } }
    );

  return true;
};

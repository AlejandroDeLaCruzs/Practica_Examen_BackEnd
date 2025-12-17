import { getDB } from "../db/db";
import { COLLECTION_INGREDIENTS } from "../utils";

export const AddIngredient = async (name: string, id: string) => {
  const ingredient = await getDB()
    .collection(COLLECTION_INGREDIENTS)
    .findOne({ name });
  if (ingredient) throw new Error("Ingrediente ya existente");
  const ingredientAdd = await getDB()
    .collection(COLLECTION_INGREDIENTS)
    .insertOne({ name, author: id });
  return await getDB()
    .collection(COLLECTION_INGREDIENTS)
    .findOne({ _id: ingredientAdd.insertedId });
};

export const DeleteIngredient = async (id: string) => {};

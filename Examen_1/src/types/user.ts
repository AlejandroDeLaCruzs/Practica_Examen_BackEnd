import { ObjectId } from "mongodb";
import { Book } from "./books";

export type User = {
  _id: ObjectId;
  username: string;
  email: string;
  borrowHistory: string[];
};

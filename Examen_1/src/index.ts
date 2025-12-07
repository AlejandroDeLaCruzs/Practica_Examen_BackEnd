import { ApolloServer } from "apollo-server";
import { typeDefs } from "./graphql/schema";
import { resolvers } from "./graphql/resolvers";
import { connectToMongoDB } from "./db/db";
import { User } from "./types/user";
import { getUserFromToken } from "../src/auth"




const start = async () => {
  await connectToMongoDB();

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
      const token = req.headers.authorization || "";
      const user = token ? await getUserFromToken(token as string) : null;
      return { user };
    },
  });

  await server.listen({ port: 4000 });
  console.log("GQL sirviendo en el puerto 4000");
};



start().catch(err=>console.error(err));
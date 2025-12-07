import { ApolloServer } from "apollo-server";
import { typeDefs } from "./graphql/schema";
import { resolvers } from "./graphql/resolver";
import { connectToMongoDB } from "./db/db";



const start = async () => {
  await connectToMongoDB();

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.listen({ port: 4000 });
  console.log("GQL sirviendo en el puerto 4000");
};



start().catch(err=>console.error(err));
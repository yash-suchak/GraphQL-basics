import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

// 1. THE SCHEMA
// This is our "Menu". It defines the "shape" of data available.
// We are telling the world: "You can ask me for a 'greeting', and I will give you a String."
const typeDefs = `#graphql
type Query {
    greeting: String,
    myAge: Int
}
`;

// 2. THE RESOLVERS
// This is the "Chef". When someone orders a 'greeting', this function cooks it up.
const resolvers = {
    Query: {
        greeting: () => "Hello World!",
        myAge: () => "25"
    }
}

// 3. THE SERVER
// We combine the Menu (typeDefs) and the Chef (resolvers) into a Server.
const server = new ApolloServer({
    typeDefs,
    resolvers,
});

const {url} = await startStandaloneServer(server, {
    listen: {port: 4000}
})

console.log(`🚀  Server ready at: ${url}`)
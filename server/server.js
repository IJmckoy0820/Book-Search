const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const path = require('path');
const authMiddleware = require('./middleware/authMiddleware');
const { typeDefs, resolvers } = require('./schemas');
const db = require('./config/connection');

// const init = require('./seeder/seeder.js')
const PORT = process.env.PORT || 3001;
const app = express();
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Create a new instance of an Apollo server with the GraphQL schema
const startApolloServer = async () => {
  await server.start();

  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  app.use('/graphql', expressMiddleware(server, {
    context: authMiddleware.protect
  }));

  if (process.env.NODE_ENV === 'production') {
    console.log("Running in production mode")
    // In production, serve the React app from the dist/ directory
    app.use(express.static(path.join(__dirname, './dist')));
  }

  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
    });
  });
};

// Call the async function to start the server
  startApolloServer();

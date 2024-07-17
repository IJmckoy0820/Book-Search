const { Book,User } = require('../models');
const bcrypt = require('bcrypt');
const { configDotenv } = require('dotenv');
const jwt = require('jsonwebtoken')
const { GraphQLError } = require('graphql');
const AuthenticationError = new GraphQLError('Could not authenticate user.', {
  extensions: {
    code: 'UNAUTHENTICATED',
  },
})

configDotenv();


const resolvers = {
    Query: {
      // Resolver for getting the current user
      me: async (_, __, { dataSources }) => {
        // Your logic to get the authenticated user
        const user = await User.findOne({ _id: context.user._id });
        if (!user) {
          throw new AuthenticationError();
        }
        return user;    

      },
    },
    Mutation: {
      createUser: async (_, { username, email, password }, { dataSources }) => {
        // todo:logic to create a user
        const user = await User.create({ username, email, password });
        if (!user) {
          throw new AuthenticationError();
        }
        return user;

      },
      login: async (_, { email, password }, { dataSources }) => {
        const user = await User.findOne({ email });
        if (!user) {
          throw new AuthenticationError();
        }
  
        const correctPassword = await bcrypt.compare(password, user.password);
        if (!correctPassword) {
          throw new AuthenticationError();
        }
  
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
        return { token, user };
      },
  
      saveBook: async (_, { bookData }, { dataSources, user }) => {
        if (!user) throw new AuthenticationError();
  
        const updatedUser = await User.findByIdAndUpdate(
          user._id,
          { $addToSet: { savedBooks: bookData } },
          { new: true }
        );
        if (!updatedUser) {
          throw new Error('Could not save book.');
        }
        return updatedUser;
      },
  
      deleteBook: async (_, { bookId }, { dataSources, user }) => {
        if (!user) throw new AuthenticationError();
  
        const updatedUser = await User.findByIdAndUpdate(
          user._id,
          { $pull: { savedBooks: { bookId } } },
          { new: true }
        );
        if (!updatedUser) {
          throw new Error('Could not delete book.');
        }
        return updatedUser;
      },
    },
  };
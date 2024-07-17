const { Book, User } = require('../models');
const bcrypt = require('bcrypt');
const { config } = require('dotenv'); // Corrected function name
const jwt = require('jsonwebtoken');
const { GraphQLError } = require('graphql');

config(); // Correctly initialize dotenv

const AuthenticationError = new GraphQLError('Could not authenticate user.', {
  extensions: {
    code: 'UNAUTHENTICATED',
  },
});

const resolvers = {
  Query: {
    me: async (_, __, { user }) => { // Corrected to include context as a destructured parameter
      const foundUser = await User.findOne({ _id: user._id });
      if (!foundUser) {
        throw new AuthenticationError();
      }
      return foundUser;
    },
  },
  Mutation: {
    createUser: async (_, { username, email, password }) => {
      const hashedPassword = await bcrypt.hash(password, 10); // Hashing password
      const user = await User.create({ username, email, password: hashedPassword });
      if (!user) {
        throw new AuthenticationError();
      }
      return user;
    },
    login: async (_, { email, password }) => {
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
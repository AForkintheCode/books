const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    users: async (parent, args, context) => {
      return User.find({});
    },
    user: async (parent, {userId}) => {
      return User.findOne({ _id: userId });
    },
    me: async (parent, args, context) => {
      if (context.user) {
        return User.findOne({_id: context.user._id});
      }
      throw new AuthenticationError('You need to be logged in!');
    }
  },

  Mutation: {
    createUser: async (parent, args) => {
      const user = await User.create({ username, email, password});
      const token = signToken(user);

      return user;
    },
    saveBook: async (parent, { userId, book }) => {
      return User.findOneAndUpdate(
        {_id: userId },
        {
          $addToSet: { books: book },
        },
        {
          new: true,
          runValidators: true,
        }
      );
    },
    deleteBook: async (parent, { userId, book }) => {
      return User.findOneAndUpdate(
        {_id: userId },
        {$pul: { books: book } },
        { new: true }
        );      
    },
    login: async (parent, {email, password}) => {
      const user = await User.findOne({ email });
      
      if (!user) {
        throw new AuthenticationError('No user with this email')
      }
      const correctPw = await User.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError('Incorrect password!');
      }

      const token = signToken(user);
      return { token, user };
    },

    }
 }

module.exports = resolvers;

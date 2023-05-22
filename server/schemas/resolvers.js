const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');


const resolvers = {
  Query: {
    me: async (parent, args, context) => {
        if (context.user) {
            const userData = await User.findOne({_id:context.user._id}).select('-__v -password').populate('savedBooks')

            return userData;
        }
        throw new AuthenticationError('Not logged in');
    },
  },

  Mutation: {
    addUser: async (parent, { name, email, password }) => {
      const user = await User.create({ name, email, password });
      const token = signToken(user);

      return { token, user };
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError('No user with this email found!');
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError('Incorrect password!');
      }

      const token = signToken(user);
      return { token, user };
    },

    saveBook: async (parent, { bookData }, context) => {
      if (context.user) {
          const updatedUser = await User.findOneAndUpdate(
              { _id: context.user._id },
              { $addToSet: { savedBooks: bookData }},
              { new: true },
          ).populate('savedBooks');
          return updatedUser;
      }
      throw new AuthenticationError("Must be logged in.");
  },
    removeBook: async (parent, { userId, book }) => {
      return User.findOneAndUpdate(
        { _id: userId },
        { $pull: { savedBooks : book } },
        { new: true }
      );
    },
  },
};

module.exports = resolvers;

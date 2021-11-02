const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    me: async (parent, { username }) => {
      const foundUser = await User.findOne(username)
      if (!foundUser) {
        throw new AuthenticationError('Cannot find a user with this id!');
      }
      return foundUser;
    }
  },

  Mutation: {
    createUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);
      return{ token, user };
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) {
        throw new AuthenticationError("Can't find this user" )
      }
      const correctPw = await user.isCorrectPassword(password);
  
      if (!correctPw) {
        throw new AuthenticationError('Wrong password!')
      }
      const token = signToken(user);
      return { token, user };
    },
    saveBook: async (parent, { authors, description, title, bookId, image, userId }) => {
        try {
          const updatedUser = await User.findOneAndUpdate(
            { _id: userId },
            { $addToSet: { savedBooks: {authors, description, title, bookId, image} } },
            { new: true, runValidators: true }
          );
          return updatedUser;
        } catch (err) {
          console.log(err);
          return;
        }
    },
    removeBook: async (parent, { user, params }) => {
      const updatedUser = await User.findOneAndUpdate(
        { _id: user._id },
        { $pull: { savedBooks: { bookId: params.bookId } } },
        { new: true }
      );
      if (!updatedUser) {
        return res.status(404).json({ message: "Couldn't find user with this id!" });
      }
      return updatedUser;
    },
  },
};

module.exports = resolvers;

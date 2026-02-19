const {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLFloat,
  GraphQLList,
  GraphQLID,
} = require('graphql');
const Menu = require('../models/Menu');
const MenuItemType = require('./MenuItemType'); // 

const MenuType = new GraphQLObjectType({
  name: 'Menu',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    items: {
      type: new GraphQLList(MenuItemType),
      // Optional resolve if .populate() already done in query
      resolve(parent) {
        return parent.items;
      },
    },
  }),
});

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    menus: {
      type: new GraphQLList(MenuType),
      resolve() {
        return Menu.find().populate({
          path: 'items',
          select: '_id name price description image category isAvailable',
        });
      },
    },
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
});

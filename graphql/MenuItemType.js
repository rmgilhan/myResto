// graphql/types/MenuItemType.js or simply MenuItemType.js
const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLFloat,
  GraphQLBoolean,
} = require('graphql');

const MenuItemType = new GraphQLObjectType({
  name: 'MenuItem',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    price: { type: GraphQLFloat },
    category: { type: GraphQLString },
    isAvailable: { type: GraphQLBoolean },
    image: { type: GraphQLString },
  }),
});

module.exports = MenuItemType;

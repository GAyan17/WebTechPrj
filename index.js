import { ApolloServer, PubSub } from 'apollo-server';
import { connect } from 'mongoose';

import typeDefs from './graphql/typeDefs'
import resolvers from ('./graphql/resolvers');
import { MONGODB } from './config.js';

const pubsub = new PubSub();

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({ req, pubsub })
});

connect(MONGODB, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('MongoDB Connected');
        return server.listen({ port: 5000 })
    }).then(res => {
        console.log(`Server running at ${res.url}`);
    });

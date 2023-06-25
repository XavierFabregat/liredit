import { MikroORM } from "@mikro-orm/core";
import Express from "express";
import { ApolloServer } from "apollo-server-express";
import { __prod__ } from "./constants";
import mikroOrmConfig from "./mikro-orm.config";
import { buildSchema } from "type-graphql";
import { PostResolver } from "./resolvers/hello";

const main = async () => {
    const orm = await MikroORM.init(mikroOrmConfig);

    orm.getMigrator().up();

    const app = Express();

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [
                PostResolver
            ],
            validate: false
        })
    });

    await apolloServer.start();

    apolloServer.applyMiddleware({ app });

    app.listen(4000, () => {
        console.log('server started on http://localhost:4000');
    });
    
};

main().catch(err => {
    console.error(err);
});

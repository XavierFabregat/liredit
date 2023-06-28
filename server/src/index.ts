import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import Express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { createClient } from "redis";
import session from "express-session";
import cors from "cors";
import { COOKIE_NAME, __prod__ } from "./constants";
import mikroOrmConfig from "./mikro-orm.config";
import { HelloResolver, PostResolver, UserResolver } from "./resolvers";
import { MyContext } from "./types";
import RedisStore from "connect-redis";

declare module "express-session" {
  interface Session {
    userId: number;
  }
}

const main = async () => {
  const orm = await MikroORM.init(mikroOrmConfig);

  orm.getMigrator().up();

  const app = Express();

  const redisClient = createClient();

  redisClient
    .connect()
    .then(() => console.log("redis connected"))
    .catch((err) => console.log("redis connection error: ", err));

  let redisStore = new RedisStore({
    client: redisClient,
    disableTouch: true,
  });

  app.use(
    cors({
      origin: ["https://studio.apollographql.com", "http://localhost:3000"],
      credentials: true,
    })
  );

  console.log(process.env.APOLLO, "<== process.env.APOLLO");

  app.use(
    session({
      name: COOKIE_NAME,
      store: redisStore,
      secret: "pisenpfnewpfnpwfniwefwnpf`weofwoew`fnwefwef",
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true,
        sameSite: process.env.APOLLO ? "lax" : "lax", // csrf => protect from csrf, why lax? https://owasp.org/www-community/SameSite
        secure: process.env.APOLLO ? false : __prod__, // cookie only works in https
      },
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }): MyContext =>
      <MyContext>{ em: orm.em.fork(), req, res },
  });

  await apolloServer.start();

  apolloServer.applyMiddleware({ app, cors: false });

  app.listen(4000, () => {
    console.log("server started on http://localhost:4000");
  });
};

main().catch((err) => {
  console.error(err);
});

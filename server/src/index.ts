import "reflect-metadata";
import { ApolloServer } from "apollo-server-express";
import RedisStore from "connect-redis";
import cors from "cors";
import Express from "express";
import session from "express-session";
import Redis from "ioredis";
import { buildSchema } from "type-graphql";
import "./loadEnv";
import { COOKIE_NAME, __prod__ } from "./constants";
import { HelloResolver, PostResolver, UserResolver } from "./resolvers";
import { DataSource } from "typeorm";
import { Post, User } from "./entities";

declare module "express-session" {
  interface Session {
    userId: number;
  }
}

const main = async () => {
  const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    database: "liredit",
    password: "12345",
    entities: [User, Post],
    synchronize: true,
    logging: !__prod__,
  });

  AppDataSource.initialize()
    .then(() => {
      console.log("AppDataSource is connected");
    })
    .catch((err) => {
      console.log(err);
    });

  const app = Express();

  const redisClient = new Redis();

  redisClient.on("connect", () => {
    console.log("Redis client connected");
  });

  redisClient.on("error", (err) => {
    console.log("Something went wrong " + err);
  });

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
    context: ({ req, res }) => ({
      req,
      res,
      redis: redisClient,
    }),
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

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
import { AppDataSource } from "./dataSource";

declare module "express-session" {
  interface Session {
    userId: number;
  }
}

const { FLY, REDIS_URL } = process.env;

console.log(FLY, "<== FLY");
console.log(REDIS_URL, "<== REDIS_URL");

const main = async () => {
  await AppDataSource.initialize()
    .then(() => {
      console.log("AppDataSource is connected");
    })
    .catch((err) => {
      console.log(err);
    });

  await AppDataSource.runMigrations().then((res) => {
    console.log("AppDataSource is migrated with result: ", res);
  });
  const app = Express();

  const redisClient = new Redis(FLY ? REDIS_URL! : "", {
    family: 6,
  });

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
      origin: [
        "https://studio.apollographql.com",
        "http://localhost:3000",
        "https://liredit-swart.vercel.app",
      ],
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

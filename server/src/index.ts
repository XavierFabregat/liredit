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
import {
  HelloResolver,
  PostResolver,
  UpdootResolver,
  UserResolver,
} from "./resolvers";
import { AppDataSource } from "./dataSource";
import { logHeaders } from "./middleware/seeResponse";

declare module "express-session" {
  interface Session {
    userId: number;
  }
}

const { FLY, REDIS_URL, PORT, HOST } = process.env;

const main = async () => {
  await AppDataSource.initialize()
    .then(() => {
      console.log("AppDataSource is connected");
    })
    .catch((err) => {
      console.log(err);
    });

  if (!__prod__) {
    await AppDataSource.runMigrations().then((res) => {
      console.log("AppDataSource is migrated with result: ", res);
    });
  }

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

  app.use(logHeaders);

  app.use(
    session({
      name: COOKIE_NAME,
      store: redisStore,
      secret: process.env.SESSION_SECRET!,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true, // cookie only works in http
        domain: __prod__ ? "liredit-server.fly.dev" : undefined,
        sameSite: __prod__ ? "none" : "lax", // csrf => protect from csrf, why lax? https://owasp.org/www-community/SameSite
        secure: __prod__, // cookie only works in https
      },
    })
  );

  app.enable("trust proxy");

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver, UpdootResolver],
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

  app.listen(PORT || 4000, () => {
    console.log(
      `server started on http://${HOST || "localhost"}:${PORT || 4000}`
    );
  });
};

main().catch((err) => {
  console.error(err);
});

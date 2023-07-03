"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const apollo_server_express_1 = require("apollo-server-express");
const connect_redis_1 = __importDefault(require("connect-redis"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const ioredis_1 = __importDefault(require("ioredis"));
const type_graphql_1 = require("type-graphql");
require("./loadEnv");
const constants_1 = require("./constants");
const resolvers_1 = require("./resolvers");
const dataSource_1 = require("./dataSource");
const seeResponse_1 = require("./middleware/seeResponse");
const { FLY, REDIS_URL, PORT, HOST } = process.env;
const main = async () => {
    await dataSource_1.AppDataSource.initialize()
        .then(() => {
        console.log("AppDataSource is connected");
    })
        .catch((err) => {
        console.log(err);
    });
    if (!constants_1.__prod__) {
        await dataSource_1.AppDataSource.runMigrations().then((res) => {
            console.log("AppDataSource is migrated with result: ", res);
        });
    }
    const app = (0, express_1.default)();
    const redisClient = new ioredis_1.default(FLY ? REDIS_URL : "", {
        family: 6,
    });
    redisClient.on("connect", () => {
        console.log("Redis client connected");
    });
    redisClient.on("error", (err) => {
        console.log("Something went wrong " + err);
    });
    let redisStore = new connect_redis_1.default({
        client: redisClient,
        disableTouch: true,
    });
    app.use((0, cors_1.default)({
        origin: [
            "https://studio.apollographql.com",
            "http://localhost:3000",
            "https://liredit-swart.vercel.app",
        ],
        credentials: true,
    }));
    app.use(seeResponse_1.logHeaders);
    app.use((0, express_session_1.default)({
        name: constants_1.COOKIE_NAME,
        store: redisStore,
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
            httpOnly: true,
            domain: constants_1.__prod__ ? "liredit-server.fly.dev" : undefined,
            sameSite: constants_1.__prod__ ? "none" : "lax",
            secure: constants_1.__prod__,
        },
    }));
    app.enable("trust proxy");
    const apolloServer = new apollo_server_express_1.ApolloServer({
        schema: await (0, type_graphql_1.buildSchema)({
            resolvers: [resolvers_1.HelloResolver, resolvers_1.PostResolver, resolvers_1.UserResolver, resolvers_1.UpdootResolver],
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
        console.log(`server started on http://${HOST || "localhost"}:${PORT || 4000}`);
    });
};
main().catch((err) => {
    console.error(err);
});
//# sourceMappingURL=index.js.map
import { User, Post } from "./entities";
import { __prod__ } from "./constants";
import { MikroORM } from "@mikro-orm/core";
import path from "path";

export default {
    migrations: {
        path: path.join(__dirname, './migrations'),
        pattern: /^[\w-]+\d+\.[tj]s$/,
    },
    entities: [Post, User],
    dbName: 'liredit',
    type: 'postgresql',
    debug: !__prod__,
    password: '12345',
} as Parameters<typeof MikroORM.init>[0];
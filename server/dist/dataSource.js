"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const constants_1 = require("./constants");
const entities_1 = require("./entities");
const path_1 = __importDefault(require("path"));
const { DB, ELEPHANTSQL_DB, ELEPHANTSQL_HOST, ELEPHANTSQL_PASSWORD, ELEPHANTSQL_PORT, ELEPHANTSQL_USER, } = process.env;
exports.AppDataSource = DB == "elephantSQL"
    ? new typeorm_1.DataSource({
        type: "postgres",
        host: ELEPHANTSQL_HOST,
        username: ELEPHANTSQL_USER,
        database: ELEPHANTSQL_DB,
        password: ELEPHANTSQL_PASSWORD,
        port: Number(ELEPHANTSQL_PORT),
        entities: [entities_1.User, entities_1.Post, entities_1.Updoot],
        synchronize: true,
        logging: !constants_1.__prod__,
        migrations: [path_1.default.join(__dirname, "./migration/*.js")],
    })
    : new typeorm_1.DataSource({
        type: "postgres",
        host: "localhost",
        port: 5432,
        username: "postgres",
        database: "liredit",
        password: "12345",
        entities: [entities_1.User, entities_1.Post, entities_1.Updoot],
        synchronize: true,
        logging: !constants_1.__prod__,
        migrations: [path_1.default.join(__dirname, "./migration/*.js")],
    });
//# sourceMappingURL=dataSource.js.map
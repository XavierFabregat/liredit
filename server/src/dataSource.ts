import { DataSource } from "typeorm";
import { __prod__ } from "./constants";
import { User, Post } from "./entities";
import path from "path";

const { DB,
  ELEPHANTSQL_DB,
  ELEPHANTSQL_HOST,
  ELEPHANTSQL_PASSWORD,
  ELEPHANTSQL_PORT,
  ELEPHANTSQL_USER,
} = process.env;

console.log(path.join(__dirname, "./migration/*.ts"));

console.log(
  DB,
  ELEPHANTSQL_DB,
  ELEPHANTSQL_HOST,
  ELEPHANTSQL_PASSWORD,
  ELEPHANTSQL_PORT,
  ELEPHANTSQL_USER,
  "<== process.env"
)

export const AppDataSource = DB=='elephantSQL' 
  ? new DataSource({
    type: "postgres",
    host: ELEPHANTSQL_HOST,
    username: ELEPHANTSQL_USER,
    database: ELEPHANTSQL_DB,
    password: ELEPHANTSQL_PASSWORD,
    port: Number(ELEPHANTSQL_PORT),
    entities: [User, Post],
    synchronize: true,
    logging: !__prod__,
    migrations: [path.join(__dirname, "./migration/*.js")],
  })
  :new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  database: "liredit",
  password: "12345",
  entities: [User, Post],
  synchronize: true,
  logging: !__prod__,
  migrations: [path.join(__dirname, "./migration/*.js")],
});

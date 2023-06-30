import { DataSource } from "typeorm";
import { __prod__ } from "./constants";
import { User, Post } from "./entities";
import path from "path";

console.log(path.join(__dirname, "./migration/*.ts"));

export const AppDataSource = new DataSource({
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

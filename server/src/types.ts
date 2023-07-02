import { Request, Response } from "express";
import { Redis } from "ioredis";

// This is a type definition for the context object that is passed to all resolvers.

export type MyContext = {
  req: Request;
  res: Response;
  redis: Redis;
};

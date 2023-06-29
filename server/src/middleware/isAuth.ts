import { User } from "../entities";
import { MyContext } from "../types";
import { MiddlewareFn } from "type-graphql";

export const isAuth: MiddlewareFn<MyContext> = async ({ context }, next) => {
  if (!context.req.session.userId) {
    throw new Error("not authenticated");
  }

  const user = await User.findOne({
    where: { id: context.req.session.userId },
  });

  if (!user) {
    throw new Error("user not found");
  }

  return next();
};

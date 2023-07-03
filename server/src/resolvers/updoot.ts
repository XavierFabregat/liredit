import { isAuth } from "../middleware/isAuth";
import { MyContext } from "../types";
import { Arg, Ctx, Int, Mutation, Resolver, UseMiddleware } from "type-graphql";
import { AppDataSource } from "../dataSource";
import { escape } from "sqlstring";

@Resolver()
export class UpdootResolver {
  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async vote(
    @Arg("postId", () => Int) _postId: number,
    @Arg("value", () => Int) _value: number,
    @Ctx() { req }: MyContext
  ) {
    const isUpdoot = _value !== -1;
    const value = isUpdoot ? 1 : -1;
    const { userId } = req.session;
    await AppDataSource.query(
      `
        START TRANSACTION;

        INSERT INTO updoot ("userId", "postId", value)
        VALUES (${escape(userId)}, ${escape(_postId)}, ${escape(value)});

        UPDATE post
        SET points = points + ${escape(value)}
        WHERE id = ${escape(_postId)};
        
        COMMIT;
      `
    );
    return true;
  }
}

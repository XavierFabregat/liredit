import { isAuth } from "../middleware/isAuth";
import { MyContext } from "../types";
import { Arg, Ctx, Int, Mutation, Resolver, UseMiddleware } from "type-graphql";
import { AppDataSource } from "../dataSource";
import { Updoot } from "../entities";

@Resolver()
export class UpdootResolver {
  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async vote(
    @Arg("postId", () => Int) _postId: number,
    @Arg("value", () => Int) _value: number,
    @Ctx() { req }: MyContext
  ) {
    const { userId } = req.session;
    const isUpdoot = _value !== -1;
    const value = isUpdoot ? 1 : -1;

    const updoot = await Updoot.findOne({ where: { postId: _postId, userId } });

    // the user has voted on the post before and they are changing their vote
    if (updoot && updoot.value !== value) {
      await AppDataSource.transaction(async (tm) => {
        await tm.query(
          `
          UPDATE updoot
          SET value = $1
          WHERE "postId" = $2 AND "userId" = $3;
        `,
          [value, _postId, userId]
        );

        await tm.query(
          `
          UPDATE post
          SET points = points + $1
          WHERE id = $2;
        `,
          [2 * value, _postId]
        );
      });
    } else if (updoot && updoot.value === value) {
      // the user has voted on the post before and they are undoing their vote
      await AppDataSource.transaction(async (tm) => {
        await tm.query(
          `
          DELETE FROM updoot
          WHERE "postId" = $1 AND "userId" = $2;
        `,
          [_postId, userId]
        );

        await tm.query(
          `
          UPDATE post
          SET points = points + $1
          WHERE id = $2;
        `,
          [-1 * value, _postId]
        );
      });
    } else {
      // the user has never voted on the post before
      await AppDataSource.transaction(async (tm) => {
        await tm.query(
          `
          INSERT INTO updoot ("userId", "postId", value)
          VALUES ($1, $2, $3);
        `,
          [userId, _postId, value]
        );

        await tm.query(
          `
          UPDATE post
          SET points = points + $1
          WHERE id = $2;
        `,
          [value, _postId]
        );
      });
    }
    return true;
  }
}

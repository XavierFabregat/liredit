import { Resolver, cacheExchange } from "@urql/exchange-graphcache";
import { Exchange, fetchExchange, stringifyVariables } from "urql";
import { pipe, tap } from "wonka";
import {
  LoginMutation,
  LogoutMutation,
  MeDocument,
  MeQuery,
  RegisterMutation,
  VoteMutationVariables,
} from "../generated/graphql";
import { betterUpdateQuery } from "./betterUpdateQuery";
import Router from "next/router";
import gql from "graphql-tag";
import { isServer } from "./isServer";

const errorExchange: Exchange =
  ({ forward }) =>
  (ops$) => {
    return pipe(
      forward(ops$),
      tap(({ error }) => {
        if (error) {
          if (error?.message.includes("not authenticated")) {
            Router.replace("/login");
          }
        }
      })
    );
  };

export const cursorPagination = (): Resolver => {
  return (_parent, fieldArgs, cache, info) => {
    const { parentKey: entityKey, fieldName } = info;

    const allFields = cache.inspectFields(entityKey);

    const fieldInfos = allFields.filter((info) => info.fieldName === fieldName);

    const size = fieldInfos.length;
    // return undefined if no data is in the cache
    if (size === 0) {
      return undefined;
    }

    const isItInTheCache = cache.resolve(
      cache.resolve(
        entityKey,
        `${fieldName}(${stringifyVariables(fieldArgs)})`
      ) as string,
      "posts"
    );

    info.partial = !isItInTheCache;

    const results: string[] = [];
    let hasMore = true;

    fieldInfos.forEach((fi) => {
      const key = cache.resolve(entityKey, fi.fieldKey) as string;

      const data = cache.resolve(key, "posts") as string[];
      const _hasMore = cache.resolve(key, "hasMore") as boolean;

      if (!_hasMore) {
        hasMore = _hasMore;
      }

      results.push(...data);
    });

    return {
      __typename: "PaginatedPosts",
      hasMore,
      posts: results,
    };
  };
};

const { NEXT_PUBLIC_FLY } = process.env;

console.log("FLY: ", NEXT_PUBLIC_FLY);

const url =
  process.env.NODE_ENV === "production"
    ? "https://liredit-server.fly.dev/graphql"
    : "http://localhost:4000/graphql";

console.log("URL: ", url);

export const createUrqlClient = (ssrExchange: any, ctx: any) => {
  let cookie = "";
  if (isServer()) {
    console.log("ctx: ", ctx);
    console.log("ctx.req: ", ctx?.req);
    console.log("headers: ", ctx?.req?.headers);
    console.log("cookie: ", ctx?.req?.headers?.cookie);
    cookie = ctx?.req?.headers?.cookie;
  }

  console.log("COOKIE: ", cookie);
  return {
    url,
    exchanges: [
      cacheExchange({
        keys: {
          PaginatedPosts: () => null,
        },
        resolvers: {
          Query: {
            posts: cursorPagination(),
          },
        },
        updates: {
          Mutation: {
            vote: (_result, args, cache, info) => {
              const { postId, value } = args as VoteMutationVariables;
              const data = cache.readFragment(
                gql`
                  fragment _ on Post {
                    id
                    points
                    voteStatus
                  }
                `,
                { id: postId } as any
              );
              console.log("data in vote invalidation: ", data);
              if (data) {
                let newPoints;
                let newVoteStatus;
                if (data.voteStatus === args.value) {
                  // if the user has already voted with the same value, then we want to undo the vote
                  newPoints = (data.points as number) - value;
                  newVoteStatus = null;
                } else if (data.voteStatus === -(args.value as number)) {
                  // if the user has already voted with the opposite value, then we want to change the vote
                  newPoints = (data.points as number) + 2 * value;
                  newVoteStatus = value;
                } else {
                  // if the user has not voted yet, then we want to add the vote
                  newPoints = (data.points as number) + value;
                  newVoteStatus = value;
                }
                cache.writeFragment(
                  gql`
                    fragment __ on Post {
                      points
                      voteStatus
                    }
                  `,
                  {
                    id: postId,
                    points: newPoints,
                    voteStatus: newVoteStatus,
                  } as any
                );
              }
            },
            createPost: (_result, args, cache, info) => {
              const allFields = cache.inspectFields("Query");
              console.log("allFields: ", allFields);
              const fieldInfos = allFields.filter(
                (info) => info.fieldName === "posts"
              );
              console.log("fieldInfos: ", fieldInfos);
              fieldInfos.forEach((fi) => {
                cache.invalidate("Query", "posts", fi.arguments || {});
              });
            },
            logout: (_result, args, cache, info) => {
              betterUpdateQuery<LogoutMutation, MeQuery>(
                cache,
                { query: MeDocument },
                _result,
                () => ({ me: null })
              );
            },
            login: (_result, args, cache, info) => {
              betterUpdateQuery<LoginMutation, MeQuery>(
                cache,
                { query: MeDocument },
                _result,
                (result, query) => {
                  if (result.login.errors) {
                    return query;
                  } else {
                    return {
                      me: result.login.user,
                    };
                  }
                }
              );
            },
            register: (_result, args, cache, info) => {
              betterUpdateQuery<RegisterMutation, MeQuery>(
                cache,
                { query: MeDocument },
                _result,
                (result, query) => {
                  if (result.register.errors) {
                    return query;
                  } else {
                    return {
                      me: result.register.user,
                    };
                  }
                }
              );
            },
          },
        },
      }),
      errorExchange,
      ssrExchange,
      fetchExchange,
    ],
    fetchOptions: () => ({
      credentials: "include" as const,
      headers: cookie
        ? {
            cookie,
          }
        : undefined,
    }),
  };
};

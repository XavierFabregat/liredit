"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdootResolver = void 0;
const isAuth_1 = require("../middleware/isAuth");
const type_graphql_1 = require("type-graphql");
const dataSource_1 = require("../dataSource");
const entities_1 = require("../entities");
let UpdootResolver = exports.UpdootResolver = class UpdootResolver {
    async vote(_postId, _value, { req }) {
        const { userId } = req.session;
        const isUpdoot = _value !== -1;
        const value = isUpdoot ? 1 : -1;
        const updoot = await entities_1.Updoot.findOne({ where: { postId: _postId, userId } });
        if (updoot && updoot.value !== value) {
            await dataSource_1.AppDataSource.transaction(async (tm) => {
                await tm.query(`
          UPDATE updoot
          SET value = $1
          WHERE "postId" = $2 AND "userId" = $3;
        `, [value, _postId, userId]);
                await tm.query(`
          UPDATE post
          SET points = points + $1
          WHERE id = $2;
        `, [2 * value, _postId]);
            });
        }
        else if (updoot && updoot.value === value) {
            await dataSource_1.AppDataSource.transaction(async (tm) => {
                await tm.query(`
          DELETE FROM updoot
          WHERE "postId" = $1 AND "userId" = $2;
        `, [_postId, userId]);
                await tm.query(`
          UPDATE post
          SET points = points + $1
          WHERE id = $2;
        `, [-1 * value, _postId]);
            });
        }
        else {
            await dataSource_1.AppDataSource.transaction(async (tm) => {
                await tm.query(`
          INSERT INTO updoot ("userId", "postId", value)
          VALUES ($1, $2, $3);
        `, [userId, _postId, value]);
                await tm.query(`
          UPDATE post
          SET points = points + $1
          WHERE id = $2;
        `, [value, _postId]);
            });
        }
        return true;
    }
};
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Arg)("postId", () => type_graphql_1.Int)),
    __param(1, (0, type_graphql_1.Arg)("value", () => type_graphql_1.Int)),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", Promise)
], UpdootResolver.prototype, "vote", null);
exports.UpdootResolver = UpdootResolver = __decorate([
    (0, type_graphql_1.Resolver)()
], UpdootResolver);
//# sourceMappingURL=updoot.js.map
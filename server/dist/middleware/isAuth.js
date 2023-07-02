"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuth = void 0;
const entities_1 = require("../entities");
const isAuth = async ({ context }, next) => {
    if (!context.req.session.userId) {
        throw new Error("not authenticated");
    }
    const user = await entities_1.User.findOne({
        where: { id: context.req.session.userId },
    });
    if (!user) {
        throw new Error("user not found");
    }
    return next();
};
exports.isAuth = isAuth;
//# sourceMappingURL=isAuth.js.map
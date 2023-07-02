"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logHeaders = void 0;
function logHeaders(_req, res, next) {
    const originalSend = res.send;
    res.send = function (body) {
        console.log("Response Headers:", res.getHeaders());
        return originalSend.call(this, body);
    };
    next();
}
exports.logHeaders = logHeaders;
//# sourceMappingURL=seeResponse.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PointColliderProjection = void 0;
const math_1 = require("../math");
/**
 * The intersection between a ray and a collider.
 */
class PointColliderProjection {
    constructor(colliderHandle, point, isInside) {
        this.colliderHandle = colliderHandle;
        this.point = point;
        this.isInside = isInside;
    }
    static fromRaw(raw) {
        if (!raw)
            return null;
        const result = new PointColliderProjection(raw.colliderHandle(), math_1.VectorOps.fromRaw(raw.point()), raw.isInside());
        raw.free();
        return result;
    }
}
exports.PointColliderProjection = PointColliderProjection;
//# sourceMappingURL=point.js.map
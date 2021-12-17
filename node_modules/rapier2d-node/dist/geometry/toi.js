"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShapeColliderTOI = void 0;
const math_1 = require("../math");
/**
 * The intersection between a ray and a collider.
 */
class ShapeColliderTOI {
    constructor(colliderHandle, toi, witness1, witness2, normal1, normal2) {
        this.colliderHandle = colliderHandle;
        this.toi = toi;
        this.witness1 = witness1;
        this.witness2 = witness2;
        this.normal1 = normal1;
        this.normal2 = normal2;
    }
    static fromRaw(raw) {
        if (!raw)
            return null;
        const result = new ShapeColliderTOI(raw.colliderHandle(), raw.toi(), math_1.VectorOps.fromRaw(raw.witness1()), math_1.VectorOps.fromRaw(raw.witness2()), math_1.VectorOps.fromRaw(raw.normal1()), math_1.VectorOps.fromRaw(raw.normal2()));
        raw.free();
        return result;
    }
}
exports.ShapeColliderTOI = ShapeColliderTOI;
//# sourceMappingURL=toi.js.map
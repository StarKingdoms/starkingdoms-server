"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BroadPhase = void 0;
const raw_1 = require("../raw");
/**
 * The broad-phase used for coarse collision-detection.
 *
 * To avoid leaking WASM resources, this MUST be freed manually with `broadPhase.free()`
 * once you are done using it.
 */
class BroadPhase {
    constructor(raw) {
        this.raw = raw || new raw_1.RawBroadPhase();
    }
    /**
     * Release the WASM memory occupied by this broad-phase.
     */
    free() {
        this.raw.free();
        this.raw = undefined;
    }
}
exports.BroadPhase = BroadPhase;
//# sourceMappingURL=broad_phase.js.map
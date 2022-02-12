"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhysicsPipeline = void 0;
const raw_1 = require("../raw");
const math_1 = require("../math");
class PhysicsPipeline {
    constructor(raw) {
        this.raw = raw || new raw_1.RawPhysicsPipeline();
    }
    free() {
        this.raw.free();
        this.raw = undefined;
    }
    step(gravity, integrationParameters, islands, broadPhase, narrowPhase, bodies, colliders, joints, ccdSolver, eventQueue, hooks) {
        let rawG = math_1.VectorOps.intoRaw(gravity);
        if (!!eventQueue) {
            this.raw.stepWithEvents(rawG, integrationParameters.raw, islands.raw, broadPhase.raw, narrowPhase.raw, bodies.raw, colliders.raw, joints.raw, ccdSolver.raw, eventQueue.raw, hooks, !!hooks ? hooks.filterContactPair : null, !!hooks ? hooks.filterIntersectionPair : null);
        }
        else {
            this.raw.step(rawG, integrationParameters.raw, islands.raw, broadPhase.raw, narrowPhase.raw, bodies.raw, colliders.raw, joints.raw, ccdSolver.raw);
        }
        rawG.free();
    }
}
exports.PhysicsPipeline = PhysicsPipeline;
//# sourceMappingURL=physics_pipeline.js.map
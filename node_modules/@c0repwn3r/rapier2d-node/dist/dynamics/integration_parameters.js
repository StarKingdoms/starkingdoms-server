"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationParameters = void 0;
const raw_1 = require("../raw");
class IntegrationParameters {
    constructor(raw) {
        this.raw = raw || new raw_1.RawIntegrationParameters();
    }
    /**
     * Free the WASM memory used by these integration parameters.
     */
    free() {
        this.raw.free();
        this.raw = undefined;
    }
    /**
     * The timestep length (default: `1.0 / 60.0`)
     */
    get dt() {
        return this.raw.dt;
    }
    /**
     * The Error Reduction Parameter in `[0, 1]` is the proportion of
     * the positional error to be corrected at each time step (default: `0.2`).
     */
    get erp() {
        return this.raw.erp;
    }
    /**
     * The Error Reduction Parameter for joints in `[0, 1]` is the proportion of
     * the positional error to be corrected at each time step (default: `0.2`).
     */
    get jointErp() {
        return this.raw.jointErp;
    }
    /**
     * Each cached impulse are multiplied by this coefficient in `[0, 1]`
     * when they are re-used to initialize the solver (default `1.0`).
     */
    get warmstartCoeff() {
        return this.raw.warmstartCoeff;
    }
    /**
     * Amount of penetration the engine wont attempt to correct (default: `0.001m`).
     */
    get allowedLinearError() {
        return this.raw.allowedLinearError;
    }
    /**
     * The maximal distance separating two objects that will generate predictive contacts (default: `0.002`).
     */
    get predictionDistance() {
        return this.raw.predictionDistance;
    }
    /**
     * Amount of angular drift of joint limits the engine wont
     * attempt to correct (default: `0.001rad`).
     */
    get allowedAngularError() {
        return this.raw.allowedAngularError;
    }
    /**
     * Maximum linear correction during one step of the non-linear position solver (default: `0.2`).
     */
    get maxLinearCorrection() {
        return this.raw.maxLinearCorrection;
    }
    /**
     * Maximum angular correction during one step of the non-linear position solver (default: `0.2`).
     */
    get maxAngularCorrection() {
        return this.raw.maxAngularCorrection;
    }
    /**
     * Maximum number of iterations performed by the velocity constraints solver (default: `4`).
     */
    get maxVelocityIterations() {
        return this.raw.maxVelocityIterations;
    }
    /**
     * Maximum number of iterations performed by the position-based constraints solver (default: `1`).
     */
    get maxPositionIterations() {
        return this.raw.maxPositionIterations;
    }
    /**
     * Minimum number of dynamic bodies in each active island (default: `128`).
     */
    get minIslandSize() {
        return this.raw.minIslandSize;
    }
    /**
     * Maximum number of substeps performed by the  solver (default: `1`).
     */
    get maxCcdSubsteps() {
        return this.raw.maxCcdSubsteps;
    }
    set dt(value) {
        this.raw.dt = value;
    }
    set erp(value) {
        this.raw.erp = value;
    }
    set jointErp(value) {
        this.raw.jointErp = value;
    }
    set warmstartCoeff(value) {
        this.raw.warmstartCoeff = value;
    }
    set allowedLinearError(value) {
        this.raw.allowedLinearError = value;
    }
    set predictionDistance(value) {
        this.raw.predictionDistance = value;
    }
    set allowedAngularError(value) {
        this.raw.allowedAngularError = value;
    }
    set maxLinearCorrection(value) {
        this.raw.maxLinearCorrection = value;
    }
    set maxAngularCorrection(value) {
        this.raw.maxAngularCorrection = value;
    }
    set maxVelocityIterations(value) {
        this.raw.maxVelocityIterations = value;
    }
    set maxPositionIterations(value) {
        this.raw.maxPositionIterations = value;
    }
    set minIslandSize(value) {
        this.raw.minIslandSize = value;
    }
    set maxCcdSubsteps(value) {
        this.raw.maxCcdSubsteps = value;
    }
}
exports.IntegrationParameters = IntegrationParameters;
//# sourceMappingURL=integration_parameters.js.map
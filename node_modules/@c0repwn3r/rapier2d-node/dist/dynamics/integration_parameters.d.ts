import { RawIntegrationParameters } from "../raw";
export declare class IntegrationParameters {
    raw: RawIntegrationParameters;
    constructor(raw?: RawIntegrationParameters);
    /**
     * Free the WASM memory used by these integration parameters.
     */
    free(): void;
    /**
     * The timestep length (default: `1.0 / 60.0`)
     */
    get dt(): number;
    /**
     * The Error Reduction Parameter in `[0, 1]` is the proportion of
     * the positional error to be corrected at each time step (default: `0.2`).
     */
    get erp(): number;
    /**
     * The Error Reduction Parameter for joints in `[0, 1]` is the proportion of
     * the positional error to be corrected at each time step (default: `0.2`).
     */
    get jointErp(): number;
    /**
     * Each cached impulse are multiplied by this coefficient in `[0, 1]`
     * when they are re-used to initialize the solver (default `1.0`).
     */
    get warmstartCoeff(): number;
    /**
     * Amount of penetration the engine wont attempt to correct (default: `0.001m`).
     */
    get allowedLinearError(): number;
    /**
     * The maximal distance separating two objects that will generate predictive contacts (default: `0.002`).
     */
    get predictionDistance(): number;
    /**
     * Amount of angular drift of joint limits the engine wont
     * attempt to correct (default: `0.001rad`).
     */
    get allowedAngularError(): number;
    /**
     * Maximum linear correction during one step of the non-linear position solver (default: `0.2`).
     */
    get maxLinearCorrection(): number;
    /**
     * Maximum angular correction during one step of the non-linear position solver (default: `0.2`).
     */
    get maxAngularCorrection(): number;
    /**
     * Maximum number of iterations performed by the velocity constraints solver (default: `4`).
     */
    get maxVelocityIterations(): number;
    /**
     * Maximum number of iterations performed by the position-based constraints solver (default: `1`).
     */
    get maxPositionIterations(): number;
    /**
     * Minimum number of dynamic bodies in each active island (default: `128`).
     */
    get minIslandSize(): number;
    /**
     * Maximum number of substeps performed by the  solver (default: `1`).
     */
    get maxCcdSubsteps(): number;
    set dt(value: number);
    set erp(value: number);
    set jointErp(value: number);
    set warmstartCoeff(value: number);
    set allowedLinearError(value: number);
    set predictionDistance(value: number);
    set allowedAngularError(value: number);
    set maxLinearCorrection(value: number);
    set maxAngularCorrection(value: number);
    set maxVelocityIterations(value: number);
    set maxPositionIterations(value: number);
    set minIslandSize(value: number);
    set maxCcdSubsteps(value: number);
}

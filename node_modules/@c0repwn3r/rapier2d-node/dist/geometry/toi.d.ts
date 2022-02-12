import { ColliderHandle } from "./collider";
import { Vector } from "../math";
import { RawShapeColliderTOI } from "../raw";
/**
 * The intersection between a ray and a collider.
 */
export declare class ShapeColliderTOI {
    /**
     * The handle of the collider hit by the ray.
     */
    colliderHandle: ColliderHandle;
    /**
     * The time of impact of the two shapes.
     */
    toi: number;
    /**
     * The local-space contact point on the first shape, at
     * the time of impact.
     */
    witness1: Vector;
    /**
     * The local-space contact point on the second shape, at
     * the time of impact.
     */
    witness2: Vector;
    /**
     * The local-space normal on the first shape, at
     * the time of impact.
     */
    normal1: Vector;
    /**
     * The local-space normal on the second shape, at
     * the time of impact.
     */
    normal2: Vector;
    constructor(colliderHandle: ColliderHandle, toi: number, witness1: Vector, witness2: Vector, normal1: Vector, normal2: Vector);
    static fromRaw(raw: RawShapeColliderTOI): ShapeColliderTOI;
}

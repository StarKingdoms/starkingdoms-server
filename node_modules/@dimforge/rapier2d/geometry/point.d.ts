import { ColliderHandle } from "./collider";
import { Vector } from "../math";
import { RawPointColliderProjection } from "../raw";
/**
 * The intersection between a ray and a collider.
 */
export declare class PointColliderProjection {
    /**
     * The handle of the collider hit by the ray.
     */
    colliderHandle: ColliderHandle;
    /**
     * The projection of the point on the collider.
     */
    point: Vector;
    /**
     * Is the point inside of the collider?
     */
    isInside: boolean;
    constructor(colliderHandle: ColliderHandle, point: Vector, isInside: boolean);
    static fromRaw(raw: RawPointColliderProjection): PointColliderProjection;
}

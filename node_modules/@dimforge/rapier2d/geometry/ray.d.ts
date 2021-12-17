import { Vector } from "../math";
import { RawRayColliderIntersection, RawRayColliderToi } from "../raw";
import { ColliderHandle } from "./collider";
/**
 * A ray. This is a directed half-line.
 */
export declare class Ray {
    /**
     * The starting point of the ray.
     */
    origin: Vector;
    /**
     * The direction of propagation of the ray.
     */
    dir: Vector;
    /**
     * Builds a ray from its origin and direction.
     *
     * @param origin - The ray's starting point.
     * @param dir - The ray's direction of propagation.
     */
    constructor(origin: Vector, dir: Vector);
    pointAt(t: number): Vector;
}
/**
 * The intersection between a ray and a collider.
 */
export declare class RayColliderIntersection {
    /**
     * The handle of the collider hit by the ray.
     */
    colliderHandle: ColliderHandle;
    /**
     * The time-of-impact of the ray with the collider.
     *
     * The hit point is obtained from the ray's origin and direction: `origin + dir * toi`.
     */
    toi: number;
    /**
     * The normal of the collider at the hit point.
     */
    normal: Vector;
    constructor(colliderHandle: ColliderHandle, toi: number, normal: Vector);
    static fromRaw(raw: RawRayColliderIntersection): RayColliderIntersection;
}
/**
 * The time of impact between a ray and a collider.
 */
export declare class RayColliderToi {
    /**
     * The handle of the collider hit by the ray.
     */
    colliderHandle: ColliderHandle;
    /**
     * The time-of-impact of the ray with the collider.
     *
     * The hit point is obtained from the ray's origin and direction: `origin + dir * toi`.
     */
    toi: number;
    constructor(colliderHandle: ColliderHandle, toi: number);
    static fromRaw(raw: RawRayColliderToi): RayColliderToi;
}

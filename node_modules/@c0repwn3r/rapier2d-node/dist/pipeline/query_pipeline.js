"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryPipeline = void 0;
const raw_1 = require("../raw");
const geometry_1 = require("../geometry");
const math_1 = require("../math");
/**
 * A pipeline for performing queries on all the colliders of a scene.
 *
 * To avoid leaking WASM resources, this MUST be freed manually with `queryPipeline.free()`
 * once you are done using it (and all the rigid-bodies it created).
 */
class QueryPipeline {
    constructor(raw) {
        this.raw = raw || new raw_1.RawQueryPipeline();
    }
    /**
     * Release the WASM memory occupied by this query pipeline.
     */
    free() {
        this.raw.free();
        this.raw = undefined;
    }
    /**
     * Updates the acceleration structure of the query pipeline.
     * @param bodies - The set of rigid-bodies taking part in this pipeline.
     * @param colliders - The set of colliders taking part in this pipeline.
     */
    update(islands, bodies, colliders) {
        this.raw.update(islands.raw, bodies.raw, colliders.raw);
    }
    /**
     * Find the closest intersection between a ray and a set of collider.
     *
     * @param colliders - The set of colliders taking part in this pipeline.
     * @param ray - The ray to cast.
     * @param maxToi - The maximum time-of-impact that can be reported by this cast. This effectively
     *   limits the length of the ray to `ray.dir.norm() * maxToi`.
     * @param solid - If `false` then the ray will attempt to hit the boundary of a shape, even if its
     *   origin already lies inside of a shape. In other terms, `true` implies that all shapes are plain,
     *   whereas `false` implies that all shapes are hollow for this ray-cast.
     * @param groups - Used to filter the colliders that can or cannot be hit by the ray.
     */
    castRay(colliders, ray, maxToi, solid, groups) {
        let rawOrig = math_1.VectorOps.intoRaw(ray.origin);
        let rawDir = math_1.VectorOps.intoRaw(ray.dir);
        let result = geometry_1.RayColliderToi.fromRaw(this.raw.castRay(colliders.raw, rawOrig, rawDir, maxToi, solid, groups));
        rawOrig.free();
        rawDir.free();
        return result;
    }
    /**
     * Find the closest intersection between a ray and a set of collider.
     *
     * This also computes the normal at the hit point.
     * @param colliders - The set of colliders taking part in this pipeline.
     * @param ray - The ray to cast.
     * @param maxToi - The maximum time-of-impact that can be reported by this cast. This effectively
     *   limits the length of the ray to `ray.dir.norm() * maxToi`.
     * @param solid - If `false` then the ray will attempt to hit the boundary of a shape, even if its
     *   origin already lies inside of a shape. In other terms, `true` implies that all shapes are plain,
     *   whereas `false` implies that all shapes are hollow for this ray-cast.
     * @param groups - Used to filter the colliders that can or cannot be hit by the ray.
     */
    castRayAndGetNormal(colliders, ray, maxToi, solid, groups) {
        let rawOrig = math_1.VectorOps.intoRaw(ray.origin);
        let rawDir = math_1.VectorOps.intoRaw(ray.dir);
        let result = geometry_1.RayColliderIntersection.fromRaw(this.raw.castRayAndGetNormal(colliders.raw, rawOrig, rawDir, maxToi, solid, groups));
        rawOrig.free();
        rawDir.free();
        return result;
    }
    /**
     * Cast a ray and collects all the intersections between a ray and the scene.
     *
     * @param colliders - The set of colliders taking part in this pipeline.
     * @param ray - The ray to cast.
     * @param maxToi - The maximum time-of-impact that can be reported by this cast. This effectively
     *   limits the length of the ray to `ray.dir.norm() * maxToi`.
     * @param solid - If `false` then the ray will attempt to hit the boundary of a shape, even if its
     *   origin already lies inside of a shape. In other terms, `true` implies that all shapes are plain,
     *   whereas `false` implies that all shapes are hollow for this ray-cast.
     * @param groups - Used to filter the colliders that can or cannot be hit by the ray.
     * @param callback - The callback called once per hit (in no particular order) between a ray and a collider.
     *   If this callback returns `false`, then the cast will stop and no further hits will be detected/reported.
     */
    intersectionsWithRay(colliders, ray, maxToi, solid, groups, callback) {
        let rawOrig = math_1.VectorOps.intoRaw(ray.origin);
        let rawDir = math_1.VectorOps.intoRaw(ray.dir);
        let rawCallback = (rawInter) => {
            return callback(geometry_1.RayColliderIntersection.fromRaw(rawInter));
        };
        this.raw.intersectionsWithRay(colliders.raw, rawOrig, rawDir, maxToi, solid, groups, rawCallback);
        rawOrig.free();
        rawDir.free();
    }
    /**
     * Gets the handle of up to one collider intersecting the given shape.
     *
     * @param colliders - The set of colliders taking part in this pipeline.
     * @param shapePos - The position of the shape used for the intersection test.
     * @param shapeRot - The orientation of the shape used for the intersection test.
     * @param shape - The shape used for the intersection test.
     * @param groups - The bit groups and filter associated to the ray, in order to only
     *   hit the colliders with collision groups compatible with the ray's group.
     */
    intersectionWithShape(colliders, shapePos, shapeRot, shape, groups) {
        let rawPos = math_1.VectorOps.intoRaw(shapePos);
        let rawRot = math_1.RotationOps.intoRaw(shapeRot);
        let rawShape = shape.intoRaw();
        let result = this.raw.intersectionWithShape(colliders.raw, rawPos, rawRot, rawShape, groups);
        rawPos.free();
        rawRot.free();
        rawShape.free();
        return result;
    }
    /**
     * Find the projection of a point on the closest collider.
     *
     * @param colliders - The set of colliders taking part in this pipeline.
     * @param point - The point to project.
     * @param solid - If this is set to `true` then the collider shapes are considered to
     *   be plain (if the point is located inside of a plain shape, its projection is the point
     *   itself). If it is set to `false` the collider shapes are considered to be hollow
     *   (if the point is located inside of an hollow shape, it is projected on the shape's
     *   boundary).
     * @param groups - The bit groups and filter associated to the point to project, in order to only
     *   project on colliders with collision groups compatible with the ray's group.
     */
    projectPoint(colliders, point, solid, groups) {
        let rawPoint = math_1.VectorOps.intoRaw(point);
        let result = geometry_1.PointColliderProjection.fromRaw(this.raw.projectPoint(colliders.raw, rawPoint, solid, groups));
        rawPoint.free();
        return result;
    }
    /**
     * Find all the colliders containing the given point.
     *
     * @param colliders - The set of colliders taking part in this pipeline.
     * @param point - The point used for the containment test.
     * @param groups - The bit groups and filter associated to the point to test, in order to only
     *   test on colliders with collision groups compatible with the ray's group.
     * @param callback - A function called with the handles of each collider with a shape
     *   containing the `point`.
     */
    intersectionsWithPoint(colliders, point, groups, callback) {
        let rawPoint = math_1.VectorOps.intoRaw(point);
        this.raw.intersectionsWithPoint(colliders.raw, rawPoint, groups, callback);
        rawPoint.free();
    }
    /**
     * Casts a shape at a constant linear velocity and retrieve the first collider it hits.
     * This is similar to ray-casting except that we are casting a whole shape instead of
     * just a point (the ray origin).
     *
     * @param colliders - The set of colliders taking part in this pipeline.
     * @param shapePos - The initial position of the shape to cast.
     * @param shapeRot - The initial rotation of the shape to cast.
     * @param shapeVel - The constant velocity of the shape to cast (i.e. the cast direction).
     * @param shape - The shape to cast.
     * @param maxToi - The maximum time-of-impact that can be reported by this cast. This effectively
     *   limits the distance traveled by the shape to `shapeVel.norm() * maxToi`.
     * @param groups - The bit groups and filter associated to the shape to cast, in order to only
     *   test on colliders with collision groups compatible with this group.
     */
    castShape(colliders, shapePos, shapeRot, shapeVel, shape, maxToi, groups) {
        let rawPos = math_1.VectorOps.intoRaw(shapePos);
        let rawRot = math_1.RotationOps.intoRaw(shapeRot);
        let rawVel = math_1.VectorOps.intoRaw(shapeVel);
        let rawShape = shape.intoRaw();
        let result = geometry_1.ShapeColliderTOI.fromRaw(this.raw.castShape(colliders.raw, rawPos, rawRot, rawVel, rawShape, maxToi, groups));
        rawPos.free();
        rawRot.free();
        rawVel.free();
        rawShape.free();
        return result;
    }
    /**
     * Retrieve all the colliders intersecting the given shape.
     *
     * @param colliders - The set of colliders taking part in this pipeline.
     * @param shapePos - The position of the shape to test.
     * @param shapeRot - The orientation of the shape to test.
     * @param shape - The shape to test.
     * @param groups - The bit groups and filter associated to the shape to test, in order to only
     *   test on colliders with collision groups compatible with this group.
     * @param callback - A function called with the handles of each collider intersecting the `shape`.
     */
    intersectionsWithShape(colliders, shapePos, shapeRot, shape, groups, callback) {
        let rawPos = math_1.VectorOps.intoRaw(shapePos);
        let rawRot = math_1.RotationOps.intoRaw(shapeRot);
        let rawShape = shape.intoRaw();
        this.raw.intersectionsWithShape(colliders.raw, rawPos, rawRot, rawShape, groups, callback);
        rawPos.free();
        rawRot.free();
        rawShape.free();
    }
    /**
     * Finds the handles of all the colliders with an AABB intersecting the given AABB.
     *
     * @param aabbCenter - The center of the AABB to test.
     * @param aabbHalfExtents - The half-extents of the AABB to test.
     * @param callback - The callback that will be called with the handles of all the colliders
     *                   currently intersecting the given AABB.
     */
    collidersWithAabbIntersectingAabb(aabbCenter, aabbHalfExtents, callback) {
        let rawCenter = math_1.VectorOps.intoRaw(aabbCenter);
        let rawHalfExtents = math_1.VectorOps.intoRaw(aabbHalfExtents);
        this.raw.collidersWithAabbIntersectingAabb(rawCenter, rawHalfExtents, callback);
        rawCenter.free();
        rawHalfExtents.free();
    }
}
exports.QueryPipeline = QueryPipeline;
//# sourceMappingURL=query_pipeline.js.map
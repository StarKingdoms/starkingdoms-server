import { RawJointSet } from "../raw";
import { RigidBodySet } from "./rigid_body_set";
import { Joint, JointHandle, JointParams } from "./joint";
import { IslandManager } from "./island_manager";
/**
 * A set of joints.
 *
 * To avoid leaking WASM resources, this MUST be freed manually with `jointSet.free()`
 * once you are done using it (and all the joints it created).
 */
export declare class JointSet {
    raw: RawJointSet;
    /**
     * Release the WASM memory occupied by this joint set.
     */
    free(): void;
    constructor(raw?: RawJointSet);
    /**
     * Creates a new joint and return its integer handle.
     *
     * @param bodies - The set of rigid-bodies containing the bodies the joint is attached to.
     * @param desc - The joint's parameters.
     * @param parent1 - The handle of the first rigid-body this joint is attached to.
     * @param parent2 - The handle of the second rigid-body this joint is attached to.
     */
    createJoint(bodies: RigidBodySet, desc: JointParams, parent1: number, parent2: number): number;
    /**
     * Remove a joint from this set.
     *
     * @param handle - The integer handle of the joint.
     * @param bodies - The set of rigid-bodies containing the rigid-bodies attached by the removed joint.
     * @param wake_up - If `true`, the rigid-bodies attached by the removed joint will be woken-up automatically.
     */
    remove(handle: JointHandle, islands: IslandManager, bodies: RigidBodySet, wake_up: boolean): void;
    /**
     * The number of joints on this set.
     */
    len(): number;
    /**
     * Does this set contain a joint with the given handle?
     *
     * @param handle - The joint handle to check.
     */
    contains(handle: JointHandle): boolean;
    /**
     * Gets the joint with the given handle.
     *
     * Returns `null` if no joint with the specified handle exists.
     * Note that two distinct calls with the same `handle` will return two
     * different JavaScript objects that both represent the same joint.
     *
     * @param handle - The integer handle of the joint to retrieve.
     */
    get(handle: JointHandle): Joint;
    /**
     * Applies the given closure to each joints contained by this set.
     *
     * @param f - The closure to apply.
     */
    forEachJoint(f: (handle: Joint) => void): void;
    /**
     * Applies the given closure to the handle of each joints contained by this set.
     *
     * @param f - The closure to apply.
     */
    forEachJointHandle(f: (handle: JointHandle) => void): void;
}

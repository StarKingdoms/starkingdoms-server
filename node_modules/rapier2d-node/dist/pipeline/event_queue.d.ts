import { RawEventQueue } from '../raw';
import { ColliderHandle } from '../geometry';
export declare enum ActiveEvents {
    INTERSECTION_EVENTS = 1,
    CONTACT_EVENTS = 2
}
/**
 * A structure responsible for collecting events generated
 * by the physics engine.
 *
 * To avoid leaking WASM resources, this MUST be freed manually with `eventQueue.free()`
 * once you are done using it.
 */
export declare class EventQueue {
    raw: RawEventQueue;
    /**
     * Creates a new event collector.
     *
     * @param autoDrain -setting this to `true` is strongly recommended. If true, the collector will
     * be automatically drained before each `world.step(collector)`. If false, the collector will
     * keep all events in memory unless it is manually drained/cleared; this may lead to unbounded use of
     * RAM if no drain is performed.
     */
    constructor(autoDrain: boolean, raw?: RawEventQueue);
    /**
     * Release the WASM memory occupied by this event-queue.
     */
    free(): void;
    /**
     * Applies the given javascript closure on each contact event of this collector, then clear
     * the internal contact event buffer.
     *
     * @param f - JavaScript closure applied to each contact event. The
     * closure should take three arguments: two integers representing the handles of the colliders
     * involved in the contact, and a boolean indicating if the contact started (true) or stopped
     * (false).
     */
    drainContactEvents(f: (handle1: ColliderHandle, handle2: ColliderHandle, started: boolean) => void): void;
    /**
     * Applies the given javascript closure on each intersection event of this collector, then clear
     * the internal intersection event buffer.
     *
     * @param f - JavaScript closure applied to each intersection event. The
     * closure should take four arguments: two integers representing the handles of the colliders
     * involved in the intersection, and a boolean indicating if they started intersecting (true) or
     * stopped intersecting (false).
     */
    drainIntersectionEvents(f: (handle1: ColliderHandle, handle2: ColliderHandle, intersecting: boolean) => void): void;
    /**
     * Removes all events contained by this collector
     */
    clear(): void;
}

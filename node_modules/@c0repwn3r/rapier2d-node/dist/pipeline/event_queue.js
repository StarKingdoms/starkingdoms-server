"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventQueue = exports.ActiveEvents = void 0;
const raw_1 = require("../raw");
/// Flags indicating what events are enabled for colliders.
var ActiveEvents;
(function (ActiveEvents) {
    /// Enable intersection events.
    ActiveEvents[ActiveEvents["INTERSECTION_EVENTS"] = 1] = "INTERSECTION_EVENTS";
    /// Enable contact events.
    ActiveEvents[ActiveEvents["CONTACT_EVENTS"] = 2] = "CONTACT_EVENTS";
})(ActiveEvents = exports.ActiveEvents || (exports.ActiveEvents = {}));
/**
 * A structure responsible for collecting events generated
 * by the physics engine.
 *
 * To avoid leaking WASM resources, this MUST be freed manually with `eventQueue.free()`
 * once you are done using it.
 */
class EventQueue {
    /**
     * Creates a new event collector.
     *
     * @param autoDrain -setting this to `true` is strongly recommended. If true, the collector will
     * be automatically drained before each `world.step(collector)`. If false, the collector will
     * keep all events in memory unless it is manually drained/cleared; this may lead to unbounded use of
     * RAM if no drain is performed.
     */
    constructor(autoDrain, raw) {
        this.raw = raw || new raw_1.RawEventQueue(autoDrain);
    }
    /**
     * Release the WASM memory occupied by this event-queue.
     */
    free() {
        this.raw.free();
        this.raw = undefined;
    }
    /**
     * Applies the given javascript closure on each contact event of this collector, then clear
     * the internal contact event buffer.
     *
     * @param f - JavaScript closure applied to each contact event. The
     * closure should take three arguments: two integers representing the handles of the colliders
     * involved in the contact, and a boolean indicating if the contact started (true) or stopped
     * (false).
     */
    drainContactEvents(f) {
        this.raw.drainContactEvents(f);
    }
    /**
     * Applies the given javascript closure on each intersection event of this collector, then clear
     * the internal intersection event buffer.
     *
     * @param f - JavaScript closure applied to each intersection event. The
     * closure should take four arguments: two integers representing the handles of the colliders
     * involved in the intersection, and a boolean indicating if they started intersecting (true) or
     * stopped intersecting (false).
     */
    drainIntersectionEvents(f) {
        this.raw.drainIntersectionEvents(f);
    }
    /**
     * Removes all events contained by this collector
     */
    clear() {
        this.raw.clear();
    }
}
exports.EventQueue = EventQueue;
//# sourceMappingURL=event_queue.js.map
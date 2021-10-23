use rapier2d::prelude::*;
use rapier2d::crossbeam::channel::{Sender as CSender, Receiver as CReceiver, unbounded as c_channel};

pub struct Simulation {
    pub rigidbodies: RigidBodySet,
    pub colliders: ColliderSet,
    pub joints: JointSet,
    pub islands: IslandManager,
    integration_parameters: IntegrationParameters,
    broad_phase: BroadPhase,
    narrow_phase: NarrowPhase,
    ccd_solver: CCDSolver,
    pipeline: PhysicsPipeline,
    intersection_events: CReceiver<IntersectionEvent>,
    contact_events: CReceiver<ContactEvent>,
    event_collector: ChannelEventCollector,
}

impl Simulation {
    pub fn new(step_time: f32) -> Simulation {
        let mut colliders = ColliderSet::new();

        let intersection_events = c_channel();
        let contact_events = c_channel();
        let event_collector = ChannelEventCollector::new(intersection_events.0, contact_events.0);
        let mut integration_parameters = IntegrationParameters::default();
        integration_parameters.dt = step_time;
        integration_parameters.erp = 0.4;
        integration_parameters.max_position_iterations = 8;
        integration_parameters.max_velocity_iterations = 8;

        let simulation = Simulation {
            pipeline: PhysicsPipeline::new(),
            integration_parameters,
            broad_phase: BroadPhase::new(),
            narrow_phase: NarrowPhase::new(),
            ccd_solver: CCDSolver::new(),

            rigidbodies: RigidBodySet::new(),
            islands: IslandManager::new(),
            colliders,
            joints: JointSet::new(),
            event_collector,
            intersection_events: intersection_events.1,
            contact_events: contact_events.1,
        };
        simulation
    }
}

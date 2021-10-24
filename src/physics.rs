use rapier2d::dynamics::{BodyStatus, CCDSolver, JointSet, RigidBody, RigidBodyBuilder,
    RigidBodyHandle, RigidBodySet, IntegrationParameters, Joint, JointHandle,
    MassProperties, BallJoint, JointParams, IslandManager};
use rapier2d::geometry::{BroadPhase, NarrowPhase, ColliderSet, IntersectionEvent,
    ContactEvent, ColliderHandle, Collider};
use rapier2d::pipeline::{PhysicsPipeline, ChannelEventCollector};
use rapier2d::crossbeam::channel::{Sender as CSender, Receiver as CReceiver, unbounded as c_channel};

pub mod typedef {
    pub type Vector = rapier2d::na::Matrix2x1<f32>;
}
use typedef::*;

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
    pub fn tick(&mut self) {
        const GRAVITY: Vector = Vector::new(0.0, 1.0);
        // step physics
        self.pipeline.step(
            &GRAVITY,
            &self.integration_parameters,
            &mut self.islands,
            &mut self.broad_phase,
            &mut self.narrow_phase,
            &mut self.rigidbodies,
            &mut self.colliders,
            &mut self.joints,
            &mut self.ccd_solver,
            &(),
            &self.event_collector,
        );
    }
}

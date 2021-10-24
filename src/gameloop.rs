use crate::connection;
use crate::physics;
use async_std::task;
use futures::select_biased;
use futures::StreamExt;
use futures::FutureExt;
use rapier2d::dynamics::{RigidBodyBuilder};
use rapier2d::geometry::{ColliderBuilder};
use rapier2d::prelude::Vector;

pub const TICKS_PER_SECOND: u8 = 20;

pub async fn gameloop() {
    let connection = task::spawn(connection::run("127.0.0.1:8443".to_string()));
	task::Poll::Ready(connection);

    const TIMESTEP: f32 = 1.0 / (TICKS_PER_SECOND as f32);
    let mut ticker = async_std::stream::interval(std::time::Duration::from_secs_f32(TIMESTEP));

    let mut simulation = physics::Simulation::new(TIMESTEP);

    let rigid_body = RigidBodyBuilder::new_dynamic()
        .translation(Vector::new(0.0, 10.0))
        .build();
    let collider = ColliderBuilder::ball(0.5). restitution(0.7).build();
    let ball_body_handle = simulation.rigidbodies.insert(rigid_body);
    simulation.colliders.insert_with_parent(collider, ball_body_handle, &mut simulation.rigidbodies);

    loop {

        select_biased! {
            _ = ticker.next().fuse() => {
                simulation.tick();
                println!("Ball altitude: {}", &simulation.rigidbodies[ball_body_handle].translation().y);
            }
        }
    }
}

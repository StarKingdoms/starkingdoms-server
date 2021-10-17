use crate::connection;
use crate::physics;
use async_std::task;
use futures::select_biased;
use futures::StreamExt;
use futures::FutureExt;

pub const TICKS_PER_SECOND: u8 = 20;

pub async fn gameloop() {
    let connection = task::spawn(connection::run("127.0.0.1:8443".to_string()));
	task::Poll::Ready(connection);

    const TIMESTEP: f32 = 1.0 / (TICKS_PER_SECOND as f32);
    let mut ticker = async_std::stream::interval(std::time::Duration::from_secs_f32(TIMESTEP));

    physics::physicsInit();

    loop {

        select_biased! {
            _ = ticker.next().fuse() => {
                physics::physics();
            }
        }
    }
}

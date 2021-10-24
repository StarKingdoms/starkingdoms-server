mod connection;
mod game_connection;
mod packet;
mod gameloop;
mod physics;

use async_std::task;
use gameloop::gameloop;

fn main() {
	println!("Hello, world!");
    task::block_on(gameloop());
}

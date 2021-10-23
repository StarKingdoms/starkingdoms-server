mod connection;
mod game_connection;
mod packet;
mod gameloop;
mod physics;

use async_std::task;
use gameloop::gameloop;

fn main() {
	println!("Hello, world!");
	connection::run("127.0.0.1:8443".to_string());
    task::block_on(gameloop());
}

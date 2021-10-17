mod connection;
mod game_connection;
mod packet;
mod gameloop;
mod physics;

use async_std::task;
use gameloop::gameloop;

fn main() {
	println!("Hello, world!");
<<<<<<< HEAD
	connection::run("127.0.0.1:8443".to_string());
    task::block_on(gameloop());
=======
	task::block_on(connection::run("127.0.0.1:8443".to_string()));
>>>>>>> da76fb9b4c4ff4da0fd94d27b6655b1edbc121a6
}

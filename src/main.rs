mod connection;
mod game_connection;
mod packet;

use async_std::task;

fn main() {
	println!("Hello, world!");
	task::block_on(connection::run("127.0.0.1:8443".to_string()));
}
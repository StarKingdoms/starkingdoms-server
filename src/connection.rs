use crate::game_connection::parse_incoming_packet;

use std::{
    collections::HashMap,
    io::Error as IoError,
    net::SocketAddr,
    sync::{Arc, Mutex},
};

use futures::prelude::*;
use futures::{
    channel::mpsc::{unbounded, UnboundedSender},
    future, pin_mut,
};

use async_std::net::{TcpListener, TcpStream};
use async_std::task;
use async_tungstenite::tungstenite::protocol::Message;

type Tx = UnboundedSender<Message>;
type PeerMap = Arc<Mutex<HashMap<SocketAddr, Tx>>>;

pub async fn handle_connection(peer_map: PeerMap, raw_stream: TcpStream, addr: SocketAddr) {
    println!("Hello from connection handler");
    println!("Incoming TCP connection from: {}", addr);

    let ws_stream = async_tungstenite::accept_async(raw_stream)
        .await
        .expect("Error during the websocket handshake occurred");
    println!("WebSocket connection established: {}", addr);

    // Insert the write part of this peer to the peer map.
    let (tx, rx) = unbounded();
    peer_map.lock().unwrap().insert(addr, tx);

    let (outgoing, incoming) = ws_stream.split();

    let broadcast_incoming = incoming
        .try_filter(|msg| {
            // Broadcasting a Close message from one client
            // will close the other clients.
            future::ready(!msg.is_close())
        })
        .try_for_each(|msg| {
            println!(
                "Received packet from {}",
                addr
            );
            
            parse_incoming_packet(peer_map.clone(), addr, msg);

            future::ok(())
        });

    let receive_from_others = rx.map(Ok).forward(outgoing);

    pin_mut!(broadcast_incoming, receive_from_others);
    future::select(broadcast_incoming, receive_from_others).await;

    println!("{} disconnected", &addr);
    peer_map.lock().unwrap().remove(&addr);
}

pub async fn run(addr: String) -> Result<(), IoError> {
    println!("Hello from connection thread");
    let state = PeerMap::new(Mutex::new(HashMap::new()));

    // Create the event loop and TCP listener we'll accept connections on.
    let try_socket = TcpListener::bind(&addr).await;
    let listener = try_socket.expect("Failed to bind");
    println!("Listening on: {}", addr);

    // Let's spawn the handling of each connection in a separate task.
    while let Ok((stream, addr)) = listener.accept().await {
        task::spawn(handle_connection(state.clone(), stream, addr));
    }

    Ok(())
}

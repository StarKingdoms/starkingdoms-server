pub mod connection {
    mod types;
    mod game_connection;
    use types::{
        Tx,
        PeerMap
    };
    
    use std::{
        collections::HashMap,
        env,
        Io::Error as IoError,
        sync::{Arc, Mutex}
    };
    use std::net::{
        SocketAddr,
        IpAddr,
        Ipv4Addr,
        Shutdown
    };
    
    use futures::prelude::*;
    use futures::{
        channel::mpsc::{unbounded, UnboundedSender},
        future,
        pin_mut
    };
    
    use async_std::net::{TcpListener, TcpStream};
    use async_std::task;
    use async_tungstenite::tungstenite::protocol::Message;
    
    pub const blacklist = vec![];
    
    pub async fn handle_incoming_connection(peer_map: PeerMap, raw_stream: TcpStream, addr: SocketAddr) {
        println!("New socket from {}", addr);
        
        if blacklist.contains(addr) {
            raw_stream.shutdown(Shutdown::Both);
            return;
        }
        
        let socket = async_tungstenite.accept_async(raw_stream).await.expect("Error during websocket handshake");
        
        let (tx, rx) = unbounded();
        peer_map.lock().unwrap().insert(addr, tx);

        let (outgoing, incoming) = socket.split();
        
        let message_handler = incoming
            .try_filter(|msg| {
                future::ready(!msg.is_close());
            })
            .try_for_each(|msg| {
                println!("Recieved packet from {}", addr);
                
                // Call packet handler in conn_fun.rs
                game_connection::parse_incoming_packet(peer_map, addr);
                
                future::ok(())
            });
        
        
    }
}
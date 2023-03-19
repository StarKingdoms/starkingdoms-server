#![feature(generic_arg_infer)]
use std::{sync::{Mutex, Arc, atomic::{AtomicUsize, Ordering}}, collections::HashMap, net::SocketAddr, io::Error as IoError, ops::Deref};

use async_std::{net::{TcpListener, TcpStream}, task, channel::{unbounded, Sender}};
use async_tungstenite::tungstenite::Message;
use futures::{channel::mpsc::UnboundedSender, StreamExt, TryStreamExt, future, SinkExt};
use postcard::{from_bytes, to_allocvec};
use stk_protocol::protocol::{ServerboundMsg, ClientboundMsg};

struct User {
    pub tx: Tx,
    pub username: String,
}


type Tx = Sender<Vec<u8>>;
type PeerMap = Arc<Mutex<HashMap<usize, User>>>;

static COUNTER: AtomicUsize = AtomicUsize::new(1);
fn get_id() -> usize { COUNTER.fetch_add(1, Ordering::Relaxed) }

async fn accept_connection(socket: TcpStream, peer_map: PeerMap, addr: SocketAddr) {
    let ws_stream = async_tungstenite::accept_async(socket)
        .await
        .expect("Error during websocket handshake");
    let (tx, rx) = unbounded();

    let (outgoing, mut incoming) = ws_stream.split();

    // handshake
    {
        if let Some(Ok(msg)) = incoming.next().await {
            let packet: ServerboundMsg = from_bytes(msg.into_data().as_slice().deref()).unwrap();
            if let ServerboundMsg::Handshake { username } = packet {
                let id = get_id();
                let clone_tx = tx.clone();
                clone_tx.send(to_allocvec(&ClientboundMsg::Handshake {
                    id: id as u16
                }).unwrap()).await.unwrap();
                println!("username: {}", id);
                peer_map.lock().unwrap().insert(id, User {
                    tx: clone_tx,
                    username,
                });
            }
        }
    }

    let broadcast_incoming = incoming
        .try_filter(|msg| {
            future::ready(!msg.is_close())
        })
        .try_for_each(|msg| async {
            println!("Received message from {}: {}", addr, msg.to_text().unwrap());
            // TODO: proper error handling
            let packet: ServerboundMsg = from_bytes(msg.into_data().as_slice().deref()).unwrap();

            match packet {
                ServerboundMsg::Chat { id, message } => {
                    let peers = peer_map.lock().unwrap();
                    let peers = peers.iter().map(|(_, user)| user);
                    for peer in peers {
                        peer.tx.send(to_allocvec(&ClientboundMsg::Chat {
                            id,
                            message: message.clone()
                        }).unwrap()).await.unwrap();
                    }
                }
                _ => {}
            }

            /*let broadcast_recipients = peers
                .iter()
                .filter(|(peer_addr, _)| */

            Ok(())
        });
}

async fn run() -> Result<(), IoError> {

    let peer_map = PeerMap::new(Mutex::new(HashMap::new()));

    let listener = TcpListener::bind("127.0.0.1:8080").await.expect("Failed to bind");

    loop {
        let (socket, addr) = listener.accept().await.unwrap();
        println!("{}", addr);
        task::spawn(accept_connection(socket, peer_map.clone(), addr));
    }
}

fn main() -> Result<(), IoError> {
    task::block_on(run())
}

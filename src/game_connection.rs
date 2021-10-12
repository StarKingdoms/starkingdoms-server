use async_tungstenite::tungstenite::protocol::Message;
use std::sync::{Arc, Mutex};
use std::collections::HashMap;

use futures::channel::mpsc::UnboundedSender;

use crate::packet::{
    PlayerMetadata,
    PlayerInput,
    PlayerJoin,
    NearbyPlayers,
    NearbyPlayer,
    ChatMessage,
};
use std::net::{
    SocketAddr
};

type Tx = UnboundedSender<Message>;
type PeerMap = Arc<Mutex<HashMap<SocketAddr, Tx>>>;

pub fn parse_incoming_packet(peer_map: PeerMap, addr: SocketAddr) {
    return;
}
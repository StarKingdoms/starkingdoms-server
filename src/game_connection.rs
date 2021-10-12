use async_tungstenite::tungstenite::protocol::Message;
use std::sync::{Arc, Mutex};
use std::collections::HashMap;

use futures::channel::mpsc::UnboundedSender;

use serde_cbor::Deserializer;

use crate::packet::packetlib::{
    PlayerMetadata,
    PlayerInput,
    NearbyPlayer,
    ChatMessage,
    LoginPacket
};
use std::net::{
    SocketAddr
};

type Tx = UnboundedSender<Message>;
type PeerMap = Arc<Mutex<HashMap<SocketAddr, Tx>>>;

pub fn parse_incoming_packet(peer_map: PeerMap, addr: SocketAddr, msg: Message) {
    // Get message as binary and attempt to decode it

}

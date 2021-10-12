pub mod game_connection {
    mod types;
    mod packet;
    use types::{
        Tx,
        PeerMap
    };
    use packet::{
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
    pub fn parse_incoming_packet(peer_map: PeerMap, addr: SocketAddr) {
        
    }
}
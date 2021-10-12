use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize)]
pub struct PlayerMetadata {
    x_pos: f32,
    y_pos: f32,
    rotation: u16
}

#[derive(Serialize, Deserialize)]
pub struct PlayerInput {
    w_key: bool,
    a_key: bool,
    s_key: bool,
    d_key: bool
}

#[derive(Serialize, Deserialize)]
pub struct PlayerJoin {
    protocol_version: u8,
    account_id: u32,
    username: String
}

#[derive(Serialize, Deserialize)]
pub struct NearbyPlayer {
    x_pos: f32,
    y_pos: f32,
    rotation: u16,
    username: String
}

#[derive(Serialize, Deserialize)]
pub struct NearbyPlayers {
    players: Vec<NearbyPlayer>
}

#[derive(Serialize, Deserialize)]
pub struct ChatMessage {
    message: String,
    sender: String
}
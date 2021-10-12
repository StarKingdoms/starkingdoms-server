use std::net::{
    SocketAddr
};
use crate::packet::{PlayerInput, PlayerMetadata};

#[derive(Serialize, Deserialize)]
pub struct Player {
    pub address: SocketAddr,
    pub username: String,
    pub metadata: PlayerMetadata,
    pub input: PlayerInput
}
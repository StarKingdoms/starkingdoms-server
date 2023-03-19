use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize, Debug, Eq, PartialEq)]
pub enum ServerboundMsg {
    Handshake {
        username: String,
    },
    Chat {
        id: u16,
        message: String,
    },
}

#[derive(Serialize, Deserialize, Debug, Eq, PartialEq)]
pub enum ClientboundMsg {
    Handshake {
        id: u16
    },
    Chat {
        id: u16,
        message: String,
    },
    PlayerJoin {
        id: u16,
        username: String,
    }
}

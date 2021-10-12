pub mod packet {
    pub struct PlayerMetadata {
        x_pos: f32,
        y_pos: f32,
        rotation: u16
    };
    
    pub struct PlayerInput {
        w_key: bool,
        a_key: bool,
        s_key: bool,
        d_key: bool
    };
    
    pub struct PlayerJoin {
        protocol_version: u8,
        account_id: u32,
        username: String
    };
    
    pub struct NearbyPlayer {
        x_pos: f32,
        y_pos: f32,
        rotation: u16,
        username: String
    };
    
    pub struct NearbyPlayers {
        players: Vec<NearbyPlayer>
    };
}
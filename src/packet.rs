pub mod packetlib {
    pub trait SerializableObject {
        fn serialize(&self) -> Vec<u8>;
    }

    #[derive(PartialEq, Debug)]
    pub struct PlayerMetadata {
        pub magic: u16,
        pub packet_type: u8,
        pub x_pos: f64,
        pub y_pos: f64,
        pub rotation: u16
    }
    impl SerializableObject for PlayerMetadata {
        fn serialize(&self) -> Vec<u8> {
            let mut a = Vec::new();
            a.append(&mut self.magic.to_be_bytes().to_vec());
            a.append(&mut self.packet_type.to_be_bytes().to_vec());
            a.append(&mut self.x_pos.to_be_bytes().to_vec());
            a.append(&mut self.y_pos.to_be_bytes().to_vec());
            a.append(&mut self.rotation.to_be_bytes().to_vec());
            a
        }
    }
    pub fn deserialize_player_metadata(vec: Vec<u8>) -> PlayerMetadata {
        let mut packet = PlayerMetadata {
            magic: 0xab47,
            packet_type: 0x01,
            x_pos: 0.0,
            y_pos: 0.0,
            rotation: 0
        };
        let mut af64: [u8; 8] = Default::default();
        let mut au16: [u8; 2] = Default::default();
        af64.copy_from_slice(&vec[3..11]);
        packet.x_pos = f64::from_be_bytes(af64);
        af64.copy_from_slice(&vec[11..19]);
        packet.y_pos = f64::from_be_bytes(af64);
        au16.copy_from_slice(&vec[19..]);
        packet.rotation = u16::from_be_bytes(au16);
        packet
    }

    #[derive(PartialEq, Debug)]
    pub struct PlayerInput {
        pub magic: u16,
        pub packet_type: u8,
        pub input_data: u8
    }
    impl SerializableObject for PlayerInput {
        fn serialize(&self) -> Vec<u8> {
            let mut a = Vec::new();
            a.append(&mut self.magic.to_be_bytes().to_vec());
            a.append(&mut self.packet_type.to_be_bytes().to_vec());
            a.append(&mut self.input_data.to_be_bytes().to_vec());
            a
        }
    }
    pub fn deserialize_player_input(vec: Vec<u8>) -> PlayerInput {
        let mut packet = PlayerInput {
            magic: 0xab47,
            packet_type: 0x02,
            input_data: 0
        };
        let mut au8: [u8; 1] = Default::default();
        au8.copy_from_slice(&vec[3..]);
        packet.input_data = u8::from_be_bytes(au8);
        packet
    }

    #[derive(PartialEq, Debug)]
    pub struct ChatMessage {
        pub magic: u16,
        pub packet_type: u8,
        pub message: String
    }
    impl SerializableObject for ChatMessage {
        fn serialize(&self) -> Vec<u8> {
            let mut a = Vec::new();
            a.append(&mut self.magic.to_be_bytes().to_vec());
            a.append(&mut self.packet_type.to_be_bytes().to_vec());
            a.append(&mut self.message.as_bytes().to_vec());
            a
        }
    }
    pub fn deserialize_chat_message(vec: Vec<u8>) -> ChatMessage {
        let mut packet = ChatMessage {
            magic: 0xab47,
            packet_type: 0x03,
            message: String::from("")
        };
        packet.message = String::from_utf8(vec[3..].to_vec()).expect("Invalid string data!");
        packet
    }

    #[derive(PartialEq, Debug)]
    pub struct NearbyPlayer {
        pub magic: u16,
        pub packet_type: u8,
        pub x_pos: f64,
        pub y_pos: f64,
        pub rotation: u16,
        pub username: String
    }
    impl SerializableObject for NearbyPlayer {
        fn serialize(&self) -> Vec<u8> {
            let mut a = Vec::new();
            a.append(&mut self.magic.to_be_bytes().to_vec());
            a.append(&mut self.packet_type.to_be_bytes().to_vec());
            a.append(&mut self.x_pos.to_be_bytes().to_vec());
            a.append(&mut self.y_pos.to_be_bytes().to_vec());
            a.append(&mut self.rotation.to_be_bytes().to_vec());
            a.append(&mut self.username.as_bytes().to_vec());
            a
        }
    }
    pub fn deserialize_nearby_player(vec: Vec<u8>) -> NearbyPlayer {
        let mut packet = NearbyPlayer {
            magic: 0xab47,
            packet_type: 0x04,
            x_pos: 0.0,
            y_pos: 0.0,
            rotation: 0,
            username: String::from("")
        };
        let mut af64: [u8; 8] = Default::default();
        let mut au16: [u8; 2] = Default::default();
        af64.copy_from_slice(&vec[3..11]);
        packet.x_pos = f64::from_be_bytes(af64);
        af64.copy_from_slice(&vec[11..19]);
        packet.y_pos = f64::from_be_bytes(af64);
        au16.copy_from_slice(&vec[19..21]);
        packet.rotation = u16::from_be_bytes(au16);
        packet.username = String::from_utf8(vec[21..].to_vec()).expect("Invalid string data!");
        packet
    }

    #[derive(PartialEq, Debug)]
    pub struct LoginPacket {
        pub magic: u16,
        pub packet_type: u8,
        pub username: String
    }
    impl SerializableObject for LoginPacket {
        fn serialize(&self) -> Vec<u8> {
            let mut a = Vec::new();
            a.append(&mut self.magic.to_be_bytes().to_vec());
            a.append(&mut self.packet_type.to_be_bytes().to_vec());
            a.append(&mut self.username.as_bytes().to_vec());
            a
        }
    }
    pub fn deserialize_login_packet(vec: Vec<u8>) -> LoginPacket {
        let mut packet = LoginPacket {
            magic: 0xab47,
            packet_type: 0x05,
            username: String::from("")
        };
        packet.username = String::from_utf8(vec[3..].to_vec()).expect("Invalid string data!");
        packet
    }
}

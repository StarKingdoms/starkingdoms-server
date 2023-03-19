use std::{borrow::BorrowMut, cell::{RefCell, Cell}, rc::Rc, ops::Deref};

use postcard::{to_allocvec, from_bytes};
use stk_protocol::protocol::{ServerboundMsg, ClientboundMsg};
use wasm_bindgen::prelude::*;
use wasm_sockets::{Message, ConnectionStatus};

extern crate console_error_panic_hook;
use std::panic;

#[wasm_bindgen]
extern {
    pub fn addChatMessage(message: &str);
}

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console, js_name = log)]
    fn log_u32(a: u32);
}

#[derive(PartialEq)]
enum State {
    Handshake,
    Game,
}

#[wasm_bindgen]
pub fn setup_socket(id: &mut [u16]) {
    panic::set_hook(Box::new(console_error_panic_hook::hook));
    let mut client = wasm_sockets::EventClient::new("ws://localhost:8080").unwrap();

    let state = Rc::new(RefCell::new(State::Handshake));

    client.set_on_connection(Some(Box::new(|client: &wasm_sockets::EventClient| {
        client.send_binary(to_allocvec(&ServerboundMsg::Handshake {
            username: String::from("test"),
        }).unwrap()).unwrap();
    })));

    let state_clone = state.clone();
    client.set_on_message(Some(Box::new(
        move |client: &wasm_sockets::EventClient, message: wasm_sockets::Message| {
            log_u32(12);
            if let Message::Binary(handshake) = message {
                let packet = from_bytes(handshake.as_slice().deref()).unwrap();
                if *state_clone.borrow() == State::Handshake {
                    if let ClientboundMsg::Handshake { id } = packet {
                        log_u32(id.into());
                    }
                    *(*state_clone).borrow_mut() = State::Game;
                }
            }
        },
    )));
}

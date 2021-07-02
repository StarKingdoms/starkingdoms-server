<?php
class Row {
    public $cols = array();
}
class AdminAccount {
    public $id = 0;
    public $username = "";
    public $password = "";
    public $token = "";

    public function __construct($id, $username, $password, $token) {
        $this->id = $id;
        $this->username = $username;
        $this->password = $password;
        $this->token = $token;
    }
}
class Savestate {
    public $id = 0;
    public $player = "";
    public $data = "";
    public $datetime = "";

    public function __construct($id, $player, $data, $datetime) {
        $this->id = $id;
        $this->player = $player;
        $this->data = $data;
        $this->datetime = $datetime;
    }
}
class LoginState {
    public $state = "";
    public $userid = "";
    
    public function __construct($state, $userid) {
        $this->state = $state;
        $this->userid = $userid;
    }
}
class Player {
    public $saves = array();
    public $name = "";

    public function __construct($saves, $name) {
        $this->saves = $saves;
        $this->name = $name;
    }
}
class User {
    public $states = array();
    public $id = "";

    public function __construct($states, $id) {
        $this->states = $states;
        $this->id = $id;
    }
}
?>
<?php
session_start();
function process() {
    $_SESSION["oauth2state"] = md5(rand());
    $loc = 'Location: https://discord.com/api/oauth2/authorize?client_id=824442493491347520&redirect_uri=https%3A%2F%2Fstarkingdoms.tk%2Fauth%2Fhandover.php&response_type=code&scope=identify&&state=';
    $loc = $loc.$_SESSION["oauth2state"];
    header($loc);
}
process();
?>

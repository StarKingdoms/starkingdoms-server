<?php
if (empty($_GET['state']) || (isset($_SESSION['oauth2state']) && $_GET['state'] !== $_SESSION['oauth2state'])) {

    if (isset($_SESSION['oauth2state'])) {
        unset($_SESSION['oauth2state']);
    }

    exit('Invalid state');

}

$url = "https://discord.com/api/oauth2/token";

$curl = curl_init($url);
curl_setopt($curl, CURLOPT_URL, $url);
curl_setopt($curl, CURLOPT_POST, true);
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);

$headers = array(
   "Content-Type: application/x-www-form-urlencoded",
);
curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);

$data = "client_id=824442493491347520&client_secret=gbTwmSSzy9FUYyECW3JUYLs_Pn2aSkmU&grant_type=authorization_code&code=" . $_GET['code'] . "&redirect_uri=https%3A%2F%2Fapi.coresdev.ml%2Fdiscordauth%2Fhandover.php&scope=identify";

curl_setopt($curl, CURLOPT_POSTFIELDS, $data);

$resp = curl_exec($curl);
curl_close($curl);

$auth = json_decode($resp);
$authToken = $auth->access_token;
$url = "https://discord.com/api/users/@me";

$curl = curl_init($url);
curl_setopt($curl, CURLOPT_URL, $url);
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);

$headers = array(
   "Authorization: Bearer " . $authToken,
);
curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);

$resp = curl_exec($curl);
curl_close($curl);

$userID = json_decode($resp)->id;

$servername = '107.180.40.196';
$username = 'kx3hoj5us5rl';
$password = 'Voigtlander20!';
    
$conn = new mysqli($servername, $username, $password, "starkingdoms");

// Check connection
if ($conn->connect_error) {
    echo '{"success": "false", "error": "S17", "text": "'.$conn->connect_error.'"}';
    return;
}
$hashedName = $userID . time();
$state = hash("sha256", $hashedName);

$sql = "SELECT * FROM state WHERE state = '" . $state ."'";

$result = $conn->query($sql);
if ($result->num_rows != 0) {
    echo 'Hello! This is a message from core. Congratulations! You managed to break my code. Please contact core#8531 with a screenshot of this page and explain what on earth you were doing. ';
    echo $state;
    return;
} else {
    $sql = "INSERT INTO `state` (`state`, `userid`) VALUES ('" . $state . "', '" . $userID . "')";
    if ($conn->query($sql) === TRUE) {
        $redir = "Location: http://starkingdoms.tk/?state=" . $state;
        header($redir);
    } else {
        echo '{"success": "false", "error": "S18", "text": "'.$conn->error.'"}';
    }
}
?>

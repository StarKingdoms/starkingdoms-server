<?php
require_once('db/dbconn.php');
require_once('db/types.php');
session_start();
if (!isset($_SESSION["login_token"]) || empty($_SESSION["login_token"])) {
  header("Location: login.php?ref=admin_nli");
}

$login_token = $_SESSION["login_token"];

$msg = '';

$conn = new mysqli(DB_SERVERNAME, DB_USERNAME, DB_PASSWORD, DB_NAME);

if ($conn->connect_error) {
  global $msg;
  $msg ='<p class="error">Database error: '.$conn->connect_error.'</p>';
  return;
}

$sql = "SELECT * FROM `admin` WHERE `token` LIKE '".$login_token."'";
$result = $conn->query($sql);

$username = "";

if ($result->num_rows > 0) {
  while($row = $result->fetch_assoc()) {
    global $username;
    $username = $row["username"];
  }
} else {
  $conn->close();
  header("Location: login.php?ref=spftkn");
}

// Authorized, DB ahxz level 0, load roots

$admin_accounts = array();
$savestates = array();
$loginstates = array();

$sql = "SELECT * FROM `admin`";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
  while ($row = $result->fetch_assoc()) {
    array_push($admin_accounts, new AdminAccount($row["id"], $row["username"], $row["password"], $row["token"]));
  }
}

$sql = "SELECT * FROM `saves`";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
  while ($row = $result->fetch_assoc()) {
    array_push($savestates, new Savestate($row["id"], $row["player"], $row["savedata"], $row["savetime"]));
  }
}

$sql = "SELECT * FROM `state`";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
  while ($row = $result->fetch_assoc()) {
    array_push($loginstates, new LoginState($row["id"], $row["userid"]));
  }
}

$conn->close();
?>
<html>

<head>
  <title>StarKingdoms Admin</title>
  <link href="https://cdn.jsdelivr.net/gh/hung1001/font-awesome-pro@0ac23ca/css/all.css" rel="stylesheet"
    type="text/css" />
  <link href="static/css/common.css" rel="stylesheet" type="text/css" />
  <link href="static/css/tree.css" rel="stylesheet" type="text/css" />
</head>

<body>
  <div class="topbar tile">
    <div class="barbutton barelement bar-left" role="button">
      <a href="logout.php" class="barlink"><i class="fad fa-sign-out"></i> Log out</a>
    </div>
    <div class="barelement bar-right">
      <span><i class="fad fa-id-badge"></i> Welcome,
        <?php global $username; echo $username; ?>
      </span>
    </div>
    <div class="barelement bar-right" id="dbeditor">
      <i class="fad fa-server"></i> Database Editor
    </div>
    <div class="barbutton barelement bar-right" id="usereditor" role="button">
      <i class="fad fa-id-badge"></i> User Editor
    </div>
    <div class="barbutton barelement bar-right" id="modtools" role="button">
      <i class="fad fa-gavel"></i> Moderation
    </div>
    <div class="barbutton barelement bar-right" id="logs" role="button">
      <i class="fad fa-file-alt"></i> Logs
    </div>
    <div class="barbutton barelement bar-right" id="controls" role="button">
      <i class="fad fa-traffic-cone"></i> Server Controls
    </div>
    <div class="barbutton barelement bar-right" id="home" role="button">
      <i class="fad fa-home"></i> Homepage
    </div>
  </div>

  <div class="tile blockcenter">
    <div class="root">
      <span><i class="fad fa-database"></i> admin</span>
    </div>
    <div class="root">
      <span><i class="fad fa-database"></i> saves</span>
    </div>
    <div class="root">
      <span><i class="fad fa-database"></i> state</span>
    </div>
  </div>
</body>

</html>
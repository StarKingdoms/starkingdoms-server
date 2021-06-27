<?php
require_once('db/dbconn.php');
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

$conn->close();
?>
<html>

<head>
  <title>StarKingdoms Admin</title>
  <link href="https://cdn.jsdelivr.net/gh/hung1001/font-awesome-pro@0ac23ca/css/all.css" rel="stylesheet"
    type="text/css" />
  <link href="static/css/common.css" rel="stylesheet" type="text/css" />
  <link href="static/css/index.css" rel="stylesheet" type="text/css" />
</head>

<body>
  <div class="topbar tile">
    <div class="barbutton barelement bar-left" role="button">
      <a href="logout.php" class="barlink"><i class="fad fa-home"></i> Log out</a>
    </div>
    <div class="barelement bar-right">
      <span><i class="fad fa-id-badge"></i> Welcome,
        <?php global $username; echo $username; ?>
      </span>
    </div>
  </div>

  <div class="nav tile">
    <div class="navblock">
      <button id="dbeditor" class="navbtn bar-left">
        <i class="fad fa-server"></i>
      </button>
      <span class="btntext">DB Editor</span>
    </div>
    <div class="navblock">
      <button id="usereditor" class="navbtn bar-left">
        <i class="fad fa-server"></i>
      </button>
      <span class="btntext">User Editor</span>
    </div>
    </div>
    <div class="navblock">
      <button id="modtools" class="navbtn bar-left">
        <i class="fad fa-server"></i>
      </button>
      <span class="btntext">Moderation</span>
    </div>
    </div>
    <div class="navblock">
      <button id="logs" class="navbtn bar-left">
        <i class="fad fa-server"></i>
      </button>
      <span class="btntext">Server Logs</span>
    </div>
    </div>
    <div class="navblock">
      <button id="controls" class="navbtn bar-left">
        <i class="fad fa-server"></i>
      </button>
      <span class="btntext">Server Controls</span>
    </div>
  </div>
</body>

</html>
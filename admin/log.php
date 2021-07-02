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
  <link href="static/css/log.css" rel="stylesheet" type="text/css" />
  <script>
    function customLinkFun(loc) {
      window.location.href = loc;
    }
  </script>
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
    <div class="barbutton barelement bar-right" id="dbeditor" role="button" onclick="customLinkFun('tree.php');">
      <i class="fad fa-server"></i> Database Editor
    </div>
    <div class="barbutton barelement bar-right" id="usereditor" role="button">
      <i class="fad fa-id-badge"></i> User Editor
    </div>
    <div class="barbutton barelement bar-right" id="modtools" role="button">
      <i class="fad fa-gavel"></i> Moderation
    </div>
    <div class="barelement bar-right" id="logs" role="button">
      <i class="fad fa-file-alt"></i> Logs
    </div>
    <div class="barbutton barelement bar-right" id="controls" role="button">
      <i class="fad fa-traffic-cone"></i> Server Controls
    </div>
    <div class="barbutton barelement bar-right" id="home" onclick="customLinkFun('index.php');">
      <i class="fad fa-home"></i> Homepage
    </div>
  </div>

  <div class="tile">
    
  </div>
</body>

</html>
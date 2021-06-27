<?php
require_once('db/dbconn.php');
session_start();
if (!isset($_SESSION["login_token"]) || empty($_SESSION["login_token"])) {
  header("Location: login.php");
}

$login_token = $_SESSION["login_token"];

$msg = '';

$conn = new mysqli(DB_SERVERNAME, DB_USERNAME, DB_PASSWORD, DB_NAME);

if ($conn->connect_error) {
  global $msg;
  $msg ='<p class="error">Database error: '.$conn->connect_error.'</p>';
  return;
}

$conn->close();
?>
<html>
  <head>
    <title>StarKingdoms Admin</title>
    <link href="https://cdn.jsdelivr.net/gh/hung1001/font-awesome-pro@0ac23ca/css/all.css" rel="stylesheet" type="text/css" />
    <link href="static/css/common.css" rel="stylesheet" type="text/css" />
    <link href="static/css/index.css" rel="stylesheet" type="text/css" />
  </head>
  <body>
    <div class="topbar tile">
      <div class="barbutton bar-left" role="button">
        <a href="logout.php" class="barlink"><i class="fad fa-home"></i> Log out</a>
      </div>
    </div>
  </body>
</html>
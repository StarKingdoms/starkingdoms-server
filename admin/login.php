<?php
require_once("db/dbconn.php");
session_start();
$msg = "";
function run() {
	if (isset($_SESSION["login_token"]) && !empty($_SESSION["login_token"])) {
		// Already logged in, redirect to main page
		header("Location: index.php");
	}
	if (isset($_POST["action"]) && $_POST["action"] == "true") {
		if (!isset($_POST["username"]) || empty($_POST["username"])) {
			global $msg;
			$msg = '<p class="error">A username is required</p>';
			return;
		}
		if (!isset($_POST["password"]) || empty($_POST["password"])) {
			global $msg;
			$msg = '<p class="error">A password is required</p>';
			return;
		}
		$username = $_POST["username"];
		$password = md5($_POST["password"]);
		$conn = new mysqli(DB_SERVERNAME, DB_USERNAME, DB_PASSWORD, DB_NAME);
		if ($conn->connect_error) {
			global $msg;
			$msg ='<p class="error">Database error: '.$conn->connect_error.'</p>';
			return; 
		}

		$sql = "SELECT * FROM `admin` WHERE `username` LIKE '".$username."' AND `password` LIKE '".$password."'";
		$result = $conn->query($sql);

		if ($result->num_rows > 0) {
			while($row = $result->fetch_assoc()) {
				$_SESSION["login_token"] = $row["token"];
			}
			header("Location: index.php");
		} else {
			global $msg;
			$msg = '<p class="error">Invalid username or password</p>';
		}
		$conn->close();
	}
	if (isset($_GET["ref"])) {
		switch ($_GET["ref"]) {
			case 'logout':
				global $msg;
				$msg = '<p class="success"><i class="fad fa-check-circle"></i> You have been logged out.</p>';
				break;
			case 'admin_nli':
				global $msg;
				$msg = '<p class="error"><i class="fad fa-times-circle"></i> You need to log in first.</p>';
				break;
			case 'spftkn':
				global $msg;
				$msg = '<p class="error"><i class="fad fa-exclamation-triangle"></i> Spoofed token detected. Please log in again.</p>';
				break;
			default:
			    global $msg;
				$msg = '<p class="warning"><i class="fad fa-exclamation-triangle"></i> NV ref provided. Please log in.</p>';
				break;
		}
	}
}
run();
?>
<html lang="en">
  <head>
    <link rel="stylesheet" href="./static/css/common.css" /> <!-- links need closers -->
    <link rel="stylesheet" href="./static/css/login.css" />
    <link rel="favicon" href="https://cdn.tm85.repl.co/md/stk/heartyBase.png" />
	<link href="https://cdn.jsdelivr.net/gh/hung1001/font-awesome-pro@0ac23ca/css/all.css" rel="stylesheet"
    type="text/css" />
  </head>
  <body>
    <div class="tile centered">
      <form action="login.php" method="POST">
	<input type="hidden" name="action" value="true" />
	<?php global $msg; echo $msg; ?>
	<div class="form_group">
	  <input type="text" id="username" name="username" class="form_field">
	  <label for="username" class="form_label">Username</label>
	</div>
	<div class="form_group">
	  <input type="password" id="password" name="password" class="form_field">
	  <label for="password" class="form_label">Password</label>
	</div>
	<button class="form_button"><i class="fad fa-sign-in"></i> Log In</button>
    </div>
  </body>
</html>

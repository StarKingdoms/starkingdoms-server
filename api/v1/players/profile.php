<?php
/*
 * StarKingdoms API
 * -=- metadata -=-
 * 
 * filename=profile.php
 * version=1
 * endpoint=/players/profile
 * fullurl=/api/v1/players/profile
 * response:text/json
 * apilevel=private
 * keyfile=private.php
 */

require_once("../keyfiles/private.php");

if (isset($_GET["api_key"])) {
  if (private_allow_key($_GET["api_key"])) {
    // do something
  } else {
    http_response_code(403);
    echo '{"error": true, "code": 403, "text": "Invalid API key."}';
  }
} else {
  http_response_code(403);
  echo '{"error": true, "code": 403, "text": "API key not provided."}';
}
?>

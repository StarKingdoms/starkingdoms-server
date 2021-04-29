<?php
exec("exec $(\"ssh-agent -s\")");
exec("ssh-add /etc/apache2/id_ed25519");
exec("git autopull");
?>

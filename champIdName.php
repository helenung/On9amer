<?php
	include("getKey.php");
	$key = getKey();
	$file = "https://global.api.pvp.net/api/lol/static-data/na/v1.2/champion?champData=all&api_key=" . $key;
	header('Content-Type: application/json');
	echo file_get_contents($file);

?>
<?php
	include("getKey.php");
	$key = getKey();
	$name = htmlspecialchars($_GET["name"]);
	$region = htmlspecialchars($_GET["region"]);
	$file = "https://na.api.pvp.net/api/lol/na/v1.4/summoner/by-name/{$name}?api_key=" . $key;
	$file_headers = @get_headers($file);
	if($file_headers[0] != 'HTTP/1.1 200 OK') {
		header("HTTP/1.0 404 Not Found");
		die();
	} else {
		// header('Content-Type: application/json');
		echo file_get_contents($file);
	}
?>
<?php
	include("getKey.php");
	$key = getKey();
	$id = htmlspecialchars($_GET["id"]);
	$file = "https://na.api.pvp.net/api/lol/static-data/na/v1.2/summoner-spell/{$id}?api_key=" . $key;
	$file_headers = @get_headers($file);
	if($file_headers[0] != 'HTTP/1.1 200 OK') {
		header("HTTP/1.0 404 Not Found");
		die();
	} else {
		header('Content-Type: application/json');
		echo file_get_contents($file);
	}
?>


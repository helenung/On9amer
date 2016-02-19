<?php
	include("getKey.php");
	$key = getKey();
	$region = htmlspecialchars($_GET["region"]);
	$file = "https://{$region}.api.pvp.net/api/lol/static-data/{$region}/v1.2/realm?api_key=" . $key;
	$file_headers = @get_headers($file);
	if($file_headers[0] != 'HTTP/1.1 200 OK') {
		header("HTTP/1.0 404 Not Found");
		die();
	} else {
		header('Content-Type: application/json');
		echo file_get_contents($file);
	}
?>


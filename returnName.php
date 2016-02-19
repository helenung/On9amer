<?php
	$id = htmlspecialchars($_GET["id"]);
	$region = htmlspecialchars($_GET["region"]);
	$file = "https://na.api.pvp.net/api/lol/static-data/na/v1.2/champion/{$id}"
	$file_headers = @get_headers($file);
	if($file_headers[0] != 'HTTP/1.1 200 OK') {
		header("HTTP/1.0 404 Not Found");
		die();
	} else {
		$champion = json_decode(file_get_contents($file), true);
		echo $champion["key"];
	}
?>
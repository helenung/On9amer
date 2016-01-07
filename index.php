<!DOCTYPE html>
<!-- A webpage to submit a form to retreive data about a player of League of Legends -->
<!-- This product is not endorsed, certified or otherwise approved in any way by Riot Games, Inc. or any of its affiliates. -->

<html>
	<head>
		<title>on9a.me</title>
		<meta charset="utf-8" />

		<meta http-equiv="X-UA-Compatible" content="IE=edge" />
  		<meta name="viewport" content="width=device-width, initial-scale=1" />
 		<meta name="description" content="on9amer" />
  		<meta name="author" content="Helen Ung" />
		 
		<link href="../../landingpage/css/bootstrap.min.css" rel="stylesheet" type="text/css" />
		<link href="../../landingpage/css/bootstrap.css" rel="stylesheet" type="text/css" />
		<link href="on9ame.css" type="text/css" rel="stylesheet" /> 
		<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js" type="text/javascript"></script>
		<script src="summoner.js" type="text/javascript"></script>
		<script src="moment.js" type="text/javascript"></script>
		<link href="CaitlynYordleTrap.png" rel="shortcut icon" />
		<script type="text/javascript">
//<![CDATA[
                  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
                  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
                  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
                  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

                  ga('create', 'UA-56792101-1', 'auto');
                  ga('send', 'pageview');

  //]]>
  </script>
	</head>

	<body>
		<div class="fluid-container">
			
			<div class="row">
				
				<div class="col-lg-3 col-md-3 col-sm-3 sidebar">
					<h1 id="header">on9a.me</h1>
					<div id="profileIcon" class="row">
					</div>
					<div class="row" id="buttons">
						<div class="row">
							<div class="col-lg-12 col-md-12 col-xs-12">
								<input tabIndex="1" id="name" size="40" class="form-control" placeholder="Enter Summoner Name" 

									<?php 
									if (isset($_GET["name"])) {
										$name = $_GET["name"];
									?> value="<?= $name ?>"	
									<?php
										}
									?>

								/>
							</div>
						</div>

						<div class="row">
							<div class="col-lg-6 col-md-6 col-xs-6">
								<select class="form-control" name="region" tabIndex="2">
									<option selected="selected">na</option>
									<option>br</option>
									<option>euw</option>
									<option>eune</option>
									<option>lan</option>
									<option>las</option>
									<option>oce</option>
								</select>
							</div>

							<div class="col-lg-6 col-md-6 col-xs-6">
								<input tabIndex="3" class="btn btn-default" name="enter" type="submit" id="enter"/>
							</div>
						</div>
					</div>
					<div class="row">
						<div class="col-lg-12" id="decayAlert"></div>
					</div>
					<div class="row">
						<div class="col-lg-12" id="profile"></div>
					</div>
				</div>


				<div class="col-lg-9 col-md-9 col-sm-9 main" style="height: 100vh;">

					<div class="row">
						<div class="col-lg-12" id="error" display="none">
						</div>
					</div>				

					<div class="row">
						<div class="col-lg-12" id="inGame" display="none">
						</div>
					</div>		

					<div class="row">
						<div class="col-lg-12" id="games">
						</div>
					</div>

					<div class="row">
						<div class="col-lg-12" id="game">
						</div>
					</div>
					<div class="row footer">

					</div>
				</div>

			</div>
		</div>
	</body>
</html>
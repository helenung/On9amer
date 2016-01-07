(function() {
	// Helen Ung
	// A script that searches for the Summoner from League of Legends that the user
	// submits. If it's found, the page displays 10 clickable images that the user may
	// click to display information from that game.

	var champRealm = "5.14.1";
	var itemRealm = "5.14.1";
	var champIdName = [];
	var otherPlayers = [];

	$(function() {
		loadChampIdName();
	});

	function loadChampIdName() {
		$.get("champIdName.php", function(response) {
			response = JSON.parse(response);
			champIdName = response["keys"];
		}).done(function() {
			startUp();
		}).fail(function() {
			$("#error").show().append($("<p>").html("Something bad happened. Try again?"));
		});
	}

	function startUp() {
		$("#enter").click(getData);
		
		$("#name").keypress(function(e) {
			var key = e.which;
			if(key == 13) {
		    	$("input[name='enter']").click();
		   		return false;  
			}
		});   

		if ($("#name").val() != '') {
			$("input[name='enter']").click();
		}

		$("#content").hide();

		var allCookie = document.cookie.split(";");
		var username;
		allCookie.forEach(function(cookie) {
			var keyValue = cookie.split("=");
			if ($.trim(keyValue[0]) === "username") {
				username = $.trim(keyValue[1]);
			} 
		});
		if (username && username != "") {
			$("#name").val(username);
			$("input[name='enter']").click();
		}

		
	}

	function getData() {
		var name = $("#name").val();
		document.cookie = "username=" + name;
		var sumName = name.toLowerCase();
		sumName = sumName.replace(/\s+/g, '');
		var region = $("[name='region']").val();

		$.get("getRealm.php?region=" + region, function (response) {
			response = JSON.parse(response);
			champRealm = response["n"]["champion"];
			itemRealm = response["n"]["item"];
		}).done(function() {
			importantSetup(name, sumName, region);
		}).fail(function() {
			console.log("Couldn't retrieve realm data");
			importantSetup(name, sumName, region);
		});
	}

	function importantSetup(name, sumName, region) {
		$("#header").html(name);
		$("#games").empty();
		$("#inGame").empty();
		$("#game").empty();
		$("#error").hide().empty();
		$("#profile").empty();
		$("#rankInfo").empty();
		$("#profileIcon").empty();
		$("#decayAlert").empty().hide();
		$("title").html(name);
		$("#decayAlert").hide();
		otherPlayers = [];
		getId(sumName, region);
	}

	function getId(sumName, region) {
		$.ajax({
			url: "getId.php?name=" + sumName + "&region=" + region,
			success: function(response) {
				response = JSON.parse(response);
				var id = response[sumName]["id"];
				searchGames(id, region);
				displayProfile(id, region);
				displayIcon(response[sumName]["profileIconId"]);
				
			//	getCurrent(response[sumName]["id"]);
			},
			error: function(xhr) {
				$("#error").show().append($("<p>").html("Summoner \"" + sumName + "\" could not be found"));
			}
		});
	}

	function displayAlert(id, region) {
		$.get("getLastRankedGame.php?id=" + id + "&region=" + region, function(response) {
			if (response && response != "") {
				response = JSON.parse(response);
				var time = response["matches"][0]["timestamp"];
				showAlert(time);
			}
		});
	}

	function showAlert(lastDate) {
		var lastPlayed = moment(new Date(lastDate));
		var lastDate = lastPlayed.format('MMMM DD, YYYY');
		var plus28Days = lastPlayed.add(28, "days");
		var formatDate = plus28Days.format('MMMM DD, YYYY');
		var now = moment();

		if (now.isBefore(plus28Days)) {
			var alertImg = $("<img>").attr("alt", "exclamation mark").attr("src", "alert.png").attr("id", "alertIcon");
			$("#decayAlert").show().append(alertImg).append($("<p>").html("Your solo queue rank will decay on " + formatDate))
							.append($("<p>").html("Your last ranked solo queue game was on " + lastDate));
		}
	}

	function displayIcon(profileIconId) {
		var profileIcon = $("<img>").attr("alt", "Profile icon")
				.attr("src", "https://ddragon.leagueoflegends.com/cdn/" + itemRealm 
						+ "/img/profileicon/" + profileIconId + ".png")
				.addClass("img-responsive");
		$("#profileIcon").append(profileIcon);
	}

	function getCurrent(id) {
		$.ajax({
			url: "getCurrent.php?id=" + id,
			success: function(response) {
				if (response != "") {
					response = JSON.parse(response);
					console.log(response);
					showCurrent(response);
				}
			},
			error: function(xhr) {
				$("#error").show().append($("<p>").html("Error finding current game."));
			}
		});
	}

	function showCurrent(data) {
		$("#game").append($("<div>").attr("id", "gamecurrent").hide());
		var image = $("<img>").css("width", "75px").css("height", "75px").attr("id", "current").click(displayGame);
		setGameImg(image, 110);
		$("#games").append(image);


		var container = $("#gamecurrent");
		var blueBan = $("<div>").attr("id", "blueBan");
		var holdBlue = $("<div>").append($("<h3>").html("Blue bans")).append(blueBan);
		var purBan = $("<div>").attr("id", "purBan");
		var holdPurple = $("<div>").append($("<h3>").html("Purple bans")).append(purBan);
		var friend = $("<ul>").attr("id", "friend");
		var friendHolder = $("<div>").append($("<h3>").html("Blue Team")).append(friend);
		var enemy = $("<ul>").attr("id", "enemy");
		var enemyHolder = $("<div>").append($("<h3>").html("Purple Team")).append(enemy);
		var timePassed = data["gameLength"];
		var timeString = Math.floor(timePassed / 60) + " minutes, " + (timePassed % 60) + " seconds";

		for (var i = 1; i <= data["bannedChampions"].length; i++) {
			if (data["bannedChampions"]) {
				if (data["bannedChampions"][i - 1]["pickTurn"] == i) {
				//	var item = $("<li>");
					var img = $("<img>");
					setGameImg(img, data["bannedChampions"][i - 1]["championId"]);
					//item.append(img);
					if (data["bannedChampions"][i - 1]["teamId"] == 100) {
						blueBan.append(img);
					} else if (data["bannedChampions"][i - 1]["teamId"] == 200) {
						purBan.append(img);
					}
				}
			}
		}

		for (var i = 0; i < data["participants"].length; i++) {
			var person = $("<li>");
			person.html(data["participants"][i]["summonerName"]);
			if (data["participants"][i]["teamId"] == 100) {
				friend.append(person);
			} else if (data["participants"][i]["teamId"] = 200) {
				enemy.append(person);
			}
		}

		container.append($("<p>").html(timeString))
			.append(holdBlue)
			.append(holdPurple)
			.append(friendHolder)
			.append(enemyHolder);
		$("#inGame").append(container); 
	}

	function displayProfile(id, region) {
		$.ajax({ 
			url: "getRankStats.php?id=" + id + "&region=" + region,
			success: function(response) {
				if (response) {
					response = JSON.parse(response);
					displayRank(id, response, region);
				} 
			},
			error: function(xhr) {
				$("#error").show().append($("<p>").html("Couldn't find rank data."));
			}
		});
	}

	function displayRank(id, response, region) {
		var ranks = $("#profile");
		for (var i = 0; i < response[id].length; i++) {
			var type;
			var lp = response[id][i]["entries"][0]["leaguePoints"];
			var division = response[id][i]["entries"][0]["division"];
			var tier = response[id][i]["tier"];
			var leagueName = response[id][i]["name"];
			var wins = response[id][i]["entries"][0]["wins"];
			var medal = $("<img>").attr("src", "tier_icons/" + tier.toLowerCase() 
						+ "_" + division.toLowerCase() + ".png").attr("id", "tierIcon")
						.css("width", "125px").css("height", "125px");
			if (response[id][i]["queue"] == "RANKED_SOLO_5x5") {
				type = "Solo 5x5";
				// only plat / diamond because we don't care about master / challenger :^)
				if (tier ==  "PLATINUM" || tier == "DIAMOND") {
					displayAlert(id, region);
				}
			} else if (response[id][i]["queue"] == "RANKED_TEAM_5x5") {
				type = "Team 5x5";
			} else {
				type = "Team 3x3";
			}
			
			ranks.append(medal)
			.append($("<p>").html(leagueName))
			.append($("<p>").html(type))
			.append($("<p>").html(tier + " " + division))
			.append($("<p>").html(lp + " LP"))
			.append($("<p>").html(wins + " wins"));
		}
	}

	function searchGames(id, region) {
		$.ajax({
			url: "getGames.php?id=" + id + "&region=" + region,
			success: function(response) {
				response = JSON.parse(response);
				displayGames(response, id);
			},
			error: function(xhr) {
				$("#error").show().append($("<p>").html("Game data could not be found. Please try again later."
					+ "\nSometimes things break because the API is down or too many requests are being sent in. :("));
			}
		});
	}

	function setBackground(id) {
		$.ajax({
			url: "returnName.php?id=" + id,
			success: function(response) {
				//$(".main").css("background-image", "url(\"http://ddragon.leagueoflegends.com/cdn/img/champion/splash/" + response +"_0.jpg\")");
			},
			error: function(xhr) {
				$("#error").show().append($("<p>").html("There was an error setting background image."));
			}
		});
	}

	function appendNameToImg(otherPlayers, listPlayers) {
		$.ajax({
			url: "getSummoners.php?list=" + listPlayers,
			success: function(response) {
				response = JSON.parse(response);
				captionPlayers(otherPlayers, response);
			},
			error: function(xhr) {
				$("#error").show().append($("<p>").html("There was an error setting summoner names."));
			}
		});
	}

	function captionPlayers(otherPlayers, response) {
		for (var j = 0; j < otherPlayers.length; j++) {
			var id = otherPlayers[j];
			var name = response[id]["name"];
			$("." + id).append($("<p>")
				.html(name)
				.addClass("playerName"))
				.attr("href", "?name=" + name)
				.click(function() {
					var classes = $(this).attr("class");
					var getId = classes.split(" ");
					var thisId = getId[0];
					var thisName = response[thisId]["name"];
					$("#name").val(thisName);
				});
		}
	}

	function insertSpell(spellID, i) {
		$.ajax({
			url: "getSumID.php?id=" + spellID,
			success: function(response) {
				response = JSON.parse(response);
				$("#sumSpells" + i).append($("<img>").attr("alt", "summoner spell").attr("src", "http://ddragon.leagueoflegends.com/cdn/" + itemRealm + "/img/spell/" + response["key"] + ".png"));
			},
			error: function(xhr) {
				$("#error").show().append($("<p>").html("Couldn't find summoner spells: " + spellID));
			}
		});
	}

	function displayGames(response, id) {
		$("#content").show();
		$("#games").empty();
		$("#game").empty();
		otherPlayers.push(id);
		setBackground(response["games"][0]["championId"]);

		// Load champions bar
		for (var i = 0; i < 10; i++) {
			$("#game").append($("<div>").attr("id", "game" + i).hide());
			var champId = response["games"][i]["championId"];
			var image = $("<img>").css("width", "75px").css("height", "75px").attr("id", i).click(displayGame);
			setGameImg(image, champId);
			$("#games").append(image);
			
			var team = response["games"][i]["stats"]["team"];
			var teamColor = (team == "100") ? "blue" : "purple";
			var otherColor = (teamColor == "blue") ? "purple" : "blue";
			var outcome = (response["games"][i]["stats"]["win"] == true) ? "win" : "loss";
			if (outcome == "win") {
				image.addClass("win");
			} else {
				image.addClass("loss");
			}
		}

		for (var i = 0; i < 10; i++) {
			var map = response["games"][i]["mapId"];
			var mapName;
			if (map == 1) {
				mapName = "Summoner's Rift";
			} else if (map == 2) {
				mapName = "Summoner's Rift";
			} else if (map == 3) {
				mapName = "Proving Grounds";
			} else if (map == 4) {
				mapName = "Twisted Treeline";
			} else if (map == 8) {
				mapName = "The Crystal Scar";
			} else if (map == 10) {
				mapName = "Twisted Treeline";
			} else if (map == 11) {
				mapName = "Summoner's Rift";
			} else if (map == 12) {
				mapName = "Howling Abyss";
			} else if (map == 14) {
				mapName = "Butcher's Bridge";
			}

			var subType = response["games"][i]["subType"];
			var rankedSoloType;
			if (subType == "NONE") {
				rankedSoloType = "Custom";
			} else if ((subType == "NORMAL") || (subType == "NORMAL_3x3") || (subType == "ODIN_UNRANKED") || (subType == "ARAM_UNRANKED_5x5")) {
				rankedSoloType = "Classic";	
			} else if ((subType == "BOT") || (subType == "BOT_3x3")) {
				rankedSoloType = "Bots";
			} else if (subType == "RANKED_SOLO_5x5") {
				rankedSoloType = "Ranked Solo";
			} else if ((subType == "RANKED_TEAM_3x3") || (subType == "RANKED_TEAM_5x5")) {
				rankedSoloType = "Ranked Team";	
			} else if (subType == "ONEFORALL_5x5") {
				rankedSoloType = "One for all";
			} else if (subType == "CAP_5x5") {
				rankedSoloType = "Team Builder";
			} else if (subType == "URF") {
				rankedSoloType = "Urf";
			} else if (subType == "URF_BOT") {
				rankedSoloType = "Urf Bots";
			} else if (subType == "BILGEWATER") {
				rankedSoloType = "Black Market Brawlers";
			} else {
				rankedSoloType = subType;
			}
			var champId = response["games"][i]["championId"];
			var team = response["games"][i]["stats"]["team"];
			var teamColor = (team == "100") ? "blue" : "purple";
			var otherColor = (teamColor == "blue") ? "purple" : "blue";
			var outcome = (response["games"][i]["stats"]["win"] == true) ? "win" : "loss";
			var champLevel = response["games"][i]["stats"]["level"];

			// MAP NAME TITLE
			$("#game" + i).append($("<h2>").html(mapName));
			$("#game" + i).append($("<h2>").html(rankedSoloType));
			var team = response["games"][i]["stats"]["team"];
			var teamColor = (team == "100") ? "blue" : "purple";
			var otherColor = (teamColor == "blue") ? "purple" : "blue";
			var outcome = (response["games"][i]["stats"]["win"] == true) ? "win" : "loss";
			$("#game" + i).append($("<h3>").html(outcome + " on " + teamColor + " side" ));

			// CREATE DATE
			var createDate = response["games"][i]["createDate"];
			var formatCreateDate = moment(createDate).format("MMMM DD, YYYY hh:mm a");
			$("#game" + i).append($("<span>").html(formatCreateDate));


			// SUMMONER SPELLS
			var spell1 = response["games"][i]["spell1"];
			var spell2 = response["games"][i]["spell2"];

			var sumSpells = $("<div>").addClass("row").attr("id", "sumSpells" + i)
				.append($("<h3>").html("spells"));
			insertSpell(spell1, i);
			insertSpell(spell2, i);	
			$("#game" + i).append(sumSpells);

			// ITEMS
			var items = $("<div>").addClass("row").attr("id", "items" + i)
				.append($("<h3>").html("items"));
			for (var k = 0; k < 7; k++) {
				if (response["games"][i]["stats"]["item" + k]) {
					$("#items" + i).append($("<img>").attr("src", "http://ddragon.leagueoflegends.com/cdn/" 
							+ itemRealm + "/img/item/" + response["games"][i]["stats"]["item" + k] + ".png")
							.attr("alt", "item").addClass("item"));
				}
			}
			$("#game" + i).append(items);

			// STATS
			var kills = (response["games"][i]["stats"]["championsKilled"] > 0) ? 
					response["games"][i]["stats"]["championsKilled"] : 0;
			var deaths = (response["games"][i]["stats"]["numDeaths"] > 0) ? 
					response["games"][i]["stats"]["numDeaths"] : 0;
			var assists = (response["games"][i]["stats"]["assists"] > 0) ? 
					response["games"][i]["stats"]["assists"] : 0;
			var kda = (deaths != 0) ? (kills + assists) / deaths : "perfect";
			if (kda > 0) {
				kda = kda.toFixed(2);
			}

			var stats = $("<div>").addClass("row").attr("id", "stats" + i)
				.append($("<h3>").html("stats"))
				.append($("<p>").html("Kills: " + kills))
				.append($("<p>").html("Deaths: " + deaths))
				.append($("<p>").html("Assists: " + assists))
				.append($("<p>").html("KDA: " + kda));

			var dblKills = (response["games"][i]["stats"]["doubleKills"] > 0) ? 
					response["games"][i]["stats"]["doubleKills"] : 0;
			var trpKills = (response["games"][i]["stats"]["tripleKills"] > 0) ? 
					response["games"][i]["stats"]["tripleKills"] : 0;
			var qdrKills = (response["games"][i]["stats"]["quadraKills"] > 0) ? 
					response["games"][i]["stats"]["quadraKills"] : 0;
			var ptaKills = (response["games"][i]["stats"]["pentaKills"] > 0) ? 
					response["games"][i]["stats"]["pentaKills"] : 0;


			if (ptaKills > 0) {
				var text = "PENTA KILL";
				if (ptaKills > 1) {
					text = text + "s";
				}
				stats.append($("<p>").html(ptaKills + " " + text + "!!!!!!!!!"));
				qdrKills -= ptaKills;
				trpKills -= ptaKills;
				dblKills -= ptaKills;
			}
			if (qdrKills > 0) {
				var text = "QUADRA kill";
				if (qdrKills > 1) {
					text = text + "s";
				}
				stats.append($("<p>").html(qdrKills + " " + text + "!!!"));
				trpKills -= ptaKills;
				dblKills -= ptaKills;
			}
			if (trpKills > 0) {
				var text = "triple kill";
				if (trpKills > 1) {
					text = text + "s";
				}
				stats.append($("<p>").html(trpKills + " " + text + "!"));
				dblKills -= ptaKills;
			}
			if (dblKills > 0) {
				if (dblKills > 1) {
					text = text + "s";
				}
				var text = "double kill";
				stats.append($("<p>").html(dblKills + " " + text));
			}

			$("#game" + i).append(stats);

			// GOLD
			var goldEarned = response["games"][i]["stats"]["goldEarned"];
			var goldSpent = response["games"][i]["stats"]["goldSpent"];

			var gold = $("<div>").addClass("row").attr("id", "gold" + i)
				.append($("<h3>").html("gold"))
				.append($("<p>").html("Gold earned: " + goldEarned))
				.append($("<p>").html("Gold spent: " + goldSpent));
			$("#game" + i).append(gold);

			// DAMAGE
			var magicDamageDealtToChampions = response["games"][i]["stats"]["magicDamageDealtToChampions"];
			var magicDamageDealtPlayer = response["games"][i]["stats"]["magicDamageDealtPlayer"];
			var physicalDamageDealtToChampions = response["games"][i]["stats"]["physicalDamageDealtToChampions"];
			var physicalDamageDealtPlayer = response["games"][i]["stats"]["physicalDamageDealtPlayer"];
			var totalDamageDealtToChampions = response["games"][i]["stats"]["totalDamageDealtToChampions"];
			var totalDamageDealt = response["games"][i]["stats"]["totalDamageDealt"];
			var magicDamageTaken = response["games"][i]["stats"]["magicDamageTaken"];
			var physicalDamageTaken = response["games"][i]["stats"]["physicalDamageTaken"];
			var trueDamageTaken = response["games"][i]["stats"]["trueDamageTaken"];
			var totalDamageTaken = response["games"][i]["stats"]["totalDamageTaken"];
			var damage = $("<div>").addClass("row").attr("id", "damage" + i)
				.append($("<h3>").html("damage"))
				.append($("<p>").html("Magic damage dealt to champions: " + magicDamageDealtToChampions))
				.append($("<p>").html("Total magic damage dealt: " + magicDamageDealtPlayer))
				.append($("<p>").html("Physical damage dealt to champions: " + physicalDamageDealtToChampions))
				.append($("<p>").html("Total physical damage dealt: " + physicalDamageDealtPlayer))
				.append($("<p>").html("Total damage dealt: " + totalDamageDealt))
				.append($("<p>").html("Total damage dealt to champions: " + totalDamageDealtToChampions))
				.append($("<p>").html("Magic damage taken: " + magicDamageTaken))
				.append($("<p>").html("Physical damage taken: " + physicalDamageTaken))
				.append($("<p>").html("True damage taken: " + trueDamageTaken))
				.append($("<p>").html("Total damage taken: " + totalDamageTaken));
			$("#game" + i).append(damage);			


			// WARDS
			var wardPlace = (response["games"][i]["stats"]["wardPlaced"] > 0) ? 
					response["games"][i]["stats"]["wardPlaced"] : 0;
			var wardKill = (response["games"][i]["stats"]["wardKilled"] > 0) ? 
					response["games"][i]["stats"]["wardKilled"] : 0;
			var wardBought = (response["games"][i]["stats"]["sightWardsBought"] > 0) ? 
					response["games"][i]["stats"]["sightWardsBought"] : 0;
			var vWardBought = (response["games"][i]["stats"]["visionWardsBought"] > 0) ? 
					response["games"][i]["stats"]["visionWardsBought"] : 0;

			if (map != 12 && map != 14 && map != 10) {
				var wards = $("<div>").addClass("row").attr("id", "wards" + i)
					.append($("<h3>").html("wards"));

				if (wardBought == 0 && vWardBought == 0) {
					wards.append($("<p>").html("no wards bought!"));
				} else {
					wards.append($("<p>").html("Sight wards bought: " + wardBought))
					.append($("<p>").html("Vision wards bought: " + vWardBought))
				}

				wards.append($("<p>").html("Wards killed: " + wardKill))
					.append($("<p>").html("Wards placed: " + wardPlace));
					
				$("#game" + i).append(wards);
			}

			// CREEP SCORE
			var laneMinions = response["games"][i]["stats"]["minionsKilled"];
			var yourJung = (response["games"][i]["stats"]["neutralMinionsKilledYourJungle"] > 0) ? 
					response["games"][i]["stats"]["neutralMinionsKilledYourJungle"] : 0;
			var otherJung =(response["games"][i]["stats"]["neutralMinionsKilledEnemyJungle"] > 0) ? 
					response["games"][i]["stats"]["neutralMinionsKilledYourJungle"] : 0;
			var jungleMin = yourJung + otherJung;

			var creepScore = $("<div>").addClass("row").attr("id", "creepScore" + i)
				.append($("<h3>").html("creep score"))
				.append($("<p>").html("Lane minions killed: " + laneMinions))
				.append($("<p>").html("Own jungle minions killed: " + yourJung))
				.append($("<p>").html("Enemy jungle minions countered: " + otherJung))
				.append($("<p>").html("Total CS: " + (laneMinions + yourJung + otherJung)));
			$("#game" + i).append(creepScore);

			for (var k = 0; k < 7; k++) {
				if (response["games"][i]["stats"]["item" + k]) {
					$("#items" + i).append($("<img>").attr("src", "http://ddragon.leagueoflegends.com/cdn/" 
							+ itemRealm + "/img/item/" + response["games"][i]["stats"]["item" + k] + ".png")
							.attr("alt", "item").addClass("item"));
				}
			}

			var bots = response["games"][i]["subType"];

			var rowForFriends = $("<div>").addClass("row").attr("id", "rowForFriends" + i);
			rowForFriends.append($("<h3>").html(teamColor));
			var rowForEnemies = $("<div>").addClass("row").attr("id", "rowForEnemies" + i);
			$("#game" + i).append(rowForFriends);
			if (bots != "BOT" && bots != "BOT_3x3") {
				rowForEnemies.append($("<h3>").html(otherColor));
				$("#game" + i).append(rowForEnemies);
			}
			
			// Add self
			var champ = $("<img>").attr("class", "img-responsive").attr("alt", "champion");
			var champImg = $("<a>").attr("class", id + " playerAnchor col-lg-2 col-md-2 col-sm-2");
			champImg.append(champ);
			setGameImg(champ, champId);
			rowForFriends.append(champImg);

			if (response["games"][i]["fellowPlayers"]) {
				for (var j = 0; j < response["games"][i]["fellowPlayers"].length; j++) {
					var playerId = response.games[i].fellowPlayers[j].summonerId;

					if ($.inArray(playerId, otherPlayers) == -1) {
						otherPlayers.push(playerId);
					}

					var imgDiv = $("<a>").attr("class", playerId + " playerAnchor col-lg-2 col-md-2 col-sm-2");
					var img = $("<img>").attr("alt", "champion").attr("class", "img-responsive");

					imgDiv.append(img);
					setGameImg(img, response["games"][i]["fellowPlayers"][j]["championId"]);
					if (response["games"][i]["fellowPlayers"][j]["teamId"] == team) {
						rowForFriends.append(imgDiv);
					} else {
						rowForEnemies.append(imgDiv);
					}
				}
			}
		}
		
		var listSize = otherPlayers.length;
		var timesToSplit = Math.ceil(listSize / 40);

		for (var k = 0; k < timesToSplit; k++) {
			var start = 40 * k;
			var end = start + 40;
			if (k == timesToSplit - 1) {
			 	end = listSize;
			}
			var subList = otherPlayers.slice(start, end);
			var listPlayers = subList[0];
			for (var l = 1; l < subList.length; l++) {
				listPlayers += "," + subList[l];
			}
			appendNameToImg(subList, listPlayers);
		}
	}

	function displayGame() {
		for (var i = 0; i < 10; i++) {
			$("#game" + i).hide();
		}
		$("#game").show();
		$("#game" + this.id).toggle("slow");
	}

	function setGameImg(image, champId) {
		image.attr("src", "http://ddragon.leagueoflegends.com/cdn/" 
						+ champRealm + "/img/champion/" + champIdName[champId] + ".png")
			.attr("alt", "champion image");
	}
})();
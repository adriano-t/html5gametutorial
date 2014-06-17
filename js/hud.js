
function MainMenu(){ 
	game.sndMusic.loop = true;
	game.sndMusic.play();
	
	var stars = [];
	var lock = [];
	for(var i=1; i < levels.length; i++){
		var s = localStorage["level"+i];
		stars[i] = (s != undefined)? s: 0;
		
		if(localStorage["complete"+i] == undefined){
			lock[i+1] = true;
		}else{
			lock[i+1] = false;
		}
	}
	lock[1] = false;
	
	
	this.Draw = function(){
		this.screen();
	}
	
	this.MainScreen = function(){
		
		game.ctx.save();  
		game.ctx.fillStyle = game.patternMenu;
		game.ctx.fillRect(0,0,game.canvas.width, game.canvas.height);
		game.ctx.restore();
		
		game.ctx.drawImage(game.sprLogo, game.canvas.width/2 - game.sprLogo.width/2 , 80);
		
		game.ctx.drawImage(game.sprSplashLogo, 70 , 180);
		
		game.ctx.shadowColor = "#000";
		game.ctx.shadowOffsetX = 1; 
		game.ctx.font = "32pt 'PixelFont'"  
		game.ctx.textAlign = "center";
		game.ctx.shadowBlur = 3;
		
		var cx = game.canvas.width/2;
		var cy = game.canvas.height/2;
			
		if(Inputs.MouseInsideText("New Game",cx, cy+10,"#eee", "#ea4") && Inputs.GetMousePress(MOUSE_LEFT))
			game.fadeout = new FadeOut(40, function() {game.mainMenu.screen = game.mainMenu.SelectionScreen;}); 
			
		if(Inputs.MouseInsideText("Other games",cx, cy+80,"#eee", "#ea4") && Inputs.GetMousePress(MOUSE_LEFT)){
			window.location.href = "http://facebook.com/revolabgames";
		}
		
		game.ctx.textAlign = "start"; 
		game.ctx.font = "12pt 'Segoe UI Light',Verdana";
		game.ctx.fillStyle = "#eee";
		game.ctx.fillText("HTML.it | Guida Videogame HTML5 di Adriano Tumminelli", 60, game.canvas.height-20);
		game.ctx.drawImage(game.sprHTML, 5, game.canvas.height-55);
		
		game.ctx.shadowOffsetX = 0; 
		game.ctx.shadowBlur = 0;
	}
	
	this.screen = this.MainScreen;
	
	
	this.SelectionScreen = function(){
		//background
		game.ctx.drawImage(game.backgroundSelect, 0,0);
		//logo
		game.ctx.drawImage(game.sprSelectLogo, game.canvas.width/2 - game.sprSelectLogo.width/2 , 50);

	
		game.ctx.drawImage(game.sprSelectArrow, 50 , 240);
		if(Inputs.MouseInsideRect(50,240, game.sprSelectArrow.width, game.sprSelectArrow.height)){
			if(Inputs.GetMousePress(MOUSE_LEFT)){
				game.fadeout = new FadeOut(40, function() {game.mainMenu.screen = game.mainMenu.MainScreen;});
			}
		}
		
		var x = 180;
		var y = 180;
		var w = game.sprSelectButton.w;
		var perRow = 5;
		var spacing = 20;
		game.ctx.fillStyle = "#fff";
		game.ctx.font = "40pt 'PixelFont'"  
		game.ctx.textAlign = "center";
		
		for(var i=0; i < levels.length-1; i++){
			var px = x + (w+spacing)*(i % perRow);
			var py = y + (w+spacing)*Math.floor(i/perRow);
			var lev = i+1;
			
			if(!lock[lev]){
				
				game.ctx.drawImage(game.sprSelectButton, px, py);
				if(Inputs.MouseInsideRect(px, py, w, w)){
					if(Inputs.GetMousePress(MOUSE_LEFT)){
						var l = lev;
						game.fadeout = new FadeOut(60, function() {game.LoadLevel(l);});
					}
				}
				if(stars[lev] > 0) game.ctx.drawImage(game.sprStarOn, px + 5, py+55);
				else game.ctx.drawImage(game.sprStarOff, px + 5, py+55);
				
				
				if(stars[lev] > 2) game.ctx.drawImage(game.sprStarOn, px + 35, py+55);
				else game.ctx.drawImage(game.sprStarOff, px + 35, py+55);
				
				
				if(stars[lev] > 1) game.ctx.drawImage(game.sprStarOn, px + 20, py+60);
				else game.ctx.drawImage(game.sprStarOff, px + 20, py+60);
				
			}
			else{
				game.ctx.drawImage(game.sprLockButton, px, py);
			}
			
			game.ctx.fillText(lev, px+w/2, py+45);
		}

			
		game.ctx.textAlign = "start";
	}
}

function FadeOut(time, callback){
	game.sleep = true;
	this.timeStart = time/2;
	this.time = this.timeStart;
	this.callback = callback;
	this.out = true;
	this.Update = function(){
		game.ctx.fillStyle = "#000";
		if(this.out){
			game.ctx.globalAlpha = 1 - this.time/this.timeStart;
			if(this.time-- <= 0){
				this.out = false;
				this.time = this.timeStart;
				this.callback();
			}
		}
		else{
			game.ctx.globalAlpha = this.time/this.timeStart;
			if(this.time-- <= 0){
				game.fadeout = null;
				game.sleep =  false;
			}
		}
		game.ctx.fillRect(-1,-1,game.canvas.width+1,game.canvas.height+1);
		game.ctx.globalAlpha = 1;
	}
}

function LevelCompleted(){
	this.coins = 0;
	this.timer = 3;
	this.sw = game.sprStarOn.width*2;
	this.sh = game.sprStarOn.height*2;
	this.complete = false;
	game.sleep = true;
	this.Draw = function(){
		var stars = Math.floor(this.coins/game.coinsCount * 3);
		
		//draw rectangle
		
		var cx = game.canvas.width/2;
		
		game.ctx.fillStyle = "#000";
		game.ctx.globalAlpha = 0.8;
		game.ctx.fillRect(25,25,game.canvas.width-50, game.canvas.height-50);
		game.ctx.globalAlpha = 1;
		
		//draw score
		game.ctx.fillStyle = "#fff";
		game.ctx.textAlign = "center";
		game.ctx.font = "70pt 'PixelFont'"  
		game.ctx.fillText("LEVEL COMPLETED!", cx, 140);
		game.ctx.font = "40pt 'PixelFont'"  
		game.ctx.fillText(this.coins+"/"+game.coinsCount, cx, 220);
		
		
		var sx = game.canvas.width/2-this.sw/2;
		if(stars > 0) game.ctx.drawImage(game.sprStarOn, sx-80, 260, this.sw, this.sh);
		else game.ctx.drawImage(game.sprStarOff, sx-80, 260, this.sw, this.sh);
		
		if(stars > 1) game.ctx.drawImage(game.sprStarOn, sx, 260, this.sw, this.sh);
		else game.ctx.drawImage(game.sprStarOff, sx, 260, this.sw, this.sh);
		
		if(stars > 2) game.ctx.drawImage(game.sprStarOn, sx+80, 260, this.sw, this.sh);
		else game.ctx.drawImage(game.sprStarOff, sx+80, 260, this.sw, this.sh);
		
		if(this.complete){
			game.ctx.drawImage(game.sprContinue, cx-game.sprContinue.width/2, 330);
			if(Inputs.GetMousePress(MOUSE_LEFT))
			{ 
				if(Inputs.MouseInsideRect(cx-game.sprContinue.width/2, 330, game.sprContinue.width, game.sprContinue.height)){
					if(game.fadeout == null){
						game.fadeout = new FadeOut(60, function() {
							game.LoadLevel(0);
							game.mainMenu.screen = game.mainMenu.SelectionScreen;
						});
					}
				}
			}
			 
		}
		else{
			///aumenta punteggio
			if(this.timer-- <= 0){
				this.coins++;
				AudioPlay(game.sndCoin);
				if(this.coins >= game.score){
					this.complete = true;
				}
				this.timer = 2;
			}
		}
		
		
		
		 
	}
	
}


function Hud(){

	this.Draw = function(){
		for(var i = 0; i < 5; i++){
			if(game.lives > i)
				game.ctx.drawImage(game.sprLife, 70 + i * 50 , game.canvas.height - 60);
			else
				game.ctx.drawImage(game.sprLifeLost, 70 + i * 50 , game.canvas.height - 60);
		}
		
		var buttonX = 10,
		buttonY = game.canvas.height - 60,
		buttonW = game.sprPause.width,
		buttonH = game.sprPause.height;
		
		if(game.paused && !game.sleep){
			game.ctx.drawImage(game.sprResume, buttonX, buttonY);
			//menu di pausa
			 
			game.ctx.shadowColor = "#000";
			game.ctx.shadowOffsetX = 1; 
			game.ctx.font = "38pt 'PixelFont'"  
			game.ctx.textAlign="center";
			game.ctx.shadowBlur = 3;
			
			var cx = game.canvas.width/2;
			var cy = game.canvas.height/2;
			if(Inputs.MouseInsideText("Resume",cx, cy,"#eee", "#ea4") && Inputs.GetMousePress(MOUSE_LEFT)){
				game.paused = false;
			}
			
			if(Inputs.MouseInsideText("Main Menu",cx, cy+60, "#eee", "#ea4")&& Inputs.GetMousePress(MOUSE_LEFT)){
				
				game.fadeout = new FadeOut(60, function() {game.LoadLevel(0);});
			}
			
			game.ctx.shadowOffsetX = 0; 
			game.ctx.shadowBlur = 0;
			game.ctx.textAlign="start";
		}else{
			game.ctx.drawImage(game.sprPause, buttonX, buttonY);
		}
		
		if(Inputs.GetMousePress(MOUSE_LEFT))
		{ 
			if(Inputs.MouseInsideRect(buttonX, buttonY, buttonW, buttonH)){
				game.paused = !game.paused;
			}
		}
		
		//fullscreen
		game.ctx.drawImage(game.sprFullscreen, game.canvas.width-60, buttonY);
		
		
		game.ctx.fillStyle = "#fff";
		game.ctx.shadowColor = "#000";
		game.ctx.shadowOffsetX = 1; 
		game.ctx.font = "24pt 'PixelFont'" 
		game.ctx.shadowBlur = 3;
		//game.ctx.fillText("Score: "+game.score, 380, game.canvas.height - 20);
		game.ctx.fillText("Level: "+game.level, 600, game.canvas.height - 20);
		game.ctx.shadowOffsetX = 0; 
		game.ctx.shadowBlur = 0;
	
		
	}
}


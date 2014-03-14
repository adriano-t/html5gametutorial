/* TO DO LIST
- specie di torrette che ti sparano
- mostri alla super mario che vanno a dx e sx 
- un nemico scudo-sparo (rimane in modalità "scudo": non puoi scalfirlo, poi toglie lo scudo per spararti un colpo, e diventa momentaneamente vulnerabile)


*/

var game = null;

 
function Block(x, y){ 
	this.x = x;
	this.y = y;
	this.width = game.cellSize;
	this.height = game.cellSize;
	this.bbox = new BoundingBox(x, y, this.width, this.height); 
}

function Bullet(x,y,hspeed){
	this.x = x;
	this.y = y;
	this.hSpeed = hspeed;
	this.bbox = new BoundingBox(x, y, game.sprBullet.width, game.sprBullet.height);
	
	this.Draw = function(){
		game.ctx.drawImage(game.sprBullet, this.x-game.sprBullet.width/2 - game.viewX, this.y-game.sprBullet.height/2 - game.viewY);
	}
	this.Update = function(){
		for(var i = 0; i < game.blocks.length; i++){ 
			if(this.bbox.CollidesAt(game.blocks[i].bbox, this.x+this.hSpeed/2, this.y)){ 
				this.Destroy();
				break;
			}
		}
		for(var i = 0; i < game.enemies.length; i++){
			if(this.bbox.CollidesAt(game.enemies[i].bbox, this.x+this.hSpeed/2, this.y)){ 
				if(game.enemies[i].curFrame == 1)game.enemies[i].life--;
				this.Destroy();
				break;
			}
		}
		this.x += this.hSpeed;
		this.bbox.Move(this.x-game.sprBullet.width/2, this.y-game.sprBullet.height/2);
		
		if(this.x > game.AreaW * game.cellSize || this.x < 0){
			this.Destroy();
		}
	}
	
	this.Destroy = function(){
			game.bullets.splice(game.bullets.indexOf(this), 1);
			new BulletExplosion(this.x, this.y);
	}
	
	this.id = game.bullets.length;
	game.bullets.push(this); 
}


function BulletExplosion(x,y){
	AudioPlay(game.sndHit);
	this.sprite = game.sprBulletHit;
	this.x = x;
	this.y = y;
	this.curFrame = 0;
	this.animSpeed = 0.25;
	
	this.Draw = function(){
		var ox = Math.floor(this.curFrame) * this.sprite.w;
		game.ctx.drawImage(this.sprite,ox,0,this.sprite.w,this.sprite.height,this.x - game.viewX - this.sprite.w/2, this.y - game.viewY - this.sprite.height/2, this.sprite.w, this.sprite.height); 
	}
	
	this.Update = function(){
		this.curFrame += this.animSpeed;
		var diff = this.curFrame - this.sprite.frames;
		if(diff >= 0){
			this.curFrame = diff;
		}
		if(this.curFrame > 2){
			game.entities.splice(game.entities.indexOf(this), 1);
		}
	}
	game.entities.push(this); 
	
}


function Explosion(x,y){
	AudioPlay(game.sndHit);
	this.sprite = game.sprExplosion;
	this.x = x;
	this.y = y;
	this.curFrame = 0;
	this.animSpeed = 0.2;
	
	this.Draw = function(){
		var ox = Math.floor(this.curFrame) * this.sprite.w;
		game.ctx.drawImage(this.sprite,ox,0,this.sprite.w,this.sprite.height,this.x - game.viewX - this.sprite.w/2, this.y - game.viewY - this.sprite.height/2, this.sprite.w, this.sprite.height); 
	}
	
	this.Update = function(){
		this.curFrame += this.animSpeed;
		var diff = this.curFrame - this.sprite.frames;
		if(diff >= 0){
			this.curFrame = diff;
		}
		if(this.curFrame > 2){
			game.entities.splice(game.entities.indexOf(this), 1);
		}
	}
	game.entities.push(this); 
	
}


function Portal(x,y){
	this.sprite = game.sprPortal;
	this.x = x;
	this.y = y;
	this.active = true;
	this.curFrame = 0;
	this.animSpeed = 0.25;
	this.bbox = new BoundingBox(x, y, this.sprite.w- this.sprite.w/2, this.sprite.height- this.sprite.height/2);
	
	this.Draw = function(){
		var ox = Math.floor(this.curFrame) * this.sprite.w;
		game.ctx.drawImage(this.sprite,ox,0,this.sprite.w,this.sprite.height,this.x - game.viewX - this.sprite.w/2, this.y - game.viewY - this.sprite.height/2, this.sprite.w, this.sprite.height); 
	}
	
	this.Update = function(){
		this.curFrame += this.animSpeed;
		var diff = this.curFrame - this.sprite.frames;
		if(diff >= 0){
			this.curFrame = diff;
		}
		if(this.bbox.CollidesAt(game.player.bbox, this.x, this.y)){
			if(this.active){
				this.active = false;
				game.levelCompleted = new LevelCompleted();
				var s = localStorage["level"+game.level];
				if(s==undefined) s=0;
				var result = Math.floor(game.score/game.coinsCount * 3);
				if(result > s)
					localStorage["level"+game.level] = result;
				
				localStorage["complete"+game.level] = true;
			}
			

		}
	}
	game.entities.push(this); 
	
}

function Spawn(x,y){
	this.sprite = game.sprSpawn;
	this.x = x;
	this.y = y;
	this.curFrame = 0;
	this.animSpeed = 0.25;
	
	this.Draw = function(){
		var ox = Math.floor(this.curFrame) * this.sprite.w;
		game.ctx.drawImage(this.sprite,ox,0,this.sprite.w,this.sprite.height,this.x - game.viewX, this.y - game.viewY, this.sprite.w, this.sprite.height); 
	}
	
	this.Update = function(){
		this.curFrame += this.animSpeed;
		var diff = this.curFrame - this.sprite.frames;
		if(diff >= 0){
			this.curFrame = diff;
		}
	}
	game.entities.push(this); 
	
}


function Coin(x,y){
	this.sprite = game.sprCoin;
	this.x = x;
	this.y = y;
	this.curFrame = 0;
	this.animSpeed = 0.2;
	this.hit = false;
	this.boing = Math.random()*3;
	this.bbox = new BoundingBox(x, y, this.sprite.w, this.sprite.height);
	
	this.Draw = function(){
		var ox = Math.floor(this.curFrame) * this.sprite.w;
		game.ctx.drawImage(this.sprite,ox,0,this.sprite.w,this.sprite.height,this.x - game.viewX - this.sprite.w/2, this.y - game.viewY - this.sprite.height/2, this.sprite.w, this.sprite.height); 
	}
	
	this.Update = function(){
		if(this.hit){
			this.curFrame += this.animSpeed;
			var diff = this.curFrame - this.sprite.frames;
			if(diff >= 0){
				this.curFrame = diff;
			}
			this.y--;
			if(this.life-- <= 0){
				game.entities.splice(game.entities.indexOf(this), 1);
			}
		}else{
			this.boing += 0.1;
			this.y += Math.cos(this.boing)/7;
			if(this.bbox.CollidesAt(game.player.bbox, this.x, this.y)){ 
				this.life = 30; 
				game.score++;
				AudioPlay(game.sndCoin);
				this.hit = true;
			}
		}
	}
	game.entities.push(this); 
	
}

function TurretBullet(x,y,hspeed){
	this.x = x;
	this.y = y;
	this.hSpeed = hspeed;
	this.bbox = new BoundingBox(x, y, game.sprTurretBullet.width, game.sprTurretBullet.height);
	
	this.Draw = function(){
		game.ctx.drawImage(game.sprTurretBullet, this.x-game.sprTurretBullet.width/2 - game.viewX, this.y-game.sprTurretBullet.height/2 - game.viewY);
	}
	this.Update = function(){
		for(var i = 0; i < game.blocks.length; i++){ 
			if(this.bbox.CollidesAt(game.blocks[i].bbox, this.x+this.hSpeed/2, this.y)){ 
				this.Destroy();
				break;
			}
		}
		if(!game.player.hit)
			if(this.bbox.CollidesAt(game.player.bbox, this.x+this.hSpeed/2, this.y)){ 
				game.player.Hit();
				this.Destroy();
			}
		this.x += this.hSpeed;
		this.bbox.Move(this.x-game.sprTurretBullet.width/2, this.y-game.sprTurretBullet.height/2);
		
		if(this.x > game.AreaW * game.cellSize || this.x < 0){
			this.Destroy();
		}
	}
	
	this.Destroy = function(){
			game.bullets.splice(game.bullets.indexOf(this), 1);
			new BulletExplosion(this.x, this.y);
	}
	
	game.bullets.push(this); 
	
}

function Turret(x,y){
	this.sprite = game.sprTurret;
	this.x = x+this.sprite.w/2;
	this.y = y;
	this.curFrame = 0;
	this.timer = 50 * Math.random();
	this.shotTimer = 0;
	this.scaling = 1;
	this.life =  5;
	this.bbox = new BoundingBox(this.x-this.sprite.w/2+5, this.y, this.sprite.w-10, this.sprite.height);
	
	this.Draw = function(){
		game.ctx.save();
		game.ctx.translate(this.x-game.viewX,this.y-game.viewY);
		game.ctx.scale(this.scaling, 1);
		var ox = Math.floor(this.curFrame) * this.sprite.w;
		game.ctx.drawImage(this.sprite,ox,0,this.sprite.w,this.sprite.height,-this.sprite.w/2,0, this.sprite.w, this.sprite.height); 
		game.ctx.restore();
	}
	
	this.Update = function(){
		this.timer--;
		
		if(this.timer<=0){
			this.curFrame = !this.curFrame;
			this.timer = 200;
			this.shotTimer = 0;
			if(game.player.x < this.x) this.scaling = 1;
			else this.scaling = -1;
		}
		
		if(this.curFrame == 1){
			this.shotTimer --;
			if(this.shotTimer<=0){
				new TurretBullet(x + 16 - this.scaling*16,y+16,-5*this.scaling);
				
				AudioPlay(game.sndShotEnemy);
				this.shotTimer = 60;
			}
		}
		if(this.life < 0){
			game.enemies.splice(game.enemies.indexOf(this), 1);
			new Explosion(this.x, this.y);
		}
	}
	game.enemies.push(this); 	
}

function Umbrella(x,y){
	this.sprite = game.sprUmbrella;
	this.x = x;
	this.y = y;
	this.curFrame = 0;
	this.timer = 50 * Math.random();
	this.shotTimer = 0;
	this.hSpeed = 1;
	this.life =  5;
	this.animSpeed = 0.25;
	this.bbox = new BoundingBox(this.x, this.y, this.sprite.w, this.sprite.height);
	
	this.Draw = function(){
		var ox = Math.floor(this.curFrame) * this.sprite.w;
		game.ctx.drawImage(this.sprite,ox,0,this.sprite.w,this.sprite.height,this.x - game.viewX, this.y - game.viewY, this.sprite.w, this.sprite.height); 
	}
	
	this.Update = function(){
		for(var i = 0; i < game.blocks.length; i++){ 
			if(this.bbox.CollidesAt(game.blocks[i].bbox, this.x+this.hSpeed/2, this.y)){ 
				this.hSpeed = -this.hSpeed;
				break;
			}
		}
		this.x += this.hSpeed;
		
		if(this.life < 0){
			game.enemies.splice(game.enemies.indexOf(this), 1);
		}
		
		this.curFrame += this.animSpeed;
		var diff = this.curFrame - this.sprite.frames;
		if(diff >= 0){
			this.curFrame = diff;
		}
		this.bbox.Move(this.x, this.y);
		if(!game.player.hit)
			if(this.bbox.Collides(game.player.bbox)){
				game.player.Hit();
			}
	}
	game.enemies.push(this); 
	
}

function Spikes(x,y){
	this.sprite = game.sprSpikes;
	this.x = x+this.sprite.w/2;
	this.y = y;
	this.curFrame = Math.floor(Math.random()*2);
	this.timer = 50 * Math.random();
	this.bbox = new BoundingBox(this.x, this.y, this.sprite.w, this.sprite.height);
	
	this.Draw = function(){
		var ox = Math.floor(this.curFrame) * this.sprite.w;
		game.ctx.drawImage(this.sprite,ox,0,this.sprite.w,this.sprite.height,this.x - game.viewX, this.y - game.viewY, this.sprite.w, this.sprite.height); 
	}
	
	this.Update = function(){
		this.timer--;
		if(this.timer<=0){
			this.curFrame = !this.curFrame;
			this.timer = 100;
		}
		
		if(this.curFrame == 1){
			if(!game.player.hit)
			if(this.bbox.Collides(game.player.bbox)){
				game.player.Hit();
			}
		}
	}
	
	this.id = game.enemies.length;
	game.enemies.push(this); 
	
}

function Player(){
	this.sprite = game.sprPlayerRun;
	this.curFrame = 0.01;
	this.width = this.sprite.w;
	this.height = this.sprite.height; 
	this.xStart = game.spawnX;
	this.yStart = game.spawnY;
	this.x = this.xStart;
	this.y = this.yStart;
	this.xOffset = Math.floor(this.width/2);
	this.yOffset = this.height;
	this.animSpeed = 0.15;
	this.animStatus = "idle";
	this.maxSpeed = 5;
	this.hSpeed = 0;
	this.vSpeed = 0;
	this.gravity = 0.2;
	this.scaling = 1;
	this.onField = false;
	this.shotTime = 0;
	this.canShot = true;
	this.bbox = new BoundingBox(this.x - this.width/2, this.y, this.width, this.height);
	this.hit = false;
	this.hitTimer = 0;
	this.hitAlpha = 0;
	this.hitAlphaTimer = 30;
	
	this.CollidesAt = function(x,y){
		for(var i = 0; i < game.blocks.length; i++){ 
			if(this.bbox.CollidesAt(game.blocks[i].bbox, x-this.xOffset, y-this.yOffset)){ 
				return true;
			}
		}
		return false;
	}
	
	
	
	this.Update = function(){
		if(Inputs.GetKeyDown(KEY_LEFT) && this.canShot){
			if(this.hSpeed > 0) this.hSpeed = 0;
			if(this.hSpeed > -this.maxSpeed) this.hSpeed-=0.2;			
		}
		else if(Inputs.GetKeyDown(KEY_RIGHT) && this.canShot){
			if(this.hSpeed < 0) this.hSpeed = 0;
			if(this.hSpeed < this.maxSpeed) this.hSpeed+=0.2;
		}
		else{
			this.hSpeed/=1.1;
			if(Math.abs(this.hSpeed) < 1){
				this.hSpeed = 0;
				this.sprite = game.sprPlayerIdle;
				this.curFrame = 0;
			}
		}
		
		
		
		this.vSpeed += this.gravity;
		var collides = false; 
		for(var a = Math.abs(this.vSpeed); a > 0; a-=0.5){
			if(this.vSpeed > 0){
				if( !this.CollidesAt(this.x , this.y + a)){
					this.y += a;
					break;
				}else{
					collides = true;
				}
			}
			else{
				if( !this.CollidesAt(this.x , this.y - a)){
					this.y -= a;
					break;
				}else{
					collides = true;
				}
			}
		}
		if(collides){ 
			this.vSpeed = 0;
		}
		 
		if(Inputs.GetKeyPress("Z") && this.CollidesAt(this.x , this.y +1)){ 
			this.jumpPower = 8;
			this.vSpeed -= 4;
		}
		
		if(Inputs.GetKeyDown("Z")){
			if(this.jumpPower-- > 0){
				this.vSpeed -= (1-this.jumpPower/8)/2;
			}
		}
		
		if(Inputs.GetKeyRelease("Z")||Inputs.GetMouseRelease(MOUSE_LEFT)){
			this.jumpPower = 0;
		}
		
		for(var a = Math.abs(this.hSpeed); a > 0; a--){
			if(this.hSpeed > 0){
				if( !this.CollidesAt(this.x + a , this.y)){
					this.x += a;
					break;
				}
			}
			else{
				if( !this.CollidesAt(this.x - a , this.y)){
					this.x -= a;
					break;
				}
			
			}
		}
		if(this.hSpeed != 0){
			this.scaling = (this.hSpeed < 0) ? -1 : 1; 
			if(this.sprite != game.sprPlayerRun){
				this.sprite = game.sprPlayerRun;
				this.curFrame = 0;
			} 
			this.animSpeed = 0.1 + Math.abs( this.hSpeed / this.maxSpeed * 0.12);
		}
		if(this.vSpeed > 0){
			this.sprite = game.sprPlayerFall;
			this.curFrame = 0;
		}else if(this.vSpeed < 0){
			this.sprite = game.sprPlayerJump;
			this.curFrame = 0;
		}
 
		
		if(this.canShot){
			if(Inputs.GetKeyPress("X")){  
				this.canShot = false;
				this.shotTime = 10;
				var bullet = new Bullet(this.x + 10*this.scaling, this.y-this.height/2, this.scaling * 8);
				AudioPlay(game.sndShot);
			}
		}else{
			this.shotTime --;
			if(this.shotTime <= 0){
				this.canShot = true;
			} 
			switch(this.sprite){
				case game.sprPlayerRun: this.sprite = game.sprPlayerIdleShot; this.curFrame = 0;break;
				case game.sprPlayerIdle: this.sprite = game.sprPlayerIdleShot; this.curFrame = 0;break;
				case game.sprPlayerFall: this.sprite = game.sprPlayerFallShot; break;
				case game.sprPlayerJump: this.sprite = game.sprPlayerJumpShot; break; 
			}
		}
 
		if(this.hit){
			this.hitTimer--;
			this.hitAlphaTimer--;
			if(this.hitAlphaTimer < 0){
				this.hitAlpha = !this.hitAlpha;
				this.hitAlphaTimer = 10;
			}
			if(this.hitTimer <= 0){
				this.hit = false;
			}
		}
 
 
		this.bbox.Move(this.x - this.xOffset,this.y-this.yOffset);
		
		
		var targetX = Math.clamp(this.x - game.canvas.width/2, 0, game.areaW - game.canvas.width)
		var targetY = Math.clamp(this.y - game.canvas.height/2, 0, game.areaH - game.canvas.height)
		
		game.viewX =  Math.floor(Math.lerp(game.viewX, targetX, 0.2));
		game.viewY =  Math.floor(Math.lerp(game.viewY, targetY, 0.2));
		
		if(this.y > game.areaH + this.sprite.height){
			game.fadeout = new FadeOut(20, function(){
				game.player.Die();
			});
		}
	}
	
	this.Die = function(){
		this.x = this.xStart;
		this.y = this.yStart;
		game.lives = 5;
		game.score = 0;
	}
	
	this.Hit = function(){
		this.hit = true;
		this.hitTimer = 140;
		this.hitAlpha = true;
		this.hitAlphaTimer = 10;
		game.lives--;
		if(game.lives <= 0){
			this.Die();
		}
		this.vSpeed = Math.clamp(this.vSpeed-5, -5, 0)
		
	}
	
	this.Draw = function(){
		//game.ctx.translate(width, 0);
		game.ctx.save();
		if(this.hit){
			if(this.hitAlpha)game.ctx.globalAlpha = 0.3;
			else game.ctx.globalAlpha = 0.6;
		}
		game.ctx.translate(this.x-game.viewX,this.y-game.viewY);
		game.ctx.scale(this.scaling, 1);
		var ox = Math.floor(this.curFrame) * this.width;
		game.ctx.drawImage(this.sprite,ox,0,this.sprite.w,this.sprite.height,-this.xOffset,-this.sprite.height, this.sprite.w, this.sprite.height); 
		game.ctx.restore();
	}
	
	
	this.UpdateAnimation = function(){
		this.curFrame += this.animSpeed;
		if(this.animSpeed > 0){
			var diff = this.curFrame - this.sprite.frames;
			if(diff >= 0){
				this.curFrame = diff;
			}
		}
		else if(this.curFrame < 0){
			this.curFrame = (this.sprite.frames + this.curFrame) - 0.0000001;
		}
	}
}

function GameOver(){

	this.Draw = function(){		
			
		game.ctx.shadowColor = "#000";
		game.ctx.shadowOffsetX = 1; 
		game.ctx.font = "30pt 'PixelFont'"  
		game.ctx.textAlign="center";
		game.ctx.shadowBlur = 3;
		game.ctx.fillStyle = "#eee";
		game.ctx.fillText("Hai fatto "+game.score+ " punti!",game.canvas.width/2, game.canvas.height/2-30);
		
		if(Inputs.MouseInsideText("Menu Principale",game.canvas.width/2, game.canvas.height/2+190,"#eee", "#ea4") && Inputs.GetMousePress(MOUSE_LEFT)){
			game.lives = 5;
			game.score = 0;
			game.fadeout = new FadeOut(60, function() {game.LoadLevel(0);});
			
		}
	
		game.ctx.shadowOffsetX = 0; 
		game.ctx.shadowBlur = 0;
		game.ctx.textAlign="start";
		
	}
}

function StartGame(){
	game = new Game();
}

function Game(){
	
	// id del div dov'è contenuto il canvas
	this.div = document.getElementById("GameDiv");
	this.div.style.width = "768px";
	this.div.style.height = "512px" 
	// id del canvas
	this.canvas = document.getElementById("GameCanvas");
	this.canvas.setAttribute("width","768");
	this.canvas.setAttribute("height","512");
	this.canvas.defaultWidth = this.canvas.width;
	this.canvas.defaultHeight = this.canvas.height;
	//il cursore non sarà visibile nell'area di gioco
	this.canvas.style.cursor = "none"; 
	// id del context 2d HTML5
	this.ctx = this.canvas.getContext("2d");
	// coordinate della view corrente
	this.fullscreen = false;
	
	this.viewX = 0;
	this.viewY = 0;
		 
	this.paused = false;
	this.level = 0;
	
	this.lives = 5;	
	this.score = 0; 
	
	this.cellSize = 32;
	this.spacing = 2;
	this.areaW = 5;
	this.areaH = 5;
	this.sleep = false;
	
	this.canvas.requestFullscreen = this.canvas.requestFullscreen ||  this.canvas.mozRequestFullScreen || this.canvas.webkitRequestFullScreen;
	this.canvas.exitFullscreen = this.canvas.exitFullscreen ||  this.canvas.mozCancelFullScreen || this.canvas.webkitCancelFullScreen;
	screenfull.onchange = function(){
		if(screenfull.isFullscreen){  
			game.canvas.width = game.canvas.height*window.innerWidth/window.innerHeight;
			game.canvas.style.width = window.innerWidth + "px";
			game.canvas.style.height = window.innerHeight + "px";
		}else{
			game.canvas.width = game.canvas.defaultWidth;
			game.canvas.height = game.canvas.defaultHeight;
			game.canvas.style.width = game.canvas.defaultWidth + "px";
			game.canvas.style.height = game.canvas.defaultHeight + "px"; 
		}
	}
	
	this.canvas.addEventListener("click", function(){ 
		if(Inputs.MouseInsideRect(game.canvas.width-60, game.canvas.height - 60,  game.sprFullscreen.width, game.sprFullscreen.height)){
			screenfull.toggle(game.canvas);
		}
	}, false);
	
	this.OnBlur = function(){
		if(this.level > 0){
			this.paused = true;
		}
		this.sndMusic.pause();
	}
	
	this.OnFocus = function(){
		this.sndMusic.play();
	}
	 
	rh = new ResourcesHandler( function(){
		game.LoadLevel(0);
		game.GameLoop();
	});
	
	///Sprites
	//Player 
	this.sprPlayerIdle = rh.LoadSprite("img/playerIdle.png",2);
	this.sprPlayerIdleShot = rh.LoadSprite("img/playerShot.png",1);
	this.sprPlayerRun = rh.LoadSprite("img/playerRun.png",6);
	this.sprPlayerJump = rh.LoadSprite("img/playerJump.png",1);
	this.sprPlayerJumpShot = rh.LoadSprite("img/playerJumpShot.png",1);
	this.sprPlayerFall = rh.LoadSprite("img/playerFall.png",1);  
	this.sprPlayerFallShot = rh.LoadSprite("img/playerFallShot.png",1);  
	
	this.sprBullet = rh.LoadSprite("img/bullet.png",1); 
	this.sprBulletHit = rh.LoadSprite("img/bullethit.png",3); 
	this.sprExplosion = rh.LoadSprite("img/explosion.png",4); 
	this.sprSpikes = rh.LoadSprite("img/spikes.png",2);
	this.sprTurret = rh.LoadSprite("img/turret.png",2);
	this.sprTurretBullet = rh.LoadSprite("img/turretbullet.png",1); 
	this.sprUmbrella = rh.LoadSprite("img/umbrella.png",4);
	this.sprPortal = rh.LoadSprite("img/portal.png",4);
	this.sprSpawn = rh.LoadSprite("img/spawn.png",3);
	
	this.sprCoin = rh.LoadSprite("img/coin.png",4); 
	 
	//hud 
	this.sprCursor = rh.LoadSprite("img/cursor.png",1); 
	this.sprLife = rh.LoadSprite("img/life.png",1); 
	this.sprLifeLost = rh.LoadSprite("img/lifeLost.png",1); 
	this.sprHeart = rh.LoadSprite("img/heart.png",1); 
	this.sprPause = rh.LoadSprite("img/pause.png",1); 
	this.sprResume = rh.LoadSprite("img/resume.png",1); 
	this.sprFullscreen = rh.LoadSprite("img/fullscreen.png",1); 
	this.sprHTML = rh.LoadSprite("img/htmlit.png",1); 
	
	//level selection
	this.sprSelectLogo = rh.LoadSprite("img/levelselect.png",1);
	this.sprSelectArrow = rh.LoadSprite("img/levelarrow.png",1); 
	this.sprSelectButton = rh.LoadSprite("img/levelbutton.png",1);
	this.sprLockButton = rh.LoadSprite("img/levelbuttonlock.png",1);  
	this.sprStarOn = rh.LoadSprite("img/staron.png",1);  
	this.sprStarOff = rh.LoadSprite("img/staroff.png",1);   
	this.sprContinue = rh.LoadSprite("img/continue.png",1);   
	
	
	//menu
	this.sprLogo = rh.LoadSprite("img/logo.png",1); 
	this.sprSplashLogo = rh.LoadSprite("img/splashLogo.png",1); 
	
	//tileset
	this.imgTiles = rh.LoadSprite("img/tiles.png",1); 
	
	/// Backgrounds
	this.backgroundSelect = rh.LoadSprite("img/backgroundselect.png",1);
	this.background1 = rh.LoadSprite("img/sky.png", 1);
	this.backgroundMenu = rh.LoadSprite("img/backgroundmenu.png", 1, function(){
		game.patternMenu = game.ctx.createPattern(game.backgroundMenu,"repeat"); 
	});
	
	/// Suoni
	this.sndMusic = rh.LoadSound("audio/datagrove",["ogg", "mp3"]); 
	this.sndCoin = rh.LoadSound("audio/coin",["ogg", "mp3"]);
	this.sndCoin.volume = 0.03;
	this.sndShot = rh.LoadSound("audio/shot",["ogg", "mp3"]);
	this.sndShot.volume = 0.03;
	this.sndShotEnemy = rh.LoadSound("audio/shotenemy",["ogg", "mp3"]);
	this.sndShotEnemy.volume = 0.03;
	this.sndHit = rh.LoadSound("audio/hit",["ogg", "mp3"]);
	this.sndHit.volume = 0.03;
	
	
	
	//aggiorna tutto
	this.Update = function(){
		if(this.level > 0) { 
			this.player.Update(); 
			for(var i = 0; i < this.bullets.length; i ++){ 
				this.bullets[i].Update();
			} 
			for(var i = 0; i < this.enemies.length; i ++){ 
				this.enemies[i].Update();
			}
			for(var i = 0; i < this.entities.length; i ++){ 
				this.entities[i].Update();
			}
			
		}
	}
	
	//aggiorna animazioni e Inputs
	this.EndLoop = function(){
		if(this.level > 0){ 
			this.player.UpdateAnimation(); 
		}
		
	}
	
	
	this.DrawAll = function(){
		// pulisci la schermata del canvas dal precedente draw
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		if(this.level > 0)
		{  
			//disegna lo sfondo ripetuto 
			//this.ctx.fillStyle = this.backgroundPattern1;
			//this.ctx.fillRect(0,0,this.canvas.width, this.canvas.height);
			this.ctx.drawImage(this.background1, 0, 0, this.canvas.width, this.canvas.height);
			
			this.ctx.save();  
			this.ctx.translate(-this.viewX,-this.viewY);
			var cs = this.cellSize;
			//draw tiles only if in view
			var vx1 = this.viewX - this.cellSize;
			var vy1 = this.viewY - this.cellSize;
			var vx2 = this.viewX + this.canvas.width;
			var vy2 = this.viewY + this.canvas.height;
			for(var i = 0; i < this.tiles.length; i ++){ 
				var layer = this.tiles[i];
				for(var j = 0; j < layer.length; j ++){ 
					if(layer[j][0] > vx1) 
					if(layer[j][1] > vy1) 
					if(layer[j][0] < vx2) 
					if(layer[j][1] < vy2)
					this.ctx.drawImage(this.imgTiles,
						layer[j][2], layer[j][3],
						cs, cs,
						layer[j][0], layer[j][1],
						cs, cs); 
				}
			}
			this.ctx.restore();
			
			
			/*
			//draw collision blocks debug 
			this.ctx.strokeStyle = "#c00";
			for(var i = 0; i < this.blocks.length; i ++){ 
				this.ctx.strokeRect(this.blocks[i].x-0.5, this.blocks[i].y-0.5,this.blocks[i].width,this.blocks[i].height); 
			}
			this.ctx.strokeStyle = "#000";
			*/
			
			this.player.Draw();  
			
			for(var i = 0; i < this.bullets.length; i ++){ 
				this.bullets[i].Draw();
			}
			
			for(var i = 0; i < this.enemies.length; i ++){ 
				this.enemies[i].Draw();
			}
			
			
			for(var i = 0; i < this.entities.length; i ++){ 
				this.entities[i].Draw();
			}
			 
			
			this.hud.Draw();
			
		}
		else{
			//disegna lo sfondo ripetuto 
			
			if(this.level == 0){
				this.mainMenu.Draw();
			}
			else if(this.level == -1){
				this.gameOver.Draw();
			}
		}
		
	}
	
	
	this.ResetLevel = function(){
		this.player = null; 
		this.hud = null;
		this.mainMenu = null;
		this.levelCompleted = null;
		this.gameOver = null;
		this.blocks = [];
		this.coinsCount = 0;
		this.score = 0;
		this.tiles = [];
		this.bullets = []; 
		this.entities = []; 
		this.enemies = [];
	}
	
	this.LoadLevel = function(lev){ 
		//distruggi tutte le instanze
		this.ResetLevel();
		
		if(lev == -1){
			this.gameOver = new GameOver();
		}
		else if(lev == 0){
			//menu 
			this.mainMenu = new MainMenu();
		}
		else{
			 
			//resetta l' array contenente i vari blocchi
			this.blocks = [];
			
			//carico le info sul livello
			var settings = levels[lev][0];
			this.cellSize = settings[0];
			this.spacing = settings[1];
			this.areaW = settings[2]*this.cellSize;
			this.areaH = settings[3]*this.cellSize;
			
			//dati sui tiles
			var tiles = levels[lev][1];
			var cs = this.cellSize + this.spacing; 
			var cellsX = Math.ceil(this.imgTiles.width / cs);
			var cellsY = Math.ceil(this.imgTiles.height / cs);
			  
			
			for(var j = 0; j < tiles.length; j++){
				var layer = tiles[j];
				this.tiles.push([]);
				for(var i = 0; i < layer.length; i++){
					var cy = Math.floor(layer[i][0] / cellsX);
					var cx = layer[i][0] - cy*cellsX;
					
					this.tiles[j].push([layer[i][1]*this.cellSize, layer[i][2]*this.cellSize, cx*cs, cy*cs]);
				}
			}
			
			
			//dati sui blocchi di collisione
			var blocks = levels[lev][2];
			for(var i = 0; i < blocks.length; i++){
				this.blocks.push(new Block(blocks[i][0]*this.cellSize, blocks[i][1]*this.cellSize)); 
			}
			
			
			//dati sugli oggetti
			var objects = levels[lev][3]; 
			for(var i = 0; i < objects.length; i++){
				var errors = false;
				var object = null;
				var x = objects[i][0]*this.cellSize;
				var y = objects[i][1]*this.cellSize;
				switch(objects[i][2]){
					case "spikes": 
						new Spikes(x, y);
						break;
					case "turret": 
						new Turret(x, y);
						break;
					case "umbrella": 
						new Umbrella(x, y);
						break;
					case "end": 
						new Portal(x, y);
						break;
					case "spawn": 
						var spawn = new Spawn(x, y);
						this.spawnX = x+this.cellSize/2;
						this.spawnY = y+this.cellSize;
						break;
					case "coin":
						new Coin(x+this.cellSize/2, y+this.cellSize/2);
						this.coinsCount++;
						break;
					default : errors = true;
				} 
				
			}
			
			this.player = new Player();
			
			this.hud = new Hud(); 
			
			
		} 
		
		this.level = lev;
	
	}
	
	
	
	this.GameLoop = function(){
		if(!this.sleep){
			if(!this.paused){
				// aggiorna tutti gli oggetti
				this.Update();
			}
			//disegna tutto a schermo
		}
		this.DrawAll();
		if(!this.sleep){
			if(!this.paused){
				// aggiorna le animazioni
				this.EndLoop();
			}
		}else{
			if(this.fadeout != null){
				this.fadeout.Update();
			}
			if(this.levelCompleted != null){
				this.levelCompleted.Draw();
			}
		}
		
		//disegna il cursore
		game.ctx.drawImage(game.sprCursor, Inputs.mouseX - game.sprCursor.width/2, Inputs.mouseY - game.sprCursor.height/2);
			
		
		
		//resetta le variabili degli Inputs premuti e rilasciati
		Inputs.Clear();
		
		window.requestAnimFrame(function() {
          game.GameLoop();
        });
		
	}
	
	
		

}


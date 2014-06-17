/* TODO LIST
- specie di torrette che ti sparano
- mostri alla super mario che vanno a dx e sx 
- un nemico scudo-sparo (rimane in modalità "scudo": non puoi scalfirlo, poi toglie lo scudo per spararti un colpo, e diventa momentaneamente vulnerabile)
*/

var game = null;

function GameObj(x, y){ 
	this.x = x;
	this.y = y;
	this.animSpeed = 1;
	this.curFrame = 0;
	this.xOffset = 0;
	this.yOffset = 0;
	
	this.OffsetCenter = function(){
		this.xOffset = this.sprite.w/2;
		this.yOffset = this.sprite.height/2;
	}
	
	this.__DrawSimple = function(){
		game.ctx.drawImage(this.sprite, this.x - game.viewX - this.xOffset, this.y - game.viewY - this.yOffset); 
	}
	
	this.__DrawAnimated = function(){
		var ox = Math.floor(this.curFrame) * this.sprite.w;
		game.ctx.drawImage(this.sprite, ox, 0, this.sprite.w,this.sprite.height,this.x - game.viewX - this.xOffset, this.y - game.viewY - this.yOffset, this.sprite.w, this.sprite.height); 
	}
	
	this.__DrawAnimatedMirror = function(){
		var ox = Math.floor(this.curFrame) * this.sprite.w;
		game.ctx.drawImage(this.sprite, ox, 0, this.sprite.w,this.sprite.height,this.x - game.viewX - this.xOffset, this.y - game.viewY - this.yOffset, this.sprite.w, this.sprite.height); 
	}
	
	this.__DrawAnimatedMirror = function(){
		game.ctx.save();
		game.ctx.translate(this.x-game.viewX,this.y-game.viewY);
		game.ctx.scale(this.scaling, 1);
		var ox = Math.floor(this.curFrame) * this.sprite.w;
		game.ctx.drawImage(this.sprite,ox,0,this.sprite.w,this.sprite.height,-this.sprite.w/2,0, this.sprite.w, this.sprite.height); 
		game.ctx.restore();
	}
	
	this.GetCollision = function(gameobj_list, x, y){
		var len = gameobj_list.length;
		for(var i = 0; i < len; i++){ 
			if(this.bbox.CollidesAt(gameobj_list[i].bbox, x, y)){ 
				return gameobj_list[i];
			}
		}
		return null;
	}
	
	this.SetSprite = function(sprite, mirror){
		if(sprite == null || sprite == undefined){
			this.Draw = function(){};
			return;
		}
		
		this.sprite = sprite;
		
		if(mirror != undefined){
			this.scaling = 1;
			this.Draw = this.__DrawAnimatedMirror;
		}
		else{
			if(sprite.frames > 0){
				this.Draw = this.__DrawAnimated;
			}else{
				this.Draw = this.__DrawSimple;
				this.UpdateAnimation  = function(){};
			}
		}
	}
	
	this.UpdateAnimation = function(){
		this.curFrame += this.animSpeed;
		if(this.animSpeed > 0){
			var diff = this.curFrame - this.sprite.frames;
			if(diff >= 0){
				this.curFrame = diff;
				this.OnAnimationEnd();
			}
		}
		else if(this.curFrame < 0){
			this.curFrame = (this.sprite.frames + this.curFrame) - 0.0000001;
				this.OnAnimationEnd();
		}
	}
	
	this.Destroy = function(){
		this.OnDestroy();
		game.entities.splice(game.entities.indexOf(this), 1);
	}
	
	//empty functions
	this.Draw = function(){}
	this.Update = function(){}
	this.OnAnimationEnd = function(){}
	this.OnDestroy = function(){}
	
	game.entities.push(this); 
	
}

function Inherit(obj, parent){
	if(parent == undefined)
		parent = GameObj;
	obj.prototype = Object.create(parent.prototype);
	obj.prototype.constructor = obj;
}

function Block(x, y){
	this.x = x;
	this.y = y;
	this.width = game.cellSize;
	this.height = game.cellSize;
	this.bbox = new BoundingBox(x, y, this.width, this.height); 
}

function Bullet(x,y,hspeed){
	GameObj.call(this, x, y);
	this.SetSprite(game.sprBullet);
	this.hSpeed = hspeed;
	this.OffsetCenter();
	this.bbox = new BoundingBox(x-this.xOffset, y-this.yOffset, this.sprite.w, this.sprite.height);
	
	this.Update = function(){
	
		if(this.GetCollision(game.blocks, this.hSpeed/2, 0)){
				this.Destroy();
		}
		
		if(inst = this.GetCollision(game.enemies, this.hSpeed/2, 0)){
			if(inst.curFrame == 1)
				inst.life--;
			this.Destroy();
		}
		
		this.x += this.hSpeed;
		this.bbox.Move(this.x-game.sprBullet.width/2, this.y-game.sprBullet.height/2);
		
		if(this.x > game.AreaW * game.cellSize || this.x < 0){
			this.Destroy();
		}
	}
	
	this.OnDestroy = function(){
		game.bullets.splice(game.bullets.indexOf(this), 1);
		new BulletExplosion(this.x, this.y);
	}
	
	game.bullets.push(this); 
}
Inherit(Bullet);

function BulletExplosion(x,y){
	GameObj.call(this, x, y);
	AudioPlay(game.sndHit);
	this.SetSprite(game.sprBulletHit);
	this.OffsetCenter();
	this.animSpeed = 0.25;
	  
	this.OnAnimationEnd = function(){
		this.Destroy();
	}
} 
Inherit(BulletExplosion);

function Explosion(x,y){
	GameObj.call(this, x, y);
	AudioPlay(game.sndHit);
	this.SetSprite(game.sprExplosion);
	this.animSpeed = 0.2;
	this.OffsetCenter();
	
	this.OnAnimationEnd = function(){
		this.Destroy();
	}
}
Inherit(Explosion);


function Portal(x,y){ 
	GameObj.call(this, x, y);
	this.SetSprite(game.sprPortal);
	this.active = true;
	this.animSpeed = 0.25;
	this.OffsetCenter();
	this.bbox = new BoundingBox(x - this.xOffset, y - this.yOffset, this.sprite.w, this.sprite.height);
	
	this.Update = function(){
		if(this.bbox.Collides(game.player.bbox)){
			if(this.active){
				this.active = false;
				game.levelCompleted = new LevelCompleted();
				var s = localStorage["level"+game.level];
				if(s == undefined) s=0;
				var result = Math.floor(game.score/game.coinsCount * 3);
				if(result > s)
					localStorage["level"+game.level] = result;
				
				localStorage["complete"+game.level] = true;
			}
		}
	}
}
Inherit(Portal);


function Spawn(x,y){
	GameObj.call(this, x, y);
	this.SetSprite(game.sprSpawn);
	this.animSpeed = 0.25;
}
Inherit(Spawn);

function Coin(x,y){
	GameObj.call(this, x, y);
	this.SetSprite(game.sprCoin);
	this.OffsetCenter();
	this.animSpeed = 0;
	this.OffsetCenter();
	this.hit = false;
	this.boing = Math.random() * 3;
	this.bbox = new BoundingBox(x-this.xOffset, y-this.yOffset, this.sprite.w, this.sprite.height);
	
	this.Update = function(){
		if(this.hit){
			this.y--;
			if(this.life-- <= 0){
				this.Destroy();
			}
		}else{
			this.boing += 0.1;
			this.y += Math.cos(this.boing)/7;
			if(this.bbox.Collides(game.player.bbox)){ 
				this.life = 30; 
				this.animSpeed = 0.2;
				game.score++;
				AudioPlay(game.sndCoin);
				this.hit = true;
			}
		}
	}
}
Inherit(Coin);

function TurretBullet(x,y,hspeed){
	GameObj.call(this, x, y);
	this.SetSprite(game.sprTurretBullet);
	this.OffsetCenter();
	this.hSpeed = hspeed;
	this.bbox = new BoundingBox(x-this.xOffset, y-this.yOffset, this.sprite.width, this.sprite.height);
	
	this.Update = function(){
		if(this.GetCollision(game.blocks, this.hSpeed/2, 0)){
				this.Destroy();
		}		
		
		if(!game.player.hit)
			if(this.bbox.CollidesAt(game.player.bbox, this.hSpeed/2, 0)){ 
				game.player.Hit();
				this.Destroy();
			}
		this.x += this.hSpeed;
		this.bbox.Move(this.x-game.sprTurretBullet.width/2, this.y-game.sprTurretBullet.height/2);
		
		if(this.x > game.AreaW * game.cellSize || this.x < 0){
			this.Destroy();
		}
	}
	
	this.OnDestroy = function(){
		game.bullets.splice(game.bullets.indexOf(this), 1);
		new BulletExplosion(this.x, this.y);
	}
	
	game.bullets.push(this); 
	
}
Inherit(TurretBullet);

function Turret(x,y){
	GameObj.call(this, x, y);
	this.SetSprite(game.sprTurret, true);
	this.x += this.sprite.w/2;
	this.timer = 50 * Math.random();
	this.animSpeed = 0;
	this.shotTimer = 0;
	this.life =  5;
	this.bbox = new BoundingBox(this.x-this.sprite.w/2+5, this.y, this.sprite.w-10, this.sprite.height);
	
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
			this.Destroy();
		}
	}
	
	this.OnDestroy = function(){
		game.enemies.splice(game.enemies.indexOf(this), 1);
		new Explosion(this.x, this.y);
	}
	
	game.enemies.push(this); 	
}
Inherit(Turret);

function Umbrella(x,y){
	GameObj.call(this, x, y);
	this.SetSprite(game.sprUmbrella); 
	this.hSpeed = 1;
	this.life =  5;
	this.animSpeed = 0.25;
	this.bbox = new BoundingBox(this.x, this.y, this.sprite.w, this.sprite.height);
	
	this.Update = function(){
		if(this.GetCollision(game.blocks, this.hSpeed/2, 0)){
			this.hSpeed = - this.hSpeed;
		}
		
		if(this.GetCollision(game.bullets, 0, 0)){
			this.life--;
		}
		
		this.x += this.hSpeed;
		
		if(this.life < 0){
			this.Destroy();
			game.enemies.splice(game.enemies.indexOf(this), 1);
		}
		
		this.bbox.Move(this.x, this.y);
		if(!game.player.hit)
			if(this.bbox.Collides(game.player.bbox)){
				game.player.Hit();
			}
	}
	
	this.OnDestroy = function(){
		game.enemies.splice(game.enemies.indexOf(this), 1);
	}

	game.enemies.push(this); 
}
Inherit(Umbrella);

function Spikes(x,y){

	GameObj.call(this, x, y);
	this.SetSprite(game.sprSpikes);
	this.x += this.sprite.w/2;
	this.curFrame = Math.floor(Math.random()*2);
	this.animSpeed = 0;
	this.timer = 50 * Math.random();
	this.bbox = new BoundingBox(this.x, this.y, this.sprite.w, this.sprite.height);
	
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
	game.enemies.push(this); 
	
}

function Player(){
	this.xStart = game.spawnX;
	this.yStart = game.spawnY;
	this.x = this.xStart;
	this.y = this.yStart;
	GameObj.call(this, this.x, this.y);
	this.SetSprite(game.sprPlayerRun, true);
	this.width = this.sprite.w;
	this.height = this.sprite.height; 
	this.xOffset = Math.floor(this.width/2);
	this.yOffset = this.height;
	this.animSpeed = 0.2;
	this.maxSpeed = 5;
	this.hSpeed = 0;
	this.vSpeed = 0;
	this.gravity = 0.4;
	this.scaling = 1;
	this.onField = false;
	this.shotTime = 0;
	this.canShot = true;
	this.bbox = new BoundingBox(this.x - this.width/2, this.y, this.width, this.height);
	this.hit = false;
	this.hitTimer = 0;
	this.hitAlpha = 0;
	this.hitAlphaTimer = 30;
	 
	this.Update = function(){
		if(Inputs.GetKeyDown(KEY_LEFT) && this.canShot){
			if(this.hSpeed > 0) this.hSpeed = 0;
			if(this.hSpeed > -this.maxSpeed) this.hSpeed-=0.4;			
		}
		else if(Inputs.GetKeyDown(KEY_RIGHT) && this.canShot){
			if(this.hSpeed < 0) this.hSpeed = 0;
			if(this.hSpeed < this.maxSpeed) this.hSpeed+=0.4;
		}
		else{
			this.hSpeed/=1.1;
			if(Math.abs(this.hSpeed) < 1 && this.canShot){
				this.hSpeed = 0;
				this.sprite = game.sprPlayerIdle;
				if(Math.random() > 0.1)
					this.animSpeed = 0.03;
				else
					this.curFrame = 0;
			}
		}
		
		
		
		this.vSpeed += this.gravity;
		var collides = false;
		
		for(var a = Math.abs(this.vSpeed); a > 0; a-=Math.abs(this.gravity)){
			if(this.vSpeed > 0){
				if( !this.GetCollision(game.blocks, 0, a)){
					this.y += a;
					break;
				}else{
					collides = true;
				}
			}
			else {
				if( !this.GetCollision(game.blocks, 0 , -a)){
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
		
				 
		if(Inputs.GetKeyPress("Z") && this.GetCollision(game.blocks, 0 , 1)){ 
			this.jumpPower = 12;
			this.vSpeed -= 7;
		}

		if(Inputs.GetKeyDown("Z")){
			if(this.jumpPower-- > 0){
				this.vSpeed -= (1-this.jumpPower/12) /2;
			}
		}
		
		if(Inputs.GetKeyRelease("Z")||Inputs.GetMouseRelease(MOUSE_LEFT)){
			this.jumpPower = 0;
		}
		
		for(var a = Math.abs(this.hSpeed); a > 0; a--){
			if(this.hSpeed > 0){
				if( !this.GetCollision(game.blocks, a , 0)){
					this.x += a;
					break;
				}
			}
			else{
				if( !this.GetCollision(game.blocks, - a , 0)){
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
	
}
Inherit(Player);

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
	
	//fps counter
	this.dt = 0;
	this.fps = 0;
	this.frames = 0;
	this.millisec = 0;
	this.prevTime = Date.now();
	
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
			for(var i = 0; i < this.entities.length; i ++){ 
				this.entities[i].Update();
			}
		}
	}
	
	//aggiorna animazioni
	this.EndLoop = function(){
		if(this.level > 0){ 
			for(var i = 0; i < this.entities.length; i ++){ 
				this.entities[i].UpdateAnimation();
			}
		}
	}
	
	
	this.Draw = function(){
		// pulisci la schermata del canvas dal precedente draw
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		
		if(this.level == 0){
			this.mainMenu.Draw();
		}
		else{  
			//draw background 
			this.ctx.drawImage(this.background1, 0, 0, this.canvas.width, this.canvas.height);
			
			var prev = Date.now();
			this.ctx.save();  
			this.ctx.translate(-this.viewX,-this.viewY);
			var cs = this.cellSize;
				
			if(!Inputs.GetKeyDown("U")){
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
			}else{
				var xMin = Math.floor(game.viewX / game.cellSize);
				var yMin = Math.floor(game.viewY / game.cellSize);
				var xMax = xMin + this.canvas.width/game.cellSize;
				var yMax = yMin + this.canvas.height/game.cellSize;
				
				for(var i = xMin; i < xMax; i++)
				for(var j = yMin; j < yMax; j++){
					tile = this.tilemap[i][j];
					if(tile){
						this.ctx.drawImage(this.imgTiles,
							tile[2], tile[3],
							cs, cs,
							tile[0], tile[1],
							cs, cs); 
					 }
				}
			}
			
			this.ctx.restore();
			
			
			//debug bounding box
			if(Inputs.GetKeyDown("D")){
				this.ctx.strokeStyle = "#c00";
				this.ctx.lineWidth = 1;
			
				for(var i = 0; i < this.entities.length; i ++){ 
					if(this.entities[i].bbox != undefined)
					this.ctx.strokeRect(this.entities[i].bbox.x-game.viewX+0.5, this.entities[i].bbox.y-game.viewY+0.5,this.entities[i].bbox.width,this.entities[i].bbox.height); 
				}
				
				for(var i = 0; i < this.blocks.length; i ++){ 
					this.ctx.strokeRect(this.blocks[i].x-game.viewX+0.5, this.blocks[i].y-game.viewY+0.5,this.blocks[i].width,this.blocks[i].height); 
				}
			
				
			}
			
			
			this.ctx.strokeStyle = "#000";
			
			this.ctx.fillText( this.fps + " , " + (parseInt(1000 / this.dt)), 30, 30);
			
			for(var i = 0; i < this.entities.length; i ++){ 
				this.entities[i].Draw();
			}
			 
			
			this.hud.Draw();
			
		}
		
	}
	
	
	this.ResetLevel = function(){
		this.player = null; 
		this.hud = null;
		this.mainMenu = null;
		this.levelCompleted = null;
		this.blocks = [];
		this.coinsCount = 0;
		this.score = 0;
		this.tiles = [];
		this.tilemap = [];
		this.bullets = []; 
		this.entities = []; 
		this.enemies = [];
	}
	
	this.LoadLevel = function(lev){ 
		//distruggi tutte le instanze
		this.ResetLevel();
		
		if(lev == 0){
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
			  
			//tilelist
			for(var j = 0; j < tiles.length; j++){
				var layer = tiles[j];
				this.tiles.push([]);
				for(var i = 0; i < layer.length; i++){
					var cy = Math.floor(layer[i][0] / cellsX);
					var cx = layer[i][0] - cy*cellsX;
					
					this.tiles[j].push([layer[i][1]*this.cellSize, layer[i][2]*this.cellSize, cx*cs, cy*cs]);
				}
			}
			
			////////////////
			//  tilemap
			////////////////
			
			//free
			console.log(settings[2], settings[3]);
			for(var i=0; i<settings[2]; i++){
				this.tilemap[i] = [];
				for(var j=0; j<settings[3]; j++){
					this.tilemap[i][j] = null;
				}
			}
			
			//add
			for(var j = 0; j < tiles.length; j++){
				var layer = tiles[j];
				for(var i = 0; i < layer.length; i++){
					var cy = Math.floor(layer[i][0] / cellsX);
					var cx = layer[i][0] - cy*cellsX;
					var x = layer[i][1];
					var y = layer[i][2];
					if(x > 0 && y > 0 && x < settings[2] && y < settings[3])
					this.tilemap[x][y] = [x*this.cellSize, y*this.cellSize, cx*cs, cy*cs];
					
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
		
		this.dt = Date.now() - this.prevTime;
		this.millisec += this.dt;
		if(this.millisec >= 1000){
			this.millisec = this.millisec % 1000;
			this.fps = this.frames;
			this.frames = 0;
		}
		this.prevTime = Date.now();
		this.frames++;
		
		if(Inputs.GetKeyDown("C")){
			console.log(this.dt);
		}
		
		if(!this.sleep){
			if(!this.paused){
				// aggiorna tutti gli oggetti
				this.Update();
			}
			//disegna tutto a schermo
		}
		this.Draw();
		
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


function ResourcesHandler(callback){
	//numero risorse caricate/da caricare
	this.resNumber = 0;
	this.resLoaded = 0; 
	this.loading = true;
	this.errors = [];
	this.warnings = [];
	this.status = 0;
	
	this.CheckLoaded = function(){
		if(!this.loading) return null;
		this.DrawLoading();
		if(this.resLoaded + this.errors.length >= this.resNumber){
			callback();
			this.loading = false;
			this.resNumber = 0;
			this.resLoaded = 0;
		}
	}
	
	this.DrawLoading = function(){
		this.status = (this.resLoaded) / (this.resNumber + this.errors.length);
		
		var cx = game.canvas.width/2;
		var cy = game.canvas.height/2; 
		game.ctx.fillStyle = "#333";
		game.ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);
		
		game.ctx.beginPath();
		game.ctx.strokeStyle = "#222";
		game.ctx.lineWidth = 25;
		game.ctx.arc(cx, cy, 80, 0, Math.PI*2, false);
		game.ctx.stroke();
		 
		var radians = (360 * this.status) * Math.PI / 180;
		game.ctx.beginPath();
		game.ctx.strokeStyle = "#ddd";
		game.ctx.lineWidth = 25;
		game.ctx.arc(cx, cy, 80, 0 - 90*Math.PI/180, radians - 90*Math.PI/180, false);
		game.ctx.stroke();
		
		game.ctx.font = '22pt Segoe UI Light';
		game.ctx.fillStyle = '#ddd';
		game.ctx.fillText(Math.floor(this.status*100) + "%",cx-25,cy+10);
	}
	
	//carica un immagine e ritorna un id
	this.LoadSprite = function(url, frames, funct){
		this.loading = true;
		var img = new Image();
		img.src = url;
		img.rh = this;
		this.resNumber++;
		img.frames = frames;
		img.onload = function(){ 
			if(funct != undefined){
				funct();
			}
			this.w = this.width/this.frames;
			this.rh.resLoaded++;
			this.rh.CheckLoaded();
		};
		img.addEventListener("error", function(e){
			this.rh.resNumber--;
			this.rh.errors.push([url, e]);
			this.rh.CheckLoaded();
		});
		
		return img;
	}
	 
	
	//carica un suono
	this.LoadSound = function(url, formats){
		this.loading = true;
		var sound = new Audio();
		sound.src = url+"."+formats[0];
		sound.formatIndex = 0;
		sound.volume = 0.05;
		this.resNumber++;
		sound.rh = this;
			
		sound.addEventListener("loadeddata", function(){
			this.rh.resLoaded++; 
			this.rh.CheckLoaded();
		}, false);
			
		sound.addEventListener("error", function(e){
			if(++this.formatIndex >= formats.length){
				this.rh.errors.push([url, e.currentTarget.error.code]);
				this.rh.CheckLoaded();
			}else{
				this.rh.warnings.push(["audio",this.src]);
				this.src = url+"."+formats[this.formatIndex];
			}
		});
			
		return sound;
	} 


}
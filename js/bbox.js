// gestione delle collisioni tramite bounding box
BoundingBox = function(x,y,w,h){
	this.x = x;
	this.y = y;
	this.width = w;
	this.height = h;
	
	//(X1+W1<X2 or X2+W2<X1 or Y1+H1<Y2 or Y2+H2<Y1)
 
	this.Collides = function(b){
		return !(this.x + this.width < b.x || b.x + b.width < this.x || this.y + this.height < b.y || b.y + b.height < this.y);
	}
	
	this.CollidesMove = function(b, x, y){
		return !(x + this.width < b.x || b.x + b.width < x || y + this.height < b.y || b.y + b.height < y);
	}

	this.CollidesAt = function(b, dx, dy){
		return !(this.x + dx + this.width < b.x || b.x + b.width < this.x + dx || this.y + this.height + dy < b.y || b.y + b.height < this.y + dy);
	}

	this.Move = function(x,y){
		this.x = x;
		this.y = y;
	}
}
 

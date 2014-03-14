// gestione delle collisioni tramite bounding box
BoundingBox = function(_x,_y,w,h){
	this.x = _x;
	this.y = _y;
	this.width = w;
	this.height = h;
	
	//(X1+W1<X2 or X2+W2<X1 or Y1+H1<Y2 or Y2+H2<Y1)
 
	this.Collides = function(b){
		return !(this.x + this.width < b.x || b.x + b.width < this.x || this.y + this.height < b.y || b.y + b.height < this.y);
	}
	
	
	this.CollidesAt = function(b,x,y){
		return !(x + this.width < b.x || b.x + b.width < x || y + this.height < b.y || b.y + b.height < y);
	}

	this.Move = function(_x,_y){
		this.x = _x;
		this.y = _y;
	}
}
 

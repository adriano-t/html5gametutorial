// gestione delle collisioni tramite bounding box
function BoundingBox(x,y,w,h){
	this.x = x;
	this.y = y;
	this.width = w;
	this.height = h;
	
	//no_collision = (x1+w1<x2 or x2+w2<x1 or y1+h1<Y2 or y2+h2<y1)

 
	this.Collides = function(b){
		return !(this.x + this.width < b.x || b.x + b.width < this.x || this.y + this.height < b.y || b.y + b.height < this.y);
	}

	this.CollidesAt = function(b, dx, dy){
		return !(this.x + dx + this.width < b.x || b.x + b.width < this.x + dx || this.y + this.height + dy < b.y || b.y + b.height < this.y + dy);
	}
	
	this.CollidesPosition = function(b, x, y){
		return !(x + this.width < b.x || b.x + b.width < x || y + this.height < b.y || b.y + b.height < y);
	}

	this.Move = function(x,y){
		this.x = x;
		this.y = y;
	}
}
 

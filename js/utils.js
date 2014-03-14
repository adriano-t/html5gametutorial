CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  this.beginPath();
  this.moveTo(x+r, y);
  this.arcTo(x+w, y,   x+w, y+h, r);
  this.arcTo(x+w, y+h, x,   y+h, r);
  this.arcTo(x,   y+h, x,   y,   r);
  this.arcTo(x,   y,   x+w, y,   r);
  this.closePath();
  return this;
}


function DecodeSoundError(errorID){
	switch(errorID){
		case 1: return "MEDIA_ERR_ABORTED";break;
		case 2: return "MEDIA_ERR_NETWORK";break;
		case 3: return "MEDIA_ERR_DECODE";break;
		case 4: return "MEDIA_ERR_SRC_NOT_SUPPORTED";break;
		default: return errorID;break;
	}
}
Math.clamp = function(x, min, max) {
    return x < min ? min : (x > max ? max : x);
};
Math.lerp = function(a, b, u) { return (1 - u) * a + u * b; };

function AudioPlay(source){
	if(window.ActiveXObject != undefined){
		source.pause();
		source.currentTime = 0;
	}else{
		source.load();
	}
	source.play();
}
window.requestAnimFrame = (function(callback) {
	return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
	function(callback) {
	  window.setTimeout(callback, 1000 / 60);
	}; 
})();


window.addEventListener('resize', function() {
  //
}, true);


window.addEventListener('load', function() {
  StartGame();
}, true);

	
window.addEventListener('focus', function() {
    game.OnFocus();
});

window.addEventListener('blur', function() {
    game.OnBlur();
});
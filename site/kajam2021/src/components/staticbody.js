import GameObject from './object.js';
import { Rect, Point } from './things.js';

class StaticBody extends GameObject {
	constructor (x, y, width, height, color) {
		super();
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.color = color;
	}
	
	collidesWithPlayer (big, before, after) {	
		if (big.intersects(new Rect(this))) {
			//return the ideal spot
			if (before.y + before.height <= this.y) {
				// above
				return [new Point(after.x, this.y - after.height), 'top'];
			} else if (before.y >= this.y + this.height) {
				// below
				return [new Point(after.x, this.y + this.height), 'bottom'];
			} else if (before.x + before.width <= this.x) {
				// left
				return [new Point(this.x - after.width, after.y), 'left'];
			} else if (before.x >= this.x + this.width) {
				// right
				return [new Point(this.x + this.width, after.y), 'right'];
			}
		}
		return false;

	}
}

export default StaticBody;
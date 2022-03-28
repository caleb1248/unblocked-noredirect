class Point {
	constructor (x, y) {
		this.x = x || 0;
		this.y = y || 0;
	}
}

class Rect {
	constructor (x, y, width, height) {
		if (x && typeof x.x === 'number' && typeof x.y === 'number' && typeof x.width === 'number' && typeof x.height === 'number') {
			this.x = x.x;
			this.y = x.y;
			this.width = x.width;
			this.height = x.height;
		} else {
			this.x = x || 0;
			this.y = y || 0;
			this.width = width || 0;
			this.height = height || 0;
		}
	}

	intersects (that) {
		return this.x < that.x + that.width && this.y < that.y + that.height && that.x < this.x + this.width && that.y < this.y + this.height;
	}
}

export {Point, Rect};
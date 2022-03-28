import GameObject from './object.js';

import { Point } from './things.js';

class OtherPlayer extends GameObject {
	constructor (player) {
		super();

		this.color = 'red';
		this.lineColor = 'black';
		this.width = 20;
		this.height = 20;
		this.x = player.x-this.width / 2;
		this.y = player.y - this.height / 2;
		this.velocity = {
			x: 0,
			y: 0,
		}
		this.playerCenter = new Point(0, 0);
		this.springStrength = 1/100;
		this.oldDraw = this.draw;
		this.draw = (ctx, pc) => {
			ctx.beginPath();
			ctx.moveTo(this.playerCenter.x - pc.x, this.playerCenter.y - pc.y);
			ctx.lineTo(this.x + this.width / 2 - pc.x, this.y + this.height / 2 - pc.y);
			ctx.strokeStyle = this.lineColor;
			ctx.stroke();
			this.oldDraw(ctx, pc);
		}
		this.t = true;
	}

	static Constants = {
		dampening: 3
	}

	update (playerCenter) {
		this.playerCenter = playerCenter;
		this.velocity.x += (this.playerCenter.x - (this.x + this.width / 2)) * this.springStrength;
		this.velocity.y += (this.playerCenter.y - (this.y + this.height / 2)) * this.springStrength;
		this.x += this.velocity.x;
		this.y += this.velocity.y;
		const dx = this.x + this.width / 2 - this.playerCenter.x, dy = this.y + this.height / 2 - this.playerCenter.y;
		const angle = Math.atan2(dy, dx);
		this.x -= OtherPlayer.Constants.dampening * Math.cos(angle);
		this.y -= OtherPlayer.Constants.dampening * Math.sin(angle);
		
	}
}

export default OtherPlayer;
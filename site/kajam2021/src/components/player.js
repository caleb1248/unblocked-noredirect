import GameObject from './object.js';
import { Rect, Point } from './things.js';
import OtherPlayer from './guyattachedtoyou.js';

class Player extends GameObject {
	constructor() {
		super();
		this.width = 50;
		this.height = 50;
		this.respawnPoint = new Point(100, 100);
		this.x = this.respawnPoint.x;
		this.y = this.respawnPoint.y;
		this.velocity = {
			x: 0,
			y: 0,
		};
		this.canWallJump = {
			left: false,
			right: false,
		}
		this.imageURL = false ? 'https://upload.wikimedia.org/wikipedia/commons/3/3d/LARGE_elevation.jpg' : '../../assets/player.png';

		this.follower = new OtherPlayer(new Point(this.x + this.width / 2, this.y + this.height / 2));

		this.createKeyControls();

		this.maxBodyLeft = 0;
		this.maxBodyRight = 0;

		this.useAntiLag = location.pathname.includes('lag');

		this.endBtn = new GameObject();
		this.endBtn.x = 7634;
		this.endBtn.y = -3473;
		this.endBtn.width = this.width;
		this.endBtn.height = this.height;
		this.endBtn.color = '#00ff00';

		this.endBtnText = "Congrats! You made it! However, it isn't over yet! Press ctrl + c to enter creator mode, drag mouse to create blocks. Press ctrl + z to delete last block, ctrl + e to export your level, and ctrl + i to import your level.";
		this.hasEnded = false;
		this.oldDraw = this.draw;
		this.draw = (ctx, pc) => {
			this.follower.draw(ctx, pc);
			this.oldDraw(ctx, pc);
			this.endBtn.draw(ctx, pc);
			ctx.fillStyle = 'blue';
			ctx.fillRect(this.maxBodyLeft - window.innerWidth - pc.x, Player.Constants.respawnHeight - pc.y, this.maxBodyRight - this.maxBodyLeft + window.innerWidth * 2, window.innerHeight);
		}
		this.canJump = false;
	}

	static Constants = {
		maxFallSpeed: 60,
		friction: 1,
		maxMoveSpeed: 15,
		jumpSpeed: -20,
		respawnHeight: 5000,
		wallJumpSpeed: 10
	}

	respawn() {
		this.x = this.respawnPoint.x;
		this.y = this.respawnPoint.y;
		this.velocity = new Point(0, 0);
		this.follower = new OtherPlayer(new Point(this.x + this.width / 2, this.y + this.height / 2));
	}

	update(gravity, staticBodys, multiplier = 1) {
		multiplier = this.useAntiLag ? multiplier : 1;
		this.maxBodyLeft = 0;
		this.maxBodyRight = 0;
		this.canJump = false;
		this.canWallJump = { left: false, right: false };
		this.velocity.y = Math.min(this.velocity.y + gravity * multiplier, Player.Constants.maxFallSpeed);
		if ((this.keys.left && this.keys.right) || (!this.keys.left && !this.keys.right)) {
			if (this.velocity.x < 0) {
				this.velocity.x = Math.abs(this.velocity.x + Player.Constants.friction * multiplier) < Player.Constants.friction ? 0 : this.velocity.x + Player.Constants.friction * multiplier;
			} else if (this.velocity.x > 0) {
				this.velocity.x = this.velocity.x - Player.Constants.friction * multiplier < Player.Constants.friction ? 0 : this.velocity.x - Player.Constants.friction * multiplier;
			}
		} else if (this.keys.right) {
			this.velocity.x = Math.min(Player.Constants.maxMoveSpeed, this.velocity.x + Player.Constants.friction * multiplier);
		} else if (this.keys.left) {
			this.velocity.x = Math.max(-Player.Constants.maxMoveSpeed, this.velocity.x - Player.Constants.friction * multiplier);
		}
		let big = new Rect();
		const before = new Rect(this);
		this.x += this.velocity.x * multiplier;
		this.y += this.velocity.y * multiplier;
		const after = new Rect(this);

		if (before.x < after.x) {
			big.x = before.x;
			big.width = after.x - before.x + before.width;
		} else {
			big.x = after.x;
			big.width = before.x - after.x + before.width;
		}
		if (before.y < after.y) {
			big.y = before.y;
			big.height = after.y - before.y + before.height;
		} else {
			big.y = after.y;
			big.height = before.y - after.y + before.height;
		}
		this.checkObstacales(big, before, after, staticBodys);

		if (this.y + this.height > Player.Constants.respawnHeight) {
			this.respawn();
		}
		this.follower.update(new Point(this.x + this.width / 2, this.y + this.height / 2));

		if (!this.hasEnded && new Rect(this.endBtn).intersects(big)) {
			alert(this.endBtnText);
			this.hasEnded = true;
		}
	}

	checkObstacales(big, before, after, bodies) {
		bodies.forEach(body => {
			const result = body.collidesWithPlayer(big, before, after);
			if (body.x < this.maxBodyLeft) this.maxBodyLeft = body.x;
			if (body.x + body.width > this.maxBodyRight) this.maxBodyRight = body.x + body.width;
			try {
				if (!result) return false;
				this.x = result[0].x;
				this.y = result[0].y;
				after = new Point(this.x, this.y);

				const type = result[1];
				if (type === 'top') {
					this.velocity.y = 0;
					this.canJump = true;
				} else if (type === 'bottom') {
					this.velocity.y = 0;
				} else if (type === 'left') {
					this.canWallJump.left = true;
				} else if (type === 'right') {
					this.canWallJump.right = true;
				}
			} catch (e) {
				console.log(result);
				console.log(e);
				throw new Error('oof')
			}
		});
	}

	jump() {
		if (this.canJump) {
			this.velocity.y = Player.Constants.jumpSpeed;
			return true;
			this.canJump = false;
		} else if (this.canWallJump.left) {
			this.velocity.y = Player.Constants.jumpSpeed;
			this.velocity.x = -Player.Constants.wallJumpSpeed;
			return true;
		} else if (this.canWallJump.right) {
			this.velocity.y = Player.Constants.jumpSpeed;
			this.velocity.x = Player.Constants.wallJumpSpeed;
			return true;
		}
		return false;
	}

	createKeyControls() {
		this.keys = {
			right: false,
			left: false,
		}
		window.addEventListener('keydown', (e) => {
			if (e.repeat) return false;
			switch (e.key) {
				case ' ':
					// jump
					this.jump();
					break;
				case 'ArrowUp':
					// jump also
					this.jump();
					break;
				case 'w':
					// also jump :P
					this.jump();
					break;
				case 'a':
					// left
					this.keys.left = true;
					break;
				case 'd':
					// right
					this.keys.right = true;
					break;
				case 'ArrowLeft':
					// left
					this.keys.left = true;
					break;
				case 'ArrowRight':
					// right
					this.keys.right = true;
					break;
			}
		});

		window.addEventListener('keyup', (e) => {
			switch (e.key) {
				case 'a':
					// left
					this.keys.left = false;
					break;
				case 'd':
					// right
					this.keys.right = false;
					break;
				case 'ArrowLeft':
					// left
					this.keys.left = false;
					break;
				case 'ArrowRight':
					// right
					this.keys.right = false;
					break;
			}
		});
	}
}

export default Player;
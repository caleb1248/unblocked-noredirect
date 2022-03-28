import Camera from './camera.js';
import Player from './player.js';
import Loader from './loader.js';
import StaticBody from './staticbody.js';
import {Point} from './things.js';

class Game {
	constructor () {

		this.loader = new Loader();
		this.loadNamesUsed = [];
		this.uploadsNeeded = 2;
		this.loadsComplete = 0;
		// create canvas
		this.container = document.body.appendChild(document.createElement('div'));
		this.container.style.cssText = 'top: 0; left: 0; position: fixed;';
		this.canvas = this.container.appendChild(document.createElement('canvas'));
		this.ctx = this.canvas.getContext('2d');

		// crate camera
		this.camera = new Camera();

		this.resize();

		this.stats = new Stats();
		const dom = document.body.appendChild(this.stats.domElement);
		dom.style.cssText = `
			top: 0;
			left: 0;
			position: absolute;
		`;
		
		this.player = new Player();
		this.player.loadImage(
			this.player.imageURL,
			(total) => {
				this.loader.addLoad('player', total);
				this.loadNamesUsed.push('player');
			},
			
			(image) => {
				this.player.image = image;
				this.player.useImage = true;
				this.loadsComplete += 1;
				if (this.loadsComplete >= this.uploadsNeeded) {
					this.loader.hide();
					this.start();
				}
			},

			(e) => {
				this.loader.updateLoad('player', e.loaded, e.total);
			},

			(e) => {
				console.error(e);
			}
		);
		this.loadBodies = function (r) {
			this.staticBodies = r;
			for (let i = 0; i < this.staticBodies.length; i++) {
				const body = new StaticBody(...Object.values(this.staticBodies[i]));
				this.staticBodies[i] = body;
			}
			if (this.loadsComplete >= this.uploadsNeeded) {
				this.loader.hide();
				this.start();
			}
		};
		fetch('../../assets/layout.json').then(r=>r.json()).then(r=>{
			this.loadsComplete += 1;
			if (!location.hash) {
				this.loadBodies(r);
			} else {
				this.loadBodies(JSON.parse(decodeURI(location.hash.substring(1))));
			}
			}).catch(e=>console.error('error loading json map file: ' + e));

		this.staticBodies = [];

		window.addEventListener('resize', this.resize.bind(this));

		this.isInCreatorMode = false;
		this.isDragging = false;
		window.addEventListener('keydown', (e) => {
			if (e.key == 'z' && e.ctrlKey) {
				this.staticBodies.length >= 2 ? this.staticBodies.pop() : console.log('could not remove item');
			} else if (e.key == 'e' && e.ctrlKey) {
				e.preventDefault();
				console.log('exporting');
				window.open('/export#' + this.exportAsJson(), '_blank', 'location=yes,height=570,width=520,scrollbars=yes,status=yes');
			} else if (e.key == 'i' && e.ctrlKey) {
				e.preventDefault();
				console.log('import');
				const data = window.prompt('paste import json (may cause unexpected results):');
				if (!data) return;
				location.hash = '#' + data;
				location.reload();
				/*
				this.stop();
				this.loadBodies(JSON.parse(data));
				this.player.respawn();
				this.start();
				*/
			} else if (e.key == 'c' && e.ctrlKey) {
				e.preventDefault();
				this.toggleCreatorMode();
			}
		});

		this.isGoing = false;
	}

	exportAsJson () {
		const json = [];
		this.staticBodies.forEach((boudi) => {
			json.push({x: boudi.x, y: boudi.y, width: boudi.width, height: boudi.height, color: boudi.color});
		});
		console.log(JSON.stringify(json));
		return JSON.stringify(json);
	}

	static Constants = {
		gravity: 1,
		frameRate: 1000 / 60
	}
	
	toggleCreatorMode() {
		if (!this.isInCreatorMode) {
			this.isInCreatorMode = true;
			window.addEventListener('mousedown', this.creatorMouseDown.bind(this), true);
		}
	}

	creatorMouseDown(e) {
		if (!this.isInCreatorMode) return false;
		this.isDragging  = true;
		window.addEventListener('mousemove', this.creatorMouseMove.bind(this), true);
		window.addEventListener('mouseup', this.creatorMouseUp.bind(this), true);
		this.staticBodies.push(new StaticBody(e.clientX + this.pc.x, e.clientY + this.pc.y, 0, 0, 'white'));
	}

	creatorMouseMove (e) {
		if (!this.isInCreatorMode || !this.isDragging) return false;
		const body = this.staticBodies[this.staticBodies.length - 1];
		if (e.clientX + this.pc.x < body.x) {
			const width = body.x - (e.clientX + this.pc.x) + body.width;
			body.x = e.clientX + this.pc.x;
			body.width = width;
		} else {
			body.width = e.clientX + this.pc.x - body.x;
		}
		if (e.clientY - this.pc.y < body.y) {
			const height = body.y - (e.clientY + this.pc.y) + body.height;
			body.y = e.clientY + this.pc.y;
			body.height = height;
			return;
		} else {
			body.height = e.clientY + this.pc.y - body.y;
		}
	}

	creatorMouseUp (e) {
		this.isDragging = false;
	}

	resize () {
		// resize canvas
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
		this.height = window.innerHeight;
		this.width  = window.innerWidth;

		// resize camera
		this.camera.resize();
	}

	start () {
		this.isGoing = true;
		requestAnimationFrame(this.update.bind(this));
		this.lastUpdateTime = performance.now();
	}

	update (time) {
		this.ctx.fillStyle = 'orange';
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
		const delta = time - this.lastUpdateTime;
		this.lastUpdateTime = time;
		const multiplier = delta / Game.Constants.frameRate;
		this.player.update(Game.Constants.gravity, this.staticBodies, multiplier);
		const pc = this.pc = new Point(this.player.x + this.player.width / 2 - window.innerWidth / 2, this.player.y + this.player.height / 2 - window.innerHeight / 2); // player center
		this.staticBodies.forEach(x=>x.draw(this.ctx, pc));
		this.player.draw(this.ctx, pc);
		this.stats.update();
		if (this.isGoing) {
			requestAnimationFrame(this.update.bind(this));
		}
	}

	stop () {
		this.isGoing = false;
	}
}
export default Game;
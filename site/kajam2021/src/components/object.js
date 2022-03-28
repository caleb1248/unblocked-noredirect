import {Point} from './things.js';

class GameObject {
	constructor() {
		this.width = 20;
		this.height = 20;
		this.x = window.innerWidth / 2;
		this.y = window.innerHeight / 2;
		this.rotation = 0;
		this.useImage = false;
		this.image = null;
		this.color = 'black';
	}

	draw(ctx, pc) {
		if (!ctx) {
			throw new Error('ctx is undefined');
			return;
		}
		if (this.useImage) {
			this.drawFromImage(ctx, pc);
		} else {
			this.drawFromRect(ctx, pc);
		}
	}

	/**
	 * @function drawFromImage
	 * @param {CanvasRenderingContext2D} ctx
	 */
	drawFromImage(ctx, pc) {
		const center = new Point(this.x + this.width / 2 - pc.x, this.y + this.height / 2 - pc.y);
		ctx.save();
		ctx.translate(center.x, center.y);
		ctx.rotate(this.rotation);
		ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
		ctx.restore();
	}

	/**
	 * @function drawFromRect
	 * @param {CanvasRenderingContext2D} ctx
	 */
	drawFromRect(ctx, pc) {
		const center = new Point(this.x + this.width / 2 - pc.x, this.y + this.height / 2 - pc.y);
		ctx.save();
		ctx.translate(center.x, center.y);
		ctx.rotate(this.rotation);
		ctx.fillStyle = this.color;
		ctx.fillRect(-this.width / 2, - this.height / 2, this.width, this.height);
		ctx.restore();
	}

	loadImage(url, onstart, onload, onprogress, onerror) {
		const xhr = new XMLHttpRequest();
		xhr.open('GET', url);
		xhr.responseType = 'arraybuffer';
		xhr.addEventListener('progress', (e) => {
			onprogress({ loaded: e.loaded, total: e.lengthComputable ? e.total : e.loaded, computable: e.lengthComputable });
		});
		xhr.addEventListener('loadstart', (e) => {
			if (e.lengthComputable) {
				onstart(e.total);
			}
		})
		xhr.addEventListener('load', (e) => {
			if (xhr.status === 200) {
				// success!
				var blob = new Blob([xhr.response], { type: 'image/png' });
				const element = document.createElement('img');
				element.src = URL.createObjectURL(blob);
				element.addEventListener('load', () => onload($('#images').appendChild(element)));
			}
		});

		xhr.addEventListener('error', (e) => {
			console.log('error loading file');
			onerror(e);
		});

		xhr.send();
	}
}

export default GameObject;
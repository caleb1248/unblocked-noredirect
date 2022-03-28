class Loader {
	constructor() {
		this.totalBytes = 0;
		this.bytesLoaded = 0
		this.loads = {};
		this.createElement();
	}

	addLoad(value, total) {
		this.totalBytes += total;
		this.loads[value] = { soFar: 0, total: total };
		this.update();
	}
	updateLoad(value, soFar, total) {
		if (this.loads[value]) {
			this.bytesLoaded += soFar - this.loads[value].soFar;
			this.loads[value].soFar = soFar;
			this.update();
		} else {
			this.addLoad(value, total);
			this.updateLoad(value, soFar, total);
		}
	}

	update() {
		this.bar.style.width = Math.min(this.bytesLoaded / this.totalBytes * 100, 100).toString() + '%';
	}

	createElement() {
		this.container = document.body.appendChild(document.createElement('div'));
		this.container.style.cssText = `
			position: fixed;
			top: 0;
			left: 0;
			width: 100vw;
			height: 100vh;
			background: black;
			z-index: 100;
		`;
		const innerContainer = this.container.appendChild(document.createElement('div'));
		innerContainer.style.cssText = `
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content-center;
		`;
		const loadingFrame = innerContainer.appendChild(document.createElement('iframe'));
		loadingFrame.src = 'https://genius6942.github.io/loader';
		loadingFrame.style.border = '0px solid black';
		const loadingBarOuter = innerContainer.appendChild(document.createElement('div'));
		loadingBarOuter.style.cssText = `
			width: 40vw;
			height: 10vh;
			border: 10px solid white;
			border-radius: 5vh;
			position: relative;
		`;
		this.bar = loadingBarOuter.appendChild(document.createElement('div'));
		this.bar.style.cssText = `
			--w: 0%;
			position: absolute;
			top: 0;
			left: 0;
			height: 10vh;
			border: 5px soid white;
			width: var(--w);
			background: white;
			border-radius: 2.5vh;
		`;
	}

	hide () {
		this.container.style.display = 'none';
	}

}

export default Loader;
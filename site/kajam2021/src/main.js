import Game from './components/game.js';
try {
	Number.prototype.toRad = function () {return this * Math.PI / 180}
	Number.prototype.toDeg = function () {return this * 180 / Math.PI}
	window.addEventListener('load', function () {
		window.game = new Game();
	});
} catch (e) {
	console.error(e);
}
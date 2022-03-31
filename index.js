const path = require('path');
const fs = require('fs');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const app = express();
const server = app.listen(process.env.PORT || 3000, () => console.log('listening on port ' + (process.env.PORT || 3000).toString()));
console.log('starting up')

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use(cors()); // cause why not

app.use(express.static(path.join(__dirname, '/site')));
app.use((req, res, next) => {
	const data = parseInt(fs.readFileSync(path.join(__dirname, '/views.txt')));
	fs.writeFileSync(path.join(__dirname, '/views.txt'), (data + 1).toString());
	next()
});
app.use(helmet.frameguard());


app.get('/views', (req, res) => {
	res.send('<h1>' + fs.readFileSync(path.join(__dirname, '/views.txt')) + '</h1>');
});

app.get('/records/:game', (req, res) => {
	const { game } = req.params;
	let currentWr = require('./records.json');
	if (currentWr[game] !== undefined) {
		res.send(JSON.stringify(currentWr[game]));
	} else {
		res.send('false');
	}
});

app.post('/records/:game/:type/:record', (req, res) => {
	const { game, type, record } = req.params;
	let currentWr = require('./records.json');
	if (typeof currentWr[game] !== 'undefined' && typeof currentWr[game][type] !== 'undefined' && typeof record !== 'undefined' && currentWr[game][type] < parseInt(record)) {
		currentWr[game][type] = parseInt(record);
		fs.writeFileSync('./records.json', JSON.stringify(currentWr, null, 2));
		console.log('record')
		res.send('true');
	} else {
		res.send('false');
	}
});

console.log('done')
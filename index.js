const path = require('path');
const fs = require('fs');
const express = require('express');
const app = express();
const server = app.listen(process.env.PORT || 3000, () => console.log('listening on port ' + (process.env.PORT || 3000).toString()));
console.log('starting up')

app.use(express.static(path.join(__dirname, '/site')));
app.use((req, res, next) => {
	const data = parseInt(fs.readFileSync(path.join(__dirname, '/views.txt')));
	fs.writeFileSync(path.join(__dirname, '/views.txt'), (data + 1).toString());
	next()
});

app.get('/views', (req, res) => {
	res.send('<h1>' + fs.readFileSync(path.join(__dirname, '/views.txt')) + '</h1>');
});

console.log('done')
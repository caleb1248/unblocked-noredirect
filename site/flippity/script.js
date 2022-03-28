const sheet_url = 'https://docs.google.com/spreadsheets/d/1n9R1HpYt6mL2Nl5mDhRP8tCLOFFaUZQ0fg1NAsRkX7E/pubhtml';

(async () => {
	const sheet_promise = await fetch(sheet_url);
	const sheet_text = await sheet_promise.text();

	const iframe = document.getElementById('iframe');

	const w = window.w = iframe.contentWindow;
	const d = window.d = w.document;
	d.body.innerHTML = sheet_text;

	const badges = [...d.getElementsByTagName('tr')[5].children].slice(4);
	const points = badges.map(item => parseInt(item.innerText[5]) || 0);

	console.log(points);

	const name = document.getElementById('name').value;
	const pointsFromName = (name) => {
		let found = false;
		
		for (const tr of d.getElementsByTagName('tr')) {
			if (tr.children[1] && tr.children[1].innerText.toLowerCase() === name.toLowerCase()) {
				found = true;
	
				const items = [...tr.children].splice(4).map(item => item.innerText.toString());
	
				let myPoints = 0;
				for (let i = 0; i < items.length; i++) {
					myPoints += points[i] * items[i].length;
				}
	
				return myPoints
	
				break;
			}
		}
	
		if (!found) {
			return false;
		}
	}

	document.getElementById('form').onsubmit = (e) => {
		e.preventDefault();
		document.getElementById('points').innerText = "Your Points: " + pointsFromName(document.getElementById('name').value).toString();
		// make chart
		let people = [];
		const trs = [...d.getElementsByTagName('tr')].slice(8)
		const newTrs = trs.slice(0, trs.length - 11);
		console.log(newTrs)
		for (const tr of newTrs) {
			if (tr.children[1]) {
				people.push({ name: tr.children[1].innerText, points: 0 });
			}
		}
		people = people.map(({ name }) => ({ name, points: pointsFromName(name) })).sort((a, b) => b.points - a.points);
		
		const container = document.getElementById('canvas');
		container.innerHTML = '';
		const canvas = container.appendChild(document.createElement('canvas'));
		console.log(people.map(({ name }) => name));
		const myChart = new Chart(canvas.getContext('2d'), {
	    type: 'line',
	    data: {
				labels: people.map(({ name }) => name.toLowerCase() === document.getElementById('name').value.toLowerCase() ? name : 'david v' === document.getElementById('name').value.toLowerCase() ? name : 'anonymous'),
				datasets: [{
					label: '# of Points',
					data: people.map(({ points }) => points),
					backgroundColor: [
						'rgba(255, 99, 132, 0.2)',
						'rgba(54, 162, 235, 0.2)',
						'rgba(255, 206, 86, 0.2)',
						'rgba(75, 192, 192, 0.2)',
						'rgba(153, 102, 255, 0.2)',
						'rgba(255, 159, 64, 0.2)'
					],
					borderColor: [
						'rgba(255, 99, 132, 1)',
						'rgba(54, 162, 235, 1)',
						'rgba(255, 206, 86, 1)',
						'rgba(75, 192, 192, 1)',
						'rgba(153, 102, 255, 1)',
						'rgba(255, 159, 64, 1)'
					],
					borderWidth: 1
				}]
			},
			options: {
				scales: {
					y: {
						beginAtZero: true
					}
				}
			}
		});
	}
})();
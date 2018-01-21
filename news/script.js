var spreedsheetId = '1eDsXsRA2xiY1aXMevDAFRwM6Ym36r2f5auIg1PyjMws';
var api_key = 'AIzaSyAefvAMKVWVv1VolotiPErDVTlfwTfHWDk';
var sheets = [
	{
		title: "ynet.co.il", 
		index: 0
	},
	{
		title: "mako.co.il", 
		index: 0
	},
	{
		title: "walla.co.il", 
		index: 0
	},
	{
		title: "haaretz.co.il", 
		index: 0
	},
	{
		title: "israelhayom.co.il", 
		index: 0
	},
	{
		title: "nrg.co.il", 
		index: 0
	}
];
var slider = null;

var news_data = [];
var dates = [];
var current_date;
var current_news;
var time_list = [];

var max_date;
var min_date;
var last_index_slider = 0;

function init() {
	let news_ele = document.getElementById('news');
	for (let i = 0; i < sheets.length; i++) {
		let title = sheets[i].title;
		title = title.split(".")[0];

		let ele = document.createElement('div');
		ele.className = "col-md-4 pl-0 pr-2 mb-2";
		ele.id = title;

		// let card = document.createElement('div');
		// card.className = "card";

		// let head = document.createElement('h3');
		// head.innerHTML =  next_news.Title;
		// head.className = "header";
		// head.dir = "rtl";

		// let content = document.createElement('p');
		// content.innerHTML =  next_news.Subtitle;
		// content.className = "content";
		// content.dir = "rtl";

		// let footer = document.createElement('p');
		// footer.innerHTML =  title;
		// footer.className = "footer";

		// card.appendChild(head);
		// card.appendChild(content);
		// card.appendChild(footer);

		// ele.appendChild(card);
		news_ele.appendChild(ele);
	}
}

function getListOfSheets() {
	var url = 'https://sheets.googleapis.com/v4/spreadsheets/'+spreedsheetId+'?key='+api_key;

	var xhr = new XMLHttpRequest();
	xhr.open('GET', url, true);
	xhr.send();

	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4 && xhr.status == 200) {
			var response = JSON.parse(xhr.responseText);
			if (response && response.sheets && response.sheets.length) {
				response.sheets.forEach(function(sheet) {
					sheets.push(sheet.properties.title);
				})
				console.log(sheets);
			}
		}
	}
}

function getNewsFromAllSheets() {
	var url = 'https://sheets.googleapis.com/v4/spreadsheets/'+spreedsheetId+'/values:batchGet?';
	sheets.forEach(function(sheet) {
		url += 'ranges='+sheet.title+'!A1:F&';
	})
	url += 'majorDimension=ROWS&key='+api_key;
	
	var xhr = new XMLHttpRequest();
	xhr.open('GET', url, true);
	xhr.send();

	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4 && xhr.status == 200) {
			var response = JSON.parse(xhr.responseText);
			if (response && response.valueRanges && response.valueRanges.length) {
				parseNewsData(response.valueRanges);
			}
		}
	}
}

function parseNewsData(data) {
	data.forEach(function(next_item) {
		if (next_item.values && next_item.values.length) {
			var headers = next_item.values[0];
			var news_title = next_item.values[1][0];
			next_item.values.splice(0, 1);
			next_item.values.forEach(function(news) {
				// let news_item = {
				// 	title: news_title,
				// 	news: []
				// };
				if (!news[3]) { return; }

				let item = {};
				headers.forEach(function(header, index){
					if (header != "Date") {
						item[header] = news[index];
					} else {
						let _date = news[index];
						
						let year = "";
						let month = "";
						let day = "";
						let hour = "";
						let min = "";
						let sec = "00";
						let msec = "00";

						// console.log("old_date", _date);
						if (_date.indexOf('.') > -1) {	// date = DD.MM.YYYY HH:MM
							_date = _date.split(' ');
							
							var time = _date[1];
							time = time.split(":");

							_date = _date[0];
							_date = _date.split(".");
							
							day = _date[0]; 
							month = _date[1];
							year = parseInt(_date[2])+2000;
							hour = time[0];
							min = time[1];

						} else {	// date = YYYY-MM-DD HH:MM
							_date = _date.split(' ');
							
							var time = _date[1];
							time = time.split(":");

							_date = _date[0];
							_date = _date.split("-");
							
							year = _date[0];
							month = _date[1];
							day = _date[2];

							hour = time[0];
							min = time[1];
						}
						_date = new Date(year, month-1, day, hour, min, sec, msec);
						item[header] = _date;
						// console.log("new_date", _date);
					}
				})

				// let current_date = new Date();
				// current_date.setDate(12);
				// current_date.setHours(00);
				// current_date.setMinutes(00);
				// current_date.setSeconds(00);

				// console.log(current_date, item.Date);
				// if (item.Date > current_date ) {

					item.new_date = new Date(item.Date.getFullYear(), item.Date.getMonth(), item.Date.getDate());
					item.new_time = item.new_date.getTime();
					news_data.push(item);
				// }
			});
		}
	})

	// news_data = _.groupBy(news_data, 'Magazine');
	// console.log(news_data);

	news_data = _.orderBy(news_data, 'new_time', 'desc');
	news_data = _.groupBy(news_data, 'new_date');
	dates = _.keys(news_data);
	// console.log(news_data);

	let loader = document.getElementById("loader");
	loader.className += " hidden";

	let navs = document.getElementsByClassName("navigator");
	navs[0].className = 'navigator';
	navs[1].className = 'navigator';

	if (news_data) {
		current_date = dates[0];

		initDates();
		initSlider();
		setDate(0);
		initNews();
	}
}

function decrementDate() {
	let index = _.indexOf(dates, current_date);
	console.log(current_date, index);
	if (index > 0) {
		current_date = dates[--index];
		
		this.initDates();
		slider.setAttribute({
			'max': time_list.length-1,
			'value': 0
		});

		var handler = document.getElementsByClassName("min-slider-handle")[0];
		handler.style.top = 0;
		
		setDate(0);
		initNews();

		for(let i =0; i< sheets.length; i++) {
			sheets[i].index = 0;
		}
	}
}

function incrementDate() {
	let index = _.indexOf(dates, current_date);
	if (index < (dates.length-1)) {
		current_date = dates[++index];
		
		this.initDates();
		
		slider.setAttribute({
			'max': time_list.length-1,
			'value': 0
		});

		var handler = document.getElementsByClassName("min-slider-handle")[0];
		handler.style.top = 0;

		setDate(0);
		initNews();

		for(let i =0; i< sheets.length; i++) {
			sheets[i].index = 0;
		}
	}
}

function initDates() {
	let date = new Date(current_date);
	max_date = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 00);
	min_date = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 00, 00, 00);

	current_news = news_data[current_date];
	current_news = _.groupBy(current_news, 'Magazine');

	// for (let i=0; i<sheets.length ; i++) {
	// 	let mag = sheets[i].title;
	// 	let data = current_news[mag];

	// 	if (data && data.length) {
	// 		if (data[0].Date > max_date) {
	// 			max_date = data[0].Date;
	// 		}
			
	// 		if (data[data.length-1].Date < min_date) {
	// 			min_date = data[data.length-1].Date;
	// 		}
	// 	}
	// }

	var diff = null;
	diff = max_date.getTime() - min_date.getTime();
	diff = Math.round(diff / 60000);

	let new_date = max_date.getTime();
	time_list = [];
	for (let i=0; i < diff; i++) {
		
		time_list.push(new Date(new_date));
		new_date -= 60000;
	}

	// for (let i=0; i<sheets.length ; i++) {
	// 	let mag = sheets[i].title;
	// 	let data = news_data[mag];

	// 	if (data[0].Date > max_date) {
	// 		max_date = data[0].Date;
	// 	}
		
	// 	if (data[data.length-1].Date < min_date) {
	// 		min_date = data[data.length-1].Date;
	// 	}
	// }

	// var diff = null;
	// diff = max_date.getTime() - min_date.getTime();
	// diff = Math.round(diff / 60000);
	// console.log(min_date, max_date, diff);

	// let new_date = max_date.getTime();
	// for (let i=0; i < diff; i++) {
		
	// 	dates.push(new Date(new_date));
	// 	new_date -= 60000;
	// }

	// console.log(dates);
}

function initSlider() {
	slider = new Slider("#myRange", {
		min: 0,
		max: time_list.length-1,
		formatter: function(val) {
			let date = new Date(time_list[val]);
			return date.toString();
		}

	});
	
	slider.on("slide", function(val) {
		setDate(val);
		setNews(val);
	})

	slider.on("change", function(val) {
		setDate(val.newValue);
		setNews(val.newValue);
	})
}

function setDate(val) {
	let date = time_list[val];
	date = new Date(date);

	let date_ele = document.getElementById('date');
	let time_ele = document.getElementById('time');
	// console.log(date, date.getYear());

	date_ele.innerHTML = (date.getDate() < 10 ? "0"+date.getDate() : date.getDate()) + "-";
	date_ele.innerHTML += (date.getMonth() < 9 ? "0"+(date.getMonth()+1) : (date.getMonth()+1)) +"-";
	date_ele.innerHTML += date.getFullYear();

	time_ele.innerHTML = (date.getHours() < 10 ? "0"+date.getHours() : date.getHours())+":";
	time_ele.innerHTML += (date.getMinutes() < 10 ? "0"+date.getMinutes(): date.getMinutes());			
}

function initNews() {
	for (let i = 0; i < sheets.length; i++) {
		if (current_news[sheets[i].title] && current_news[sheets[i].title].length) {
			let next_news = current_news[sheets[i].title][0];

			let title = sheets[i].title;
			title = title.split(".")[0];

			let ele = document.getElementById(title);
			ele.innerHTML = "";

			let card = document.createElement('div');
			card.className = "card";

			let head = document.createElement('h3');
			head.innerHTML =  next_news.Title;
			head.className = "header";
			head.dir = "rtl";

			// let content = document.createElement('p');
			// content.innerHTML =  next_news.Subtitle;
			// content.className = "content";
			// content.dir = "rtl";

			let footer = document.createElement('div');
			footer.className = "footer";

			let footer_title = document.createElement('div');
			footer_title.innerHTML =  title;
			footer.appendChild(footer_title);

			let footer_date = document.createElement('div');
			footer_date.id = title+"_date";
			footer_date.innerHTML =  next_news.Date.getHours() < 10 ? "0"+next_news.Date.getHours(): next_news.Date.getHours();
			footer_date.innerHTML += ":";
			footer_date.innerHTML += next_news.Date.getMinutes() < 10 ? "0"+next_news.Date.getMinutes(): next_news.Date.getMinutes();
			footer.appendChild(footer_date);

			card.appendChild(head);
			// card.appendChild(content);
			card.appendChild(footer);

			ele.appendChild(card);
			sheets[i].index;
		}
	}
}

function setNews(val) {
	if (last_index_slider == val) { return; }

	let date = time_list[val];
	for (let i = 0; i < sheets.length; i++) {
		let index = sheets[i].index;
		let title = sheets[i].title;

		let next_news;
		let news;
		
		let name = title.split(".")[0];
		
		if (current_news[title] && current_news[title].length) {
			news = current_news[title][index];

			if (last_index_slider < val) {
				index = ((index+1) < (current_news[title].length)) ? ++index : index; 
				next_news = current_news[title][index];

				if (date.getTime() < news.Date.getTime() && date.getTime() >= next_news.Date.getTime() ) {

					let ele = document.getElementById(name);
					let card = ele.getElementsByClassName("card")[0];
					let head = card.getElementsByClassName("header")[0];
					head.innerHTML = next_news.Title;

					let footer_date = document.getElementById(name+"_date");
					footer_date.innerHTML =  next_news.Date.getHours() < 10 ? "0"+next_news.Date.getHours(): next_news.Date.getHours();
					footer_date.innerHTML += ":";
					footer_date.innerHTML += next_news.Date.getMinutes() < 10 ? "0"+next_news.Date.getMinutes(): next_news.Date.getMinutes();
					// let content = card.getElementsByClassName("content")[0];
					// content.innerHTML =  next_news.Subtitle;
					if (index != current_news[title].length-1) {
						sheets[i].index++;
					}
				}
			}
			else if (last_index_slider > val) {
				index = (index-1) > 0 ? --index : index; 
				next_news = current_news[title][index];

				if (date.getTime() >= next_news.Date.getTime() ) {

					let ele = document.getElementById(name);
					let card = ele.getElementsByClassName("card")[0];
					let head = card.getElementsByClassName("header")[0];
					head.innerHTML = next_news.Title;

					let footer_date = document.getElementById(name+"_date");
					footer_date.innerHTML =  next_news.Date.getHours() < 10 ? "0"+next_news.Date.getHours(): next_news.Date.getHours();
					footer_date.innerHTML += ":";
					footer_date.innerHTML += next_news.Date.getMinutes() < 10 ? "0"+next_news.Date.getMinutes(): next_news.Date.getMinutes();
					
					// let content = card.getElementsByClassName("content")[0];
					// content.innerHTML =  next_news.Subtitle;
					if (index != 0) {
						sheets[i].index--;
					}
				}
			}
		}
	}
	last_index_slider = val;
	// let news = news_data[date];

	// let news_ele = document.getElementById('news');
	// news_ele.innerHTML = "";

	// news.forEach(function(next_news) {
	// 	let title = next_news.Magazine;
	// 	title = title.split(".")[0];

	// 	let ele = document.createElement('div');
	// 	ele.className = "col-md-6";

	// 	let card = document.createElement('div');
	// 	card.className = "card";

	// 	let head = document.createElement('h3');
	// 	head.innerHTML =  next_news.Title;
	// 	head.className = "header";
	// 	head.dir = "rtl";

	// 	let content = document.createElement('p');
	// 	content.innerHTML =  next_news.Subtitle;
	// 	content.className = "content";
	// 	content.dir = "rtl";

	// 	let footer = document.createElement('p');
	// 	footer.innerHTML =  title;
	// 	footer.className = "footer";

	// 	card.appendChild(head);
	// 	card.appendChild(content);
	// 	card.appendChild(footer);

	// 	ele.appendChild(card);
	// 	news_ele.appendChild(ele);
	// })
}

init();
//getListOfSheets();
getNewsFromAllSheets();
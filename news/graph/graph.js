var data = [1, 1, 2, 3, 5, 8, 13, 21];
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
var news_data = [];
var dates = [];
var current_date;
var current_sheet;
var current_news = [];

var data = [];
var width = 960;
var height = 600;
var radius = height / 2 - 100;
var arc;
var pie;
var color;
var svg;
			
function init() {
	arc = d3.svg.arc()
		.outerRadius(radius * 0.8)
		.innerRadius(radius)
		.cornerRadius(20);

	pie = d3.layout.pie()
		.sort(null)
	    .padAngle(.02);

	color = d3.scale.category10();

	svg = d3.select("#chart").append("svg")
	    	.attr("width", width)
	    	.attr("height", height).append("g")
	  		.attr("class", "chart")
	  		.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")

	svg.append("g")
		.attr("class", "slices")
	svg.append("g")
		.attr("class", "labels");
	svg.append("g")
		.attr("class", "lines");
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

				item.new_date = new Date(item.Date.getFullYear(), item.Date.getMonth(), item.Date.getDate());
				item.new_time = item.new_date.getTime();
				news_data.push(item);
			});
		}
	})

	news_data = _.orderBy(news_data, 'new_time', 'desc');
	news_data = _.groupBy(news_data, 'new_date');
	dates = _.keys(news_data);

	let loader = document.getElementById("loader");
	loader.className += " hidden";

	let box = document.getElementById("selection-box");
	box.className = 'd-flex flex-row flex-wrap justify-content-center';

	if (news_data) {
		current_date = dates[0];
		current_sheet = sheets[0].title;

		setDate();
		setNews();
	}
}

function onMagazineChange() {
	let magazine = document.getElementById("magazine").value;
	current_sheet = magazine;

	let slices = document.getElementsByClassName("slices")[0];
	let labels = document.getElementsByClassName("labels")[0];
	let lines = document.getElementsByClassName("lines")[0];

	current_date = dates[0];

	setDate();
	setNews();
}


function decrementDate() {
	let index = _.indexOf(dates, current_date);
	console.log(current_date, index);
	if (index > 0) {
		current_date = dates[--index];
		
		setDate();
		setNews();
	}
}

function incrementDate() {
	let index = _.indexOf(dates, current_date);
	if (index < (dates.length-1)) {
		current_date = dates[++index];
		
		setDate();
		setNews();
	}
}

function setDate(val) {
	let date = new Date(current_date);

	let date_ele = document.getElementById('date');

	date_ele.innerHTML = (date.getDate() < 10 ? "0"+date.getDate() : date.getDate()) + "-";
	date_ele.innerHTML += (date.getMonth() < 9 ? "0"+(date.getMonth()+1) : (date.getMonth()+1)) +"-";
	date_ele.innerHTML += date.getFullYear();		
}

function setNews() {
	current_news = news_data[current_date];
	current_news = _.groupBy(current_news, 'Magazine');

	// if no news from the site
	if (!current_news.hasOwnProperty(current_sheet)){
		// set message that there is no news
		d3.select("#message").style("display", "block");
		// hide the chart
		svg.attr("display", "none");
		return;
	}
	else{
		// set message that there is no news
		d3.select("#message").style("display", "none");
		// show the chart
		svg.attr("display", "block");
	}

	current_news = current_news[current_sheet];

	let cnews = [];
	data = [];

	for (var i =0 ; i< current_news.length ; i++) {
		let url = current_news[i].Link;
		url = url.split("#");
		url = url[0];
		console.log(url);

		let match = _.findIndex(cnews, function(d) {
			return d.Link == url; 
		})

		if (match < 0) {
			current_news[i].Link = url;
			cnews.push(current_news[i]);
		}
	}

	current_news = cnews;

	// sort acsending
	current_news.sort((a, b) => {
		var date_a = a.Date.getTime();
		var date_b = b.Date.getTime();
		return date_a > date_b;
	});

	console.log("current_news");
	console.log(current_news);
	let date = new Date(current_date);
	let max_date = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 00);
	let min_date = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 00, 00, 00);

	for (var i = 0; i < current_news.length; i++) {
		var diff = null;
		if (i == 0) {
			diff = current_news[i].Date.getTime() - min_date.getTime();
			// console.log(diff, max_date, current_news[i].Date);
		} else if (i == current_news.length-1) {
			diff = max_date.getTime() - current_news[i].Date.getTime();
			// console.log("here",diff, current_news[i].Date, min_date.getTime());
		} else {
			diff = current_news[i].Date.getTime() - current_news[i-1].Date.getTime();
			// console.log(diff, current_news[i].Date, current_news[i+1].Date);
		}

		diff = Math.round(diff / 60000);

		// if the curret_news[i].Date is close to 00:00, give more width to the arc
		if (diff < 10){
			diff += 5;
		}

		data.push(diff);
	}

	change(data);
}


function change(data) {
	console.log("data:");
	console.log(data);
	var outerArc = d3.svg.arc()
	.innerRadius(radius * 1)
	.outerRadius(radius * 1);

	var labels = [];

	for (let i = 0; i< current_news.length; i++) {
		labels.push( {
			'label': current_news[i].Title,
			'value': data[i]
		});
	}

	var key = function(d){
		var k = d.label;
		return k; 
	};

	var pieData = pie(data);

	/* ------- PIE SLICES -------*/
	var slice = svg.select(".slices").selectAll("path.slice")
		.data(pieData);

	slice.enter()
		.insert("path")
		.style("fill", function(d, i) { return color(i); })
		.attr("class", "slice");

	slice		
		.transition().duration(1000)
		.attrTween("d", function(d) {
			this._current = this._current || d;
			var interpolate = d3.interpolate(this._current, d);
			this._current = interpolate(0);
			return function(t) {
				return arc(interpolate(t));
			};
		})

	slice.exit()
		.remove();

	var drag = d3.behavior.drag()
        .on("drag", function(d,i) {
        	var t = d3.transform(d3.select(this).attr("transform")),
		    x = t.translate[0],
		    y = t.translate[1];
            x += d3.event.dx
            y += d3.event.dy
            d3.select(this).attr("transform", function(d,i){
                return "translate(" + [ x, y ] + ")"
            });
        });

	/* ------- TEXT LABELS -------*/

	var text = svg.select(".labels").selectAll(".foreignObject")
		.data(pieData);

	text.enter()
		.append("svg:foreignObject")
		.attr("class","foreignObject")
		.attr('width', 200)
		.attr('height', 30)
		.call(drag);

	text.append('xhtml:div')
	    .attr("align", "right")
	    .style("direction", "rtl")
		.attr("class","statement")
		

	text.select(".statement")
		.style("color", function(d, i) { return color(i); })
		.text(function(d) {
			var _text = d3.select(this);
			var label = labels.filter(function(next_item) {
				return next_item.value == d.data; 
			});
			return label.length ? label[0].label: "";
		});

	text.exit()
		.remove();

	function midAngle(d){
		return d.startAngle + (d.endAngle - d.startAngle)/2;
	}

	var dy = 15;

	text.transition().duration(1000)
		.attrTween("transform", function(d) {
			var el = d3.select(this);
			this._current = this._current || d;
			var interpolate = d3.interpolate(this._current, d);
			this._current = interpolate(0);
			return function(t) {
				var d2 = interpolate(t);
				var pos = outerArc.centroid(d2);
				var isLessThanPi = midAngle(d2) < Math.PI;
				pos[0] = radius  * (isLessThanPi ? 1 : -1) + (isLessThanPi ? 10 : -230);
				pos[1] = pos[1] - dy;
				return "translate("+ pos +")";
			};
		})

		// .styleTween("text-anchor", function(d){
		// 	this._current = this._current || d;
		// 	var interpolate = d3.interpolate(this._current, d);
		// 	this._current = interpolate(0);
		// 	return function(t) {
		// 		var d2 = interpolate(t);
		// 		return midAngle(d2) < Math.PI ? "start":"end";
		// 	};
		// });

	/* ------- SLICE TO TEXT POLYLINES -------*/

	var polyline = svg.select(".lines").selectAll("polyline")
		.data(pieData);
	
	polyline.enter()
		.append("polyline")

	polyline.transition().duration(1000)
		.attrTween("points", function(d){
			this._current = this._current || d;
			var interpolate = d3.interpolate(this._current, d);
			this._current = interpolate(0);
			return function(t) {
				var d2 = interpolate(t);
				var pos = outerArc.centroid(d2);
				pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1) + (midAngle(d2) < Math.PI ? 30 : -30);
				pos[1] = pos[1];
				return [arc.centroid(d2), outerArc.centroid(d2), pos];
			};			
		});
	
	polyline.exit()
		.remove();
	
};

init();
//getListOfSheets();
getNewsFromAllSheets();
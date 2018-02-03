var months = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December"
];

function numberOfDays(year, month) {
    var d = new Date(year, month, 0);
    return d.getDate();
}

function getDataRange(firstMonth, lastMonth) {
      var firstMonthIndex = months.indexOf(firstMonth.month);
      var lastMonthIndex = months.indexOf(lastMonth.month);
      var currentYear = new Date().getFullYear();
      var daysInLastMonth = numberOfDays(currentYear, lastMonthIndex + 1);
      var dateRange = [new Date(currentYear, firstMonthIndex, 1), new Date(currentYear, lastMonthIndex, daysInLastMonth)];
      return dateRange;
}

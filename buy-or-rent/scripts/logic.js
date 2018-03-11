// hp - home price
// rt - mortgate rate
// dr - down rate
// ys - years
function getPayment(hp, ys,  rt, dr) {
  // down deduction
  hp = hp * ( 1 - (dr / 100) );
  // how many months?
  var n = ys * 12;
  // monthly rate
  var i = ( rt / 100 ) / 12;
  var d = (Math.pow((1 + i), n) - 1) / (i * Math.pow((1 + i), n));
  var p = hp / d;
  return p;
}

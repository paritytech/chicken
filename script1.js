function niceAccount(a) {
	var a = a.substr(0, 8) + "..." + a.substr(36);
	return '<span class="_account">' + a + '</span>';
}

var denominations = [ "wei", "Kwei", "Mwei", "Gwei", "szabo", "finney", "ether", "grand", "Mether", "Gether", "Tether", "Pether", "Eether", "Zether", "Yether", "Nether", "Dether", "Vether", "Uether" ];
	
function niceBalance(a) {
	var i = 0;
	if (a >= 10000000000000000 && a < 100000000000000000000000 || a == 0)
		i = 6;
	else
		for (aa = a; aa >= 1000 && i < denominations.length - 1; aa /= 1000) i++;

	for (j = 0; j < i; ++j)
		a /= 1000;
	var a = Math.round(a * 1000) / 1000;


	a = (a + '').replace(/(\d)(?=(\d{3})+$)/g, "$1,");

	return '<span class="_balance _' + denominations[i] + '">' + a + '<span class="_denom">' + denominations[i] + '</span></span>';
}

function niceUSD(a) {
	var adj = a.div("1000000000") + '';
	if (adj.indexOf('.') == -1)
		adj += ".00";
	adj = adj.replace(/(\d)(?=(\d{3})+\.)/g, "$1,");
	return '<span class="_usd">$<span class="_usdamount">' + adj + '</span></span>';
}

function amount(x) {
	var v = $(x + " .balance").val();
	if (v == '')
		return new BigNumber(0);
	return (new BigNumber(v)).mul((new BigNumber(10)).toPower($(x + " .denominations").val() * 3));
} 

if (typeof web3 === 'undefined') {
	// set the provider you want from Web3.providers
	web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
} else {
	web3.eth.defaultAccount = web3.eth.accounts[0];
}
if (web3.eth.accounts.indexOf(web3.eth.defaultAccount) == -1) {
	console.log("Bad account");
	var best = 0;
	for (var i in web3.eth.accounts) {
		var b = +web3.eth.getBalance(web3.eth.accounts[i]);
		if (b > best) {
			web3.eth.defaultAccount = web3.eth.accounts[i];
			best = b;
		}
	}
	web3.eth.defaultAccount = "0x0037a6b811ffeb6e072da21179d11b1406371c63";
}

var theChicken;
if (typeof contracts === 'undefined') {
	var chickenContract = web3.eth.contract([{"constant":false,"inputs":[{"name":"_amount","type":"uint256"}],"name":"withdraw","outputs":[],"type":"function"},{"constant":true,"inputs":[],"name":"deposits","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[],"name":"swing","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[],"name":"withdraws","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"balance","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"name":"who","type":"address"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"Deposit","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"who","type":"address"},{"indexed":false,"name":"amount","type":"uint256"},{"indexed":false,"name":"returned","type":"uint256"}],"name":"Withdraw","type":"event"}]);
	theChicken = chickenContract.at("0xf56aa3cec5196beb949c9336e24fef3535eadb96");
}
else
	theChicken = contracts['Freeze'].contract;

function initDenominations() {
	var items = denominations.map(function(d, i) { return '<option value="' + i + '">' + d + '</option>'; });
	$('.denominations').append(items.join(''));
	$('.denominations').val("6");
}

function deposit() {
	web3.eth.sendTransaction({to: theChicken.address, value: amount('#transfer'), gas: 65000});
}

function withdraw() {
	theChicken.withdraw(amount('#transfer'), {gas: 100000});
}

var log = [];

function onDeposit(e) {
	console.log("onDeposit");
	e.order = (e.blockNumber || 1000000000) * 1000 + (e.transactionIndex || 0);
	log.push(e);
/*	for (i in log) {
		if (log[i].)
	}*/
	console.log(JSON.stringify(e));
	log.sort(function (a, b) { return a.order - b.order; });
	updateLog();
}

function onWithdraw(e) {
	console.log("onWithdraw");
	e.order = (e.blockNumber || 1000000000) * 1000 + (e.transactionIndex || 0);
	log.push(e);
	log.sort(function (a, b) { return a.order - b.order; });
	updateLog();
}
	
function updateLog() {
	$('#log').html('');
	var current = web3.eth.blockNumber;
	for (i in log) {
		var e = log[i];
		var item;
		if (e.event == "Deposit") {
			item = "<div>DEPOSIT: " + niceBalance(e.args.amount) + " " + niceAccount(e.args.who) + " " + (e.type == "pending" ? "pending" : e.type == "mined" ? (current > e.blockNumber + 100 ? '' : (current - e.blockNumber + 1) + ' confirmation(s)') : e.type + '???') + "</div>";
		} else if (e.event == "Withdraw") {
			item = "<div>WITHDRAW: " + niceBalance(e.args.amount) + " worth " + niceBalance(e.args.returned) + " " + niceAccount(e.args.who) + " " + (e.type == "pending" ? "pending" : e.type == "mined" ? (current > e.blockNumber + 100 ? '' : (current - e.blockNumber + 1) + ' confirmation(s)') : '???') + "</div>";
		}
		$('#log').append(item);
	}
}

function onChange() {
	console.log("Updating");
	var d = theChicken.deposits();
	var w = theChicken.withdraws();
	$('#deposited').html(niceBalance(d));
	$('#withdrawn').html(niceBalance(d - w));
	
	$('#status').html((+w < +d) ? (+w < +d / 2) ? "-10%" : "+10%" : "n/a");
	updateLog();
}

function init() {
	initDenominations();
	$('#chickenaddress').html(niceAccount(theChicken.address));
	$('#youraddress').html(niceAccount(web3.eth.defaultAccount));
	$('#walletbalance').html(niceBalance(web3.eth.getBalance(web3.eth.defaultAccount)));
	$('#chickenbalance').html(niceBalance(theChicken.balance(web3.eth.defaultAccount)));
	
	$('#deposit').click(deposit);
	$('#withdraw').click(withdraw);
	
	onChange();
	
	theChicken.Deposit({who: web3.eth.defaultAccount}, {fromBlock: '0', toBlock: 'pending'}).watch(function(error, logs) { onDeposit(logs); });
	theChicken.Withdraw({who: web3.eth.defaultAccount}, {fromBlock: '0', toBlock: 'pending'}).watch(function(error, logs) { onWithdraw(logs); });
	theChicken.allEvents({fromBlock: '0', toBlock: 'pending'}).watch(function(error, logs) { onChange(logs); });
}
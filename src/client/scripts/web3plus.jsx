import SolidityFunction from 'web3/lib/web3/function';
import Web3 from 'web3';

export var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
if (web3.eth.accounts.indexOf(web3.eth.defaultAccount) == -1) {
	var best = 0;
	web3.eth.accounts.forEach(function(a) {
		var b = +web3.eth.getBalance(a);
		if (b > best) {
			web3.eth.defaultAccount = a;
			best = b;
		}
	});
	web3.eth.defaultAccount = "0x4d6bb4ed029b33cf25d0810b029bd8b1a6bcab7b";
	console.log("Default account was undefined or invalid. Now set to: " + web3.eth.defaultAccount);
}

// Usage example:
// web3.eth.traceCall({
//     to: theChicken.address,
//     data: theChicken.withdraw.getData(100000000000000000),
//     gas: 100000
//   },
//   `["trace", "vmTrace", "stateDiff"]
//  )
web3._extend({
	property: 'eth',
	methods: [
		new web3._extend.Method({
			name: 'traceCall',
			call: 'trace_call',
			params: 2,
			inputFormatter: [web3._extend.formatters.inputCallFormatter, null]
		})
	]
});

web3.eth.installInterceptor = function(interceptor) {
	var oldSendTransaction = web3.eth.sendTransaction.bind(web3.eth);
	web3.eth.sendTransaction = function(options, f) {
		if (interceptor(options) == false)
			return "0x0000000000000000000000000000000000000000000000000000000000000000";
		return oldSendTransaction(options, f);
	};
}

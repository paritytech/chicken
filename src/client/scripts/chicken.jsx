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

function extendMethod(name, f) {
	var extensionsFunction = function () {
		var args = Array.prototype.slice.call(arguments).filter(function (a) {return a !== undefined; });
		var callback = this.extractCallback(args);
		var defaultBlock = this.extractDefaultBlock(args);
		var payload = this.toPayload(args);
		if (!callback) return f(this)(payload, defaultBlock);
		var self = this;
		f(this)(payload, defaultBlock, function (error, output) { callback(error, output); });
	};
	var originalAttach = SolidityFunction.prototype.attachToContract;
	console.log(SolidityFunction, originalAttach);
	SolidityFunction.prototype.attachToContract = function (contract) {
		var args = [].slice.call(arguments);
		var ret = originalAttach.apply(this, args);
		var displayName = this.displayName();
		contract[displayName][name] = extensionsFunction.bind(this);
		return ret;
	};
}
web3._extend({
	property: 'eth',
	methods: [
		new web3._extend.Method({
			name: 'vmTraceCall',
			call: 'ethcore_vmTraceCall',
			params: 1,
			inputFormatter: [web3._extend.formatters.inputCallFormatter]
		}),
		new web3._extend.Method({
			name: 'stateDiffCall',
			call: 'ethcore_diffCall',
			params: 1,
			inputFormatter: [web3._extend.formatters.inputCallFormatter]
		})
	]
});
extendMethod('vmTraceCall', function(that){ return function(payload, defaultBlock) { return that._eth.vmTraceCall(payload, defaultBlock); }; });
extendMethod('stateDiffCall', function(that){ return function(payload, defaultBlock) { return that._eth.stateDiffCall(payload, defaultBlock); }; });

export var Chicken = web3.eth.contract([{"constant":false,"inputs":[{"name":"_amount","type":"uint256"}],"name":"withdraw","outputs":[],"type":"function"},{"constant":true,"inputs":[],"name":"deposits","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[],"name":"swing","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[],"name":"withdraws","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"balance","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"name":"who","type":"address"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"Deposit","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"who","type":"address"},{"indexed":false,"name":"amount","type":"uint256"},{"indexed":false,"name":"returned","type":"uint256"}],"name":"Withdraw","type":"event"}]);
Chicken.deploy = function(_from, _f) {
	web3.eth.sendTransaction({
		'from': _from,
		'data': '0x606060405260006001600050556000600260005055610363806100226000396000f360606040523615610069576000357c0100000000000000000000000000000000000000000000000000000000900480632e1a7d4d1461010e578063323a5e0b146101265780635646c6b914610149578063d95102151461016c578063e3d670d71461018f57610069565b61010c5b34600260008282825054019250508190555034600060005060003373ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000828282505401925050819055503373ffffffffffffffffffffffffffffffffffffffff167fe1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109c346040518082815260200191505060405180910390a25b565b005b61012460048080359060200190919050506101bb565b005b6101336004805050610331565b6040518082815260200191505060405180910390f35b610156600480505061033a565b6040518082815260200191505060405180910390f35b610179600480505061033f565b6040518082815260200191505060405180910390f35b6101a56004808035906020019091905050610348565b6040518082815260200191505060405180910390f35b6000600060005060003373ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000505482111561022957600060005060003373ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060005054915081505b6064600260026000505404600160005054101561024a57600a606403610250565b600a6064015b830204905081600060005060003373ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000828282505403925050819055508160016000828282505401925050819055503373ffffffffffffffffffffffffffffffffffffffff16600082604051809050600060405180830381858888f19350505050503373ffffffffffffffffffffffffffffffffffffffff167ff279e6a1f5e320cca91135676d9cb6e44ca8a08c0b88342bcdb1144f6511b5688383604051808381526020018281526020019250505060405180910390a25b5050565b60026000505481565b600a81565b60016000505481565b6000600050602052806000526040600020600091509050548156', 
		'gas': 3000000,
	}, function (error, result) {
		if (error)
			_f(error);
		else
			_f(null, Chicken.at(web3.eth.getTransaction(result).creates));
	});
};

import styles from "../style.css";
import React from 'react';
import BigNumber from 'bignumber.js';
import {render} from 'react-dom';
import {HexDump, Balance, InputBalance} from './react-web3.jsx';
import {web3, Chicken} from './chicken.jsx';
import {amount, niceAccount} from './web3-aux.jsx';
import {LogManager} from './logmanager.jsx';
import {Withdraw, Deposit} from './react-chicken.jsx';

var theChicken = Chicken.at("0x6a669ba5cd02d4d59b6d7668d5ab563e443430e4");

function transactionInterceptor(t) {
	if ($('#trace').is(':checked')) {
		showTrace(processTrace(web3.eth.vmTraceCall(t)));
	}
	if ($('#diff').is(':checked')) {
		console.log("stateDiffCall: " + web3.eth.stateDiffCall(t));
	}
}

//TODO: web3.eth._installInceptor(transactionInterceptor);

class InteractionConsole extends React.Component {
	constructor() {
		super();
		this.state = {
			value: new BigNumber("1000000000000000000")
		}
		this.deposit = this.deposit.bind(this);
		this.withdraw = this.withdraw.bind(this);
	}

	deposit () {
		web3.eth.sendTransaction({to: theChicken.address, value: this.transfer, gas: 65000});
	}

	withdraw() {
		theChicken.withdraw(this.state.value, {gas: 100000});
	}

	render () {
		return <div>
			<InputBalance id="transfer" value={this.state.value} onChanged={()=>this.setState({value: v})}/>
			<button id="deposit" onClick={this.deposit}>Deposit</button>
			<button id="withdraw" onClick={this.withdraw}>Withdraw</button>
		</div>;
	}
}

export class ChickenApp extends React.Component {
	render () {
		return <div>
			<div>Contract address: <span id="chickenaddress">Unknown</span><button id="deploy">Deploy</button></div>
			<div>Your address: <span id="youraddress">Unknown</span></div>
			<div>Balance in wallet: <span id="walletbalance">Unknown</span></div>
			<div>Balance in chicken: <span id="chickenbalance">Unknown</span></div>

			<div>Status:
				<span id="status">Unknown</span> 
				(<span id="withdrawn">Unknown</span> remaining from <span id="deposited">Unknown</span> deposited)
			</div>

			<InteractionConsole />

			<label for="tracing">Tracing</label><input type="checkbox" disabled="1" id="tracing" />
			<label for="vmtracing">VM Tracing</label><input type="checkbox" id="vmtracing" />
			<label for="diffing">Diffing</label><input type="checkbox" id="diffing" />
		</div>;
	}
}

function processTrace(trace) {
	var c = trace.code;
	var stack = [];
	var memory = [];
	var storage = {};
	trace.ops = trace.ops.map(function(o) {
		var i = Instructions[c[o.pc]];
		o.pop = stack.splice(-i.args, i.args);
		o.stack = stack.slice();
		if (typeof(o.ex) == "object") {
			o.ex.push.forEach(function(x){ stack.push(x); });
			if (typeof(o.ex.mem) != "undefined") {
				memory = memory.slice();
				memory.spliceArray(o.ex.mem.off, o.ex.mem.data.length, o.ex.mem.data);
			}
			if (typeof(o.ex.store) != "undefined") {
				storage = Object.assign({}, storage);
				storage[o.ex.store.key] = o.ex.store.val;
			}
		}
		o.memory = memory;
		o.storage = storage;
		return o;
	});
	return trace;
}

function showTrace(trace) {
	var myWindow = window.open("", "MsgWindow", "width=600,height=800");
	myWindow.document.write('<div id="content"></div>');
	render(<Trace trace={trace}></Trace>, document.getElementById('content'));
}

function updateState() {
	$('#youraddress').html(niceAccount(web3.eth.defaultAccount));
	render(<Balance value={web3.eth.getBalance(web3.eth.defaultAccount)} />, document.getElementById('walletbalance'));
	if (theChicken) {
		$('#chickenaddress').html(niceAccount(theChicken.address));
		render(<Balance value={theChicken.balance(web3.eth.defaultAccount)} />, document.getElementById('chickenbalance'));
		var d = theChicken.deposits();
		var w = theChicken.withdraws();
		render(<Balance value={d} />, document.getElementById('deposited'));
		render(<Balance value={d - w} />, document.getElementById('withdrawn'));
		$('#status').html((+w < +d) ? (+w < +d / 2) ? "-10%" : "+10%" : "n/a");
	}
}

function init() {
	$('#deploy').click(function() {
		Chicken.deploy(web3.eth.defaultAccount, function(error, contract) {
			console.log("Returned: " + error + "/" + JSON.stringify(contract));
			if (typeof(contract.address) != 'undefined') {
				theChicken = contract;
				updateState();
			}
			else
				console.log("Error deploying: " + error);
		});
	});
	
	updateState();
	
	window.lm = new LogManager(
		[theChicken.Deposit, theChicken.Withdraw],
		{"Withdraw": Withdraw, "Deposit": Deposit},
		document.getElementById('log')
	);

	theChicken.allEvents({fromBlock: 'latest', toBlock: 'pending'}).watch(function(error, logs) { updateState(); });
}

$(document).ready(init);

// for debug console happiness.
window.web3 = web3;
window.amount = amount;
window.Chicken = Chicken;
window.theChicken = theChicken;

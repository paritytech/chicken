import styles from "../style.css";
import React from 'react';
import BigNumber from 'bignumber.js';
import {render} from 'react-dom';
import {web3, installInceptor} from './web3plus.jsx';
import {HexDump, Balance, InputBalance, TokenContractBalance, Account, AccountBalance} from './react-web3.jsx';
import {LogManager} from './logmanager.jsx';
import {Withdraw, Deposit} from './react-chicken.jsx';

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
		web3.eth.sendTransaction({to: this.props.chicken.address, value: this.state.value, gas: 65000});
	}

	withdraw() {
		this.props.chicken.withdraw(this.state.value, {gas: 100000});
	}

	render () {
		return <div>
			<InputBalance id="transfer" value={this.state.value} onChanged={()=>this.setState({value: v})}/>
			<button id="deposit" onClick={this.deposit}>Deposit</button>
			<button id="withdraw" onClick={this.withdraw}>Withdraw</button>
		</div>;
	}
}

class ChickenStatus extends React.Component {
	constructor() {
		super();
		this.state = { deposits: new BigNumber(0), withdraws: new BigNumber(0) };
	}

	updateState() {
		this.setState({
			deposits: this.props.chicken.deposits(),
			withdraws: this.props.chicken.withdraws()
		});
	}

	componentWillMount() {
		this.filter = this.props.chicken.allEvents({fromBlock: 'latest', toBlock: 'pending'});
		this.filter.watch(this.updateState.bind(this));
		// TODO: this should get called anyway.
		this.updateState();
	}

	componentWillUnmount() {
		this.filter.stopWatching();
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.chicken.address !== this.props.chicken.address) {
			this.componentWillUnmount();
			this.componentDidMount();
		}
	}

	render() {	
		var d = this.state.deposits;
		var w = this.state.withdraws;
		var r = d.sub(w);
		return <span>
			<span id="status">{(+w < +d) ? (+w < +d / 2) ? "-10%" : "+10%" : "n/a"}</span> 
			(<Balance value={r} /> remaining from <Balance value={d} /> deposited)
		</span>;
	}
};

export class ChickenApp extends React.Component {
	render() {
		var theChicken = Chicken.at(this.props.address);
		return <div>
			<div id="log"></div>
			<h3>Chicken</h3>
			<div>Contract address: <Account addr={this.props.address} /></div>
			<div>Your address: <Account addr={web3.eth.defaultAccount} /></div>
			<div>Balance in wallet: <AccountBalance address={web3.eth.defaultAccount} /></div>
			<div>Balance in chicken: <TokenContractBalance contract={theChicken} address={web3.eth.defaultAccount} /></div>
			<div>Status: <ChickenStatus chicken={theChicken}/></div>
			<InteractionConsole chicken={theChicken} />
			<label for="trace">Tracing</label><input type="checkbox" id="trace" />
			<label for="vmTrace">VM Tracing</label><input type="checkbox" id="vmTrace" />
			<label for="stateDiff">Diffing</label><input type="checkbox" id="stateDiff" />
		</div>;
	}
}

function init() {
/*	$('#deploy').click(function() {
		Chicken.deploy(web3.eth.defaultAccount, function(error, contract) {
			console.log("Returned: " + error + "/" + JSON.stringify(contract));
			if (typeof(contract.address) != 'undefined') {
				theChicken = contract;
				updateState();
			}
			else
				console.log("Error deploying: " + error);
		});
	});*/
	
	// TODO: reactify properly.
	var theChicken = Chicken.at("0x6a669ba5cd02d4d59b6d7668d5ab563e443430e4");
	window.lm = new LogManager(
		[theChicken.Deposit, theChicken.Withdraw],
		{"Withdraw": Withdraw, "Deposit": Deposit},
		document.getElementById('log')
	);
}

$(document).ready(init);

// for debug console happiness.
window.web3 = web3;
window.Chicken = Chicken;

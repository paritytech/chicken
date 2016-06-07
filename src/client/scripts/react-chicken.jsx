import React from 'react';
import {render} from 'react-dom';
import BigNumber from 'bignumber.js';
import {InputBalance, Balance} from './react-web3.jsx';
import {ConfirmEvent} from './react-events.jsx';

export class Deposit extends React.Component {
	render() {
		return (
			<ConfirmEvent confirmed={this.props.confirmed} cardClass="deposit">
				<div className="card-label">deposit</div>
				<Balance value={this.props.args.amount} />
			</ConfirmEvent>
		);
	}
}

export class Withdraw extends React.Component {
	render() {
		return (
			<ConfirmEvent confirmed={this.props.confirmed} cardClass="withdraw">
				<div className="card-label">withdraw</div>
				<Balance value={this.props.args.amount} /> (returned <Balance value={this.props.args.returned} />)
			</ConfirmEvent>
		);
	}
}

export class InteractionConsole extends React.Component {
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

export class ChickenStatus extends React.Component {
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
			this.componentWillMount();
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
}

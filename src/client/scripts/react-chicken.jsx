import React from 'react';
import {render} from 'react-dom';
import {ConfirmEvent} from './react-events.jsx';
import {Balance} from './react-web3.jsx';

export var Deposit = React.createClass({
	render: function() {
		return (
			<ConfirmEvent confirmed={this.props.confirmed} cardClass="deposit">
				<div className="card-label">deposit</div>
				<Balance value={this.props.args.amount} />
			</ConfirmEvent>
		);
	}
});

export var Withdraw = React.createClass({
	render: function() {
		return (
			<ConfirmEvent confirmed={this.props.confirmed} cardClass="withdraw">
				<div className="card-label">withdraw</div>
				<Balance value={this.props.args.amount} /> (returned <Balance value={this.props.args.returned} />)
			</ConfirmEvent>
		);
	}
});

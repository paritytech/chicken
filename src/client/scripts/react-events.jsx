import React from 'react';
import {render} from 'react-dom';
import {Balance} from './react-web3.jsx';
import TimeAgo from 'react-timeago'

export var ConfirmingEvent = React.createClass({
  render: function() {
    return (
      <div className="confirmingEvent card">
     	<div className="progress"><span style={{paddingLeft: (this.props.confirmations / 12 * 100) + '%'}}></span></div>
      	<div className={'card-body ' + this.props.cardClass}>
	      	<div style={{float: 'right'}}>{this.props.confirmations} confirmations</div>
   	    	{this.props.children}
   	    </div>
      </div>
    );
  }
});

export var PendingEvent = React.createClass({
  render: function() {
    return (
      <div className="pendingEvent card">
      	<div className={'card-body ' + this.props.cardClass}>
	      	<div style={{float: 'right'}}>Pending!</div>
   	    	{this.props.children}
   	    </div>
      </div>
    );
  }
});

export var ConfirmedEvent = React.createClass({
  render: function() {
    return (
      <div className="confirmedEvent card-part">
      	<div className={'card-body ' + this.props.cardClass}>
	      	<div className="card-datestamp"><TimeAgo date={this.props.timestamp} /></div>
   	    	{this.props.children}
   	    </div>
      </div>
    );
  }
});

export var ConfirmEvent = React.createClass({
	render: function() {
		if (this.props.confirmed > 1000)
			return (<ConfirmedEvent timestamp={this.props.confirmed} cardClass={this.props.cardClass}>{this.props.children}</ConfirmedEvent>);
		else if (typeof this.props.confirmed == "number")
			return (<ConfirmingEvent confirmations={this.props.confirmed} cardClass={this.props.cardClass}>{this.props.children}</ConfirmingEvent>);
		else
			return (<PendingEvent cardClass={this.props.cardClass}>{this.props.children}</PendingEvent>);
	}
});

export var Log = React.createClass({
	render: function() {
		var f = this.props.factory;
		var rows = [];
		this.props.logs.forEach(function(l) {
			rows.push(React.createElement(f[l.event], {key: l.key, confirmed: l.confirmed, args: l.args}));
		});
		return (<div>{rows}</div>);
	}
});

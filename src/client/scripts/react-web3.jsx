import BigNumber from 'bignumber.js';
import React from 'react';
import {render} from 'react-dom';
import 'jquery';

function paddedHex(i, l) {
	return ("0".repeat(l) + i.toString(16)).substr(-l);
}

export class HexDump extends React.Component {
	render () {
		var bytesPerLine = 16;
		var hex = this.props.data;
		var text = "";
		for (var i = 0; i < hex.length; i += bytesPerLine) {
			text += paddedHex(i, 4) + "  ";
			for (var j = i; j < i + bytesPerLine; ++j)
				if (j < hex.length)
					text += paddedHex(hex[j], 2) + " ";
				else
					text += "  ";
			text += "  ";
			for (var j = i; j < i + bytesPerLine; ++j)
				if (j < hex.length && hex[j] >= 32 && hex[j] < 128)
					text += String.fromCharCode(hex[j]);
				else
					text += " ";
			text += "\n";
		}
		return (<pre style={{display: this.props.visible ? 'block' : 'none'}}>{text}</pre>);
	}
}
HexDump.propTypes = { visible: React.PropTypes.bool, data: React.PropTypes.array };
HexDump.defaultProps = { visible: true };

export class Trace extends React.Component {
	render () {
		var code = this.props.trace.code;
		var rows = this.props.trace.ops.map(function(l) {
			var info = Instructions[code[l.pc]];
			var name = (typeof(info) == "object") ? info.name : "!?";
			return (<div style={{whiteSpace: "nowrap"}}>
				<span style={{fontSize: "x-small", fontFamily: "monospace"}}>{paddedHex(l.pc, 4)}</span>&nbsp;
				<span style={{fontWeight: "bold", fontFamily: "monospace", display: "inline-block", width: "8em"}}>{name}</span>&nbsp;
				<span style={{color: "green", fontSize: "small", fontFamily: "monospace"}}>{l.ex !== null ? l.ex.push.slice().reverse().join(' ') : ''}</span>&nbsp;
				<span style={{color: "red", fontSize: "small", fontFamily: "monospace"}}>{l.pop.slice().reverse().join(' ')}</span>&nbsp;
				<span style={{color: "#ccc", fontSize: "x-small", fontFamily: "monospace"}}>{l.stack.slice().reverse().join(' ')}</span>&nbsp;
				<HexDump visible={l.ex && l.ex.mem} data={l.memory} />
				<div style={{display: l.ex && l.ex.store ? 'block' : 'none'}}>
					{JSON.stringify(l.storage)}
				</div>
			</div>);
		});
		return (<div>{rows}</div>);
	}
}
Trace.propTypes = { trace: React.PropTypes.object };

var denominations = [ "wei", "Kwei", "Mwei", "Gwei", "szabo", "finney", "ether", "grand", "Mether", "Gether", "Tether", "Pether", "Eether", "Zether", "Yether", "Nether", "Dether", "Vether", "Uether" ];

function splitValue(a) {
	var i = 0;
	var a = new BigNumber('' + a);
	if (a.gte(new BigNumber("10000000000000000")) && a.lt(new BigNumber("100000000000000000000000")) || a.eq(0))
		i = 6;
	else
		for (var aa = a; aa.gte(1000) && i < denominations.length - 1; aa = aa.div(1000))
			i++;

	for (var j = 0; j < i; ++j)
		a = a.div(1000);

	return {base: a, denom: i};
}

export class Balance extends React.Component {
	render () {
		var s = splitValue(this.props.value);
		var a = ('' + s.base.mul(1000).round().div(1000)).replace(/(\d)(?=(\d{3})+$)/g, "$1,");
		return (
			<span className={'_balance _' + denominations[s.denom]}>
				{a}
				<span className="_denom">
					{denominations[s.denom]}
				</span>
			</span>
		);
	}
} 
//Balance.propTypes = { value: React.PropTypes.object };

export class InputBalance extends React.Component {
	render () {
		var s = splitValue(this.props.value);
		return <span>
			<input classNames="balance" ref={(ref) => this.theBalance = ref} style={{width: '5ex'}} value={'' + s.base} onChange={this.handleChange.bind(this)} />
			<select classNames="denominations" ref={(ref) => this.theDenominations = ref} onChange={this.handleChange.bind(this)} value={s.denom}>
				{denominations.map(function(d, i) { return <option value={i} key={i}>{d}</option>; })}
			</select>
		</span>;
	}

	handleChange () {
		var v = this.theBalance.value;
		if (v == '')
			v = new BigNumber(0);
		else
			v = (new BigNumber(v)).mul((new BigNumber(10)).toPower((+this.theDenominations.value) * 3));

		this.props.onChanged(v);
	}
}

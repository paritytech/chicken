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

function initDenominations () {
	var items = denominations.map(function(d, i) { return '<option value="' + i + '">' + d + '</option>'; });
	$('.denominations').append(items.join(''));
	$('.denominations').val("6");
}

$(document).ready(function() {
	initDenominations();
});

export class Balance extends React.Component {
	render () {
		var a = this.props.value;
		var i = 0;
		if (a >= 10000000000000000 && a < 100000000000000000000000 || a == 0)
			i = 6;
		else
			for (var aa = a; aa >= 1000 && i < denominations.length - 1; aa /= 1000)
				i++;

		for (var j = 0; j < i; ++j)
			a /= 1000;
		var a = Math.round(a * 1000) / 1000;
		a = (a + '').replace(/(\d)(?=(\d{3})+$)/g, "$1,");

		return (
			<span className={'_balance _' + denominations[i]}>
				{a}
				<span className="_denom">
					{denominations[i]}
				</span>
			</span>
		);
	}
}
Balance.propTypes = { value: React.PropTypes.object };
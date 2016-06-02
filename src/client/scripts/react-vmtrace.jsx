import 'jquery';
import Instructions from './instructions.jsx';
import BigNumber from 'bignumber.js';
import React from 'react';
import {render} from 'react-dom';
import {HexDump, Balance} from './react-web3.jsx';

export class VMTrace extends React.Component {
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
VMTrace.propTypes = { trace: React.PropTypes.object };

Array.prototype.spliceArray = function(index, n, array) {
	return Array.prototype.splice.apply(this, [index, n].concat(array));
}

export function processVMTrace(trace) {
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

export function showVMTrace(trace) {
	var myWindow = window.open("", "MsgWindow", "width=600,height=800");
	myWindow.document.write('<div id="content"></div>');
	render(<VMTrace trace={trace} />, document.getElementById('content'));
}

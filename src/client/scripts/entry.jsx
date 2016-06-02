import 'jquery';
import React from 'react';
import {render} from 'react-dom';
import {web3} from './web3plus.jsx';
import {processVMTrace, showVMTrace} from './react-vmtrace.jsx';
import {ChickenApp} from './app.jsx'

web3.eth.installInterceptor(t => {
	console.log("sendTransaction(" + JSON.stringify(t) + ")");

	var out = web3.eth.traceCall(t, ["trace", "vmTrace", "stateDiff"]);

	if ($('#vmTrace').is(':checked')) {
		showVMTrace(processVMTrace(out.vmTrace));
	}
	if ($('#stateDiff').is(':checked')) {
		console.log("stateDiff: " + JSON.stringify(out.stateDiff));
	}
	if ($('#trace').is(':checked')) {
		console.log("trace: " + JSON.stringify(out.trace));
	}
});

render(<ChickenApp address="0x6a669ba5cd02d4d59b6d7668d5ab563e443430e4"/>, document.getElementById('app'));

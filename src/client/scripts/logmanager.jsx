import React from 'react';
import {render} from 'react-dom';
import {Log} from './react-events.jsx';
import {web3} from './chicken.jsx';

export var LogManager = function(events, factory, target) {
	this.log = [];
	this.recentLogCount = 0;
	this.deferredUpdate = null;
	this.target = target;
	this.factory = factory;

	var t = this;
	events.forEach(function(e){
		e({who: web3.eth.defaultAccount}, {fromBlock: '0', toBlock: 'pending'}).watch(function(error, l) { t.pushLog(l); });
	});
	web3.eth.filter("latest").watch(function(error, latestHash) { t.onNewBlock(latestHash); })
};

LogManager.prototype.pushLog = function(e) {
//	console.log("New log: " + JSON.stringify(e));
	e.order = (e.blockNumber || 1000000000) * 1000 + (e.transactionIndex || 0);
	var updated = false;
	for (var i = 0; i < this.log.length; ++i)
		if (this.log[i].transactionHash == e.transactionHash) {
			this.log[i] = e;
			updated = true;
		}
	if (!updated)
		this.log.push(e);
	this.log.sort(function (a, b) { return a.order - b.order; });
	this.noteLogChanged();
}

LogManager.prototype.noteLogChanged = function() {
	if (this.deferredUpdate !== null)
		clearTimeout(this.deferredUpdate);
	var t = this;
	this.deferredUpdate = setTimeout(function(){ t.updateLog() }, 400);	
}

LogManager.prototype.updateLog = function() {
	var current = web3.eth.blockNumber;
	this.recentLogCount = 0;
	var prep = [];
	for (var i = this.log.length - 1; i >= 0; --i) {
		var e = this.log[i];
		var item;
		var status = '';
		var confirmed;
		if (e.type == "pending") {
			this.recentLogCount++;
			confirmed = null;
		} else if (e.type == "mined" && current < e.blockNumber + 12) {
			this.recentLogCount++;
			confirmed = current - e.blockNumber + 1;
		} else if (e.type == "mined") {
			confirmed = new Date(web3.eth.getBlock(e.blockNumber).timestamp * 1000);
		}
		prep.push({event: e.event, key: e.transactionHash, 'confirmed': confirmed, args: e.args});
	}

	render(<Log logs={prep} factory={this.factory}></Log>, this.target);
}

LogManager.prototype.onNewBlock = function(h) {
	if (this.recentLogCount > 0)
		this.updateLog();
}

'use strict';
var request = require('request');
var BASE_URL='https://test.instamojo.com/api/1.1/';
var ENDPOINTS = {	
	'CREATE': 'payment-requests/',
	'PAYMENT_STATUS': 'payment-requests/',
	'LINKS': 'links/',
	'REFUNDS': 'refunds/'
};

module.exports = {
	HEADERS: {
		'X-Api-Key': '',
		'X-Auth-Token': ''
	},
	setHeaders: function(apiKey, apiAuthToken) {
		this.HEADERS['X-Api-Key'] = apiKey;
		this.HEADERS['X-Auth-Token'] = apiAuthToken;
	},
	caller: function(url, method, callback,data) {
		request({
			method: method,
			url: url,
			headers: this.HEADERS,
			form:data
		}, function(error, result, body) {
			if (!error && result.statusCode === 200)
				body = JSON.parse(body);
			callback(error, result, body);
		})
	},
	verifyMac:function(data,salt,callback){
		var mac=data.mac;
		var str="";
		delete data.mac;
		var keys=Object.keys(data).sort();
		keys.forEach(function(key){
			str=str+obj[key]+'|';
		})
		var hashString=str.substr(0,str.length-1)
		var hash = crypto.createHmac('sha1', salt).update(hashString).digest('hex')
		return callback(mac===hash);
	},
	createRequest: function(data, callback) {
		var url= BASE_URL + ENDPOINTS.CREATE;
		this.caller(url,'POST',callback,data);
	},
	getRequestDetails: function(requestId, callback) {
		var url= BASE_URL + ENDPOINTS.PAYMENT_STATUS + requestId + '/';
		this.caller(url,'GET',callback);
	},
	getPaymentDetails: function(requestId, paymentId, callback) {
		var url= BASE_URL + ENDPOINTS.PAYMENT_STATUS + requestId + '/' + paymentId + '/';
		this.caller(url,'GET',callback);		
	},
	getAllPaymentRequests: function(callback) {
		var url= BASE_URL + ENDPOINTS.PAYMENT_STATUS;
		this.caller(url,'GET',callback);		
	},
	createRefund: function(refundData, callback) {
		var url= BASE_URL + ENDPOINTS.REFUNDS;
		this.caller(url,'POST',callback,refundData);
	},
	getAllRefunds: function(callback) {
		var url= BASE_URL + ENDPOINTS.REFUNDS;
		this.caller(url,'GET',callback);
	},
	getRefundDetails: function(refundId, callback) {
		var url= BASE_URL + ENDPOINTS.REFUNDS + refundId + '/'
		this.caller(url,'GET',callback);
	},
	refundFields: function() {		
		return ({
			'payment_id': '',
			'type': '',
			'body': '',
			'refund_amount':''					
		});
	},
	paymentFields: function() {
		return ({
			'purpose': '',
			'amount': '',
			'currency': 'INR',
			'buyer_name': '',
			'email': '',
			'phone': '',
			'send_email': '',
			'send_sms': '',
			'allow_repeated_payments': '',
			'webhook': '',
			'redirect_url': '',
		})
	}
}

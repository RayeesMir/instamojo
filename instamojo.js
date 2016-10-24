'use strict';
var request = require('request');
var crypto=require('crypto');

function Instamojo(env, key, token, salt) {
    var self = this;
    this._getBaseUrl = function (env) {
        if (!env)
            env = "dev";
        if (env == "dev")
            return "https://test.instamojo.com/api/1.1/";
        else
            return "https://www.instamojo.com/api/1.1/";
    };
    this.endPoints = {
        baseUrl: self._getBaseUrl(env),
        create: 'payment-requests/',
        paymentStatus: 'payment-requests/',
        links: 'links/',
        refund: 'refunds/'
    };
    this.salt = salt;
    this.header = {
        'X-Api-Key': key,
        'X-Auth-Token': token
    };

    this.paymentFields = {
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
    };
    this.refundFields = {
        'payment_id': '',
        'type': '',
        'body': '',
        'refund_amount': ''
    };
}
module.exports = {	
	
	caller: function(url, method, callback,data) {
		var self = this;
		return new Promise(function (resolve, reject) {
		    request({
			method: method,
			url: url,
			headers: self.header,
			form: data
		    }, function (error, result, body) {
			if (error) {
			    if (typeof callback === "function")
				callback(error);
			    reject(error);
			}
			if (result.statusCode === 200 || result.statusCode === 201) {
			    body = JSON.parse(body);
			    if (typeof callback === "function")
				callback(null, result, body);
			    resolve([result, body])
			}
		    })
		});
	},
	verifyMac:function(data,salt,callback){
		var self = this;
		return new Promise(function (resolve, reject) {
		    var mac = data.mac;
		    var str = "";
		    delete data.mac;
		    var keys = Object.keys(data).sort();
		    keys.forEach(function (key) {
			str = str + obj[key] + '|';
		    });
		    var hashString = str.substr(0, str.length - 1);
		    var hash = crypto.createHmac('sha1', self.salt).update(hashString).digest('hex');
		    if (hash)
			resolve(mac === hash);
		    else {
			var err = new Error("Invalid Mac");
			err.code = 400;
			reject(err);
		    }
		})
	},
	createRequest: function(data, callback) {
		var url= BASE_URL + ENDPOINTS.CREATE;
		return this.caller(url,'POST',callback,data);
	},
	getRequestDetails: function(requestId, callback) {
		var url= BASE_URL + ENDPOINTS.PAYMENT_STATUS + requestId + '/';
		return this.caller(url,'GET',callback);
	},
	getPaymentDetails: function(requestId, paymentId, callback) {
		var url= BASE_URL + ENDPOINTS.PAYMENT_STATUS + requestId + '/' + paymentId + '/';
		return this.caller(url,'GET',callback);		
	},
	getAllPaymentRequests: function(callback) {
		var url= BASE_URL + ENDPOINTS.PAYMENT_STATUS;
		return this.caller(url,'GET',callback);		
	},
	createRefund: function(refundData, callback) {
		var url= BASE_URL + ENDPOINTS.REFUNDS;
		return this.caller(url,'POST',callback,refundData);
	},
	getAllRefunds: function(callback) {
		var url= BASE_URL + ENDPOINTS.REFUNDS;
		this.caller(url,'GET',callback);
	},
	getRefundDetails: function(refundId, callback) {
		var url= BASE_URL + ENDPOINTS.REFUNDS + refundId + '/'
		return this.caller(url,'GET',callback);
	},
	refundFields: function() {		
		return this.refundFields;
	},
	paymentFields: function() {
		return this.paymentFields;
	},
	setWebHook: function (url) {
        	this.paymentFields.webhook = url;
	},
	setRedirectionUrl: function (url) {
		this.paymentFields.redirect_url = url;
	}
}

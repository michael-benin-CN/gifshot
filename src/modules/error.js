define([
	'utils'
], function(utils) {
	var error = {
		'validate': function() {
			var errorObj = {};
			utils.each(error.validators, function(indece, currentValidator) {
				if(!currentValidator.condition) {
					errorObj = currentValidator;
					errorObj.error = true;
					return false;
				}
			});
			delete errorObj.condition;
			return errorObj;
		},
		'isValid': function() {
			var errorObj = error.validate(),
				isValid = errorObj.error !== true ? true : false;

			return isValid;
		},
	    'validators': [{
	    	'condition': utils.isFunction(utils.getUserMedia),
	        'errorCode': 'getUserMedia',
	        'errorMsg': 'The getUserMedia API is not supported in your browser'
	    }, {
	    	'condition': utils.isSupported.canvas(),
	        'errorCode': 'canvas',
	        'errorMsg': 'Canvas elements are not supported in your browser',
	    }, {
	        'condition': utils.isSupported.webworkers(),
	        'errorCode': 'webworkers',
	        'errorMsg': 'The Web Workers API is not supported in your browser'
	    }, {
	        'condition': utils.isFunction(utils.URL),
	        'errorCode': 'window.URL',
	        'errorMsg': 'The window.URL API is not supported in your browser'
	    }, {
	        'condition': utils.isSupported.blob(),
	        'errorCode': 'window.Blob',
	        'errorMsg': 'The window.Blob File API is not supported in your browser'
	    }, {
	        'condition': utils.isFunction(window.btoa),
	        'errorCode': 'window.btoa',
	        'errorMsg': 'The window.btoa base-64 encoding method is not supported in your browser'
	    }, {
	        'condition': utils.isFunction(Uint8Array),
	        'errorCode': 'window.Uint8Array',
	        'errorMsg': 'The window.Uint8Array function constructor is not supported in your browser'
	    }, {
	        'condition': utils.isFunction(Uint32Array),
	        'errorCode': 'window.Uint32Array',
	        'errorMsg': 'The window.Uint32Array function constructor is not supported in your browser'
	    }]
	};
	return error;
});
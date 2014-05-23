define([
	'utils'
], function(utils) {
	var error = {
		'validate': function(skipObj) {
			skipObj = utils.isObject(skipObj) ? skipObj : {};
			var errorObj = {};
			utils.each(error.validators, function(indece, currentValidator) {
				var errorCode = currentValidator.errorCode;
				if(!skipObj[errorCode] && !currentValidator.condition) {
					errorObj = currentValidator;
					errorObj.error = true;
					return false;
				}
			});
			delete errorObj.condition;
			return errorObj;
		},
		'isValid': function(skipObj) {
			var errorObj = error.validate(skipObj),
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
	    }]
	};
	return error;
});
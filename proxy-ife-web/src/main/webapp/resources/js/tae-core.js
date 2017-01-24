/**
 * TEXT ADAPTATION AND SIMPLIFICATION SERVICE
 */
var taeEngine = new function() {
	var endpoint = "/ife/api/proxy";
	/**
	 * INIT THE ENGINE CONFIG. PARAMETERS:
	 * - endpoint: URL OF THE TAE API
	 */
	this.init = function(config) {
		config = config || {};
		if (config.endpoint) {
			endpoint = config.endpoint;
		}
	}
	/**
	 * RETRIEVE DEFINITIONS-ANNOTATED TEXT GIVEN NORMAL TEXT
	 */
	this.getDefinitions = function(source, callback, errorCallback) {
	  //var value = document.getElementById(source).innerText;
		var value = source.replace(/[\t\r\n]/g, '');
		var url = endpoint + "/textenrich?lex=0&text=" + value;
	  //$.getJSON('http://hlt-services7.fbk.eu:8011/simp?text=['+value+']')
		$.getJSON(url)
		  .done(function(json) {
		    //console.log(JSON.stringify(baconGoodness));
		    var index = 0;
		    var annotatedText = "";
		    for (itemName in json.readability.forms) {
		    	item = json.readability.forms[itemName];
		    	annotatedText = annotatedText + value.substring(index, item.start-1);
		    	var originalText = value.substring(item.start, item.end);
		      annotatedText = annotatedText + 
		      ' <a class="simpatico-label" title="' + item.description.description + 
		      '">' + originalText +'</a> ';
		      index = item.end;
		    }
		    annotatedText = annotatedText + value.substring(index, value.length);
		    //console.log('annotatedText ' + annotatedText);
		    callback(annotatedText);
		  })
		  .fail(function( jqxhr, textStatus, error) {
		  	console.log(textStatus + ", " + error);
		  	errorCallback("Errore nella comunicazione col server");
		  });
	};
	
	/**
	 * RETRIEVE SIMPLIFICATION-ANNOTATED TEXT GIVEN NORMAL TEXT
	 */
	this.getExplanations = function(source, callback, errorCallback) {
	  //var value = document.getElementById(source).innerText;
		var value = source.replace(/[\t\r\n]/g, '');
		var url = endpoint + "/textenrich?lex=1&text=" + value;
	  //$.getJSON('http://hlt-services7.fbk.eu:8011/simp?text=['+value+']')
		$.getJSON(url)
		  .done(function(json) {
		    //console.log(JSON.stringify(baconGoodness));
		    var index = 0;
		    var annotatedText = "";
		    if(json.simplifications) {
		    	//console.log(JSON.stringify(json.simplifications));
			    for (item in json.simplifications) {
			    	var originalText = value.substring(json.simplifications[item].start, json.simplifications[item].end);
		        annotatedText = annotatedText + value.substring(index, json.simplifications[item].start-1);
		        annotatedText = annotatedText + ' <a class="simpatico-label" title="' + json.simplifications[item].simplification + 
		        '">' + originalText +'</a> '
		        index = json.simplifications[item].end;
			    }
			    annotatedText = annotatedText + value.substring(index, value.length);
			    callback(annotatedText);
		    } else {
		    	callback(source);
		    } 
		  })
		  .fail(function( jqxhr, textStatus, error) {
		  	console.log(textStatus + ", " + error);
		  	errorCallback("Errore nella comunicazione col server");
		  });
	};
	
	/**
	 * RETRIEVE WIKIPEDIA TEXT GIVEN NORMAL TEXT
	 */
	this.wikipedia = function(source, callback, errorCallback) {
		var value = source.replace(/[\t\r\n]/g, '');
		var url = endpoint + "/textenrich?lex=1&text=" + value;
		$.getJSON(url)
		  .done(function(json) {
		    var index = 0;
		    var annotatedText = "";
		    json.linkings.sort(compareLinkItem);
		    var actualOffset = -1;
		    var actualLinkItem = null;
		    for (itemName in json.linkings) {
		    	var item = json.linkings[itemName];
		    	if(actualOffset == -1) {
		    		actualOffset = item.offset;
		    	}
		    	if(item.offset > actualOffset) {
			    	annotatedText = annotatedText + value.substring(index, actualLinkItem.offset-1);
			    	var originalText = value.substring(actualLinkItem.offset, actualLinkItem.offset + actualLinkItem.length);
			      annotatedText = annotatedText + 
			      ' <a class="simpatico-label" target="_blank" href="' + actualLinkItem.page + 
			      '">' + originalText +'</a> ';
			      index = actualLinkItem.offset + actualLinkItem.length;
			      actualLinkItem = item;
			      actualOffset = item.offset;
		    	} else {
		    		actualLinkItem = item;
		    	}
		    }
		    if(actualLinkItem != null) {
		    	annotatedText = annotatedText + value.substring(index, actualLinkItem.offset-1);
		    	var originalText = value.substring(actualLinkItem.offset, actualLinkItem.offset + actualLinkItem.length);
		      annotatedText = annotatedText + 
		      ' <a class="simpatico-label" target="_blank" href="' + actualLinkItem.page + 
		      '">' + originalText +'</a> ';
		      index = actualLinkItem.offset + actualLinkItem.length;
		    }
		    annotatedText = annotatedText + value.substring(index, value.length);
		    //console.log('annotatedText ' + annotatedText);
		    callback(annotatedText);
		  })
		  .fail(function( jqxhr, textStatus, error) {
		  	console.log(textStatus + ", " + error);
		  	errorCallback("Errore nella comunicazione col server");
		  });
	};
	
	/**
	 * RETRIEVE SIMPLIFIED LITERAL TEXT GIVEN NORMAL TEXT
	 */
	this.getSimplifiedText = function(source, callback, errorCallback) {
		// TODO: this is completely fake implementation
		callback('bla-bla-bla');
	}

	
	function compareLinkItem(a, b) {
		if(a.offset < b.offset) {
			return -1;
		} else if(a.offset > b.offset) {
			return 1;
		} else {
			if(a.score < b.score) {
				return -1;
			}
			if(a.score > b.score) {
				return 1;
			}
			return 0;
		}
	}
}
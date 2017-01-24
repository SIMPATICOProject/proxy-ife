/**
 * CITIZENPEDIA SERVICE
 */
var cpdEngine = new function() {
	var endpoint = "https://simpatico.morelab.deusto.es/";
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
	 * RETRIEVE QUESTIONS FOR THE SPECIFIED TAG (URI)
	 */
	this.getQuestions = function(uri, callback, errorCallback) {
		// TODO replace with the real implementation
		var response = {
			"questions" : {
			  "question1": {"url": "http://asgard.deusto.es:52180/questions/show/583d8bd5ecd2ea20143a751e", "title": "¿Puedo desgravar los impuestos de una beca de doctorado? (No answer)"},
			  "question2": {"url": "http://asgard.deusto.es:52180/questions/show/5825e07574b1ec17ecaf0a8e", "title": "Quiero participar (1 answer)"},
			  "question3": {"url": "http://asgard.deusto.es:52180/questions/show/5825dd6874b1ec17ecaf0a81", "title": "¿A qué procesos selectivos me puedo presentar? (1 answer)"},
			}
		};
		callback(response.questions);
//		jQuery.getJSON(endpoint+'interactiveFrontend/questions.json',
//	      function(jsonResponse)
//	      {
//			callback(jsonResponse.questions)
//	      });
	};

}
/**
 * CITIZENPEDIA UI OPERATIONS
 */
var cpdUI = new function() {
	
	this.colors = {
		cpd: '#000'
	}
	var labels = {
			questionsLabel: 'Related questions: ',
			newQuestionLabel: 'Add new question'
	};
	var endpoint = null;
	
	/**
	 * INITIALIZE UI COMPONENT.
	 * CONFIG PARAMETERS:
	 * - endpoint: URL OF THE TAE API ENDPOINT 
	 * - cpdColor: COLOR TO HIGHLITE THE QUESTION SECTION
	 * - newQuestionLabel: TEXT FOR NEW QUESTION LINK
	 * - questionsLabel: TEXT FOR SECTION TITLE
	 */
	this.init = function(config) {
		config = config || {};
		if (config.endpoint) {
			cpdEngine.init({endpoint: config.endpoint});
			endpoint = config.endpoint;
		}
		this.colors.cpd = config.cpdColor || this.colors.cpd;
		labels.questionsLabel = config.questionsLabel || labels.questionsLabel; 
		labels.newQuestionLabel = config.newQuestionLabel || labels.newQuestionLabel; 
	}
			
	/**
	 * FIND AND UPDATE THE TEXT ELEMENTS FOR CITIZENPEDIA LINKS
	 * ALL THE ELEMENTS WITH THE ATTRIBUTE data-simpatico-cpd-element
	 * WILL BE HIGHLIGHTED
	 */
	this.activateCitizenpedia = function() {
		$("[data-simpatico-cpd-element]").each(function(i){
			var node = $(this);
			if (!node.attr('id')) node.attr('id','cpd_'+i);
	        node.css('borderLeft', "thick solid " + cpdUI.colors.cpd);
	        node.css('position','relative');
	        node.on("click", function(){
	        	showQuestions(node.attr('id'));
	        });
		});
	}
	/**
	 * FIND AND UPDATE THE TEXT ELEMENTS FOR SIMPLIFICATION
	 */
	this.deactivateCitizenpedia = function() {
		$('.simpatico-cpd-questions').remove();
		$('[data-simpatico-cpd-element]').each(function(i){
			var p = $(this);
	        p.css('borderLeft', "0");
	        p.unbind("click");
		});
	}
	
	function showQuestions(id) {
		var newId = 'cpd_'+id+'_questions';
		var node = $('#'+id);
		var questionsNode = $('#'+newId);
		if (questionsNode.length > 0) return;
		
		cpdEngine.getQuestions(node.attr('data-simpatico-cpd-element'), function(questions){
			if (questions) {
				node.append('<div><ul id="'+newId+'" class="simpatico-cpd-questions">'+
							'<span>'+labels.questionsLabel+'</span></ul></div>');
				var questionsNode = $('#'+newId);
				for (var k in questions) {
					var q = questions[k];
					questionsNode.append('<li><a href="'+q.url+'" target="_blank">'+q.title+'</a></li>');
				}
				questionsNode.append('<li class="new-question"><a href="'+endpoint+'/questions/create" target="_blank">'+labels.newQuestionLabel+'</a></li>');
				questionsNode.css('borderTop', 'thick solid ' + cpdUI.colors.cpd);
				questionsNode.css('borderLeft', "thick solid " + cpdUI.colors.cpd);

			}
		});
	}
	
	function getSelectedText(){
		var text = "";
	  if (window.getSelection()) {
	      text = window.getSelection().toString();
	  } else if (document.selection && document.selection.type != "Control") {
	      text = document.selection.createRange().text;
	  }
	  return text;
	};	
};



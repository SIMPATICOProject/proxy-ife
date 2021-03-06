var selectedText = null;

$( function() {
	$(document).tooltip();
	
	var dialog_simplify = $("#dialog-simplify").dialog({
		autoOpen: false,
	  modal: true,
	  resizable: true,
    height: "auto",
    width: 600,	  
	  buttons: {
	  	close: function() {
	  		$(this).dialog( "close" );
	    }
	  }
	});
	
	$("#tabs").tabs({
		beforeActivate: function( event, ui ) {
			if(ui.newPanel["0"].id == "tab-definizioni") {
				if(selectedText != "") {
					ui.newPanel["0"].innerHTML = '<p>Loading...</p>';
					definizioni(selectedText, ui.newPanel["0"].id);
				} else {
					ui.newPanel["0"].innerHTML = '<p>Nessun testo selezionato</p>';
				}
			} if(ui.newPanel["0"].id == "tab-semplificazione") {
				if(selectedText != "") {
					ui.newPanel["0"].innerHTML = '<p>Loading...</p>';
					semplificazione(selectedText, ui.newPanel["0"].id);
				} else {
					ui.newPanel["0"].innerHTML = '<p>Nessun testo selezionato</p>';
				}
			} else if(ui.newPanel["0"].id == "tab-wikipedia") {
				if(selectedText != "") {
					ui.newPanel["0"].innerHTML = '<p>Loading...</p>';
					wikipedia(selectedText, ui.newPanel["0"].id);
				} else {
					ui.newPanel["0"].innerHTML = '<p>Nessun testo selezionato</p>';
				}
			}
		},
		load:function( event, ui ) { 
  		/* After page load*/  
  	}		
	});
	
	$("#open-dialog").on("click", function() {
		$("#tabs").tabs( "option", "active", 0);
		$("#tabs").tabs("option", "disabled", [] );
		selectedText = getSelectedText().trim();
		/*var splitArray = selectedText.split(" ");
		if(splitArray.length > 1) {
			$("#tabs").tabs("option", "disabled", [3] );
		}*/
		dialog_simplify.dialog("open");
	});
	
	var initUserData = function() {
		var data = JSON.parse(localStorage.userData || 'null');
		if (!!data) {
			$("#userdata").show();
			$("#access").hide();
			$("#userdata").text(data.name + ' '+ data.surname);
		} else {
			$("#access").show();
			$("#userdata").hide();
		}
	}
	initUserData();
	
	$("#access").on("click", function() {
    	var aacBase = 'https://tn.smartcommunitylab.it/aac';
		var base = window.location.href;
    	var arr = base.split("/");
    	var redirect = arr[0]+'//'+arr[2]+'/ife/callback';
    	var authority = 'google';
//    	var authority = 'adc';

		var url = aacBase + '/eauth/authorize/'+authority+'?response_type=code&'
		+ 'redirect_uri='+redirect+'&client_id=8ab03990-d5dd-47ea-8fc6-c92a3b0c04a4';
        var win = window.open(url, 'AuthPopup', 'width=1024,height=768,resizable=true,scrollbars=true,status=true');
        window.addEventListener('message', function (event) {
        	$.ajax({
                url: '/ife/userapi/profile',
                type: 'GET',
                dataType: 'json',
                success: function(data) {
                	localStorage.userData = JSON.stringify(data);
        			initUserData();
                },
                error: function(err) { 
                	console.log(err);
                },
                beforeSend: function(xhr) {
                    xhr.setRequestHeader('Authorization', 'Bearer ' + event.data.access_token);
                }
              });
        	localStorage.aacTokenData = JSON.stringify(event.data);
            
        }, false);

	});
});

function getSelectedText(){
	var text = "";
  if (window.getSelection()) {
      text = window.getSelection().toString();
  } else if (document.selection && document.selection.type != "Control") {
      text = document.selection.createRange().text;
  }
  return text;
};

var annotatedText = [];


function definizioni(source, target) {
  //var value = document.getElementById(source).innerText;
	var value = source.replace(/[\t\r\n]/g, '');
	var url = "/ife/api/proxy/textenrich?lex=0&text=" + value;
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
	    document.getElementById(target).innerHTML = '<p>' + annotatedText + '</p>';
	  })
	  .fail(function( jqxhr, textStatus, error) {
	  	console.log(textStatus + ", " + error);
	  	document.getElementById(target).innerHTML = '<p>Errore nella comunicazione col server</p>';
	  });
}

function semplificazione(source, target) {
  //var value = document.getElementById(source).innerText;
	var value = source.replace(/[\t\r\n]/g, '');
	var url = "/ife/api/proxy/textenrich?lex=1&text=" + value;
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
		    document.getElementById(target).innerHTML = '<p>' + annotatedText + '</p>';
	    } else {
	    	document.getElementById(target).innerHTML = '<p>' + source + '</p>';
	    } 
	  })
	  .fail(function( jqxhr, textStatus, error) {
	  	console.log(textStatus + ", " + error);
	  	document.getElementById(target).innerHTML = '<p>Errore nella comunicazione col server</p>';
	  });
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

function wikipedia(source, target) {
	var value = source.replace(/[\t\r\n]/g, '');
	var url = "/ife/api/proxy/textenrich?lex=1&text=" + value;
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
	    document.getElementById(target).innerHTML = '<p>' + annotatedText + '</p>';
	  })
	  .fail(function( jqxhr, textStatus, error) {
	  	console.log(textStatus + ", " + error);
	  	document.getElementById(target).innerHTML = '<p>Errore nella comunicazione col server</p>';
	  });
}

function annotate(name)
{
  console.log("Annotate "+name);

  if (annotatedText[name] == undefined) { annotatedText[name] = "Add note"};
    
  jQuery.getJSON('http://hlt-services7.fbk.eu:8011/simp?text=['+value+']',
    function(baconGoodness)
    {
      console.log(JSON.stringify(baconGoodness));
      
    }
  );

  document.getElementById(name).innerHTML = document.getElementById(name).innerHTML +
  '<span id="annotateGroup'+name+'"><textarea id="annotate" rows="4" cols="50">'+annotatedText[name]+'</textarea><input type="button" value="Send" id="sendAnnotate" onclick="sendAnnotate(\''+name+'\');"></span>';
  document.getElementById("annotateSwitch").value="annotateOff";
}

function citizenpedia(name)
{
  console.log("Citizenpedia "+name);
  window.location.href = 'http://192.168.33.10:9000/questions/create';
}

function sendAnnotate(name)
{
  console.log("Send Annotate "+name);
  annotatedText[name] = document.getElementById("annotate").value;

  document.getElementById("annotateGroup"+name).style.display = "none";

}




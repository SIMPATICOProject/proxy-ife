$( function() {
	// INIT WAE ENGINE CONFIG
	waeUI.init({
		endpoint: '',
		prevButtonLabel: 'Precedente',
		nextButtonLabel: 'Successivo',
		topBarHeight: 60
	});
	// INIT TAE CONFIG
	taeUI.init({
		endpoint: '/ife/api/proxy',
		dialogTitle: 'Arricchimento testo',
		tabDefinitionsTitle: 'Definizioni',
		tabSimplificationTitle: 'Semplificazione',
		tabWikipediaTitle: 'Wikipedia',
		entryMessage: 'Scegli il tipo di aiuto',
		notextMessage: 'Nessun testo selezionato',
		simplifyColor: '#0000FF'
	});
	// INIT CITIZENPEDIA CONFIG
	cpdUI.init({
		endpoint: 'https://simpatico.morelab.deusto.es/',
		cpdColor: '#379e4c'
	});
	
	// SIMPATICO BAR BUTTONS: 
	// - id: identifier of the control
	// - img (optional): image of the button
	// - text (optional): text value of the control
	// - operation: called to activate the button
	// - cleanup: called to deactivate the control and cleanup the UI
	// - color: to use for highlighting the control
	var buttons = [
		{ // simplify text. Switch to a modality where annotated paragraph are highlighted and replaced
			id: 'simplify',
			img: 'images/simplify.png',
			text: 'Semplifica testo',
			operation: function(){
				taeUI.activateSimplification('#0000FF');
				return true;
			},
			cleanup: function(){
				taeUI.deactivateSimplification();
			},
			color: '#0000FF'
		},
		{ // enrich text. A pop-up appears showing the information about the selected text
			id: 'enrich',
			text: 'Arricchisci testo',
			operation: function() {
				taeUI.showDialog();
				return false;
			},
			cleanup: function(){
				taeUI.hideDialog();
			},
			color: '#0000FF'
		},
		{ // citizenpedia. Switch to a modality, where annotated paragraphs are linked to questions from Citizenpedia
			id: 'citizenpedia',
			img: 'images/citizenpedia.png',
			text: 'Citizenpedia',
			operation: function() {
				cpdUI.activateCitizenpedia();
				return true;
			},
			cleanup: function(){
				cpdUI.deactivateCitizenpedia();
			},
			color: '#379e4c'
		},
		{ // workflow adaptation. Switch to the modality, where the form adaptation starts
			id: 'workflow',
			img: 'images/forms.png',
			text: 'Semplifica processo',
			enabled: waeUI.enabled,
			operation: function() {
				var idProfile = null;// TODO: understand profile, for the moment
				waeUI.loadModel(idProfile);
				return true;
			},
			cleanup: function(){
				waeUI.reset();
			},
			color: '#de453e'
		}
	];
	
	// switch on/off the control buttons
	var currentAction = null; 
	var toggleAction = function(id) {
		return function() {
			// changeStyle of currently active
			$('#'+currentAction+'Switch').removeClass('active');
			$('#'+currentAction+'Switch').css('border-color','transparent');
			// find next object to handle
			var next = null;
			buttons.forEach(function(b) {
				if (b.id == id) next = b;
			});
			// de-activate previous action
			buttons.forEach(function(b) {
				if (b.id == currentAction && b.cleanup) b.cleanup();
			});
			// if the object is different, trigger the new one
			if (currentAction != id) {
				if (next != null && next.operation()) {
					$('#'+id+'Switch').addClass('active');
					$('#'+id+'Switch').css('border-color',next.color);
				}
				currentAction = id;
			} else {
				currentAction = null;
			}
		}
	}
	
	/**
	 * Set up SIMPATICO TOOLBAR: Create bar and add buttons
	 * @returns
	 */
	function setUpSimpaticoBar() {
	    simpaticoBarHtml = 
		    '<div id="simpatico_navbar">'+
	        '  <div>' +
	        '    <a href="#"><img src="images/logo_simpatico.png" height="50px" alt="Simpatico" /></a>'+
	        '  </div>'+
	        '  <ul id="simpatico_bar_buttons">' +
	        '  </ul>' +
	        '  <ul class="navbar-right">' +
	        '    <li><a class="image-ancor" id="userdata" href="#!"><span id="userdataname">User</span><img height="50px" src="images/ic_on.png"/></a>' +
	        '        <a class="image-ancor" id="access" href="#!">Accedi ai tuoi dati</span><img height="50px" src="images/login.png"/></a></li>' +
	        '  </ul>' +
	        '</div>';
	    
	    $( "body" ).prepend( simpaticoBarHtml);
	    

	    buttons.forEach(function(b) {
	    	if (b.enabled && !b.enabled()) return;
	    	var html = 
	            '<li id="'+b.id+'Switch" value="'+ b.id +'Off"><a href="#" class="'+(!!b.img? 'image-ancor' : '')+'">' + 
	    		(!!b.img ? ('<img  src="'+b.img+'" width="50" height="50"/>') :b.text +'</a></li>'); 
	    	$("#simpatico_bar_buttons").append(html);
	    	$("#"+b.id+"Switch").on("click",toggleAction(b.id));
	    });

	    // attach login flow to the sign-in button
	    $("#access").on("click", function() {
	        var aacBase = 'https://tn.smartcommunitylab.it/aac';
	    		var base = window.location.href;
	        var arr = base.split("/");
	        var redirect = arr[0]+'//'+arr[2]+'/ife/callback';
	        var authority = 'google';
//	        	var authority = 'adc';

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
	    // attach logout
	    $("#userdata").on("click", function() {
	    	localStorage.userData = '';
	    	initUserData();
	    });
	    
	}
	setUpSimpaticoBar();	
	
	// user data and login actions
	var userData = null;
	var initUserData = function() {
		var data = JSON.parse(localStorage.userData || 'null');
		if (!!data) {
			$("#simpatico_bar_buttons").show();
			$("#userdata").show();
			$("#access").hide();
			$("#userdataname").text(data.name + ' '+ data.surname);
			userData = data;
		} else {
			$("#simpatico_bar_buttons").hide();
			$("#access").show();
			$("#userdata").hide();
		}
		
	}
	initUserData();
	
});
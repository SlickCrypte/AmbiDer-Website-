$(document).ready(function(){
	
	
//--------------------------------- Counter--------------------------------//
var myDate = new Date(); 
myDate = new Date(myDate.getFullYear() + 1, 1-1, 1); 
$('#display').countdown({until: myDate}); 
//--------------------------------- End counter--------------------------------//


//Social hover animation//
$('#socials img').animate({"opacity": 1 }, 0);
$('#socials img').hover(function() {
$(this).stop().animate({ "opacity": .5 }, 250);
	}, function() {
		$(this).stop().animate({ "opacity": 1 }, 250);
});
//End social hover animation//


//Font replacement //			
Cufon.replace('h2');
//End font replacement //

});

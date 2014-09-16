(function(){
	// če je kar koli narobe alert uporabnika
	assertThat(true, "prva stopnicka");

	var element = document.getElementById("test-results");
	if (element === null) {
		alert("Nisem ustvari div wraperja za testiranje");
		return;
	}
	if (element.children.length !== 5) {
		alert("Nisem ustvaril vseh potrebnih elementov");
	}

})();

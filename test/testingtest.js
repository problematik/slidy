(function(){
	window.onload = function() {
		// če je kar koli narobe alert uporabnika
		assertThat(true, "prva stopnicka");

		var element = document.getElementById("test-results");
		console.log(element.children.length);
		if (element === null) {
			alert("Nisem ustvari div wraperja za testiranje");
			return;
		}
		if (element.children.length !== 4) {
			alert("Nisem ustvaril vseh potrebnih elementov");
		}

		// TODO: add more:)
	}
})();

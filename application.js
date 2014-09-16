(function(){

	var Application = function(data){

		this.nastaviDefaults(data);

		// root element kamor ostali appendajo zadeve....
		this.rootElement = Z.create("div", this.preFix + "-central");;

		setTimeout(function(){
			Z.fireEvent(Z.body(), new Z.event(Z.body(), "applicationLoaded", data));
		},0);
	}

	Application.prototype.nastaviDefaults = function(data) {
		for (var def in data) {
			this[def] = data[def];
		}
	}

	window.onload = function(){
		var data = {
			appMode : "diameter", // TESTING: uporabniki podajo polmer za vsak krog posebaj
			appRanged: true, // TESTING: uporabnik ne more iti v minus na sliderju
			izrisovanje: 1, // TESTING: 1 = isti canvas za vse sliderje | 2 = vsak slider na svojem canvasu
			preFix : "slidy",
			editModeTimeout: 3000
		};

		window["application"] = new Application(data);

		setTimeout(function(){
			var e = new Z.event("expenseAdded", {polmer: 100, range: 720, value: 180, step: 25, premer:200});
			Z.fireEvent(Z.body(), e);
		}, 0);
	}
})();

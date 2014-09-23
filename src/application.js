( function () {

	var Application = function (data) {

		this.nastaviDefaults(data);

		// root element kamor ostali appendajo zadeve....
		this.rootElement = Z.create("div", this.preFix + "-central", {className: "slidy-central"});;

		setTimeout(function () {
			Z.fireEvent(Z.body(), new Z.event(Z.body(), "applicationLoaded", data));
		},0);

		Z.addEvent(Z.body(), "applicationSaveData", this.saveData.bind(this));
		setTimeout(this.loadData.bind(this, this.projectName), 100);
	}

	/**
	 * Preverimo ali imamo v local storage shranjene podatke o sliderjih/expensih
	 */
	Application.prototype.loadData = function (projectName) {
		var data = localStorage.getItem(projectName);

		if (data !== null ){
			try {
				var parsedData = JSON.parse(data);
				var e = new Z.event("applicationDataLoadedFromStorage", parsedData);
				Z.fireEvent(Z.body(), e);
			} catch(e) {
				console.error("Poizkušal sem parsati shranjene podatke v localStorage", data, e);
			}

		}
	}

	/**
	 * Shranimo podatke v storage
	 */
	Application.prototype.saveData = function(e) {
		localStorage.setItem(this.projectName, JSON.stringify(e.data));
	}
	Application.prototype.nastaviDefaults = function (data) {
		for (var def in data) {
			this[def] = data[def];
		}
	}

	window.onload = function () {
		var data = {
			preFix : "slidy", // prefix za id-je elementov
			editModeTimeout: 3000, // po koliko časa po zadnji interakcij z canvasom naj pride do prekinitve urejanja
			projectName: "slidy", // kam shranjujemo podatke v localStorage
		};

		window["application"] = new Application(data);
	}
})();

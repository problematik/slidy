(function(){

	testGroup("testiranje getData in removeData", function(){

		var elements = [];

		for (var i = 0; i < 2; i++) {

			var el = document.createElement("div");
			el.title = "Title " + i;

			elements.push(el);
		}

		for (var i = 0; i < elements.length; i++) {
			Z.podatke(elements[i]).customField = elements[i].title;
		}

		for (var i = 0; i < elements.length; i++) {
			assertThat(Z.podatke(elements[i]).customField === elements[i].title, "Shranjeni podatki so enaki naslovu elementa");
		}

		for (var i = 0; i < elements.length; i++) {
			Z.odstranitiPodatke(elements[i]);
			assertThat(Z.podatke(elements[i]).customField === undefined, "Uspešni pobrisal podatke z uporabo removeData");
		}
	});

	testGroup("testiranje addEvent", function(){

		var el = document.createElement("div");
		Z.body().appendChild(el);
		(function(){

			var clicked = false;
			Z.dodatiEvent(el, "click", function(){
				clicked = true;
			});
			Z.podatki(el);
			el.click();
			assertThat(clicked, "Click event dodan in vrednost spremenjena");

			clicked = false;

			Z.odstranitiEvent(el, "click");
			el.click();
			assertThat(clicked === false, "Click event uspešno odstranjen");

		})();

		(function(){

			var counter = 0;

			function pristejPet(){
				counter+=5;
			};

			Z.dodatiEvent(el, "click", function(){
				counter++;
			});

			Z.dodatiEvent(el, "click", pristejPet);

			el.click();

			assertThat(counter == 6, "Uspešno dodal več različnih click handlerjev");



			var keypressed = false;
			Z.dodatiEvent(el, "keydown", function(){
				keypressed = true;
			});

			// http://stackoverflow.com/questions/596481/simulate-javascript-key-events#12187302
			var keyboardEvent = document.createEvent("KeyboardEvent");
			var initMethod = typeof keyboardEvent.initKeyboardEvent !== 'undefined' ? "initKeyboardEvent" : "initKeyEvent";
			keyboardEvent[initMethod]("keydown", true, true, window, false, false, false, false, 40, 0);

			el.dispatchEvent(keyboardEvent);

			assertThat("keypressed", "Uspešno dodal keypress event");


			keypressed = false;
			counter = 0;

			Z.odstranitiEvent(el, "click", pristejPet);

			el.click();
			el.dispatchEvent(keyboardEvent);
			assertThat(keypressed === true && counter === 1, "Uspešno zbrisal točno določen handler");

			keypressed = false;
			counter = 0;

			Z.odstranitiEvent(el);

			el.click();
			el.dispatchEvent(keyboardEvent);

			assertThat(keypressed === false && counter === 0, "Uspešno zbrisal vse handlerje");
		})();

		Z.body().removeChild(el);
	});

	testGroup("testiramo Želim", function(){

		(function(){
			var el = document.createElement("div");

			var vrnjen = Z(el);

			assertThat(vrnjen === el, "Želim nam je vrnil pravi element");

			el.id = "testing";
			var vrnjen = Z("testing");
			assertThat(vrnjen === null, "Želim nam ni vrnil elementa z neobstoječim id-jem");

			document.body.appendChild(el);

			var vrnjen = Z("testing");
			assertThat(vrnjen === el, "Želim nam je vrnil pravi element");
			document.body.removeChild(el);
		})();

		(function(){

			var elem = {ha: "haha", bu: "muuuuuu", que: function(){}};
			var kopija = Z.clone(elem);

			assertThat(kopija !== elem, "Clone nam pravilno ni vrnil istega elementa");

			var isteLastnosti = true;

			for(var att in elem) {
				if (!kopija.hasOwnProperty(att) || elem[att] !== kopija[att]){
					isteLastnosti = false;
				}
			}

			if (Object.keys) {
				if (Object.keys(elem).length !== Object.keys(kopija).length) {
					isteLastnosti = false;
				}
			}

			assertThat(isteLastnosti === true, "Clone je uspešno prekopiral vrednosti");
		})();

		(function(){

			assertException("Želim novElement vrze exception brez zadostnih parametrov", function(){
				try {
					Z.novElement();
				} catch(e) {
					Z.novElement("div");
				}
			});

			// poizkusamo ustvariti element
			// predno ga ustarimo ne sme obstjaati, po kreiranju mora biti bindan na body
			var element = document.getElementById("buska");
			var noviElement = Z.novElement("div", "buska");
			var element2 = document.getElementById("buska");

			// preverimo če se je res zgodilo vse to kar bi se moralo

			// element pred kreacijo ne obstaja
			var elementPrej = element === null;
			// vrnil je nazaj element
			var kreiranElement = noviElement !== null;
			// ki ima pravilno nastavljen id
			var nastavljenId = noviElement.id === "buska";
			// in pravilno nastavljen tagName
			var nastavljenTag = noviElement.tagName.toLowerCase() === "div";
			// ki smo ga uspešno appendali
			var appendanElement = element2 !== null;
			// na pravi parent
			var parentBody = element2.parentElement === Z.body();

			// izvedemo assertion
			var elementUspesnoKreiran = elementPrej && kreiranElement && nastavljenId
										&& nastavljenTag && appendanElement && parentBody;
			assertThat(elementUspesnoKreiran, "Želim novElement je uspešno kreiral nov element")

			Z.body().removeChild(noviElement);



			var noviElement = Z.novElement("div", "buska", {className : "hruska", jabolko: function(){}});
			var nastavljenClassName = noviElement.className == "hruska";
			var nastavljenaFunkcija = typeof noviElement.jabolko === "function";

			assertThat(nastavljenClassName && nastavljenaFunkcija, "Želim.novElement kreiral nov element z podanimi attributi");

			Z.body().removeChild(noviElement);



			var testResults = document.getElementById("test-results");
			var noviElement = Z.novElement("div", "buska", "test-results");
			var noviElement2 = Z.novElement("div", "buska2", testResults);

			assertThat(noviElement.parentElement === testResults && noviElement2.parentElement === testResults, "Nov element appendal pravilenemu parentu");
			testResults.removeChild(noviElement);
			testResults.removeChild(noviElement2);
		})();

	});

	testGroup("Testiramo Slider", function(){

		assertException("Vrzemo exception ce ga ustvarimo brez parametrov", function(){
			try {
				new Slider();
			} catch(e) {
				new Slider(1);
			}
		});

		assertCalled("Kličemo nastaviDefaultVrednosti", "Slider", "nastaviDefaultVrednosti", function(){
			new Slider(1,1);
		});

		var data = {thisdont : "overwrite"};
		var a = new Slider(1,data);

		resetMock("Slider", "nastaviDefaultVrednosti");

		assertCalledAndReturn("Kličemo defaults", a, "defaults",{my : "data", was : "set", thisShouldntBe : "overwritten"} , function(){
			assertException("Vrzemo exception če ni zadostnih podatkov", function(){
				a.nastaviDefaultVrednosti();
			});

			data.x = 500;
			data.y = 500;
			data.polmer = 30;
			data.kot = 30;
			data.range = 300;
			data.step = 10;
			data.value = 0;
			data.thisShouldntBe = "mySuperValue";

			a.nastaviDefaultVrednosti();

			assertThat(a.data.my === "data" && a.data.was === "set" && a.data.thisShouldntBe === "mySuperValue", "Uspešno nastavim default vrednosti");
		});

		resetMocks();
	});
})();

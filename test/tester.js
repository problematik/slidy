/**
 * Clousure za stvari povezane z testi
 * Testing related stuff was tested by hand :)
 */
(function(){

	var rootElement;
	var rootUl;

	// kamor se trenutno dodajajo Li elementi
	var targetElement = null;
	// prejsni element
	var prejsniTargetElement = null;

	// zapisujemo rezultate testiranja
	var rezultati = {
		steviloUspesnih: 0,
		steviloNeuspesnih: 0,
		uspesniElement: 0,
		neuspesniElement: 0
	}

	// ker omogočamo mockanje objektov, tukaj shranujemo original vrednosti
	var mocks = {};

	/**
	 * Ustvarimo li
	 *
	 * @param  clas Kakšen class naj ima
	 * @param  desc Besedilo li
	 *
	 * @return {HTMLElement}
	 */
	var createLi = function(clas, desc) {

		var li = document.createElement("li");

		li.className = clas;

		if (typeof desc == 'string' || desc instanceof String) {
			li.appendChild(document.createTextNode(desc));
		} else {
			li.appendChild(desc);
		}

		return li;
	};

	/**
	 * Ustvarimo li ki drži rezultate testa
	 *
	 * @param  value Logical value - assertion
	 * @param  desc  Text value
	 *
	 * @return {HTMLElement}
	 */
	var createTestLi = function(value, desc) {

		var clas = value ? "pass hidden" : 'fail';

		return createLi(clas, desc);
	}

	/**
	 * Ustvarimo li na katero lahko kliknemo z njim odpremo pod menije
	 *
	 * @param  desc        Text value
	 * @param  element     Kam bindamo clickEvent
	 * @param  pokaziTekst Kaj naj bo kot tekst za prikaz menija
	 * @param  skrijTekst  Kaj naj bo kot tekst za skritje menija
	 *
	 * @return {HTMLElement}
	 */
	var createExpandableLi = function(desc, element, pokaziTekst, skrijTekst) {

		if (!pokaziTekst) {
			pokaziTekst = "pokaži";
		}
		if (!skrijTekst) {
			skrijTekst = "skrij";
		}

		var clas = "group cursorPointer";

		var li = createLi(clas, desc);

		var span = document.createElement("span");
		span.innerHTML = pokaziTekst;
		span.className = "expand-li"

		li.appendChild(span);

		Z.dodatiEvent(li, "click", handleClick.bind(element, pokaziTekst, skrijTekst, span));
		append(li);

		return li;
	}
	/**
	 * Pripnemo element targetElementu
	 */
	var append = function(element) {

		if (targetElement == null) {
			createRootElement();
		}

		targetElement.appendChild(element);
	}

	/**
	 * Zamenjamo element v katerega se dodajajo elementi
	 */
	var zamenjajTargetElement = function(element) {

		if (targetElement == null){
			createRootElement();
		}

		var temp = targetElement;

		targetElement = element;

		prejsniTargetElement = temp;
	}

	/**
	 * Preverimo če value drži
	 *
	 * @param  value Assertion
	 * @param  desc  Opis
	 */
	this.assertThat = function(value, desc) {

		var li = createTestLi(value, desc);

		append(li);

		preveriRezultatTesta(value);
	}

	/**
	 * Ali je bil test uspešen
	 */
	var preveriRezultatTesta = function(value) {
		if(value) {
			nastaviVrednostTesta(rezultati.uspesniElement, ++rezultati.steviloUspesnih);
		} else {
			odkrijRootElement();
			nastaviVrednostTesta(rezultati.neuspesniElement, ++rezultati.steviloNeuspesnih);
		}
	}

	/**
	 * Združimo več testov pod eno streho
	 *
	 * @param  desc Ime skupine
	 * @param  fn Closure z testi
	 */
	this.testGroup = function(desc, fn) {

		var ul = document.createElement("ul");
		ul.skrito = true;

		zamenjajTargetElement(ul);

		try {
			fn();
		} catch(e) {

			var msg = e.stack.split("\n");

			for (var i = 0; i < msg.length; i++) {
				var li = createLi("fail", msg[i]);

				ul.appendChild(li);
			}

			preveriRezultatTesta(false);

			desc = "Ujet error v skupini " + desc;
		}

		zamenjajTargetElement(prejsniTargetElement);

		var li = createExpandableLi(desc, ul);

		li.appendChild(ul);
		li.skrito = true;

		append(li);
	}

	/**
	 * Če v testu pričakujemo exception/error
	 */
	this.assertException = function(desc, fn) {

		var error = false;
		try {
			fn();
		} catch(e) {
			error = true;
		}

		this.assertThat(error, desc);
	};

	/**
	 * Ustvarimo container za rezultate testiranja
	 */
	var createRootElement = function() {

		rootElement = document.createElement("ul");
		rootElement.id = "test-results";

		rootUl = document.createElement("ul");
		rootUl.skrito = true;

		targetElement = rootElement;

		ustvariElementeZaRezultate();
		createExpandableLi("Rezultati", rootUl);

		rootElement.appendChild(rootUl);

		targetElement = rootUl;

		if (document.body) {
			document.body.appendChild(rootElement);
		} else {
			document.getElementsByTagsName("body")[0].appendChild(rootElement);
		}
	}

	/**
	 * Ker smo imeli failan test kliknemo na element da prikaže pravilen label
	 */
	var odkrijRootElement = function() {
		if (rootUl.skrito) {
			rootElement.getElementsByClassName("group cursorPointer")[0].click();
		}
	}

	/**
	 * Handlamo click, ki je sprožen na Li elementu ustvarjenem v createExpandableLi
	 */
	var handleClick = function(pokaziTekst, skrijTekst, span) {
		// kateri stii so ok, kateri ne
		var styles = this.skrito ?
			{toStay: "show", toGo: "hidden"} :
			{toStay: "hidden", toGo: "show"};

		// da vemo state gumba
		this.skrito = !this.skrito;
		span.innerHTML = this.skrito ? pokaziTekst : skrijTekst;

		var cLen = this.children.length;

		for (var i = 0; i < cLen; i++) {
			Z.zamenjajClass(this.children[i], styles.toGo, styles.toStay);
		}
	}

	/**
	 * Ustvarimo elemente potrebne za prikaz uspešnosti/neuspešnosti testiranja
	 */
	var ustvariElementeZaRezultate = function() {

		var ustvari = function(clas, desc) {
			var el = document.createElement("div");
			el.className = clas;

			el.appendChild(document.createTextNode(desc));
			el.appendChild(document.createElement("span"));

			return el;
		}

		rezultati.uspesniElement = ustvari("uspesno", "Število uspešnih: ");
		rezultati.neuspesniElement = ustvari("neuspesno", "Število neuspešnih: ");

		append(createLi("", rezultati.uspesniElement));
		append(createLi("", rezultati.neuspesniElement));

		nastaviVrednostTesta(rezultati.uspesniElement, 0);
		nastaviVrednostTesta(rezultati.neuspesniElement, 0);
	}

	/**
	 * Nastavimo število uspešnih/neuspešnih testov
	 *
	 * @param  element V kateri element bomo pisali
	 * @param  vrednost Katero vrednost bomo zapisali
	 */
	var nastaviVrednostTesta = function(element, vrednost) {
		element.children[0].innerHTML = vrednost;
	}

	/**
	 * Preverimo ali je bila funkcija klicana
	 *
	 * @param  desc Message
	 * @param  kdo Kateri objekt
	 * @param  kaj Katera funkcija
	 * @param  fn Kaj izvrsujemo
	 * @param  data Dodatne možnosti
	 */
	this.assertCalled = function(desc, kdo, kaj, fn, data) {

		if (data === undefined) {
			data = {};
		}

		if (mocks[kdo] === undefined) {
			mocks[kdo] = {};
		}

		// če je bila funkcija klicana se tole nastavi na true
		var called = false;
		var mocked = function(){
			called = true;
			if (data.rtrn) {
				return data.rtrn;
			}
		}

		// če jo imamo v window gre za Prototype
		// Če gre za prototype je potrebno shraniti original fn da jo bomo lahko potem nastavili nazaj
		// Če gre za druge objekte, pa urejamo direktno tisti objekt in ga tudi shranimo za kasnejšo uporabo
		if (window[kdo]) {
			mocks[kdo][kaj] = window[kdo].prototype[kaj];

			window[kdo].prototype[kaj] = mocked;
		} else {
			// shranimo konstruktor - da bomo pravilnemu objektu nazaj nastavjali original vrednost funkcije
			// shranimo original funkcijo
			mocks[kdo][kaj] = [kdo.prototype.constructor, kdo.prototype[kaj]];
			kdo.prototype[kaj] = mocked
		}

		fn();

		assertThat(called, desc);
	}

	/**
	 * Preverimo ali je bila funkcija klicana in če je bila vrnemo vrednost
	 *
	 * @param  desc Message
	 * @param  kdo Kateri objekt
	 * @param  kaj Katera funkcija
	 * @param  vrnemo Kaj naj vrnemo če smo bili klicani
	 * @param  fn Kaj naj se izvrsi
	 */
	this.assertCalledAndReturn = function(desc, kdo, kaj, vrnemo, fn) {
		this.assertCalled(desc, kdo, kaj, fn, {rtrn: vrnemo});
	};

	/**
	 * Postavimo nazaj vse prototype vrednosti
	 */
	this.resetMocks = function(){
		for (var ob in mocks) {
			for (var fn in mocks[ob]) {
				this.resetMock(ob, fn);
			}
		}
	}

	/**
	 * Postavimo nazaj določeno prototype vrednost
	 *
	 * @param  ob Na katerem objektu
	 * @param  fn Katero funkcijo
	 */
	this.resetMock = function(ob, fn){
		if (window[ob]) {
			window[ob].prototype[fn] = mocks[ob][fn];
		} else {
			var mock = mocks[ob][fn];
			mock[0].prototype[fn] = mock[1];
		}
	}
})();

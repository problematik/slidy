(function(){

	/**
	 * Vektor
	 *
	 * @param e TouchEvent
	 */
	var Vektor = function(e)
	{
		this.x = 0;
		this.y = 0;

		if (e) {
			this.nastaviKoordinate(e);
		}
	}

	/**
	 * Nastavimo koordinate
	 *
	 * @param  vektor Vektor
	 */
	Vektor.prototype.nastaviKoordinate = function(vektor) {
		this.x = vektor.x;
		this.y = vektor.y;
	}

	/**
	 * Vektor, ki ga uporabljamo da določamo sredino sliderja
	 *
	 * @param element
	 */
	var VektorSredina = function(element) {
		Vektor.call(this, element);
	}

	VektorSredina.prototype = Object.create(Vektor);
	VektorSredina.prototype.constructor = VektorSredina;

	/**
	 * Vektorju nastavimo nove koordinate
	 *
	 * @param  element HTMLElement
	 */
	VektorSredina.prototype.nastaviKoordinate = function(element) {

		var boxRect = element.getBoundingClientRect();

		// vracunamo pozicijo scrollBara
		this.x = (boxRect.right - boxRect.width/2) - window.pageXOffset;
		this.y = (boxRect.bottom - boxRect.height/2) - window.pageYOffset;
	}

	/**
	 * Vektor ki ga uporabljamo za zaznavanje dotika
	 *
	 * @param e TouchEvent
	 */
	var VektorPremik = function(e) {
		Vektor.call(this, e);
	}

	VektorPremik.prototype = Object.create(Vektor);
	VektorPremik.prototype.constructor = VektorPremik;

	/**
	 * Vektorju nastavimo koordinate miške ali prejšnega vektorja
	 */
	VektorPremik.prototype.nastaviKoordinate = function(e) {
		// premik touch
		if (e.changedTouches) {
			var touchobj = e.changedTouches[0];

			this.x = parseInt(touchobj.clientX);
			this.y = parseInt(touchobj.clientY);
		}
		// premik miške
		else if (e.clientX) {
			this.x = parseInt(e.clientX);
			this.y = parseInt(e.clientY);
		}
		// prejšni vektor
		else {
			Vektor.prototype.nastaviKoordinate.call(this, e);
		}
	}

	/**
	 * Hendlamo touch sliderja
	 *
	 * @param  element         HTMLElement
	 * @param  callbackPremik  Kaj naj se kliče ko zaznamo premik
	 * @param  callbackKonec   Kaj naj se kliče ko zaznamo da se ne dotikamo več
	 */
	this.HandleTouch = function(element, callbackPremik, callbackKonec)
	{
		if (!element) {
			return;
		}

		// kaj naj klicemo ko imamo premik z določeno smerjo
		this.callbackPremik = callbackPremik;
		// kaj naj klicemo ko je uporabnik odmaknil/dvignil prst
		this.callbackKonec = callbackKonec;

		this.element = Z.element(element);

		// podatki o prejšni miškini poziciji
		this.vPrejsni = new VektorPremik();
		// podatki o zdejšni miškini poziciji
		this.vZdejsni = new VektorPremik();
		// podatki o sredini
		this.vSredina = new VektorSredina(element);

		// če smo ustvarjeni je user kliknil z miško, tako mousedown=true
		this.mouseClicked = false;

		this.handlers = {
			touchstart : "touchStart",
			mousedown : "mouseDown",
			touchend : "touchEnd",
			mouseup : "touchEnd",
			touchmove : "touchMove",
			mousemove : "touchMove"
		};

		this.addListeners();
	}

	/**
	 * Elementu this.element dodamo listenerje
	 */
	HandleTouch.prototype.addListeners = function(){

		for (var e in this.handlers) {
			Z.dodajEvent(this.element, e, this[this.handlers[e]].bind(this));
		}
	}

	/**
	 * Odstranimo vse listenerje za this.element
	 */
	HandleTouch.prototype.removeListeners = function() {

		for (var e in this.handlers) {
			Z.removeEvent(this.element, e, this[this.handlers[e]]);
		}
	}

	/**
	 * Klican ko se začne touch event
	 *
	 * @param  e Touch event
	 */
	HandleTouch.prototype.touchStart = function(e) {

		this.mouseClicked = true;
		this.vPrejsni.nastaviKoordinate(e);

		e.preventDefault();
	}

	/**
	 * Klican ko se premikamo
	 *
	 * @param  e Mouse/Touch event
	 */
	HandleTouch.prototype.touchMove = function(e) {

		if (this.mouseClicked === true) {
			this.vZdejsni.nastaviKoordinate(e);

			this.handlePremik(e);

			e.preventDefault();
		}
	};

	/**
	 * Klican ko se touch konča
	 *
	 * @param  e Mouse/Touch event
	 */
	HandleTouch.prototype.touchEnd = function(e) {
		this.mouseClicked = false;
		this.callbackKonec();
		e.preventDefault();
	}

	/**
	 * Klican ko user pritisne gumb na miški
	 *
	 * @param  e Mouse Event
	 */
	HandleTouch.prototype.mouseDown = function(e){

		this.vPrejsni.nastaviKoordinate(e);

		this.mouseClicked = true;
		this.handlePremik(e);

		e.preventDefault();
	}

	/**
	 * Uporabnk je premaknil prst/miško
	 *
	 * @param e Touch/Mouse event
	 */
	HandleTouch.prototype.handlePremik = function(e) {

		var smer = this.dolociSmerVrtenja(this.vSredina, this.vPrejsni, this.vZdejsni)

		this.callbackPremik(smer, e);

		this.vPrejsni.nastaviKoordinate(this.vZdejsni);
	};

	/**
	 * Določimo smer vrtenja
	 *
	 * @param  sredina  Vektor sredina
	 * @param  prejsni  Vektor prejsnega dotika
	 * @param  zdejsni  Vektor dotika
	 *
	 * @return -1|1; -1 = levo 1 = desno
	 */
	HandleTouch.prototype.dolociSmerVrtenja = function(sredina, prejsni, zdejsni) {

		var smer = ((prejsni.x - sredina.x) * (zdejsni.y - sredina.y) - (prejsni.y - sredina.y) * (zdejsni.x - sredina.x));

		if (smer > 0) {
			return 1;
		}

		return -1;
	};
})();

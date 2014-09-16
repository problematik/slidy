// TODO: testit
(function (){

	// lista v kateri držimo podatke za posamezni guid
	var cache = {},
		guidCounter = 1,
		// unique identifier attribute
		expando = "data" + (new Date).getTime();

	/**
	 * Dobimo shranjene podatke o elementu
	 *
	 * @param elem Za kateri element nas zanima
	 */
	Zelim.podatke = Z.podatki = Z.getData = function(elem) {

		var guid = elem[expando];

		if (!guid) {
			guid = elem[expando] = guidCounter++;
			cache[guid] = {};
		}

		return cache[guid];
	}

	/**
	 * Odstranimo shranjene podatke o elementu
	 *
	 * @param elem Element s katerega čiščimo
	 */
	Zelim.odstranitiPodatke = Z.odstraniPodatke = Z.removeData = function(elem) {

		var guid = elem[expando];

		if (!guid) {
			return;
		}

		delete cache[guid];

		try {
			delete elem[expando];
		}

		catch (e) {
			if (elem.removeAttribute) {
				elem.removeAttribute(expando);
			}
		}

	}
})();

(function(){

	var nextGuid = 1;

	// Ker MS groupira Touch Event-e skupaj z Mouse in Pen Event-i v Pointer Evente jih tukaj map-amo na touch evente
	var touchTypeZaZamenjavo = {
		touchstart: ["MSPointerDown", "pointerdown"],
		touchmove: ["MSPointerMove", "pointermove"],
		touchend: ["MSPointerUp", "pointerup"],
		touchcancel: ["MSPointerCancel", "pointercancel"]
	}

	/**
	 * Ker MS groupira Touch Event-e skupaj z Mouse in Pen Event-i v Pointer Evente jih tukaj map-amo na touch evente
	 *
	 * @param type Kateri event preverjamo
	 */
	var preveriTouchType = function(type){

		if (touchTypeZaZamenjavo.hasOwnProperty(type)) {

			touchTypeZaZamenjavo[type].unshift(type);

			return touchTypeZaZamenjavo[type];
		}

		return [type];
	}

	/**
	 * Popravimo event objekt da je konsistenten pri vseh browserjih in kar se da v skaldu z DOM Level 2 aka odpravimo nepravilnost v IE < 9
 	 * http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-interface
 	 *
	 * @param  event Event v popravilu
	 */
	Zelim.popravitiEvent = Z.popraviEvent = Z.fixEvent = function(event) {

		function returnTrue() { return true;}
		function returnFalse() { return false;}

		if (!event || !event.stopPropagation) {
			var old = event || window.event;

			event = {};

			for (var prop in old) {
				event[prop] = old[prop];
			}

			if (!event.target) {
				event.target = event.srcElement || document;
			}

			event.relatedTarget = event.fromElement === event.target ?
				event.toElement :
				event.fromElement;

			// ustavimo brskalnikovo default akcijo
			event.preventDefault = function() {
				event.returnValue = false;
				event.isDefaultPrevented = returnTrue;
			;}

			event.isDefaultPrevented = returnFalse;

			// prekinemo bubblanje eventa
			event.stopPropagation = function() {
				event.cancelBubble = true;
				event.isPropagationStopped = returnTrue;
			}

			event.isPropagationStopped = returnFalse;

			// prekinemo bubblanje in izvajanje drugih handlerjev
			event.stopImmediatePropagation = function() {
				this.isImmediatePropagationStopped = returnTrue;
				this.stopPropagation;
			}

			event.isImmediatePropagationStopped = returnFalse;

			// pozicija miške
			if (event.clientX != null) {
				var doc = document.documentElement;

				if (document.body) {
					var body = document.body;
				} else {
					var body = document.getElementsByTagName("body")[0];
				}

				event.pageX = event.clientX +
					(doc && doc.scrollLeft || body && body.scrollLeft || 0) -
					(doc && doc.clientLeft || body && body.clientLeft || 0);
				event.pageY = event.clientY +
					(doc && doc.scrollTop || body && body.scrollTop || 0) -
					(doc && doc.clientTop || body && body.clientTop || 0);
			}

			event.which = event.charCode || event.keyCode;

			// Popravimo gumb pri miškinem kliku
			// 0 == left, 1 == sredina, 2 == desno
			if (event.button != null) {
				event.button = (event.button & 1 ? 0 :
					(event.button & 4 ? 1 :
						(event.button & 2 ? 2 : 0)));
			}
		}

		return event;
	}

	/**
	 * Funkcija ki jo bomo uporabljamo namesto addEventListener/attachEvent
	 *
	 * @param elem Za kateri element attachamo listenerje
	 * @param type Za kateri event gre
	 * @param fn Kaj naj se zgodi ko bo prišlo do eventa
	 */
	Zelim.dodatiEvent = Z.dodajEvent = Z.addEvent = function(elem, type, fn) {

		var data = Zelim.podatke(elem);

		// objekt ki drži handlerje za definirane Evente - type
		if (!data.handlers) {
			data.handlers = {};
		}

		// ker imamo lahko različne type za isti Event
		var types = preveriTouchType(type);

		for(var i = 0; i < types.length; i++) {

			// različni handlerji za posamezni Event
			if (!data.handlers[types[i]]) {
				data.handlers[types[i]] = [];
			}

			// lookup za originalni handler, ki ga uporabimo pri removeEvent
			if (!fn.guid) {
				fn.guid = nextGuid++;
			}

			data.handlers[types[i]].push(fn);
		}

		// dispather za klic vseh listenerjev za posamezni event
		if (!data.dispatcher) {

			data.disabled = false;
			data.dispatcher = function (event) {

				if (data.disabled) {
					return;
				}

				// odpravimo nepravilnosti v starih verzijah IE
				event = Zelim.popravitiEvent(event);

				var handlers = data.handlers[event.type];

				// kličemo vse listenerje
				if (handlers) {
					for (var n = 0; n < handlers.length; n++) {
						handlers[n].call(elem, event);
					}
				}
			};
		}

		// dodamo listenerje
		if (data.handlers[type].length == 1) {

			if (document.addEventListener) {

				// preverimo če imamo slučajno opravka z touch eventi
				for (var i = 0; i < types.length; i++) {
					elem.addEventListener(types[i], data.dispatcher, false);
				}

			} else if (document.attachEvent) {
				elem.attachEvent("on" + type, data.dispatcher);
			}
		}
	}

	/**
	 * Pospravimo za seboj, zbrisemo ustrezne handlerje, odstranimo listenerje etc...
	 *
	 * @param  elem Za kateri element gre
	 * @param  type Za kateri event gre
	 */
	var tidyUp = function(elem, type) {

		// helper za preverjanje praznosti
		function isEmpty(object) {
			for (var prop in object) {
				return false;
			}
			return false;
		}

		// dobimo vse podatke o elementu
		var data = Zelim.podatke(elem);

		// če nimamo več handlerjev za dotičen type zbrišemo vse event listenerje
		if (data.handlers[type].length === 0) {

			delete data.handlers[type];

			if (document.removeEventListener) {

				var types = preveriTouchType(type);

				for (var i = 0; i < types.length; i++) {
					elem.removeEventListener(types[i], data.dispatcher, false);
				}
			} else if (document.detachEvent) {
				elem.detachEvent("on" + type, data.dispatcher);
			}
		}

		// če nimamo definiranega nobenega handlerja za posamezni type zbrišemo vse
		if (isEmpty(data.handlers)) {
			delete data.handlers;
			delete data.dispatcher;
		}

		// če je data prazen zbrišemo še to
		if (isEmpty(data)) {
			removeData(elem);
		}
	}

	/**
	 * Zbrišemo event
	 *
	 * @param  elem Element s katerim operiramo
	 * @param  type Za kateri tip eventa gre, če ga ne podamo brišemo vse evente
	 * @param  fn za katero funkcijo gre, če ne podamo brišemo vse funkcije za podan event
	 */
	Zelim.odstranitiEvent = Z.odstraniEvent = Z.removeEvent = function(elem, type, fn) {

		if (!elem) {
			return;
		}

		var data = Zelim.podatke(elem);

		if (!data.handlers) {
			return;
		}

		var removeType = function(t) {
			data.handlers[t] = [];
			tidyUp(elem, t);
		}

		var types = preveriTouchType(type);

		if (!type) {
			// ker uporabnik ni podal type in fn
			// brišemo vse dodane handlerje/listenerje za ta element
			for (var t in data.handlers) {
				removeType(t);
			}

			return;
		}

		var handlers = data.handlers[type];

		if (!handlers) {
			return;
		}

		// uporabnik ni podal fn
		// brišemo vse handlerje za podan type/Event
		if (!fn) {
			for(var i = 0; i < types.length; i++) {
				removeType(types[i]);
			}
			return;
		}

		// uporabnik je podal funkcijo za katero obstjajo handlerji
		if (fn.guid) {
			for (var i = 0; i < handlers.length; i++) {
				if (handlers[i].guid === fn.guid) {
					handlers.splice(i--, 1);
				}
			}
		}

		for (var i = 0; i < types.length; i++) {
			tidyUp(elem, types[i]);
		}
	}

	/**
	 * Sprožimo event na elementu
	 *
	 * @param  elem Na katerem elementu prožimo event
	 * @param  event Kateri event prožimo
	 */
	Zelim.sprozitiEvent = Z.sproziEvent = Z.fireEvent = function(elem, event) {

		var data = Zelim.podatke(elem),
			parent = elem.parentNode || elem.ownerDocument;

		// če smo podali string ustvarimo Event
		if (typeof event === "string") {
			event = {type: event, target: elem};
		} else if(elem.target === undefined) {
			event.target = elem;
		}

		event = Zelim.popravitiEvent(event);

		// če ima element nastavljen dispather ga kličemo, sprožimo evente
		if (data.dispatcher) {
			data.dispatcher.call(elem, event);
		}

		// rekurzivno kličemo funkcijo - "bubblamo" event po DOM-u
		if (parent && !event.isPropagationStopped()) {
			Z.fireEvent(parent, event);
		} else if (!parent && !event.isDefaultPrevented()) {

			// če nimamo več staršev poizkusimo izpeljati default akcijo elementa
			var targetData = Zelim.podatke(event.target);

			if (event.target[event.type]) {

				// začasno ustavimo eksekucijo dispatcherja - da ne bi prišlo do dvojnega zagona listenerjev
				// ker smo ravnokar klicali vse listenerje
				targetData.disabled = true;

				event.target[event.type]();

				// vklopimo nazaj
				targetData.disabled = false;
			}
		}
	}

	/**
	 * Custom event za prenašanje podatkov
	 * Overloading - lahko skippamo element, ga v fireEventu avtomatsko bindamo na podan element
	 * Overloading - lahko podamo samo event, brez data
	 *
	 * @param 	elem Na kateri element ga bindamo
	 * @param   type Tip eventa
	 * @param   data Podatki za event
	 */
	Z.event = function(elem, type, data) {
		if (data === undefined && type && elem) {
			this.type = elem;
			this.data = type;
		} else if (elem && type == undefined) {
			this.type = elem;
		} else {
			this.target = elem;
			this.type = type;
			this.data = data;
		}
	}
})();


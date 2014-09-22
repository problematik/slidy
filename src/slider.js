(function(){

	/**
	 * Preko tega objekta exposamo vse funkcionalnost, ki jo rabimo za delo na canvasu z sliderji
	 *
	 * @param data Podatki o aplikaciji
	 */
	var SliderCentral = function(data){

		this.data = data;
		this.nastaviDefaultVrednosti();

		// vsi dodani sliderji
		this.sliderji = [];

		// kamor izrisujemo vse sliderje ko nismo v edit mode
		this.ctxSliderji = this.data.canvasSliderji.getContext("2d");

		// izrisujemo premikajoci se slider
		this.ctxSlider = this.data.canvasSlider.getContext("2d");
		// ker je ozadje staticno ga izrisemo v svoj canvas
		this.ctxBackground = this.data.canvasBackground.getContext("2d");

		// ko smo v edit mode tu drzimo referenco na MoveableSlider
		this.premikajoci = null;
		// ali urejamo
		this.editMode = false;

		// Canvasom dodamo pocistiCanvas
		// da nam ne bo potrebno tega kasneje preračunavati in zato da imajo
		// sliderji sami možnost klicanja tega
		var pocistiCanvas = function() {
			this.clearRect(0, 0, this.canvas.width, this.canvas.height);
		}

		this.requestAnimationFrameId = 0;

		this.ctxSlider.pocistiCanvas = pocistiCanvas;
		this.ctxSliderji.pocistiCanvas = pocistiCanvas;
		this.ctxBackground.pocistiCanvas = pocistiCanvas;

		this.dodajListenerje();

		// ce pride do resiza windowa da ne resizamo takoj
		this.windowResizeCounter = 0;

		// da prenehamo z editiranjem
		this.editTimeoutCounter = 0;
	};

	// uporabnik je poklikal vsa oknca in odprl se je projekt
	Z.dodajEvent(Z.body(), "applicationLoaded", function(e){
		window["sliderCentral"] = new SliderCentral(e.data);
	});

	/**
	 * Bindamo listenerje
	 *
	 */
	SliderCentral.prototype.dodajListenerje = function() {
		Z.dodajEvent(Z.body(), "expenseAdded", this.dodajSlider.bind(this));
		Z.dodajEvent(Z.body(), "expenseRemoved", this.odstraniSlider.bind(this));
		Z.dodajEvent(Z.body(), "expenseEdited", this.updateSlider.bind(this));
		// Z.dodajEvent(this.data.canvasElement, "click", this.handleClickNaCanvas.bind(this));
		window.touchHandler.add(this.data.canvasElement, this.handleClickNaCanvas.bind(this));
		Z.dodajEvent(window, "resize", this.windowResized.bind(this));
	}

	/**
	 * Okno se je zmanjšalo/povečalo treba spremeniti/ponovno izrisati zadeve
	 */
	SliderCentral.prototype.windowResized = function() {

		// če premikamo postopoma, vmes prekinom prejsne ponovno izrisovanje
		clearInterval(this.windowResizeCounter);

		var f = function(){

			// nastavimo nov width in height
			this.data.width = this.data.canvasElement.getBoundingClientRect().width;
			this.data.height = this.data.canvasElement.getBoundingClientRect().height;
			this.data.x = this.data.width/2;
			this.data.y = this.data.height/2;

			var canvasi = [this.data.canvasSliderji, this.data.canvasBackground, this.data.canvasSlider];

			// nastavimo nove dimenzije canvasom
			for (var i = 0; i < canvasi.length; i++) {

				var element = canvasi[i];
				element.style.width = this.data.width;
				element.style.height = this.data.height;
				element.width = this.data.width;
				element.height = this.data.height;
			}

			// ce smo v edit mode updatejtamo samo premikajoci slider
			if (this.editMode) {
				this.premikajoci.draw();
			} else {

				for (var i = 0; i < this.sliderji.length; i++) {
					this.sliderji[i].data.x = this.data.x;
					this.sliderji[i].data.y = this.data.y;
					this.sliderji[i].preracunajPodatkeZaOzadje();
					this.sliderji[i].draw();
				}
			}
		}

		this.windowResizeCounter = setTimeout(f.bind(this), 100);
	}
	/**
	 * Nastavimo default vrednosti potrebne za izrisovanje
	 *
	 * @param  data
	 */
	SliderCentral.prototype.nastaviDefaultVrednosti = function() {

		/**
		 * Helper za hitrejše ustvarjanje canvasov
		 * ustvarimo canvas, določimo id, width in height in pa ga appendamo rootElementu
		 *
		 * @param  poz Za kateri canvas po vrsti gre
		 * @param  hidden Ali naj skrijem canvas
		 *
		 * @return HTMLElement
		 */
		var createCanvas = function(id, hidden){

			var data = {width: this.data.width, height: this.data.height, className: "unselect"};

			if (hidden) {
				data.className += " hidden";
			}

			return Z.create("canvas", id, data, this.data.canvasElement);
		};

		var that = this;

		// kaj naj se ustvari če ni podano
		var defaults = {
			sliderCanvasPrefix: "slider",
			canvasElement: function(){return Z.create("div", application.preFix + "-canvas-wrapper", {className: "canvas-wrapper"}, application.rootElement)},
			width: function(){return that.data.canvasElement.getBoundingClientRect().width;},
			height: function(){return that.data.canvasElement.getBoundingClientRect().height;},
			canvasSliderji: function(){return createCanvas.call(that, "c-sliderji");},
			canvasBackground: function(){return createCanvas.call(that, "c-background", true);},
			canvasSlider: function(){return createCanvas.call(that, "c-slider", true);}
		};

		if (this.data === undefined) {
			this.data = {};
		}

		for (var att in defaults) {

			if (this.data[att] === undefined) {
				if (typeof defaults[att] === "function") {
					this.data[att] = defaults[att]();
				} else {
					this.data[att] = defaults[att];
				}
			}
		}

		Z.create("div", null, {className: "clear-both"}, application.rootElement);
	}

	/**
	 * Uporabnik je dodal nov expense, čas da izrišemo nov slider
	 *
	 * @param  e Event z podatki
	 */
	SliderCentral.prototype.dodajSlider = function(e) {

		e.data.x = this.ctxSliderji.canvas.width/2;
		e.data.y = this.ctxSliderji.canvas.height/2;
		e.data.appRanged = this.data.appRanged;

		var slider = new Slider(this.ctxSliderji, e.data);

		slider.draw();

		this.sliderji.push(slider);
	}

	/**
	 * Uporabnik je spremenil expense, odstranimo slider
	 *
	 * @param  e Event z podatki
	 */
	SliderCentral.prototype.odstraniSlider = function(e) {

		for (var i = 0; i < this.sliderji.length; i++) {
			if (this.sliderji[i].data.id === e.data) {
				// TODO: kaj moramo še popucat za sabo?
				this.sliderji.splice(i, 1);
				break;
			}
		}

		this.ctxSliderji.pocistiCanvas();

		for (var i = 0; i < this.sliderji.length; i++) {
			this.sliderji[i].draw();
		}
	}

	/**
	 * En izmed expensov je bil spremenjen
	 */
	SliderCentral.prototype.updateSlider = function() {

		this.ctxSliderji.pocistiCanvas();

		for(var i = 0; i < this.sliderji.length; i++) {
			this.sliderji[i].preracunajPodatkeZaOzadje();
			this.sliderji[i].draw();
		}
	}

	/**
	 * Handlamo click na canvas z sliderji
	 *
	 * @param  {[type]} e [description]
	 */
	SliderCentral.prototype.handleClickNaCanvas = function(e) {

		if (this.editMode === false) {

			// ker se lahko overlapajo gremo od ozadaj - top first
			var dolzina = this.sliderji.length;

			for (var i = dolzina-1; i >= 0; i--) {

				var slider = this.sliderji[i];

				// klik je na sliderji
				if (slider.preveriAliJePozicijaMiskeNaKrogu(e)){

					this.editMode = true;

					// izrisujemo vse na enem canvasu - default
					if (this.data.izrisovanje === 1){

						this.ctxSliderji.pocistiCanvas();
						this.goToEditMode(slider);

					} else {
						// ne še :D
					}

					break;
				}
			}
		}
	}

	/**
	 * Ko smo v edit mode izklopimo scroll
	 */
	SliderCentral.prototype.disableScroll = function() {
		Z.zamenjajClass(this.ctxSliderji.canvas, "scroll", "noscroll");
		Z.zamenjajClass(this.ctxBackground.canvas, "scroll", "noscroll");
		Z.zamenjajClass(this.ctxSlider.canvas, "scroll", "noscroll");
	}

	/**
	 * Vklopimo ga nazaj
	 */
	SliderCentral.prototype.enableScroll = function() {
		Z.zamenjajClass(this.ctxSliderji.canvas, "noscroll", "scroll");
		Z.zamenjajClass(this.ctxBackground.canvas, "noscroll", "scroll");
		Z.zamenjajClass(this.ctxSlider.canvas, "noscroll", "scroll");
	}

	/**
	 * Slider je bil kliknjen
	 * @param  slider Slider
	 * @return {[type]}        [description]
	 */
	SliderCentral.prototype.goToEditMode = function(slider) {

		this.disableScroll();

		Z.zamenjajClass(this.ctxSliderji.canvas, "show", "hidden");
		Z.zamenjajClass(this.ctxBackground.canvas, "hidden", "show");
		Z.zamenjajClass(this.ctxSlider.canvas, "hidden", "show");

		if (this.premikajoci === null) {
			this.premikajoci = new MoveableSlider(this.ctxSlider, this.ctxBackground, slider.data);
			this.premikajoci.handlerId = window.touchHandler.add(this.ctxSlider.canvas, this.handleTouchOnCanvas.bind(this));
		}

		this.premikajoci.nastaviData(slider.data);

		requestAnimationFrame(this.premikajoci.izrisiOzadje.bind(this.premikajoci, this.ctxBackground));


		Z.fireEvent(Z.body(), new Z.event("sliderEditingStart", {value: slider.data.value}));

		this.premikajoci.draw();

		this.ctxSliderji.pocistiCanvas();
		this.ctxBackground.pocistiCanvas();

		this.animate();
	}

	/**
	 * User je imel interakcijo z canvasom
	 *
	 * @param  {[type]} e    [description]
	 */
	SliderCentral.prototype.handleTouchOnCanvas = function(e) {
		this.premikajoci.update(e);
	}

	/**
	 * Ponovno izrisemo
	 *
	 * @param  {[type]} id [description]
	 */
	SliderCentral.prototype.animate = function(id) {

		this.requestAnimationFrameId = window.requestAnimationFrame(this.animate.bind(this));

		if (this.editMode) {
			if (this.premikajoci.needsUpdate) {
				this.premikajoci.ponovnoIzrisi();
			}
		}
	}



	/**
	 * ################################################################################################
	 * #																							  #
	 * #											SLIDER       									  #
	 * #																							  #
	 * ################################################################################################
	 */

	/**
	 * Izrisemo posamezni slider
	 */
	this.Slider = function(ctx, data) {

		if (ctx === undefined || data === undefined) {
			throw new Error("Nisi podal podatkov za kreiranje Sliderja");
		}

		this.ctx = ctx;
		this.data = data;
		this.nastaviDefaultVrednosti();
	};

	// optimalna dolzina in razmik glede na try&error za r=100
	var OZADJE_DOLZINA_OBARVANEGA_DELA = 8.726646259971647; // α = 5°
	var OZADJE_RAZMIK = 10.471975511965978; // α = 6°

	/**
	 * Default nastavitve za slider
	 */
	Slider.prototype.defaults = function(){
		return {
			zacetek : 270, // 0 levo | 90 dol | 180 levo | 270 gor
			barva : "rgba(64, 0, 128, 0.6)",
			sirina: 25,
			krogBarva: "white",
			krogBarvaObroba: "#bbb",
			krogWidth: 1,
			ozadjeKot: kotKroznegaLoka(this.data.polmer, OZADJE_DOLZINA_OBARVANEGA_DELA),
			ozadjeRazmik: kotKroznegaLoka(this.data.polmer, OZADJE_RAZMIK),
			ozadjeBarva: "rgba(128,128,128, 0.3)"
		};
	};

	/**
	 * Prislo je do window resize, ponovno moramo zracunati zadeve
	 */
	Slider.prototype.preracunajPodatkeZaOzadje = function() {
		this.data.ozadjeKot = kotKroznegaLoka(this.data.polmer, OZADJE_DOLZINA_OBARVANEGA_DELA);
		this.data.ozadjeRazmik = kotKroznegaLoka(this.data.polmer, OZADJE_RAZMIK);

		this.nastaviPodatkeZaKrogNaSliderju();
	}

	/**
	 * Podatki ki jih potrebujemo za ustrezno izrisovanje
	 */
	Slider.prototype.nastaviDefaultVrednosti = function() {

		this.preracunajKot();

		var passed = Z.preveritiVrednosti([undefined, null, "NaN"], this.data.x, this.data.y, this.data.polmer, this.data.kot);
		if (passed !== true){
			throw new Error("Z podanimi podatki ne morem izrisati sliderja. "  + passed[0] +  " parameter za preverjanje je enak " + passed[1]);
		}

		var defaults = this.defaults();

		for (var att in defaults) {
			if (this.data[att] === undefined) {
				this.data[att] = defaults[att];
			}
		}

		this.nastaviPodatkeZaKrogNaSliderju();
	}

	/**
	 * Nastavimo vrednost za izris krog na sliderju
	 */
	Slider.prototype.nastaviPodatkeZaKrogNaSliderju = function(){
		this.data.krogPolmer = this.data.sirina/2 + 3;
		this.data.krogOdmik = -this.data.polmer + this.data.krogPolmer -3;
		this.data.krogRob = this.data.krogPolmer + this.data.krogWidth;
	}

	/**
	 * Preverimo ali je uporabnik z miško nad nami
	 *
	 * @param  e Event
	 * @param  toleranca Koliko px imamo tolerance
	 *
	 * @return boolean
	 */
	Slider.prototype.preveriAliJePozicijaMiskeNaKrogu = function(e, toleranca) {

		if (!toleranca) {
			toleranca = 0;
		}

		var x = e.elementX - e.elementSirina;
		var y = e.elementY - e.elementVisina;

		var dist = Math.sqrt(x*x + y*y);

		// preverimo ali je klik znotraj izrisanega kroga
		if (((this.data.polmer - this.data.sirina - toleranca) < dist) && (dist < this.data.polmer + toleranca)) {
			return true;
		}

		return false;
	}

	/**
	 * Izracunamo pozicijo kroga
	 *
	 * @return {[type]} [description]
	 */
	Slider.prototype.izracunajTockeZaKrogNaSliderju = function() {
		// 360 - this.data.zacetek == da začnemo iz iste točke kot Slider
		var radian = toRadian(this.data.kot + 360 - this.data.zacetek);

		this.krogX = this.data.x + this.data.krogOdmik  * Math.cos(radian);
		this.krogY = this.data.y + this.data.krogOdmik * Math.sin(radian);
	}

	/**
	 * Izrisemo krog na koncu izseka/sliderja
	 *
	 * @param  ctx
	 */
	Slider.prototype.izrisiKrogNaSliderju = function(ctx) {

		var data = this.izracunajTockeZaKrogNaSliderju();

		ctx.save();
		ctx.beginPath();

		//izrisemo obrobo
		ctx.arc(this.krogX, this.krogY, this.data.krogRob , 0, r360)
		ctx.fillStyle = this.data.krogBarvaObroba;
		ctx.fill();
		ctx.closePath();

		// izrisemo krog
		ctx.beginPath();
		ctx.arc(this.krogX, this.krogY, this.data.krogPolmer, 0, r360);
		ctx.fillStyle = this.data.krogBarva;
		ctx.fill();
		ctx.closePath();

		ctx.restore();
	}

	/**
	 * Izrisemo izsek kroga
	 *
	 * @param ctx Context za risanje
	 * @param zacetek Na katerih stopinjah zacnemo risati (0 = desno)
	 * @param kot Kaksen kot izrisujemo
	 * @param barva Barva izseka
	 */
	Slider.prototype.izrisiIzsek = function(ctx, zacetek, kot, barva){
		// based on http://stackoverflow.com/a/8031173

		var zacetekR = toRadian(zacetek);
		var konecR = toRadian(zacetek + kot);

		ctx.save();
		ctx.beginPath();
		ctx.moveTo(this.data.x, this.data.y);

		// izrisemo zunanji del
		ctx.arc(this.data.x, this.data.y, this.data.polmer, zacetekR, konecR, false);
		// izrisemo notranji del
		ctx.arc(this.data.x, this.data.y, this.data.polmer - this.data.sirina, konecR, zacetekR, true);

		ctx.fillStyle = barva;
		ctx.fill();
		ctx.closePath();
		ctx.restore();
	}

	/**
	 * Izrisemo slider
	 */
	Slider.prototype.izrisiSlider = function(ctx){
		this.izrisiIzsek(ctx, this.data.zacetek, this.data.kot, this.data.barva);
	}

	/**
	 * Izrisemo ozadje
	 * TODO: na kaksen drug nacin?
	 */
	Slider.prototype.izrisiOzadje = function(ctx) {

		for (var i = 0; i < 360; i+=this.data.ozadjeRazmik) {
			this.izrisiIzsek(ctx, i, this.data.ozadjeKot, this.data.ozadjeBarva);
		}
	}

	/**
	 * Izrisemo vse potrebno za prikaz sliderja
	 */
	Slider.prototype.draw = function() {

		this.izrisiOzadje(this.ctx);
		this.izrisiSlider(this.ctx);
		this.izrisiKrogNaSliderju(this.ctx);
	}

	/**
	 * Dobimo vrednost kot-a za izrisovanje
	 */
	Slider.prototype.preracunajKot = function() {
		var noviKot = (this.data.value / this.data.range) * 360;
		this.data.kot = noviKot;
	}
	/**
	 * ################################################################################################
	 * #																							  #
	 * #											MOVEABLE SLIDER 								  #
	 * #																							  #
	 * ################################################################################################
	 */

	 /**
	  * Izrisovali bomo moveable slider
	  *
	  * @param ctx Context za izrisovanje premikajočega sliderja
	  * @param ctx Za enkrat izrisovanje statičnega ozadja
	  * @param data Podatki o sliderju
	  */
	this.MoveableSlider = function(ctx, ctxOzadje, data) {

		Slider.call(this, ctx, data);

		this.ctxOzadje = ctxOzadje;

		this.updateCount = 0;
		this.redrawOn = 3;

		// da animate ne izrisuje ampak samo takrat ko se je kaj spremenilo
		this.needsUpdate = false;
	};

	MoveableSlider.prototype = Object.create(Slider.prototype);
	MoveableSlider.prototype.constructor = MoveableSlider;

	/**
	 * Nastavimo default vrednosti za moveableSlider
	 */
	MoveableSlider.prototype.nastaviDefaultVrednosti = function() {

		Slider.prototype.nastaviDefaultVrednosti.call(this);

		// ko smo nastavili defaulte nastavimo še area za brisanje MoveableSLider,
		// da nam ne bo potrebno tega kasneje izračunavati
		this.data.cleanX = this.data.x - this.data.krogOdmik * - 1 - this.data.sirina/2 - 6;
		this.data.cleanY = this.data.y - this.data.krogOdmik * - 1 - this.data.sirina/2 - 6;
		this.data.cleanH = this.data.cleanW = this.data.polmer * 2 + 12;

		this.updateInProgress = false;
	}

	/**
	 * Izrisovali bomo nek nov slider
	 * @param  {[type]} data [description]
	 * @return {[type]}      [description]
	 */
	MoveableSlider.prototype.nastaviData = function(data) {

		this.data = data;
		this.appRanged = this.data.appRanged;
		this.needsUpdate = true;
		this.nastaviDefaultVrednosti();
	}

	/**
	 * Prvič izrišemo moveable slider
	 *
	 * Ko ga prvič izrišemo najprej počistimo canvas, nato izrišemo statičen background in nato slider
	 */
	MoveableSlider.prototype.draw = function() {

		this.ctxOzadje.pocistiCanvas();
		this.ctx.pocistiCanvas();

		this.izrisiOzadje(this.ctxOzadje);
		this.izrisiSlider(this.ctx, this.data.zacetek, this.data.kot, this.data.barva);
		this.izrisiKrogNaSliderju(this.ctx);
	}

	/**
	 * Izrisemo ok ko je minilo 3 sekunde od zadnjege interakcije z canvasom
	 * @return {[type]} [description]
	 */
	MoveableSlider.prototype.izrisiOK = function(){
		Z.fireEvent(Z.body(), new Z.event("sliderCanEndEdit", {value: this.data.value}));
	}

	/**
	 * Preverimo ali je uporabnik kliknil na OK?
	 *
	 * @param  {[type]} e [description]
	 */
	MoveableSlider.prototype.preveriZaKlikNaOk = function(e) {

		if (e.elementX >= this.data.x - 20 &&
			e.elementX <= this.data.x + 20 &&
			e.elementY >= this.data.y - 20 &&
			e.elementY <= this.data.y + 20)
		{
			sliderCentral.enableScroll();

			window.cancelAnimationFrame(sliderCentral.requestAnimationFrameId);

			sliderCentral.editMode = false;

			Z.zamenjajClass(sliderCentral.ctxSlider.canvas, "show", "hidden");
			Z.zamenjajClass(sliderCentral.ctxBackground.canvas, "show", "hidden");
			Z.zamenjajClass(sliderCentral.ctxSliderji.canvas, "hidden", "show");

			// TODO: reduce?
			Z.fireEvent(Z.body(), new Z.event("sliderEditingEnd"));
			Z.fireEvent(Z.body(), new Z.event("expenseEdited", this.data.id));
			Z.fireEvent(Z.body(), new Z.event("expense-"+this.data.id+"-edited", this.data));

		}
	}

	/**
	 * User je kliknil na canvas, preverimo če rabimo ponovno izristovati/nastavljati nove vrednosti
	 *
	 * @param  e TouchEvent
	 */
	MoveableSlider.prototype.update = function(e) {
		if ((e.what === "click" || e.what === "move" || e.what === "doubleTap") ) {

			if (e.what === "move") {
				clearTimeout(this.editTimeoutCounter);
			}

			if (this.updateInProgress === false) {

				this.updateInProgress = true;

				// ker lahko user vrti zunaj kroga/kroznice
				if (this.preveriAliJePozicijaMiskeNaKrogu(e, e.tapZamik) || e.what === "move") {

					clearTimeout(this.editTimeoutCounter);

					var razlika = this.preracunajRazlikoGledeNaKot(e);

					if (razlika !== false) {

						vrednost = this.data.value + razlika;

						this.nastaviVrednost(vrednost);
						this.preracunajKot();

						this.needsUpdate = true;
					}

				} else {
					this.preveriZaKlikNaOk(e);
				}

				this.updateInProgress = false;

			}
		} else if (e.what === "clickEnd") {

			clearTimeout(this.editTimeoutCounter);
			this.editTimeoutCounter = setTimeout(this.izrisiOK.bind(this), this.data.editModeTimeout || 2500);

		}

		return;
	}

	/**
	 * Nastavimo za koliko bi se vrednost spremenila glede na kot
	 *
	 * @param  e
	 * @return razlika v value|false če ni razlike
	 */
	MoveableSlider.prototype.preracunajRazlikoGledeNaKot = function(e) {

		// dobimo koliko bi bila temp value
		var tempValue = (e.kot / 360) * this.data.range;

		var tempValue = tempValue - this.data.value;

		if (Math.abs(tempValue) >= this.data.step/2) {

			var kolikokrat = Math.floor(Math.abs(tempValue) / this.data.step);

			// odštevamo
			if (tempValue < 0) {
				// value bomo postavili na 0
				if (this.data.value === this.data.step) {
					return -this.data.step;
				}
				// preračunamo koliko moramo odšteti
				return -this.data.step * kolikokrat;
			}
			else if (this.data.value === this.data.range - this.data.step) {
				// value bomo postavili na range
				return this.data.step;
			} else {
				// preračunamo koliko moramo prišteti
				return this.data.step * kolikokrat;
			}
		}

		// ni spremembe
		return false;
	}

	/**
	 * Nastavimo vrednost
	 *
	 * @param  {[type]} tempValue [description]
	 */
	MoveableSlider.prototype.nastaviVrednost = function(tempValue) {

		this.data.value = tempValue;

		Z.fireEvent(Z.body(), new Z.event("sliderLiveUpdate", {value: this.data.value}));
	}

	/**
	 * Ugotovili smo da je potreben ponoven izris - izrešemo samo slider in krog na koncu sliderja
	 */
	MoveableSlider.prototype.ponovnoIzrisi = function(id) {
		// zadnja sprememba .....
		this.needsUpdate = false;
		this.ctx.clearRect(this.data.cleanX, this.data.cleanY, this.data.cleanW, this.data.cleanH);

		// ponovno izrišemo
		this.izrisiSlider(this.ctx, this.data.zacetek, this.data.kot, this.data.barva);
		this.izrisiKrogNaSliderju(this.ctx);
	}

	/**
	 * ################################################################################################
	 * #																							  #
	 * #											HELPERJI		 								  #
	 * #																							  #
	 * ################################################################################################
	 */

	/**
	 * Spremenimo stopinje v radiane
	 *
	 * @param  kot Kot v stopinjah
	 * @return Kot v radianih
	 */
	var toRadian = function(kot) {
		return kot * Math.PI / 180;
	}
	// da nam ni potrebno vsakič tega računat
	var r360 = toRadian(360);

	/**
	 * Dobimo dolzino kroznega loka za polmer in kot
	 *
	 * @param  r
	 * @param  kot
	 *
	 * @return dolzina kroznega loka
	 */
	function dolzinaKroznegaLoka(r, kot) {
		return (Math.PI * r * kot) / 180;
	}

	/**
	 * Dobimo kot kroznega loka za dolzino in polmer
	 *
	 * @param  r
	 * @param  dolzina
	 *
	 * @return Kot
	 */
	function kotKroznegaLoka(r, dolzina) {
		return (dolzina * 180) /  (Math.PI * r);
	}
})();

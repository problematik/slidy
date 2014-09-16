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
		// id funkcija za time
		this.editModeTimeoutID = null;

		// Canvasom dodamo pocistiCanvas
		// da nam ne bo potrebno tega kasneje preračunavati in zato da imajo
		// sliderji sami možnost klicanja tega
		var pocistiCanvas = function() {
			this.clearRect(0, 0, this.canvas.width, this.canvas.height);
		}

		this.ctxSlider.pocistiCanvas = pocistiCanvas;
		this.ctxSliderji.pocistiCanvas = pocistiCanvas;
		this.ctxBackground.pocistiCanvas = pocistiCanvas;

		this.dodajListenerje();
	};

	// uporabnik je poklikal vsa oknca in odprl se je projekt
	Z.dodajEvent(Z.body(), "applicationLoaded", function(e){
		window["sliderCentral"] = new SliderCentral(e.data);
	});

	SliderCentral.prototype.dodajListenerje = function() {

		// bindamo še vse za nas zanimive evente
		Z.dodajEvent(Z.body(), "expenseAdded", this.dodajSlider.bind(this));
		Z.dodajEvent(Z.body(), "expenseRemoved", this.odstraniSlider.bind(this));
		Z.dodajEvent(Z.body(), "expenseEdited", this.updateSlider.bind(this));
		Z.dodajEvent(window.application.rootElement, "click", this.sliderClicked.bind(this));
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

			var data = {width: this.data.width, height: this.data.height};

			if (hidden) {
				data.className = "hidden";
			}

			return Z.create("canvas", id, data, window.application.rootElement);
		};

		var that = this;

		// kaj naj se ustvari
		var defaults = {
			width: 500,
			height: 500,
			sliderCanvasPrefix: "slider",
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
	}

	SliderCentral.prototype.updateSlider = function(e) {

	}

	SliderCentral.prototype.sliderClicked = function(e) {

		if (this.editMode === false) {

			// ker se lahko overlapajo gremo od ozadaj - top first
			var dolzina = this.sliderji.length;

			for (var i = dolzina-1; i >= 0; i--) {

				var slider = this.sliderji[i];

				if (slider.preveriAliJePozicijaMiskeNaKrogu(e)){

					this.editMode = true;

					// izrisujemo vse na enem canvasu
					if (this.data.izrisovanje === 1){

						this.ctxSliderji.pocistiCanvas();
						this.goToEditMode(slider, i);

					} else {
						// ne še :D
					}

					break;
				}
			}
		}
	}

	SliderCentral.prototype.goToEditMode = function(slider, i) {

		Z.zamenjajClass(this.ctxSliderji.canvas, "show", "hidden");
		Z.zamenjajClass(this.ctxBackground.canvas, "hidden", "show");
		Z.zamenjajClass(this.ctxSlider.canvas, "hidden", "show");

		this.premikajoci = new MoveableSlider(this.ctxSlider, this.ctxBackground, slider.data);

		this.premikajoci.nastaviData(slider.data);
		this.premikajoci.draw();

		Z.fireEvent(Z.body(), new Z.event("sliderEditingStart"));

		new HandleTouch(this.ctxSlider.canvas, this.sliderUpdate.bind(this), this.konecTouch.bind(this));
	}

	SliderCentral.prototype.sliderUpdate = function(smer, e) {
		clearTimeout(this.editModeTimeoutID);

		this.premikajoci.update(smer, e);
	}

	SliderCentral.prototype.konecTouch = function() {
		this.premikajoci.updateCount = 0;

		this.editModeTimeoutID = setTimeout(function(){

			// this.editMode = false;
			// fire event
			//
		}, this.data.editModeTimeout);
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
	var ozadjeDolzinaObarvanegaDela = 8.726646259971647; // α = 5°
	var ozadjeRazmik = 10.471975511965978; // α = 6°

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
			ozadjeKot: kotKroznegaLoka(this.data.polmer, ozadjeDolzinaObarvanegaDela),
			ozadjeRazmik: kotKroznegaLoka(this.data.polmer, ozadjeRazmik),
			ozadjeBarva: "rgba(128,128,128, 0.3)"
		};
	};

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

		// http://stackoverflow.com/a/19274644

		var y = e[Z.mouseXYatt.x] - this.data.x;
		var x = e[Z.mouseXYatt.y] - this.data.y;

		var dist = Math.sqrt(y*y + x*x);

		// preverimo ali je klik znotraj izrisanega kroga
		if (((this.data.polmer - this.data.sirina - toleranca) < dist) && (dist < this.data.polmer + toleranca)) {
			return true;
		}

		return false;
	}

	/**
	 * Izrisemo krog na koncu izseka/sliderja
	 *
	 * @param  ctx
	 */
	Slider.prototype.izrisiKrogNaSliderju = function(ctx) {

		// 360 - this.data.zacetek == da začnemo iz iste točke kot Slider
		var radian = toRadian(this.data.kot + 360 - this.data.zacetek);

		var rotX = this.data.x + this.data.krogOdmik  * Math.cos(radian);
		var rotY = this.data.y + this.data.krogOdmik * Math.sin(radian);

		ctx.save();
		ctx.beginPath();

		//izrisemo obrobo
		ctx.arc(rotX, rotY, this.data.krogRob , 0, r360)
		ctx.fillStyle = this.data.krogBarvaObroba;
		ctx.fill();
		ctx.closePath();

		// izrisemo krog
		ctx.beginPath();
		ctx.arc(rotX, rotY, this.data.krogPolmer, 0, r360);
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

		var f = function(){
			this.izrisiOzadje(this.ctx);
			this.izrisiSlider(this.ctx);
			this.izrisiKrogNaSliderju(this.ctx);
		}

		setTimeout(f.bind(this), 0);
	}

	/**
	 * Dobimo vrednost kot-a za izrisovanje
	 */
	Slider.prototype.preracunajKot = function() {
		this.data.kot = (this.data.value / this.data.range) * 360;
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

		this.prejsnaSmer = null;
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
	}
	/**
	 * Izrisovali bomo nek nov slider
	 * @param  {[type]} data [description]
	 * @return {[type]}      [description]
	 */
	MoveableSlider.prototype.nastaviData = function(data) {
		var app = this.data.appRanged;
		this.data = data;
		this.appRanged = app;

		this.nastaviDefaultVrednosti();
	}

	/**
	 * Prvič izrišemo moveable slider
	 *
	 * Ko ga prvič izrišemo najprej počistimo canvas, nato izrišemo statičen background in nato slider
	 */
	MoveableSlider.prototype.draw = function() {

		var f = function(){
			this.ctxOzadje.pocistiCanvas();
			this.ctx.pocistiCanvas();

			this.izrisiOzadje(this.ctxOzadje);
			this.izrisiSlider(this.ctx, this.data.zacetek, this.data.kot, this.data.barva);
			this.izrisiKrogNaSliderju(this.ctx);
		}

		setTimeout(f.bind(this), 0);
	}

	/**
	 * Zaznali smo movement, preverimo če rabimo ponovno izristovati
	 *
	 * @param  smer Kam se premika prst/miška
	 */
	MoveableSlider.prototype.update = function(smer, e) {

		// ker ne izrisujemo na čisto vsak update
		// če smo pa na "robu" se pravi za this.data.step odmaknjeni od 0 ali 360 pa vedno izrisujemo
		// if (++this.updateCount >= this.redrawOn || this.valueNaRobu()) {

			this.updateCount = 0;

			// če user klikne na krog postavimo value direktno na kot, ki ga tvori z miško
			if (this.preveriAliJePozicijaMiskeNaKrogu(e, 6)) {

				// izracunamo zacasni kot
				var kot = this.izracunajKot(e);
				var praviKot;
				// preverimo če nismo šli slučajno iz 355 > 5 ali pa iz 5 < 355 | čez mejo
				if ((praviKot = this.smoSliCezRob(e)) === true) {
					this.data.kot = kot;
				} else {

					this.data.kot = praviKot;
				}

				this.nastaviVrednostGledeNaKot(this.data.kot);

			} else {

				// izracunamo novo value glede na smer
				var tempValue = this.preracunaj(smer);


				if (this.data.appRanged) {
					// preverimo če ne bomo nastavili value čez range oz pod 0
					tempValue = this.nastaviValueZnotrajRange(tempValue)
				}

				this.nastaviVrednost(tempValue);
				this.preracunajKot();


			}

			this.prejsnaSmer = smer;
			this.ponovnoIzrisi();

		// }
	}

	/**
	 * Preverimo ali smo sli pri premikanju skoz rob; čez this.data.range oz pod 0
	 *
	 * @param  e MouseEvent
	 *
	 * @return true Če smo šli čez rob
	 */
	MoveableSlider.prototype.smoSliCezRob = function(e) {

		var misX = e[Z.mouseXYatt.x] - this.data.x;

		if (this.data.value >= (this.data.range - this.data.step) && misX >= 0 && this.prejsnaSmer === 1) {
			return 360;
		} else if (this.data.value <= this.data.step && misX <= 0 && this.prejsnaSmer === -1) {
			return 0;
		}

		return true;
	}

	/**
	 * Nastavimo data.value glede na kot
	 *
	 * @param  kot
	 */
	MoveableSlider.prototype.nastaviVrednostGledeNaKot = function(kot) {

		this.data.value = (kot / 360) * this.data.range;

		Z.fireEvent(Z.body(), new Z.event("sliderLiveUpdate", {value: this.data.value}));
	}

	MoveableSlider.prototype.nastaviVrednost = function(tempValue) {
		this.data.value = tempValue;

		Z.fireEvent(Z.body(), new Z.event("sliderLiveUpdate", {value: this.data.value}));
	}

	/**
	 * Uporabnik ima misko nad krogom zato rabimo izračunat kot
	 *
	 * @param  e MouseEvent
	 *
	 * @return kot
	 */
	MoveableSlider.prototype.izracunajKot = function(e) {

		var y = e[Z.mouseXYatt.x] - this.data.x;
		var x = e[Z.mouseXYatt.y] - this.data.y;

		var rad = Math.atan2(x,y);
		// prištejemo 90 da je origin med 3 in 4 - glej spodaj
		var kot = rad * 180/Math.PI + 90;

		/**
		 *     |
		 *   3 | 4
		 * ----------
		 *   2 | 1
		 *     |
		 *
		 *  Ker obmocju 3 vraca negativne vrednosti
		 */
		if(kot < 0) {
			kot = 360 - Math.abs(kot);
		}

		return kot;
	}

	/**
	 * Lahko se zgodi da imamo step 10 in se nato value nastavi na 9.99999 oz smo na max - step
	 * V takšnih primerih moramo biti dostopni za risanje, kljub temu da je updateCount < redrawOn
	 *
	 * @return boolean
	 */
	MoveableSlider.prototype.valueNaRobu = function(){
		return this.data.value < this.data.step || this.data.value > (this.data.range - this.data.step);
	}

	/**
	 * Ugotovili smo da je potreben ponoven izris - izrešemo samo slider in krog na koncu sliderja
	 */
	MoveableSlider.prototype.ponovnoIzrisi = function() {
		var f = function() {
			// TODO:
			// kaj je hitrejše, narisat še enkrat slider z prejšnim kotom in z opacity/alpa 0 ali rectangle?
			this.ctx.clearRect(this.data.cleanX, this.data.cleanY, this.data.cleanW, this.data.cleanH);

			// ponovno izrišemo
			this.izrisiSlider(this.ctx, this.data.zacetek, this.data.kot, this.data.barva);
			this.izrisiKrogNaSliderju(this.ctx);
		}

		setTimeout(f.bind(this), 0);
	}

	/**
	 * Preverimo če bi z premikom premaknili vrednost/kot čez meje
	 *
	 * @param  tempValue Trenutna vrednost
	 *
	 * @return tempValue
	 */
	MoveableSlider.prototype.nastaviValueZnotrajRange = function(tempValue){

		if ((tempValue >= 0) && (tempValue <= this.data.range)) {
			return tempValue;
		} else if (tempValue <= 0) {
			return 0;
		}

		return this.data.range;
	}

	/**
	 * Preracunamo novo vrednost
	 *
	 * @param  smer Smer premika
	 *
	 * @return Nova vrednost
	 */
	MoveableSlider.prototype.preracunaj = function(smer) {
		// smer: 1 = desno | -1 = levo
		return smer * this.data.step + this.data.value;
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

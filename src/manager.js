(function(){

	var ExpenseManager = function(){

		// lista expensov
		this.expenses = [];

		// v kakšnem vrstnem redu naj se prikazujejo ona, ko dodajamo/editamo expense
		this.createSequence = [];

		this.init();

		this.inputs = null;

		Z.addEvent(Z.body(), "applicationDataLoadedFromStorage", this.dataLoadedFromStorage.bind(this));
		Z.addEvent(Z.body(), "applicationReSaveData", this.shraniPodatkeVStorage.bind(this));
	}

	ExpenseManager.prototype.shraniPodatkeVStorage = function () {
		Z.fireEvent(Z.body(), new Z.event("applicationSaveData", this.expenses));
	}
	ExpenseManager.prototype.sliderUpdated = function () {

	}
	/**
	 * Prebrali smo podatke shranjene v local storage
	 * @param  {[type]} data [description]
	 */
	ExpenseManager.prototype.dataLoadedFromStorage = function(data) {
		data = data.data;
		for (var i = 0; i < data.length; i++) {
			this.expenseDodan(data[i]);
		}
	}

	/**
	 * Dobimo inpute s katerimi dodajamo/editramo
	 */
	ExpenseManager.prototype.dobiInpute = function(){

		if (this.inputs === null ){
			this.inputs = Array.prototype.slice.call(this.dodajExpenseElement.getElementsByTagName("input"));
		}

		return this.inputs;
	}
	/**
	 * Dodali smo nov expense, izrisemo stvari na dokument in bindamo gumbe za edit/delete
	 */
	ExpenseManager.prototype.ustvariElementeZaPrikazovanjeExpensa = function() {

		var zadnji = this.expenses.slice(-1)[0];

		// ustvarimo wrapper
		var wrapper = Z.create("div", application.preFix + "expense" + this.expenses.length, {className: "slidy-expense"}, this.expensesElement);
		// katere podatke nosimo
		Z.getData(wrapper).expense = zadnji;

		// prikazujmo vrednost
		var spanValue = Z.create("span", null, {className: "expense-value", innerHTML: zadnji.value}, wrapper);

		var that = this;

		// preverimo če že imamo nastavljen id
		var kajIscemo = "slidy-i-"+zadnji.ime;
		var counter = 1;

		while (document.getElementById(kajIscemo)) {
			kajIscemo = kajIscemo + counter++;
		}

		var hidden = Z.create("input", kajIscemo, {type: "hidden", value: zadnji.value}, wrapper);
		Z.addEvent(Z.body(), "expense-"+zadnji.id+"-edited", function(data){
			Z.fireEvent(Z.body(), new Z.event("applicationSaveData", that.expenses));
			spanValue.innerHTML = data.data.value;
			hidden.value = data.data.value;
		});

		// prikazujmo barvo
		ustvariWrapperZaBarvo(zadnji.barva, wrapper);
		// prikazujmo ime
		Z.create("span", null, {className: "expenses-name", innerHTML: zadnji.ime}, wrapper);


		var btnWrapper = Z.create("div", null, {className: "btn-wrapper"}, wrapper);
		var uredi = Z.create("input", null, {className: "button", value: "uredi", type: "button"}, btnWrapper);
		var zbrisi = Z.create("input", null, {className: "button", value: "izbrisi", type: "button"}, btnWrapper);

		Z.dodajEvent(uredi, "click", this.kliknjenEdit.bind(this, zadnji, wrapper));
		Z.dodajEvent(zbrisi, "click", this.kliknjenZbrisi.bind(this, zadnji, wrapper));
	}

	ExpenseManager.prototype.kliknjenZbrisi = function(expense, wrapper) {
		for (var i = 0; i < this.expenses.length; i++) {
			if (this.expenses[i].id === expense.id) {
				// pobrišemo
				this.expenses.splice(i,1);

				var e = new Z.event("expenseRemoved", expense.id);
				Z.fireEvent(Z.body(), e);

				break;
			}
		}

		wrapper.parentElement.removeChild(wrapper);
		Z.fireEvent(Z.body(), new Z.event("applicationSaveData", this.expenses));
	}
	/**
	 * Uporabnik je kliknil na gumb za editiranje expensa
	 * @param  expense
	 * @param  wrapper
	 * @param  e
	 */
	ExpenseManager.prototype.kliknjenEdit = function(expense, wrapper, e){

		// če nimamo gumba prekliči
		if (this.dobiInpute().length === 6) {
			var inputs = this.dobiInpute().slice( 0, -1);
			var skriti =  Z.create("input", null, {className: "button hidden", type: "button", value: "Prekliči"}, this.dodajExpenseElement);
			this.inputs.push(skriti);
			Z.addEvent(skriti, "click", this.kliknjenPreklici.bind(this));
		} else {
			var inputs = this.dobiInpute().slice(0, -2);
			var skriti = this.dobiInpute().slice(-1)[0];
		}

		// sprehodimo se in nastavimo pravilne vrednosti
		for (var i = 0; i < inputs.length; i++) {
			inputs[i].value = expense[inputs[i].name];
		}

		// pokažemo element
		Z.zamenjajClass(skriti, "hidden", "show-btn");

		this.dobiInpute().slice(-2, -1)[0].value ="Shrani";

		var data = Z.getData(skriti);
		data.expense = expense;
		data.wrapper = wrapper;
	}

	ExpenseManager.prototype.kliknjenPreklici = function() {
		var inputs = this.dobiInpute().slice(0, -2);

		for (var i = 0; i < inputs.length; i++) {
			inputs[i].value = "";
		}
		var skriti = this.dobiInpute().slice(-1)[0];
		Z.zamenjajClass(skriti, "show-btn", "hidden");
		this.dobiInpute().slice(-2, -1)[0].value ="Dodaj";

		var izbran = this.dodajExpenseElement.getElementsByClassName("izbran")[0];
		Z.zamenjajClass(izbran, "izbran", "neizbran");
		Z.getData(skriti).expense = undefined;
	}
	/**
	 * Ustvarimo element, ki drži kvadrat z backgroundom in barvo
	 *
	 * @param  {[type]} color  [description]
	 * @param  {[type]} parent [description]
	 */
	var ustvariWrapperZaBarvo = function(color, parent){

		// ustvarimo element, ki je hkrati default barva ozadja
		var span = Z.create.call(Z, "span", null, {className: "color-background color-block"}, parent);

		// shranimo dejansko barvo, ki jo prikazujemo da jo lahko prebremo ob kliku
		Z.podatki(span).color = color;

		span.style.backgroundColor = "rgba(128,128,128, 0.3)";

		// nastavimo dejansko barvo, ki jo prikazujemo
		var colorSpan = Z.create("span", null, {className: "color color-block"}, span);
		colorSpan.style.backgroundColor = color;
	}

	/**
	 * Ustvarimo vse potrebno za pravilno delovanje ExpenseManagerja
	 */
	ExpenseManager.prototype.init = function() {

		// ustvarimo root element v katerega bomo pripenjali otroke
		this.rootElement = Z.create("div", application.preFix + "-manager", {className : "slidy-manager"}, application.rootElement);
		// this.rootElement = Z.create("div", application.preFix + "-manager", {className : "slidy-manager hidden"}, application.rootElement);

		// okno za dodajanje expensov
		this.dodajExpenseElement = Z.create("div", application.preFix + "-dodaj", {className : "slidy-dodaj"}, this.rootElement);
		this.expensesElement = Z.create("div", application.preFix + "-expenses", {className: "slidy-expenses"}, this.rootElement);
		// helper za ustvarjanje inputa
		var createInput = function(ime, label, type, parent, error) {

			var data = {className: "input", name: ime, type: type};

			if (type === "number") {
				data.min = 0;
			}

			// če ni hidden rabimo label
			if (type !== "hidden") {
				var dat = {innerHTML: label, htmlFor: ime};
				var parent = Z.create("label", ime +"-label", dat, parent);
			}

			var input = Z.create("input", ime, data, parent);

			// kaj naj se izpiše če uporabnik ni vnesel podatka v polje
			Z.getData(input).error = error;

			return input;
		}

		// med katerimi barvami lahko izbiramo
		var colors = ["128, 0, 0", "255, 0, 0", "128, 128, 0", "255, 255, 0", "0, 128, 0", "0,255, 0", "0,128,128", "0, 255, 255", "0, 0, 128", "0, 0, 255", "128, 0, 128", "255, 0, 255"];

		// ustarimo okno za prikaz barv
		var createColor = function(ime, label, parent, error) {

			var input = createInput(ime, label, "text", parent, error);

			var cWrapper = Z.create("div", ime + "-colors", {className: "slidy-colors"}, parent);

			for (var i = 0; i < colors.length; i++) {

				var color = "rgba(" + colors[i] + ", 0.5)";
				ustvariWrapperZaBarvo(color, cWrapper);
			}

			return input;
		}

		// določimo katere elemente potrebujemo za dodajanje
		// 0 = id, 1 = name, 2 = type, 3 = error msg
		var elements = [
			["ime", "Določi ime", "string", "Vnesti moraš ime"],
			["range", "Določi razpon", "number", "Vnesti moraš razpon"],
			["polmer", "Določi polmer", "number", "Vnesti moraš polmer"],
			["step", "Določi korak", "number", "Vnesti moraš korak"],
			["barva", "Izberi barvo", "colors", "Izbrati moraš barvo"]
		];

		// helperza za wrappanje posamezne vrednosti
		var createWindow = function(number, ime, label, type, error) {

			var wrapper = Z.create("div", "slidy-add-" + number, {className: "slidy-mananger-wrapper"}, this.dodajExpenseElement);

			if (type !== "colors") {
				createInput(ime, label, type, wrapper, error);
			} else {
				var input = createColor(ime, label, wrapper, error);

				Z.dodajEvent(wrapper, "click", handleClick.bind(input));
			}

		}

		var handleClick = function(e) {

			// dobimo podatke o barvi
			var parent = e.srcElement || e.target;
			var data = Z.getData(parent.parentNode);

			// če je bil kliknjen element z barvo in ne njegov parent
			if (data.color) {
				// nastavimo text - barva
				this.value = data.color;

				// dobimo podatke o prejšni izbrani barvi - elementu
				var podatki = Z.getData(parent.parentNode.parentNode);

				// elementu "odizberemo"
				if (podatki.prejsni !== undefined) {
					Z.zamenjajClass(podatki.prejsni, "izbran", "neizbran");
				}
				// izberemo kliknjen element
				Z.zamenjajClass(parent.parentNode, "neizbran", "izbran");
				// nastavimo za naprej
				podatki.prejsni = parent.parentNode;
			}
		}


		for (var i = 0; i < elements.length; i++) {
			elements[i].unshift(i);

			// ustvarimo okna
			createWindow.apply(this, elements[i]);
		}

		var btn = Z.create("input", application.preFix + "-add-expense", {className: "add-expense", type: "button", value: "Dodaj"}, this.dodajExpenseElement);

		Z.addEvent(btn, "click", this.uporabnikDelaZExpensom.bind(this));
	}

	/**
	 * Uporabnik bi rad dodal expense
	 *
	 */
	ExpenseManager.prototype.uporabnikDelaZExpensom = function() {

		// dobimo vse inpute - razen zadnjega - gumb Dodaj
		if (this.dobiInpute().length === 6) {
			var elements = this.dobiInpute().slice( 0, -1);
		} else {
			var elements = this.dobiInpute().slice( 0, -2);
		}
		var data = {};

		// helper za prikaz errorja
		var showError = function (element, value) {
			if (value === undefined) {
				value = Z.getData(element).error;
			}
			if (element.parentNode.childNodes.length === 2) {
				Z.create("div", null, {className: "error", innerHTML: value}, element.parentNode);
			} else {
				element.parentNode.childNodes[2].innerHTML = value;
				Z.zamenjajClass(element.parentNode.childNodes[2], "hidden", "error");
			}
		}

		// preverimo vrednosti v inputih
		var preveriInpute = function() {
			var errorFree = true;
			for (var i = 0; i < elements.length; i++) {

				var element = elements[i];

				// uporabnik ni vnesel ničesar
				if (element.value.length === 0 || element.value === "") {
					errorFree = false;
					showError(element);
				} else {
					if (element.parentNode.childNodes.length === 3) {
						Z.zamenjajClass(element.parentNode.childNodes[2], "error", "hidden");
					}

					if (element.type === "number") {

						if (element.name === "polmer" && parseFloat(element.value, 10) < 70) {
							errorFree = false;
							showError(element, "Polmer mora biti večji ali enak 70");
						}

						if ((parseFloat(element.value, 10) <= 0) || isNaN(parseFloat(element.value, 10))) {
							showError(element);
							errorFree = false;
						}

						data[element.name] = parseFloat(element.value, 10);

					} else {
						data[element.name] = element.value;
					}
				}
			}

			return errorFree;
		}


		if (preveriInpute.call(this)) {

			// dobimo gumb prekliči
			var prekliciGumb = this.dobiInpute().slice(-1)[0].value === "Prekliči" ? this.dobiInpute().slice(-1)[0] : false;
			// preverimo ali imamo shranjene podatke
			var urejamo = prekliciGumb ? Z.getData(prekliciGumb) : {};

			// ustvarjamo nov element
			if (urejamo.expense === undefined)  {
				this.expenseDodan(data);
			}
			// editiramo starega
			else {

				// zapišemo vrednosti iz inputov
				for (var att in data){
					urejamo.expense[att] = data[att];
				}

				// kličemo funkcijo za update prikaza in pošiljanje eventa
				this.updateExpense.call(this,urejamo);

				// odstranimo podatke iz gumba
				Z.removeData(prekliciGumb);
				// skrijemo gumb nazaj
				Z.zamenjajClass(prekliciGumb, "show-btn", "hidden");
				this.dobiInpute().slice(-2, -1)[0].value ="Dodaj";

			}

			// spucamo inpute
			for (var i = 0; i < elements.length; i++) {
				elements[i].value = "";
			}

			var izbran = this.dodajExpenseElement.getElementsByClassName("izbran")[0];

			if (izbran && izbran.length !== 0) {
				Z.zamenjajClass(izbran, "izbran", "neizbran");
			}
		}
	}

	ExpenseManager.prototype.expenseDodan = function(data) {

		data.id = this.expenses.length;

		if (data.value === undefined) {
			data.value = 0;
		}
		this.expenses.push(data);
		this.ustvariElementeZaPrikazovanjeExpensa();
		Z.fireEvent(Z.body(), new Z.event("expenseAdded", data));
		Z.fireEvent(Z.body(), new Z.event("applicationSaveData", this.expenses));
	}
	/**
	 * User je uredil expense
	 */
	ExpenseManager.prototype.updateExpense = function(urejamoData){

		// dobimo spane
		var spans = urejamoData.wrapper.getElementsByTagName("span");

		// spremenimo barvo
		spans[2].style.backgroundColor = urejamoData.expense.barva;
		// spremenimo display name
		spans[3].innerHTML = urejamoData.expense.ime;

		// inputu spremenimo id
		var input = urejamoData.wrapper.getElementsByTagName("input")[0];
		input.id = null;
		// preverimo če že imamo nastavljen id
		var kajIscemo = "slidy-i-"+urejamoData.expense.ime;
		var counter = 1;

		while (document.getElementById(kajIscemo)) {
			kajIscemo = kajIscemo + counter++;
		}

		input.id = kajIscemo;

		// pošljemo event
		var e = new Z.event("expenseEdited", urejamoData.expense.id);

		Z.fireEvent(Z.body(), e);
		Z.fireEvent(Z.body(), new Z.event("applicationSaveData", this.expenses));
	}

	// ko se aplikacija naloži ustvarimo expense manager
	Z.addEvent(Z.body(), "applicationLoaded", function(){
		window.expenseManager = new ExpenseManager();
	});
})();

(function(){

	var testNum = 0;
	var testFail = 0;

	var manualTestElement;

	function preveri(value, desc) {

		var div = document.createElement("div");
		div.innerHTML = desc;

		if (value) {
			div.style.color = "green";
		} else {
			testFail++;
			div.style.color = "red";
		}

		testNum++;
		manualTestElement.appendChild(div);

	}

	window.onload = function() {

		manualTestElement = document.getElementById("manual-test");

		// če je kar koli narobe alert uporabnika
		assertThat(true, "pričakovan pass");

		var element = document.getElementById("test-results");

		preveri(element !== null, "Ustvaril sem div wrapper za testiranje");

		preveri(element.children.length === 4, "Ustvaril sem vse potrebne elemente");

		/**
		 *
		 *	Testiramo true
		 *
		 */
		var childs = Array.prototype.slice.call(element.children);
		var uls = Array.prototype.slice.call(document.getElementsByTagName("ul"));
		var ul = uls.pop();

		preveri(childs.pop() === ul, "Zadnji otrok v test-results je ul");

		preveri(ul.children.length === 1, "Ustvaril sem element v ul");

		preveri(ul.children[0].innerHTML === "pričakovan pass", "Vsebina prvega elementa v test-results je 'pričakovan pass'");

		preveri(ul.children[0].className.indexOf("pass") !== -1, "Prvi rezultat testiranja je dobil className 'pass'");

		preveri(element.children[0].children[0].children[0].innerHTML === "1", "Število uspešnih testov se je povečalo za 1");

		preveri(element.children[1].children[0].children[0].innerHTML === "0", "Število neuspešnih testov je ostalo 0");

		/**
		 *
		 *	Testiramo fail
		 *
		 */
		assertThat(true === false, "pričakovan fail");

		preveri(ul.children.length === 2, "Število elementov v ul se je povečalo za 1");

		preveri(ul.children[1].innerHTML === "pričakovan fail", "Drugi rezultat testiranja je dobil vrednost 'pričakovan fail'");

		preveri(ul.children[1].className.indexOf("fail") !== -1, "Drugi rezultat testiranja je dobil className 'fail'");

		preveri(element.children[0].children[0].children[0].innerHTML === "1", "Število uspešnih testov je ostalo 1");

		preveri(element.children[1].children[0].children[0].innerHTML === "1", "Število neuspešnih testov se je povečalo na 1");

		/**
		 *
		 *	Stestirali smo uporabi assertThat - deluje tako kot mora
		 *	Zato ga lahko od sedaj naprej normalno uporabljamo!
		 *	Zbrišemo script tag z test frameworkom in ga še enkrat dodamo - reset vsega!
		 *
		 */


		var rezultat = ["<br>Ročno testiranje končano. Število testov", testNum, "Število uspešnih", testNum - testFail, "Število neuspešnih", testFail];
		manualTestElement.innerHTML += rezultat.join(" ");
		manualTestElement.innerHTML += "<br>Do tukaj smo ročno preverjali assertThat - če je zgornje število neuspešnih enako 0, lahko z gotovostjo trdimo da le-ta deluje po pričakovanjih.";
		manualTestElement.innerHTML += "<br>Tako da od zdaj naprej namesto ročnega testiranja uporabljamo assertThat";
		manualTestElement.innerHTML += "<br>Odstranimo #framework in ga še enkrat dodamo - reset vrednosti/clean slate";

		document.body.removeChild(document.getElementById("framework"));
		document.body.removeChild(document.getElementById("test-results"));

		var script = document.createElement("script");
		script.type = "text/javascript";
		script.src = "test.js";

		document.body.appendChild(script);

		script.onload = function(){


			/**
			 *
			 *	Testiramo group
			 *
			 */
			testGroup("Testiramo skupino", function(){
				assertThat(1, "OK");
			});

			var uls = Array.prototype.slice.call(document.getElementsByTagName("ul"));
			var ul = uls[1];

			assertThat(ul.children.length === 1, "Pričakoval sem da bo imel ul 1 otroka");
			assertThat(ul.children[0].childNodes[0].nodeValue == "Testiramo skupino", "Pričakoval sem da bom pravilno poimenoval skupino");
			assertThat(ul.children[0].children.length === 2, "Pričakoval sem da bo imel 2 otroka");
			assertThat(ul.children[0].children[0].className.indexOf("expand-li") >= 0, "Pričakoval sem da bo imela skupino možnost skrij/pokaži");

			testGroup("Testiramo exception", function(){
				assertException("Pričakujemo exception", function(){
					throw new Error("hahaah");
				});

				// mockamo da imamo v testih samo passene teste, če ne bi mockali bi imeli en failan test
				var tempAssert = this.assertThat;

				// preverimo da smo ujeli false - ni bilo exceptiona
				var caught = false;
				this.assertThat = function(error, desc) {
					caught = caught;
				}
				assertException.call(this, "Ne pričakujemo exception - moramo failati", function(){});

				this.assertThat = tempAssert;

				assertThat(caught === false, "Ne pričakujemo exception-a");
			});

			assertThat(ul.children.length === 6, "Pričakoval sem da bo imel ul 6 otrok");
			assertThat(ul.children[5].childNodes[0].nodeValue === "Testiramo exception", "Pričakoval sem da bo pravilno poimenoval skupino");
			assertThat(ul.children[5].children.length === 2, "Pričakoval sem da bo imel nova skupina dva childa");
			assertThat(ul.children[5].children[1].children[0].innerHTML === "Pričakujemo exception", "Pričakoval sem da bom pravilno poimenoval prvi exception");
			assertThat(ul.children[5].children[1].children[1].innerHTML === "Ne pričakujemo exception-a", "Pričakoval sem da bom pravilno poimenoval drugi exception");
			assertThat(ul.children[5].children[1].children[0].className.indexOf("pass") >= 0, "Pričakoval sem da bo prvi exception passal");
			assertThat(ul.children[5].children[1].children[1].className.indexOf("pass") >= 0, "Pričakoval sem da bo drugi exception passal");

			/**
			 *
			 *	Testiramo mock
			 *
			 */

			 // objekt na katerem bomo izvajali mock
			 // objekti katere mockamo morajo biti definirani v window
			var A = function(){this.stevilo = 0;};
			A.prototype.dodajEna = function(){
				this.stevilo +=1;
			}
			A.prototype.dodajDva = function() {
				this.stevilo +=2;
			}
			A.prototype.vrni = function() {
				return true;
			}

			// shranimo original
			var dodajEna = A.prototype.dodajEna;

			testGroup("Testiramo mock", function(){

				var b = new A();
				b.dodajEna();
				b.dodajDva();

				assertThat(b.stevilo === 3, "Objekt, katerga bomo mockali se obnaša pravilno");
				var stevilo = 0;
				assertCalled("Uspešno mockal dodajEna", A, "dodajEna", function(){
					c = new A();
					c.dodajEna();
					c.dodajDva();

					stevilo = c.stevilo;
				});

				assertThat(stevilo === 2, "Uspešno mockal dodajEna, število = 2");
				assertThat(A.prototype.dodajEna !== dodajEna, "A prototype dodajEna ni enak original verziji dodajEna");
			});

			testGroup("Testiramo resetMocks", function(){
				resetMocks();
				assertThat(A.prototype.dodajEna === dodajEna, "Mock je bil uspešno povrnjen na original vrednost");
			});

			testGroup("Testiramo assertCalledAndReturn", function(){

				var vrnil = 0;
				var stevilo = 0;

				assertCalledAndReturn("Mockamo dodajEna - vrnil je 5", A, "dodajEna", 5, function(){
					var a = new A();
					vrnil = a.dodajEna();
					a.dodajDva();
					stevilo = a.stevilo;
				});

					assertThat(vrnil === 5, "Uspešno smo nazaj dobili 5");
				assertThat(stevilo === 2, "Število je 2");
			});

			var finish = document.createElement("div");
			finish.innerHTML = "Končal z testiranjem :)";

			document.body.appendChild(finish);
			document.getElementById("test-results").style.position = "inherit";
		}
	}
})();

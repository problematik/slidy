(function () {
    var listaElementov;
    listaElementov = {};
    /**
     * Moj mini library za tale projekt
     *
     */
    this.Zelim = this.Z = function (elem) {
        return Zelim.element(elem);
    };
    /**
     * Funkcija za hitrejše pridobivanje DOM elementov preko ID (in samo ID) elementa
     *
     * @param  elem Identifier
     * @return DOMElement
     */
    Z.element = function(elem){

        if (elem === undefined) {
            return;
        }
        // preverimo če je uporabnik podal DOM elementa
        // če je ga shranimo da ga lahko naslednjič hitreje dobimo
        // preverjanje ni bulletproof ampak za moj usecase je ok
        if (elem.tagName) {
            if (elem.id) {
                listaElementov[elem.id] = elem;
            }
            return elem;
        }
        // če je pa uporabnik podal string
        else if (typeof elem === "string") {

             // najprej preverimo če ga nimamo shranjenega - ga poiščemo in če ga najdemo ga shranimo
             if(listaElementov[elem] === undefined) {

                var element = document.getElementById(elem);
                if (element != null) {
                    listaElementov[elem] = element;
                }
                return element;
            }

        // če ga imamo shranjenega ga pa samo vrnemo
        return listaElementov[elem];
        }
    };

    /**
     * Dobimo body elementa
     *
     */
    Z.body = function () {

        if (listaElementov["__body__"] === undefined) {

            if (document.body) {
                listaElementov["__body__"] = document.body;

            return document.body;

            } else {
                var body = document.getElementsByTagsName("body")[0];

                listaElementov["__body__"] = body;

                return body;
            }
        }

        return listaElementov["__body__"];
    };

    /**
     * Naredimo kopijo objekta
     *
     * @param elem Objekt, ki ga kopiramo
     */
    Zelim.kopirati = Z.clone = function(elem) {

        var novi = {};
        for (var att in elem) {
            if (elem.hasOwnProperty(att)) {
                novi[att] = elem[att];
            }
        }

        return novi;
    }

    /**
     * Ustvarimo nov element, mu nastavimo id, attribute in appendamo elementu
     *
     * @param  tag Tag name novega elementa
     * @param  id ID novega elementa
     * @param  attributes Dodatni attributi za element, lahko jih skipamo in kar tu direktno podamo element
     * @param  parent Na kateri element naj ga appendamo - če ga ne podamo appendamo na document.body
     * @param  predElement Appendali ga bomo pred predElement
     *
     * @return HTMLElement
     */
    Zelim.novElement = Z.create = function(tag, id, attributes, parent, predElement) {

        if (tag === undefined || id === undefined) {
            throw new Error("Podati moraš tag in id");
        }

        var noviElement = document.createElement(tag);

        if (id !== null) {
            noviElement.id = id;
        }

        if (attributes === undefined && parent === undefined) {
            append(undefined);
        } else {

            if (attributes !== undefined) {
            // uporabnik je kot 3 argument passal parent, skipamo attributes
                if (attributes !== undefined  && (typeof attributes === "string" || (attributes.tagName && attributes.nodeType)) && parent === undefined) {
                    append(attributes);
                }
                // uporabnik je podal attribute
                else {
                    for (var att in attributes) {
                        if (att !== "type") {
                            noviElement[att] = attributes[att];
                        } else {
                            noviElement.setAttribute(att, attributes[att]);
                        }
                    }

                    append(parent);
                }
            }

            if (parent !== undefined) {
                append(parent);
            }
        }

        function append (parent) {
            // iščemo po ID-ju
            if (typeof parent === "string") {
                var el = Z.element(parent);
            }
            // uporabnik je podal HTML element
            else if (typeof parent === "object" && parent.tagName && parent.nodeType){
                var el = parent;
            }
            // appendamo na document.body
            else {
                var el = Z.body();
            }

            if (predElement !== undefined) {
                el.insertBefore(noviElement, predElement);
            } else {
                el.appendChild(noviElement);
            }
        }

        return noviElement;
    }

    /**
     * Za primer kjer feature support ni dovolj (miškine kooridnate) detectamo browser
     * http://stackoverflow.com/a/2401861
     * http://codepen.io/anon/pen/GxCeu
     *
     * @return Browser
     */
    Zelim.browser = (function () {
        var ua= navigator.userAgent, tem,
        M= ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];

        if (/trident/i.test(M[1])) {
            tem=  /\brv[ :]+(\d+)/g.exec(ua) || [];
            return 'IE '+(tem[1] || '');
        }
        if (M[1]=== 'Chrome') {
            tem= ua.match(/\bOPR\/(\d+)/)
            if(tem!= null) return 'Opera '+tem[1];
        }

        M= M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
        if((tem= ua.match(/version\/(\d+)/i))!= null) M.splice(1, 1, tem[1]);

        return M.join(" ");
    })();

    /**
     * NOPE!
     * Katera attributa naj uporabimo pri MouseEventu za x in y pozicijo, ker so drugacni od browserja do browserja
     * Ce smo natancni seveda...
     *
     * @return {x: att, y: att}
     */
    Zelim.mouseXYatt = (function(){
        if (Zelim.browser.indexOf("Chrome") === 0 || Zelim.browser.indexOf("IE") === 0) {
            return {x: "offsetX", y: "offsetY"}
        } else {
            return {x: "layerX", y: "layerY"};
        }
    })();

    /**
     * Preverimo ali so elementi podani enakim vrednostim
     * Omogoča overloading
     *
     * @param preverjamoVrednosti Katerim vrednostim mora ustrezati
     * @param .... Kaj preverjamo
     * @return true|i, vrednost] Če je vse ok vrnemo true, če ne podamo array; (i = kateri element po vrsti) je bil napačne vrednosti (vrednost = dejanska vrednost)
     */
    Zelim.preveritiVrednosti = Z.preveriVrednosti = function(preverjamoVrednosti){

       var kajPreverjamo = Array.prototype.slice.call(arguments, 1);

        for (var i in kajPreverjamo) {
            for (var j in preverjamoVrednosti) {

                if (preverjamoVrednosti[j] === "NaN") {
                    if (isNaN(kajPreverjamo[i])) {
                        return [++i, "NaN"];
                    }
                } else if (kajPreverjamo[i] === preverjamoVrednosti[j]) {
                        return [++i, kajPreverjamo[i]];
                }
            }
       }

       return true;
    }

    /**
     * Podanemu elementu zamenjamo class
     *
     * @param  elem Na katerem elementu delamo
     * @param  toGo Kateri class bomo zamenjali
     * @param  toStay S katerim classom ga bomo zamenjali
     */
    Zelim.zamenjatiClass = Z.zamenjajClass = function(elem, toGo, toStay ) {
        // sprehodimo se po class-ih elementa in brišemo vn class toGo, vrinemo notri toStay
        var classes = Array.prototype.slice.call(elem.classList, 0);

        var newClasses = [toStay];
        for (var j = 0; j < classes.length; j++) {
            if (classes[j] !== toGo && classes[j] !== toStay) {
                newClasses.push(classes[j]);
            }
        }

        elem.className = newClasses.join(" ");
    }

    Zelim.izdatek = function(elem) {
        return Z.element(elem).value;
    }
})();

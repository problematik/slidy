(function () {

    // http://gianlucaguarini.github.io/Tocca.js/demo-fun.html
    var TouchHandler = function (data) {
        this.element = Z.element("testing");

        // http://stackoverflow.com/questions/4817029/whats-the-best-way-to-detect-a-touch-screen-device-using-javascript/4819886#4819886
        var podpiramoTouch = 'ontouchstart' in window // works on most browsers
                               || 'onmsgesturechange' in window; // works on ie10

        // če je user v configu povedal da na touch dovolimo samo touch
        this.mouseAllowed = data.mouseAllowed || podpiramoTouch ? false : true;

        this.prejsni = {};

        // ali ima user tipko/prst dol
        this.clicked = false;
        // kolikokrat se je v tapCas zgodil klik
        this.steviloClick = 0;
        // id za timeout
        this.tapTimer = 0;
        // cas med dvema klikoma da se šteje kot klik
        this.tapCas = 200;
        // treshold za tap
        this.tapZamik = 30;

        this.prejX = this.prejY = this.zdajX = this.zdajY = null;
        this.elementPrejX = this.elementPrejY = null;

        this.callbackId = 0;
        this.callbacks = {};
    }

    /**
     * Dodamo element za katerega hocemo listenerje
     *
     * @param element Za kateri element gre
     * @param callback Kaj naj se klico za vsak event
     */
    TouchHandler.prototype.add = function (element, callback) {

        this.callbackId++;

        this.callbacks[this.callbackId] = {element: element, callback: callback};

        this.bindHandlers(element);

        return this.callbackId;
    }

    TouchHandler.prototype.remove = function (id) {

        this.removeHandlers(id);

        delete this.callbacks[id];
    }

    TouchHandler.prototype.dolociEvente = function () {

        var events = {touchStart: "touchstart",
                      touchMove: "touchmove",
                      touchEnd: "touchend"}

        if (this.mouseAllowed) {
            events.touchStart += " mousedown";
            events.touchMove += " mousemove";
            events.touchEnd += " mouseup";
        }

        return events;
    }

    TouchHandler.prototype.bindHandlers = function (element) {

        var events = this.dolociEvente();

        for (var e in events) {

            var ee = events[e].split(" ");
            var i = ee.length;

            while(i--) {
                Z.addEvent(element, ee[i], this[e].bind(this));
            }
        }
    }

    TouchHandler.prototype.removeHandlers = function (id) {

        var events = this.dolociEvente();
        Z.removeEvent(this.callbacks[id].element);

        delete this.callbacks[id];
    }

    TouchHandler.prototype.getEventData = function(e) {
        e.podpiramoTouch = this.podpiramoTouch;
        e.tapZamik = this.tapZamik;
        return e.targetTouches ? e.targetTouches[0] : e;

    }

    /**
     * Preverimo ali je slucajno pri prislo do double tapa ali imamo navadni click
     *
     * @param  {[type]} e [description]
     */
    TouchHandler.prototype.handleClick = function(e) {

        if(this.prejX >= this.zdajX - this.tapZamik &&
           this.prejX <= this.zdajX + this.tapZamik &&
           this.prejY >= this.zdajY - this.tapZamik &&
           this.prejY <= this.zdajY + this.tapZamik &&
           this.clicked === false) {

            e.what = (this.steviloClick === 2) ? "doubleTap" : "click";

            for (var komu in this.callbacks) {

                this.callbacks[komu].callback(e);
            }

            this.steviloClick = 0;
        }
    }

    TouchHandler.prototype.touchStart = function (e) {

        this.clicked = true;
        this.steviloClick++;

        var data = this.getEventData(e);

        e = this.dobiPozicijoMiskeVElement(e);

        this.dolociSmer(e);

        this.prejX = this.zdajX = data.pageX;

        this.prejY = this.zdajY = data.pageY;

        this.elementPrejX = data.elementX;
        this.elementPrejY = data.elementY;

        clearTimeout(this.tapTimer);

        this.tapTimer = setTimeout(this.handleClick.bind(this, e), this.tapCas);

    }

    TouchHandler.prototype.touchMove = function (e) {

        if (this.clicked) {

            var data = this.getEventData(e);

            e = this.dobiPozicijoMiskeVElement(e);

            this.prejX = this.zdajX;
            this.prejY = this.zdajY;
            this.zdajX = data.pageX;
            this.zdajY = data.pageY;

            e = this.dolociSmer(e);

            this.elementPrejX = data.elementX;
            this.elementPrejY = data.elementY;

            e.what = "move";

            e.preventDefault();
            for (var komu in this.callbacks) {

                this.callbacks[komu].callback(e);
            }
        }
    }

    TouchHandler.prototype.dobiPozicijoMiskeVElement = function(e) {

        if (e.changedTouches) {
            var touchobj = e.changedTouches[0];
            var parent = e.changedTouches[0].target.getBoundingClientRect();

            var y = touchobj.clientY - parent.top;
            var x = touchobj.clientX - parent.left;

        } else {

            var parent = e.srcElement.getBoundingClientRect();

            var y = e.clientY - parent.top;
            var x = e.clientX - parent.left;

        }

        // nastavimo X in Y elementa
        e.elementX = x;
        e.elementY = y;

        return e;
    }

    /**
     * Določimo smer vrtenja
     *
     * @param  sredina Podatki o sredini - okoli česa se vrtimo
     *
     * @return -1|1; -1 = levo 1 = desno
     */
     TouchHandler.prototype.dolociSmer = function (e) {

             var rect = e.srcElement.getBoundingClientRect();

             var sirina = rect.width/2;
             var visina = rect.height/2;



         var x1 = e.elementX - sirina;
         var y1 = e.elementY - visina;
         var x2 = this.elementPrejX - sirina;
         var y2 = this.elementPrejY - visina;

         var kotZdaj = this.dolociKot(x1, y1);
         var kotPrej = this.dolociKot(x2, y2);




         if (kotZdaj < kotPrej) {
             e.smer = -1;
             e.smerOznaka = "levo";
         } else {
             e.smer = 1;
             e.smerOznaka = "desno";
         }

         if (kotZdaj >= 359 && kotZdaj <= 360 && kotPrej >= 0 && kotPrej <= 1) {
         console.group("NASTVLJAM");
            console.log("ROBNA NASTAVLJENA NA -1 SMER", e.smer);
            e.skoziRob = -1;
            e.smer = -1;
         console.groupEnd();
         } else if (kotZdaj>= 0 && kotZdaj <= 1 && kotPrej >= 359 && kotPrej <= 360){
            console.group("NASTVLJAM");
            console.log("ROBNA NASTAVLJENA NA 1 SMER", e.smer);
            e.skoziRob = 1;
            e.smor = 1;
         console.groupEnd();
         }
         e.elementSirina = sirina;
         e.elementVisina = visina;
         e.kot = kotZdaj;
         e.kotPrej = kotPrej;
         return e;
     }

    TouchHandler.prototype.dolociKot = function (e, ey) {

        if (e.srcElement) {
            var box = e.srcElement.getBoundingClientRect();

            var sirina = box.width/2;
            var visina = box.height/2;

            var x = e.elementX - sirina;
            var y = e.elementY - visina;

            e.elementSirina = sirina;
            e.elementVisina = visina;

        } else {
            var x = e
            var y = ey;
        }

        var rad = Math.atan2(x, y);
        // var rad = Math.atan2(x,y);

        // prištejemo 90 da je origin med 3 in 4 - glej spodaj
        var kot = rad * 180 / Math.PI + 90;

        /**
        *     |
        *   3 | 4
        * ----------
        *   2 | 1
        *     |
        *
        *  Ker obmocju 3 vraca negativne vrednosti
        */
        if (kot < 0) {
            var kot = 270 + Math.abs(kot);
            return kot;
        }
        var kot = Math.abs(270 - kot);
        return kot;
    }

    TouchHandler.prototype.touchEnd = function (e) {

        e.what = "clickEnd";

        this.clicked = false;
        this.elementVisina = null;
        this.elementSirina = null;

        e.preventDefault();
        for (var komu in this.callbacks) {

            this.callbacks[komu].callback(e);
        }

    }

    Z.dodajEvent(Z.body(), "applicationLoaded", function(data){

        window["touchHandler"] = new TouchHandler(data);

    });
})();

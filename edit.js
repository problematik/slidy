(function(){

	var EditMode = function() {
		this.element = Z.create("div", window.application.preFix + "-edit-text", {className: "edit-mode hidden"}, window.application.rootElement);

		Z.addEvent(Z.body(), "sliderLiveUpdate", this.izrisiValue.bind(this));
		Z.addEvent(Z.body(), "sliderEditingStart", this.show.bind(this));
		Z.addEvent(Z.body(), "sliderEditingEnd", this.hide.bind(this));
	}

	EditMode.prototype.izrisiValue = function(e) {
		this.element.innerHTML = Math.floor(e.data.value);
	}

	EditMode.prototype.show = function() {
		Z.zamenjajClass(this.element, "hidden", "show");
	}

	EditMode.prototype.hide = function() {
		Z.zamenjatiClass(this.element, "show", "hidden");
	}

	Z.addEvent(Z.body(), "applicationLoaded", function(){
		var editor = new EditMode();
	});
})();

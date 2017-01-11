
lychee.define('lychee.ai.neat.Gene').exports(function(lychee, global, attachments) {

	let Composite = function(data) {

		this.into = 0;
		this.out = 0;
		this.weight = 0.0;
		this.enabled = true;
		this.innovation = 0;

	};


	Composite.prototype = {

		copyGene: function() {

			let clone = new Composite();

			clone.into       = this.into;
			clone.out        = this.out;
			clone.weight     = this.weight;
			clone.enabled    = this.enabled;
			clone.innovation = this.innovation;


			return clone;

		}

	};


	return Composite;

});


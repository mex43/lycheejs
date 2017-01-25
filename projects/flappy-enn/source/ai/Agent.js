
lychee.define('game.ai.Agent').requires([
	'lychee.ai.bnn.Brain',
	'lychee.policy.Position',
	'game.policy.Plane'
]).includes([
	'lychee.ai.Agent'
]).exports(function(lychee, global, attachments) {

	const _Agent    = lychee.import('lychee.ai.Agent');
	const _Plane    = lychee.import('game.policy.Plane');
	const _Position = lychee.import('lychee.policy.Position');
	const _Brain    = lychee.import('lychee.ai.bnn.Brain');



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(data) {

		let settings = Object.assign({}, data);


		let sensors  = [];
		let controls = [];
		let plane    = new _Plane({
			entity: settings.plane,
			limit:  settings.limit
		});

		let goal     = new _Position({
			entity: settings.goal,
			limit:  settings.limit
		});


		sensors.push(plane);
		sensors.push(goal);
		controls.push(plane);
		this.__expected = goal;


		settings.brain = new _Brain({
			sensors:  sensors,
			controls: controls
		});


		_Agent.call(this, settings);

		settings = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Agent.prototype.serialize.call(this);
			data['constructor'] = 'game.ai.Agent';

		},



		/*
		 * CUSTOM API
		 */

		reward: function(diff) {

			let training = {
				iterations: diff,
				inputs:     this.brain._inputs.slice(0),
				outputs:    this.__expected.sensor()
			};

			return _Agent.prototype.reward.call(this, diff, training);

		},

		punish: function(diff) {

			let training = {
				iterations: diff,
				inputs:     this.brain._inputs.slice(0),
				outputs:    this.__expected.sensor()
			};

			return _Agent.prototype.punish.call(this, diff, training);

		}

	};


	return Composite;

});


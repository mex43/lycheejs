
lychee.define('game.state.Game').requires([
	'lychee.ai.Layer',
	'lychee.math.Mersenne',
	'lychee.ui.entity.Label',
	'game.ai.Agent',
	'game.effect.Explosion',
	'game.entity.Goal',
	'game.entity.Plane',
	'game.ui.sprite.Background'
]).includes([
	'lychee.app.State'
]).exports(function(lychee, global, attachments) {

	const _Agent     = lychee.import('game.ai.Agent');
	const _Explosion = lychee.import('game.effect.Explosion');
	const _Goal      = lychee.import('game.entity.Goal');
	const _Mersenne  = lychee.import('lychee.math.Mersenne');
	const _Plane     = lychee.import('game.entity.Plane');
	const _State     = lychee.import('lychee.app.State');
	const _BLOB      = attachments["json"].buffer;



	/*
	 * HELPERS
	 */

	const _reset_goals = function() {

		let goals   = this.__cache.goals;
		let twister = this.twister;
		let width   = this.renderer.width;
		let height  = this.renderer.height;

		let offsetx =  1 / 2 * width;
		let offsety = -1 / 2 * height + 128;

		for (let g = 0, gl = goals.length; g < gl; g++) {
			offsetx = Math.max(offsetx, goals[g].position.x);
		}


		for (let g = 0, gl = goals.length; g < gl; g++) {

			let goal = goals[g];
			if (goal.position.x < -1 / 2 * width) {
				goal.position.x = offsetx;
				goal.position.y = offsety + (twister.random() * (height - 256)) | 0;
				offsetx += 256;
			}

		}

	};

	const _reset_planes = function() {

		let planes = this.__cache.planes;
		let width  = this.renderer.width;
		let height = this.renderer.height;

		for (let p = 0, pl = planes.length; p < pl; p++) {

			let plane = planes[p];
			if (plane.position.y >  1 / 2 * height) {
				plane.position.x = -1 / 2 * width + plane.width;
				plane.position.y = 0;
			}


			plane.alive = true;

		}

	};


	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(main) {

		_State.call(this, main);


		this.twister = new _Mersenne(1337);


		this.__cache = {
			agents:     [],
			background: null,
			goals:      [],
			info:       null,
			planes:     []
		};

		this.__statistics = {
			generation: 1,
			score:      0,
			highscore:  0
		};


		this.deserialize(_BLOB);



		/*
		 * INITIALIZATION
		 */

		let viewport = this.viewport;
		if (viewport !== null) {

			viewport.bind('reshape', function(orientation, rotation) {

				let renderer = this.renderer;
				if (renderer !== null) {

					let entity = null;
					let width  = renderer.width;
					let height = renderer.height;


					entity = this.queryLayer('bg', 'background');
					entity.trigger('reshape', [ null, null, width, height ]);
					this.__cache.background = entity;

					entity = this.queryLayer('ui', 'info');
					entity.setPosition({
						y: -1 / 2 * height + 32
					});
					this.__cache.info = entity;

				}

			}, this);

		}

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			let data = _State.prototype.serialize.call(this);
			data['constructor'] = 'game.state.Game';


			return data;

		},

		deserialize: function(blob) {

			_State.prototype.deserialize.call(this, blob);


			let cache    = this.__cache;
			let renderer = this.renderer;
			let layer    = this.getLayer('ai');

			if (renderer !== null && layer !== null) {

				let limit = {
					x: renderer.width,
					y: renderer.height,
					z: 1
				};


				layer = this.getLayer('game');

				for (let p = 0; p < 64; p++) {
					let plane = new _Plane();
					cache.planes.push(plane);
					layer.addEntity(plane);
				}

				_reset_planes.call(this);


				for (let g = 0; g < (renderer.width / 256); g++) {
					let goal = new _Goal();
					cache.goals.push(goal);
					layer.addEntity(goal);
				}

				_reset_goals.call(this);


				layer = this.getLayer('ai');
				layer.unbind('epoche');

				for (let a = 0; a < cache.planes.length; a++) {

					let agent = new _Agent({
						plane: cache.planes[a],
						goal:  cache.goals[0],
						limit: limit
					});
					cache.agents.push(agent);
					layer.addAgent(agent);

					// XXX: agent.__expected.entity

				}

			}

		},



		/*
		 * CUSTOM API
		 */

		enter: function(oncomplete) {

			_reset_goals.call(this);
			_reset_planes.call(this);


			let input = new lychee.Input({
				touch: true
			});

			input.bind('touch', function() {

				let plane = this.__cache.planes[0] || null;
				if (plane !== null) {
					plane.flap();
				}

			}, this);


			if (oncomplete !== null) {
				oncomplete(true);
			}

		},

		update: function(clock, delta) {

			_State.prototype.update.call(this, clock, delta);


			let cache  = this.__cache;
			let width  = this.renderer.width;
			let height = this.renderer.height;


			let background = cache.background;
			if (background !== null) {

				let origin = background.origin.x - (delta / 1000) * 128;
				background.origin.x  = (origin % background.width) | 0;
				background.__isDirty = true;

			}


			let agents = cache.agents;
			let goals  = cache.goals;
			let planes = cache.planes;

			for (let g = 0, gl = goals.length; g < gl; g++) {

				let goal = goals[g];

				for (let p = 0, pl = planes.length; p < pl; p++) {

					let plane = planes[p];

					if (plane.alive === true && goal.collidesWith(plane) === true) {

						if (plane.effects.length === 0) {
							plane.addEffect(new _Explosion({
								position: plane.position
							}));
						}

						plane.alive = false;

					}

					if (plane.alive === true) {

						let agent = agents[p] || null;
						if (agent !== null) {

							// agent.__expected.entity = next_goal;

							// TODO: Update agent
							// agent.update();

						}


						if (plane.position.y > 1 / 2 * height) {

							if (plane.effects.length === 0) {
								plane.addEffect(new _Explosion({
									position: plane.position
								}));
							}

							plane.alive = false;

						}

					}

				}


				// TODO: Collision detection
				// TODO: Plane interaction

				if (goal.position.x < -1 / 2 * width) {
					_reset_goals.call(this);
				}

			}

		}

	};


	return Composite;

});


lychee.define('harvester.Watcher').requires([
	'harvester.data.Filesystem',
	'harvester.data.Project',
	'harvester.mod.Beautifier',
	'harvester.mod.Fertilizer',
	'harvester.mod.Packager',
	'harvester.mod.Server'
//	'harvester.mod.Strainer',
//	'harvester.mod.Updater'
]).exports(function(lychee, global, attachments) {

	const _Filesystem = lychee.import('harvester.data.Filesystem');
	const _Project    = lychee.import('harvester.data.Project');
	const _mod        = {
		Beautifier: lychee.import('harvester.mod.Beautifier'),
		Fertilizer: lychee.import('harvester.mod.Fertilizer'),
		Packager:   lychee.import('harvester.mod.Packager'),
		Server:     lychee.import('harvester.mod.Server'),
		Strainer:   null,
		Updater:    null
		// Strainer:   lychee.import('harvester.mod.Strainer'),
		// Updater:    lychee.import('harvester.mod.Updater')
	};



	/*
	 * HELPERS
	 */

	const _update_cache = function() {

		this.filesystem.dir('/libraries').filter(function(value) {
			return /README\.md/.test(value) === false;
		}).map(function(value) {
			return '/libraries/' + value;
		}).forEach(function(identifier) {

			let check = this.libraries[identifier] || null;
			let info1 = this.filesystem.info(identifier + '/lychee.pkg');

			if (check === null && (info1 !== null && info1.type === 'file')) {
				this.libraries[identifier] = new _Project(identifier);
			}

		}.bind(this));

		this.filesystem.dir('/projects').filter(function(value) {
			return /cultivator|README\.md/.test(value) === false;
		}).map(function(value) {
			return '/projects/' + value;
		}).forEach(function(identifier) {

			let check = this.projects[identifier] || null;
			let info1 = this.filesystem.info(identifier + '/index.html');
			let info2 = this.filesystem.info(identifier + '/lychee.pkg');

			if (check === null && ((info1 !== null && info1.type === 'file') || (info2 !== null && info2.type === 'file'))) {
				this.projects[identifier] = new _Project(identifier);
			}

		}.bind(this));

		this.filesystem.dir('/projects/cultivator').filter(function(value) {
			return /design|index\.html|robots\.txt/.test(value) === false;
		}).map(function(value) {
			return '/projects/cultivator/' + value;
		}).forEach(function(identifier) {

			let check = this.projects[identifier] || null;
			let info1 = this.filesystem.info(identifier + '/index.html');
			let info2 = this.filesystem.info(identifier + '/lychee.pkg');

			if (check === null && ((info1 !== null && info1.type === 'file') || (info2 !== null && info2.type === 'file'))) {
				this.projects[identifier] = new _Project(identifier);
			}

		}.bind(this));

	};

	const _update_mods = function() {

		let Fertilizer = _mod.Fertilizer;
		let Packager   = _mod.Packager;
		let Server     = _mod.Server;
		let Strainer   = _mod.Strainer;
		let Updater    = _mod.Updater;
		let sandbox    = this.sandbox;

		if (sandbox === true) {

			Fertilizer = null;
			Server     = null;
			Strainer   = null;

		} else {

			// Fertilizer is disabled for now
			// (Performance reasons)
			Fertilizer = null;

		}


		// TODO: Check if libraries and projects still exist


		for (let lid in this.libraries) {

			let library = this.libraries[lid];

			if (Packager !== null && Packager.can(library) === true) {
				Packager.process(library);
			}

			if (Server !== null && Server.can(library) === true) {
				Server.process(library);
			}

			if (Updater !== null && Updater.can(library) === true) {
				Updater.process(library);
			}

			if (Strainer !== null && Strainer.can(library) === true) {
				Strainer.process(library);
			}

			if (Fertilizer !== null && Fertilizer.can(library) === true) {
				Fertilizer.process(library);
			}

		}

		for (let pid in this.projects) {

			let project = this.projects[pid];

			if (Packager !== null && Packager.can(project) === true) {
				Packager.process(project);
			}

			if (Server !== null && Server.can(project) === true) {
				Server.process(project);
			}

			if (Updater !== null && Updater.can(project) === true) {
				Updater.process(project);
			}

			if (Strainer !== null && Strainer.can(project) === true) {
				Strainer.process(project);
			}

			if (Fertilizer !== null && Fertilizer.can(project) === true) {
				Fertilizer.process(project);
			}

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(main) {

		this.filesystem = new _Filesystem();
		this.libraries  = {};
		this.projects   = {};
		this.sandbox    = true;


		// Figure out if there's a cleaner way
		main._libraries = this.libraries;
		main._projects  = this.projects;

	};

	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			return {
				'constructor': 'harvester.Watcher',
				'arguments':   []
			};

		},


		// TODO: can(project)?

		init: function(sandbox) {

			sandbox = sandbox === true;


			if (sandbox === true) {

				console.info('harvester.Watcher: SANDBOX mode active');
				console.info('harvester.Watcher: Software bots disabled');
				console.log('\n\n');

				this.sandbox = true;

			} else {

				console.info('harvester.Watcher: SANDBOX mode inactive');
				console.info('harvester.Watcher: Software bots enabled');
				console.log('\n\n');

				this.sandbox = false;

			}


			_update_cache.call(this);


			for (let lid in this.libraries) {

				let library = this.libraries[lid];

				if (_mod.Packager !== null && _mod.Packager.can(library) === true) {
					_mod.Packager.process(library);
				}

				if (_mod.Beautifier !== null && _mod.Beautifier.can(library) === true) {
					_mod.Beautifier.process(library);
				}

				if (_mod.Server !== null && _mod.Server.can(library) === true) {
					_mod.Server.process(library);
				}

			}

			for (let pid in this.projects) {

				let project = this.projects[pid];

				if (_mod.Packager !== null && _mod.Packager.can(project) === true) {
					_mod.Packager.process(project);
				}

				if (_mod.Beautifier !== null && _mod.Beautifier.can(project) === true) {
					_mod.Beautifier.process(project);
				}

				if (_mod.Server !== null && _mod.Server.can(project) === true) {
					_mod.Server.process(project);
				}

			}

		},

		update: function() {

			_update_mods.call(this);

		}

	};


	return Composite;

});


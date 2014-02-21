/**
 * COOL4CODE
 * Authors:
 *
 * Alejandro Zarate: azarate@cool4code.com,
 * Marcos Aguilera: maguilera@cool4code.com,
 * Paola Vanegas: pvanegas@cool4code.com,
 * David Alméciga: walmeciga@cool4code.com"
 */

define(function(require) {

	"use strict";

	var $ = require('jquery'),
		dane = require('app/fixtures/dane'),
		moment = require('moment');

	var app = {

		deferred: $.Deferred(),

		countSur: 0,

		countDci: 0,

		countDirectorio: 0,

		countDemanda: 0,

		dataSur: [],

		dataDci: [],

		dataDirectorio: [],

		dataDemanda: [],

		dataDane: dane,

		checkUpdatedData: function() {
			console.log("checkUpdatedData: Comprobando si los datos están actualizados!");
			app.deferred.notify({ msg: "Comprobando datos actualizados!" , count: 0 });
			var updated = window.localStorage.getItem("updated");			

			if (updated && moment() < moment(updated).add(7, "days")) {
				console.log("checkUpdatedData: Los datos están actualizados! " + updated);
				return true;
			} else {
				console.log("checkUpdatedData: Los datos no están actualizados!");
				return false;
			}
		},

		loadSur: function() {
			console.log("loadSur: Consultando open data!");
			app.deferred.notify({ msg: "Descargando datos: Sur-sur!" , count: 14.3 });
			var url = "http://servicedatosabiertoscolombia.cloudapp.net/v1/APC/sursur?$format=json&$filter=id>" + app.countSur;
			var xhr = app.getJson(url);
			xhr.success(function(r) {
				console.log("loadSur: Descarga completa!");
				$.each(r.d, function(k, v) {
					app.dataSur.push(v);
				});
				if (r.d.length == 1000) {
					app.countSur = app.countSur + 1000;
					app.loadSur();
				} else {
					console.log("loadSur: Se descargaron los datos completos de open data!");					
					app.loadDci();
				}
			});
			console.log("loadSur: " + url);
		},

		loadDci: function() {
			console.log("loadDci: Consultando open data!");
			app.deferred.notify({ msg: "Descargando datos: Dci!" , count: 28.6 });
			var url = "http://servicedatosabiertoscolombia.cloudapp.net/v1/APC/dci?$format=json&$filter=id>" + app.countDci;
			var xhr = app.getJson(url);
			xhr.success(function(r) {
				$.each(r.d, function(k, v) {
					app.dataDci.push(v);
				});
				if (r.d.length == 1000) {
					app.countDci = app.countDci + 1000;
					app.loadDci();
				} else {
					console.log("loadDci: Se descargaron los datos completos de open data!");
					app.loadDirectorio();
				}
			});
			console.log("loadDci: " + url);
		},

		loadDirectorio: function(cb) {
			console.log("loadDirectorio: Consultando open data!");
			app.deferred.notify({ msg: "Descargando datos: Directorio!" , count: 42.9 });
			var url = "http://servicedatosabiertoscolombia.cloudapp.net/v1/APC/directorio?$format=json&$filter=id>" + app.countDirectorio;
			var xhr = app.getJson(url);
			xhr.success(function(r) {
				$.each(r.d, function(k, v) {
					app.dataDirectorio.push(v);
				});
				if (r.d.length == 1000) {
					app.countDirectorio = app.countDirectorio + 1000;
					app.loadDirectorio();
				} else {
					console.log("loadDirectorio: Se descargaron los datos completos de open data!");
					app.loadDemanda();
				}
			});
			console.log("load: " + url);
		},

		loadDemanda: function(cb) {
			console.log("loadDemanda: Consultando open data!");
			app.deferred.notify({ msg: "Descargando datos: Proyectos!" , count: 57.2 });
			var url = "http://servicedatosabiertoscolombia.cloudapp.net/v1/APC/demanda?$format=json&$filter=id>" + app.countDemanda;
			var xhr = app.getJson(url);
			xhr.success(function(r) {
				$.each(r.d, function(k, v) {
					app.dataDemanda.push(v);
				});
				if (r.d.length == 1000) {
					app.countDemanda = app.countDemanda + 1000;
					app.loadDemanda();
				} else {
					console.log("loadDemanda: Se descargaron los datos completos de open data!");					
					app.createDB();
				}
			});
			console.log("load: " + url);
		},

		getJson: function(url) {
			return $.ajax({
				type: "GET",
				url: url,
				dataType: 'jsonp',
				error: function() {
					console.error("El repositorio de datos Open Data no está disponible ó se ha perdido la conexión con la red!");
					navigator.notification.alert('El repositorio de datos Open Data no está disponible ó se ha perdido la conexión con la red, inténtalo más tarde!', function() {
					}, 'Atención', 'Reintentar');
				}
			});
		},

		createDB: function() {
			console.log("createDB: Creando base de datos!");
			app.deferred.notify({ msg: "Creando base de datos!" , count: 71.5 });
			var db = window.openDatabase("apc", "1.0", "APC - Agencia Presidencial de la Cooperación en Colombia", 4145728);
			db.transaction(app.populateDB, app.errorDB, app.successDB);
		},

		populateDB: function(tx) {
			console.log("populateDB: Creando tablas!");
			app.deferred.notify({ msg: "Insertando datos!" , count: 85.8 });

			var tables = [{
				name: "sursur",
				fields: [],
				data: "dataSur"
			}, {
				name: "dci",
				fields: [],
				data: "dataDci"
			}, {
				name: "directorio",
				fields: [],
				data: "dataDirectorio"
			}, {
				name: "demanda",
				fields: [],
				data: "dataDemanda"
			}, {
				name: "dane",
				fields: [],
				data: "dataDane"
			}];

			$.each(tables, function(k, v) {
				$.each(app[v.data][0], function(k1, v1) {
					v.fields.push(k1);
				});
			});

			$.each(tables, function(k, v) {
				tx.executeSql('DROP TABLE IF EXISTS ' + v.name);

				console.log("populateDB: Creando tabla " + v.name + "!");
				tx.executeSql('CREATE TABLE IF NOT EXISTS ' + v.name + ' (' + v.fields.join() + ')');

				console.log("populateDB: Insertando registros en la tabla datos " + v.name + "!");
				$.each(app[v.data], function(k1, v1) {
					var values = [];
					$.each(v1, function(k2, v2) {
						values.push("'" + v2 + "'");
					});
					var sql = 'INSERT INTO ' + v.name + ' (' + v.fields.join() + ') VALUES (' + values.join() + ')';
					tx.executeSql(sql);
				});

			});			
		},

		successDB: function() {
			console.log("successDB: Base de datos creada con éxito!");
			console.log("successDB: Guardando fecha de actualización!");
			app.deferred.notify({ msg: "Base de datos creada con éxito!" , count: 99.9 });

			var updated = new Date();
			window.localStorage.setItem("updated", updated);
			$("#date").html("<strong>" + updated + "</strong>");

			app.init();
		},

		errorDB: function(err) {
			console.error(err);
			app.deferred.reject("Error en la base de datos!");
		},

		init: function() {
			console.log('init: Go app!');
			app.deferred.resolve({ msg: "Datos actualizados!" , count: 100 });
		}
	};


	return function() {
		if (app.checkUpdatedData()) {
			app.init();
		} else {
			app.loadSur();
		}

		return app.deferred.promise();
	};

});
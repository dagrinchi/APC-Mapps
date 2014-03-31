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

	var baseapc = function(odb) {
		this.odb = odb;
	};

	baseapc.prototype = {

		constructor: baseapc,

		execute: function(sql, cb) {

			this.odb.transaction(

				function(tx) {
					tx.executeSql(sql, [], function(tx, results) {
						var len = results.rows.length;
						var dataCollection = [];
						for (var i = 0; i < len; i = i + 1) {
							dataCollection[i] = results.rows.item(i);
						}
						cb(dataCollection);
					});
				},

				function(err) {
					console.log(err);
				});
		}

	};

	return baseapc;

});
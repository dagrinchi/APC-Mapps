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

	var $ = require('jquery');
	var Baseapc = require('app/utils/basedb');

	var db = new Baseapc(window.openDatabase("apc", "1.0", "APC - Agencia Presidencial de la Cooperación en Colombia", 4145728));

	var findAll = function() {
		var deferred = $.Deferred();
		db.execute("SELECT DISTINCT * FROM dci INNER JOIN (SELECT dci.terrirorio terr, dane.lat, dane.long FROM dci INNER JOIN dane ON (dane.nomdep LIKE dci.terrirorio and dane.codmun = '') or(dane.nommun LIKE dci.terrirorio) GROUP BY dci.terrirorio) dciterr ON dciterr.terr = dci.terrirorio ", function(d) {
			deferred.resolve(d);
		});
		return deferred.promise();
	};

	var findBySelection = function() {
		var deferred = $.Deferred();
		var sql = buildSQL();
		db.execute(sql, function(d) {
			deferred.resolve(d);
		});
		return deferred.promise();
	};

	var buildSQL = function() {
		var selection = {
			cols: [],
			vals: []
		};
		$.each(APC.selection.dci.cols, function(k1, v1) {
			if (v1.length > 0) {
				selection.cols.push(k1);
				selection.vals.push(v1);
			}
		});
		var sql = "SELECT DISTINCT * FROM dci INNER JOIN (SELECT dci.terrirorio terr, dane.lat, dane.long FROM dci INNER JOIN dane ON (dane.nomdep LIKE dci.terrirorio and dane.codmun = '') or(dane.nommun LIKE dci.terrirorio) GROUP BY dci.terrirorio) dciterr ON dciterr.terr = dci.terrirorio ";
		$.each(selection.vals, function(k1, v1) {
			if (k1 === 0) {
				sql += "WHERE (";
			} else {
				sql += " AND (";
			}
			$.each(v1, function(k2, v2) {
				if (k2 > 0) {
					sql += " OR ";
				}
				sql += selection.cols[k1] + " LIKE " + "'" + v2 + "'";
			});
			sql += ")";
		});
		return sql;
	};

	return {
		findAll: findAll,
		findBySelection: findBySelection
	};

});
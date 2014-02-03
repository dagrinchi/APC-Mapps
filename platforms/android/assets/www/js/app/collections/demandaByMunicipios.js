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

    var Backbone = require('backbone'),
        DB = require('app/utils/db');

    var $ = require('jquery');

    var model = Backbone.Model.extend({});

    return Backbone.Collection.extend({

        baseapc: {},

        sqlInit: "select * from demanda LEFT join dane on (((demanda.municipio like dane.nommun) and (demanda.territorio like dane.nomdep)) or ((demanda.municipio NOT like dane.nommun) and (demanda.territorio like dane.nomdep) and demanda.municipio = '' and demanda.territorio = 'AMBITO NACIONAL') OR ((demanda.municipio = dane.nommun) and (demanda.territorio like dane.nomdep) and demanda.municipio = '' and demanda.territorio != 'AMBITO NACIONAL' AND dane.nommun != 'AMBITO NACIONAL')) ",

        initialize: function() {
            this.baseapc = new DB(window.openDatabase("apc", "1.0", "APC - Agencia Presidencial de la Cooperación en Colombia", 4145728));
        },

        buildSQL: function() {
            var selection = {
                cols: [],
                vals: []
            };
            $.each(APC.selection.demanda.cols, function(k1, v1) {
                if (v1.length > 0) {
                    selection.cols.push(k1);
                    selection.vals.push(v1);
                }
            });
            var sql = this.sqlInit;

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
                    sql += selection.cols[k1] + " = " + "'" + v2 + "'";
                });
                sql += ")";
            });
            return sql;
        },

        findByMunicipio: function() {
            var deferred = $.Deferred();

            var self = this;
            this.baseapc.execute(self.buildSQL(), model, function(data) {
                self.reset(data);
                deferred.resolve();
            });

            return deferred.promise();
        }

    });

});
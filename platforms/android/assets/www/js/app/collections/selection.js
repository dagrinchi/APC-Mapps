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

    var model = Backbone.Model.extend({ 

    });

    var $        = require('jquery'),
        deferred = $.Deferred();

    return Backbone.Collection.extend({
        
        model: model,

        initialize: function() {
            
        },

        buildSQL: function(table) {

            var selection = {
                cols: [],
                vals: []
            };
            $.each(APC.selection[table].cols, function(k1, v1) {
                if (v1.length > 0) {
                    selection.cols.push(k1);
                    selection.vals.push(v1);
                }
            });
            var sql = "SELECT DISTINCT " + selection.cols.join() + " FROM " + table;
            $.each(selection.vals, function(k1, v1) {                
                if (k1 === 0) {
                    sql += " WHERE (";
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

        find: function(table) {
            var baseapc = new DB(window.openDatabase("apc", "1.0", "APC - Agencia Presidencial de la Cooperación en Colombia", 4145728));
            var self = this;   
            baseapc.execute(this.buildSQL(table), model, function(data) {
                self.reset(data);
                deferred.resolve();
            });

            return deferred.promise();
        }

    });

});
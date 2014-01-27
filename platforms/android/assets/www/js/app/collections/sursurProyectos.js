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

    var model = Backbone.Model.extend({ });

    var $ = require('jquery'),
        deferred = $.Deferred();

    return Backbone.Collection.extend({
        model: model,

        baseapc: {},

        surOff: 0,

        surLimit: 20,

        initialize: function(options) {
            this.baseapc = new DB(window.openDatabase("apc", "1.0", "APC - Agencia Presidencial de la Cooperación en Colombia", 4145728));
        },

        findByName: function(key) {            
            var self = this;
            var sql = "SELECT DISTINCT RowKey, programaproyectoactividad proyectoprograma FROM sursur WHERE programaproyectoactividad LIKE '%" + key + "%' ORDER BY programaproyectoactividad";            
            this.baseapc.execute(sql, model, function(data) {
                self.reset(data);               
            });
        },

        findAll: function() {            
            var self = this;
            this.surOff = 0;
            var sql = "SELECT DISTINCT RowKey, programaproyectoactividad proyectoprograma FROM sursur GROUP BY programaproyectoactividad ORDER BY programaproyectoactividad LIMIT 0, " + this.surLimit;
            this.baseapc.execute(sql, model, function(data) {
                self.reset(data);                
            });
        },

        findNext: function() {            
            var self = this;
            var sql = "SELECT DISTINCT RowKey, programaproyectoactividad proyectoprograma FROM sursur GROUP BY programaproyectoactividad ORDER BY programaproyectoactividad LIMIT " + this.surOff + ", " + this.surLimit;
            this.baseapc.execute(sql, model, function(data) {
                self.add(data);                
            });
        }
    });

});
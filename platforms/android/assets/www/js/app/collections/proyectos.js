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
        DB = require('app/utils/db'),
        model = require('app/models/proyectos');

    var $ = require('jquery'),
        deferred = $.Deferred();

    return Backbone.Collection.extend({
        model: model,

        baseapc: {},

        proOff: 0,

        proLimit: 20,

        surOff: 1,

        surLimit: 10,

        initialize: function(options) {
            this.baseapc = new DB(window.openDatabase("apc", "1.0", "APC - Agencia Presidencial de la Cooperación en Colombia", 4145728));
        },

        findByName: function(key) {            
            var self = this;
            var sql = "SELECT DISTINCT RowKey, proyectoprograma FROM demanda WHERE proyectoprograma LIKE '%" + key + "%' GROUP BY codigoproyecto ORDER BY proyectoprograma";            
            this.baseapc.execute(sql, model, function(data) {
                self.reset(data);               
            });
        },

        findAll: function() {            
            var self = this;
            var sql = "SELECT DISTINCT RowKey, proyectoprograma FROM demanda GROUP BY codigoproyecto ORDER BY proyectoprograma LIMIT " + this.proOff + ", " + this.proLimit;
        
            this.baseapc.execute(sql, model, function(data) {
                self.reset(data);
                deferred.resolve();
            });

            return deferred.promise();
        },

        findAllSursur: function() {            
            var self = this;
            var sql  = "SELECT DISTINCT RowKey, programaproyectoactividad proyectoprograma FROM sursur GROUP BY programaproyectoactividad ORDER BY programaproyectoactividad LIMIT " + this.surOff + ", " + this.surLimit;
            this.baseapc.execute(sql, model, function(data) {
                self.reset(data);                
            });
        }
    });

});
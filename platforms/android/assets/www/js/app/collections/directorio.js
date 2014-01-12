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
        model = require('app/models/directorio');

    var $        = require('jquery'),
        deferred = $.Deferred();

    return Backbone.Collection.extend({
        
        model: model,

        baseapc: {},

        initialize: function() {
            this.baseapc = new DB(window.openDatabase("apc", "1.0", "APC - Agencia Presidencial de la Cooperación en Colombia", 4145728));
        },

        findByName: function(key) {            
            var self = this;
            var sql = "SELECT * FROM directorio WHERE nombredelaorganizacion LIKE '%" + key + "%'";            
            this.baseapc.execute(sql, model, function(data) {
                self.reset(data);               
            });
        },

        findAll: function() {            
            var self = this;            
            this.baseapc.execute("select * from directorio", model, function(data) {
                self.reset(data);
                deferred.resolve();
            });

            return deferred.promise();
        }

    });

});
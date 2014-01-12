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

    var $ = require('jquery'),
        deferred = $.Deferred();

    var model = Backbone.Model.extend({});

    return Backbone.Collection.extend({

        baseapc : {},

        initialize: function() {
            this.baseapc = new DB(window.openDatabase("apc", "1.0", "APC - Agencia Presidencial de la Cooperación en Colombia", 4145728));
        },

        findByMunicipio: function(mun) {            
            var self = this;
            var sql = "SELECT DISTINCT * FROM demanda WHERE municipio = '" + mun + "'";            
            this.baseapc.execute(sql, model, function(data) {
                self.reset(data);
                deferred.resolve();
            });

            return deferred.promise();
        }

    });

});
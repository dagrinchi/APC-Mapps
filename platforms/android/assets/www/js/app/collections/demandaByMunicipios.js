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

        baseapc : {},

        initialize: function() {
            this.baseapc = new DB(window.openDatabase("apc", "1.0", "APC - Agencia Presidencial de la Cooperación en Colombia", 4145728));
        },

        findByMunicipio: function(mun) {            
            var deferred = $.Deferred();

            var self = this;
            var sql = "SELECT DISTINCT RowKey, proyectoprograma FROM demanda WHERE territorio = '" + mun + "'";            
            this.baseapc.execute(sql, model, function(data) {
                self.reset(data);
                deferred.resolve();
                console.log(sql);
            });

            return deferred.promise();
        }

    });

});
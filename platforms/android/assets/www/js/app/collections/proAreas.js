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
        model = require('app/models/proAreas');

    var $        = require('jquery'),
        deferred = $.Deferred();

    return Backbone.Collection.extend({
        
        model: model,

        initialize: function() {
            
        },

        findAll: function() {
            var baseapc = new DB(window.openDatabase("apc", "1.0", "APC - Agencia Presidencial de la Cooperación en Colombia", 4145728));
            var self = this;            
            baseapc.execute("select distinct dci.codigocomponente || ' ' || dci.componentecooperacion as item, dci.codigocomponente as value from dci where dci.codigocomponente <> '' AND dci.codigocomponente <> '999999' order by dci.componentecooperacion", model, function(data) {
                self.reset(data);
                deferred.resolve();
            });

            return deferred.promise();
        }

    });

});
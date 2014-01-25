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

    return Backbone.Model.extend({ 

    	baseapc: {},

        initialize: function() {
            this.baseapc = new DB(window.openDatabase("apc", "1.0", "APC - Agencia Presidencial de la Cooperación en Colombia", 4145728));
        },

    	findByRowKey: function(RowKey, cb) {
			var self = this;
			this.baseapc.executeOne("SELECT * FROM sursur WHERE RowKey = '" + RowKey + "'", this, function(model) {
				cb(model);
			});
		}

    });

});
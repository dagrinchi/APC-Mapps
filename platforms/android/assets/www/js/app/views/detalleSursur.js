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

	var $ = require('jquery'),
		Backbone = require('backbone'),
		_ = require('underscore'),
		detalleTpl = require('text!tpl/detalleSurSur.html');

	return Backbone.View.extend({

		el: "body",

		template: _.template(detalleTpl),		

		events: {
            "click .share": "btnShare"
        },


        btnShare: function() {
            require(['html2canvas'], function() {
                html2canvas(document.getElementsByTagName("body"), {
                    useCORS: true,
                    onrendered: function(canvas) {                        
                        window.plugins.socialsharing.available(function(isAvailable) {
                            if (isAvailable) {                                
                                window.plugins.socialsharing.share("APC-Mapps", "APC-Mapps", canvas.toDataURL(), "http://www.apccolombia.gov.co/");
                            }
                        });
                    }
                });
            });

            return false;
        },

		render: function() {
			this.$el.html(this.template(this.model.toJSON()));
			return this;
		}
	});
});
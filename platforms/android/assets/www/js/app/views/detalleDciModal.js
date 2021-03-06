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
        tpl = require('text!tpl/detalleDci.html'),
        bootstrap = require('bootstrap/bootstrap');

    return Backbone.View.extend({

        className: "modal hide",

        template: _.template(tpl),

        events: {
            "click .share": "btnShare"
        },

        initialize: function() {
            var self = this;
            this.$el.on('hidden', function () {
                console.log("Bye modal");
                self.$el.remove();
            });
        },

        btnShare: function() {
            var self = this;
            require(['html2canvas'], function() {
                html2canvas(self.$el, {
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
            this.$el.modal('show');
            this.$el.children(".modal-body").height($(window).height() - 200);

            return this;
        }
    });

});
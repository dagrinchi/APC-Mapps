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
        bootstrap = require('bootstrap/bootstrap');

    return Backbone.View.extend({

        className: "modal hide",

        template: _.template(require('text!tpl/modalCooperacion.html')),

        initialize: function() {
            var self = this;
            this.$el.on('hidden', function() {
                console.log("Bye modal");
                self.$el.remove();
            });
            this.$el.on('shown', function() {
                require(['iscroll'], function() {
                    var scroll = new IScroll('#dciDetalle', {
                        scrollY: true,
                        scrollX: false
                    });
                });
            });
        },

        events: {
            "click .share": "btnShare"
        },

        btnShare: function() {
            var self = this;
            require(['html2canvas'], function() {
                html2canvas(self.$el.find(".modal-body"), {
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
            this.$el.html(this.template({
                'dci': this.collection.toJSON()
            }));
            this.$el.children(".modal-body").height($(window).height() - 220);
            this.$el.modal('show');

            return this;
        }
    });

});
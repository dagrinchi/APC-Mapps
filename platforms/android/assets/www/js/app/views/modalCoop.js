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
        modalTpl = require('text!tpl/modalCooperacion.html'),
        coopMarker = require('text!tpl/coopMarkerListItem.html'),
        bootstrap = require('bootstrap/bootstrap');

    var listItemView = Backbone.View.extend({
        tagName: 'li',
        className: '',        
        template: _.template(coopMarker),
        render: function() {                                    
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        }
    });

    var listEl = Backbone.View.extend({
        render: function() {
            this.collection.each(function(m) {
                var itemView = new listItemView({
                    model: m
                });
                this.$el.append(itemView.render().el);
            }, this);
            return this;
        }
    });

    return Backbone.View.extend({

        className: "modal hide fade",

        initialize: function() {
            var self = this;
            this.$el.on('hidden', function () {
                console.log("Bye modal");
                self.$el.remove();
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
            var self = this;
            var listElement = new listEl({
                collection : this.collection
            });

            this.$el.html(_.template(modalTpl, {
                title: self.options.title,
                puntofocal: self.collection.models[0].attributes.puntofocal,
                direccionpuntofocal: self.collection.models[0].attributes.direccionpuntofocal,
                miembrosdelcomite: self.collection.models[0].attributes.miembrocomite,
                content: listElement.render().$el.html()
            }));

            this.$el.children(".modal-body").height($(window).height() - 220);
            this.$el.modal('show');            
            return this;
        }
    });

});
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
        modalTpl = require('text!tpl/modal.html'),
        demMarker = require('text!tpl/demMarkerListItem.html'),
        bootstrap = require('bootstrap/bootstrap');

    var listItemView = Backbone.View.extend({
        tagName: 'h4',
        className: '',        
        template: _.template(demMarker),
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

        render: function() {
            var self = this;
            var listElement = new listEl({
                collection : this.collection
            });

            this.$el.html(_.template(modalTpl, {
                title: self.options.title,
                content: listElement.render().$el.html()
            }));

            this.$el.children(".modal-body").height($(window).height() - 200);
            this.$el.modal('show');            
            return this;
        }
    });

});
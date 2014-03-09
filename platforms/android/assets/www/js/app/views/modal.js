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
        
        tagName: 'li',
        
        className: 'topcoat-list__item',
        
        attributes: { "style" : "padding: 1rem;" },        
        
        template: _.template(demMarker),
        
        initialize: function() {
            var data = this.model.toJSON();
            this.$el.on("tap", function() {
                document.location.hash = "#proyectos/" + data["RowKey"];
            });
        },
        
        render: function() {                                    
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        }
    });

    var listEl = Backbone.View.extend({
        
        tagName: "ul",
        
        className: 'topcoat-list',
        
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

        className: "modal hide",

        initialize: function() {
            
            var self = this;
            this.$el.on('hidden', function () {
                console.log("Bye modal");
                self.$el.remove();
            });
            
        },

        render: function() {
            console.log("render demanda modal!");
            if (this.collection.models.length > 0) {

                var self = this;
                var listElement = new listEl({
                    collection : this.collection
                });

                this.$el.html(_.template(modalTpl, {
                    title: self.options.title
                }));           

                $("body").append(this.el);

                this.$el.children(".modal-body").height($(window).height() - 220);
                $("#ModalList").children().html(listElement.render().el);

                this.$el.on('shown', function() {   
                    require(['iscroll'], function() {
                        var scroll = new IScroll('#ModalList', { tap: true });  
                    });                            
                });

                
                this.$el.modal('show');
            } else {
                this.render();
            }
            return this;
        }
    });

});
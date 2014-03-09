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
        modalTpl = require('text!tpl/modalHelp.html'),
        bootstrap = require('bootstrap/bootstrap');


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
            var self = this;            

            this.$el.html(_.template(modalTpl, {
                title: self.options.title,
                content: self.options.content
            }));

            this.$el.children(".modal-body").height($(window).height() - 220);
            this.$el.modal('show');            
            return this;
        }
    });

});
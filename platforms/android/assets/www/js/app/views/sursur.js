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
        tpl = require('text!tpl/sursur.html');

    return Backbone.View.extend({
        el: "body",

        template: _.template(tpl),

        initialize: function() {
            
        },

        render: function() {
            this.$el.html(this.template);
            APC.views.mapSursur.render();
            return this;
        }
    });

});
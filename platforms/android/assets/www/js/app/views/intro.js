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
        introTpl = require('text!tpl/intro.html');

    return Backbone.View.extend({

        el: "body",

        template: _.template(introTpl),

        progressBar: function(percent, str) {
            var progressBarWidth = percent * $("#progressBar").width() / 100;
            $("#progressBar").find('div').animate({
                width: progressBarWidth
            }, 20);
            $("#pbLabel").html(percent + "%&nbsp;");
            $("#progressLabel").html(str);
        },

        render: function() {
            this.$el.html(this.template);

            var wh = $(window).height();
            $(".introWrapper").height(wh);
            return this;
        }
    });

});
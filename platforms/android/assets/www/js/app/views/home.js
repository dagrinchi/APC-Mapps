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

    var $           = require('jquery'),
        Backbone    = require('backbone'),        
        tpl   = require('text!tpl/home.html');

    return Backbone.View.extend({

        el: "body",
        
        template: _.template(tpl),
        
        initialize: function() {
            
        },
        
        render: function() {
            this.$el.html(this.template);

            var wh = $(window).height() / 3;
            $(".thumbnails li").height(wh);
            $("#loadingBox").height($(window).height());
            return this;
        }
    });

});
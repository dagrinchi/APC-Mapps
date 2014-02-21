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
        tpl   = require('text!tpl/acercade.html');

    return Backbone.View.extend({
        el: "body",
        template: _.template(tpl),

        events: {
            "click #apcVocabulary" : "btnGlosario"
        },

        btnGlosario : function() {
             var ref = window.open(encodeURI('http://www.apccolombia.gov.co/?idcategoria=118#&panel1-1'), '_blank', 'location=yes');
        },

        render: function() {
            this.$el.html(this.template);
            require(['iscroll'], function() {                
                var scroll = new IScroll('#acercadePage', { scrollY: true, scrollX: false });  
            });
            $(".container").height($(window).height() - 155);
            return this;
        }
    });

});
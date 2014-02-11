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
        tpl = require('text!tpl/ejecutas.html');

    return Backbone.View.extend({
        el: "body",
        template: _.template(tpl),

        events: {
            "click #registrate": "btnRegistrate",
            "click #informate": "btnInformate",
            "click .bool-slider .inset .control": "chkSwitch"
        },

        btnRegistrate: function() {            
            var ref = window.open(encodeURI('http://www.apccolombia.gov.co/recursos_user/Documentos/Ficha-Presentacion-Proyectos-2013.doc'), '_system', 'location=yes');
            return false;
        },

        btnInformate: function() {
            var ref = window.open(encodeURI('http://www.apccolombia.gov.co/?idcategoria=40#&panel1-1'), '_blank', 'location=yes');
            return false;
        },

        chkSwitch: function(e) {
            var el = e.target;
            if (!$(el).parent().parent().hasClass('disabled')) {
                if ($(el).parent().parent().hasClass('true')) {
                    $(el).parent().parent().addClass('false').removeClass('true');
                    $('#aceptar').slideUp();
                    $('#denegar').slideDown(); 
                } else {
                    $(el).parent().parent().addClass('true').removeClass('false');
                    $('#denegar').slideUp();
                    $('#aceptar').slideDown();
                }
            }

            // if (e.currentTarget.checked) {
            //     $('#denegar').slideUp();
            //     $('#aceptar').slideDown();
            // } else {
            //     $('#aceptar').slideUp();
            //     $('#denegar').slideDown();
            // }
        },

        render: function() {
            this.$el.html(this.template);
            require(['iscroll'], function() {                
                var scroll = new IScroll('#ejecutasPage', { scrollY: true, scrollX: false });  
            });
            $(".container").height($(window).height() - 117);
            return this;
        }
    });

});
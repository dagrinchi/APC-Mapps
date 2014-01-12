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
            "click #myonoffswitch": "chkSwitch"
        },

        btnRegistrate: function() {            
            var ref = window.open(encodeURI('http://www.apccolombia.gov.co/recursos_user/Documentos/Ficha-Presentacion-Proyectos-2013.doc'), '_system', 'location=yes');
        },

        btnInformate: function() {
            var ref = window.open(encodeURI('http://www.apccolombia.gov.co/?idcategoria=40#&panel1-1'), '_system', 'location=yes');
        },

        chkSwitch: function(e) {
            if (e.currentTarget.checked) {
                $('#denegar').slideUp();
                $('#aceptar').slideDown();
            } else {
                $('#aceptar').slideUp();
                $('#denegar').slideDown();
            }
        },

        render: function() {
            this.$el.html(this.template);
            return this;
        }
    });

});
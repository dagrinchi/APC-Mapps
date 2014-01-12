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
		detalleProyectoTpl = require('text!tpl/detalleProyecto.html');

	return Backbone.View.extend({

		el: "body",

		template: _.template(detalleProyectoTpl),		

		render: function() {
			this.$el.html(this.template(this.model.toJSON()));
			return this;
		}
	});
});
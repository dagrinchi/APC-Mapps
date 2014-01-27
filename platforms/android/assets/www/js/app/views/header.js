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
		headerTpl = require('text!tpl/header.html');

	return Backbone.View.extend({
		el: "#header",
		template: _.template(headerTpl),
		render: function() {
			this.$el.html(this.template);
			return this;
		},

		remove: function() {
			this.$el.html("");
		}
	});

});
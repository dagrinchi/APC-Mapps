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
		Backbone = require('backbone');

	return Backbone.View.extend({

		tagName: 'div',		

		map: {},

		initialize: function() {
			var self = this;

			require(['async!https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false'], function() {

				var mapOptions = {
					zoom: self.options.zoom,
					minZoom: self.options.minZoom,
					maxZoom: self.options.maxZoom,
					center: new google.maps.LatLng(self.options.latitude, self.options.longitude),
					mapTypeId: google.maps.MapTypeId.ROADMAP,
					mapTypeControl: false,				    
				    streetViewControl: false,
				    panControl: false,
					styles: self.options.styles
				};
				self.map = new google.maps.Map(self.el, mapOptions);
			});
		},

		render: function() {
			return this;
		}
	});

});
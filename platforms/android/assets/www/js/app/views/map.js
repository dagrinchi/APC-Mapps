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

		map: {},

		mapOptions: {
			zoom: 3,
			minZoom: 2,
			maxZoom: 12,
			mapTypeControl: false,
			streetViewControl: false,
			panControl: false,
			center: {},
			mapTypeId: "roadmap"
		},

		initialize: function() {		 	
			var self = this;
			require(['async!https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false'], function() {
				self.mapOptions.center = new google.maps.LatLng(self.options.latitude, self.options.longitude);
				self.mapOptions.mapTypeId = google.maps.MapTypeId.ROADMAP;
			});	
		},

		render: function() {
			var self = this;			
			$("#" + self.id).width("100%");
			$("#" + self.id).height(self.options.height);
						
			self.map = new google.maps.Map(document.getElementById(self.id), self.mapOptions);
			return this;
		}
	});

});
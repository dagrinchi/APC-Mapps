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
			zoomControl: true,
			panControl: false,
			center: {},
			mapTypeId: "roadmap"
		},

		initialize: function() {		 	
			var self = this;
			
			self.mapOptions.center = new google.maps.LatLng(self.options.latitude, self.options.longitude);
			self.mapOptions.mapTypeId = google.maps.MapTypeId.ROADMAP;
			self.mapOptions.zoomControl = self.options.zoomControl;
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
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
		directorioItemTpl = require('text!tpl/directorioItem.html'),
		directorioPageTpl = require('text!tpl/directorioPage.html');

	var DirectorioItemView = Backbone.View.extend({
		tagName: 'li',
		className: 'topcoat-list__item',
		template: _.template(directorioItemTpl),

		events: {
			"click .share": "btnShare"
		},

		btnShare: function(e) {
			window.plugins.socialsharing.available(function(isAvailable) {
				if (isAvailable) {
					window.plugins.socialsharing.share(e.delegateTarget.innerText, "APC-Mapps", null, "http://www.apccolombia.gov.co/");
				}
			});
			return false;
		},

		render: function() {
			this.$el.html(this.template(this.model.toJSON()));
			return this;
		}
	});

	var DirectorioListView = Backbone.View.extend({

		tagName: "ul",
		className: 'topcoat-list__container',

		initialize: function() {
			this.collection.bind("reset", this.render, this);
		},

		render: function() {
			this.$el.empty();
			this.collection.each(function(m) {
				var directorioItemView = new DirectorioItemView({
					model: m
				});
				this.$el.append(directorioItemView.render().el);
			}, this);
			return this;
		}
	});

	return Backbone.View.extend({
		el: "body",

		events: {
			"keyup #search-dir": "search"
		},

		search: function(event) {
			var key = $('#search-dir').val();
			this.collection.findByName(key);
		},
		
		render: function() {
			var self = this;
			var list = new DirectorioListView({
				collection: self.collection
			});
			this.$el.html(_.template(directorioPageTpl));

			$("#dirList").height($(window).height() - 118);
			$("#dirList").html(list.render().el);
			return this;
		}
	});
});
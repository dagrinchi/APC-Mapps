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
			"click .share" : "btnShare"
		},

		initialize: function() {
			var self = this;
			var data = this.model.toJSON();
			// this.$el.on("tap", function() {
			// 	self.btnShare();
			// });
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
			this.collection.bind("add", this.addOne, this);
		},

		addOne: function(contacto) {
			var contactView = new DirectorioItemView({
				model : contacto
			});
			this.$el.append(contactView.render().el);
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
			if (key.length > 0) {
				this.collection.findByName(key);
			} else {
				this.collection.findAll();
			}
		},

		scrollDirectorio: function() {
			if (this.y === this.maxScrollY) {
				if ($('#search-dir').val().length > 0) {
					APC.collections.directorioCollection.offByName += 20;
					APC.collections.directorioCollection.findByNameNext($('#search-dir').val());
				} else {
					APC.collections.directorioCollection.offset += 20;
					APC.collections.directorioCollection.findNext();
				}
				this.refresh();
			}
		},

		render: function() {
			var self = this;
			var list = new DirectorioListView({
				collection: self.collection
			});
			this.$el.html(_.template(directorioPageTpl));

			$("#dirList").height($(window).height() - 118);
			$("#dirList").children().html(list.render().el);

			require(['iscroll'], function() {
				var dirScroll = new IScroll('#dirList', {
					tap: true
				});
				dirScroll.on("scrollEnd", self.scrollDirectorio);
			});

			return this;
		}
	});
});
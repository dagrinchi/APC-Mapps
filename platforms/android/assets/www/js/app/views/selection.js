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
		_ = require('underscore');

	var badgeView = Backbone.View.extend({

		tagName: "li",

		className: "badge selectionBadge",

		events: {
			"click": "itemClick"
		},

		initialize: function() {			
			this.listenTo(this.model, 'destroy', this.remove);
		},

		itemClick: function() {
			var data = {
				data: this.model.toJSON()
			};
			var table = this.options.table;
			var cols;
			_.each(data.data, function(item, key) {
				cols = key;
				if (table === "demanda" && cols === "codigoenci") {
					APC.selection["demanda"]["cols"]["codigoenci"].splice(APC.selection["demanda"]["cols"]["codigoenci"].indexOf(item), 1);
					APC.selection["dci"]["cols"]["codigocomponente"].splice(APC.selection["dci"]["cols"]["codigocomponente"].indexOf(item), 1);
				} else if (table === "demanda" && cols === "territorio") {
					APC.selection["demanda"]["cols"]["territorio"].splice(APC.selection["demanda"]["cols"]["territorio"].indexOf(item), 1);
					APC.selection["dci"]["cols"]["terrirorio"].splice(APC.selection["dci"]["cols"]["terrirorio"].indexOf(item), 1);
				} else if (table === "dci" && cols === "codigocomponente") {
					APC.selection["demanda"]["cols"]["codigoenci"].splice(APC.selection["demanda"]["cols"]["codigoenci"].indexOf(item), 1);
					APC.selection["dci"]["cols"]["codigocomponente"].splice(APC.selection["dci"]["cols"]["codigocomponente"].indexOf(item), 1);
				} else if (table === "dci" && cols === "terrirorio") {
					APC.selection["demanda"]["cols"]["territorio"].splice(APC.selection["demanda"]["cols"]["territorio"].indexOf(item), 1);
					APC.selection["dci"]["cols"]["terrirorio"].splice(APC.selection["dci"]["cols"]["terrirorio"].indexOf(item), 1);
				} else {
					APC.selection[table]["cols"][cols].splice(APC.selection[table]["cols"][cols].indexOf(item), 1);
				}
			});

			if (table === "demanda") {
				switch (cols) {
					case "codigoenci":
						APC.collections.demCollection.findBySelection();
						APC.collections.coopCollection.findBySelection();
						break;
					case "territorio":
						APC.collections.demCollection.findBySelection();
						APC.collections.coopCollection.findBySelection();
						break;
					default:
						APC.collections.demCollection.findBySelection();
						break;
				}
			} else if (table === "dci") {
				switch (cols) {
					case "codigocomponente":
						APC.collections.demCollection.findBySelection();
						APC.collections.coopCollection.findBySelection();
						break;
					case "terrirorio":
						APC.collections.demCollection.findBySelection();
						APC.collections.coopCollection.findBySelection();
						break;
					default:
						APC.collections.coopCollection.findBySelection();
						break;
				}
			}

			this.model.destroy();
		},

		render: function() {
			var self = this;
			var list = '<% _.each(data, function(item, key) { %><i class="icon-remove icon-white"></i> <%= item %><% }); %>';
			var data = {
				data: this.model.toJSON()
			};
			var table = this.options.table;

			this.$el.html(_.template(list, data));

			if (table === "demanda") {
				this.$el.addClass("badge-warning");
			} else if (table === "dci") {
				this.$el.addClass("badge-success");
			}
			return this;
		}

	});

	return Backbone.View.extend({

		tagName: "ul",

		className: "selectionList",

		initialize: function() {
			this.collection.bind("reset", this.render, this);
			this.collection.bind("remove", this.removeItem, this);
			this.collection.bind("reset", this.resetAction, this);
		},

		resetAction: function() {
			if (this.collection.models.length === 0) {
				if (typeof APC.views.mapDemanda.markerCluster !== "undefined") {
					APC.views.mapDemanda.markerCluster.clearMarkers();
				}
				if (typeof APC.views.mapCooperacion.markerCluster !== "undefined") {
					APC.views.mapCooperacion.markerCluster.clearMarkers();
				}
			}
		},

		removeItem: function(model) {
			if (model.get("codigoenci")) {
				var componentecooperacion = APC.collections.dciSelection.findWhere({
					"codigocomponente": model.get("codigoenci")
				});
				if (typeof componentecooperacion !== "undefined") {
					componentecooperacion.destroy();
				}
			} else if (model.get("codigocomponente")) {
				var enci = APC.collections.demandaSelection.findWhere({
					"codigoenci": model.get("codigocomponente")
				});
				if (typeof enci !== "undefined") {
					enci.destroy();
				}
			}
		},

		render: function() {
			var self = this;
			this.$el.empty();
			this.collection.each(function(m) {
				var badge = new badgeView({
					model: m,
					table: self.options.table
				});
				this.$el.append(badge.render().el);
			}, this);
			return this;
		}

	});

});
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

		className: "badge",

		render: function() {
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

			this.$el.click(function(e) {
				var cols;
				_.each(data.data, function(item, key) {
					cols = key;
					APC.selection[table]["cols"][cols].splice(APC.selection[table]["cols"][cols].indexOf(item), 1);
					if (table === "demanda" && cols === "codigoenci") {
						APC.selection["dci"]["cols"]["codigoarea"].splice(APC.selection["dci"]["cols"]["codigoarea"].indexOf(item), 1);
					} else if (table === "demanda" && cols === "territorio") {
						APC.selection["dci"]["cols"]["terrirorio"].splice(APC.selection["dci"]["cols"]["terrirorio"].indexOf(item), 1);
					} else if (table === "dci" && cols === "codigoarea") {
						APC.selection["demanda"]["cols"]["codigoenci"].splice(APC.selection["demanda"]["cols"]["codigoenci"].indexOf(item), 1);
					} else if (table === "dci" && cols === "terrirorio") {
						APC.selection["demanda"]["cols"]["territorio"].splice(APC.selection["demanda"]["cols"]["territorio"].indexOf(item), 1);
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
						case "codigoarea":
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
				$(this).remove();
			});
			return this;
		}

	});

	return Backbone.View.extend({

		tagName: "ul",

		className: "selectionList",

		initialize: function() {
			this.collection.bind("reset", this.render, this);
		},

		render: function() {
			var self = this;
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
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
        tpl = require('text!tpl/sursur.html'),
        modalTpl = require('text!tpl/modalList.html'),
        listItemTpl = require('text!tpl/listItem.html'),
        bootstrap = require('bootstrap/bootstrap');


    var listItemView = Backbone.View.extend({
        tagName: 'div',
        className: '',
        template: _.template(listItemTpl),
        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        }
    });

    var listEl = Backbone.View.extend({
        render: function() {
            this.collection.each(function(m) {
                var itemView = new listItemView({
                    model: m
                });
                this.$el.append(itemView.render().el);
            }, this);
            return this;
        }
    });

    var modalList = Backbone.View.extend({

        className: "modal hide fade",

        initialize: function() {
            var self = this;
            this.template = _.template(modalTpl, {
                title: self.options.title,
                list: self.options.list
            });            
        },

        events: {
            "click .items": "chkItem",
            "click .ok": "btnOK"
        },

        btnOK: function() {
            if (this.options.table === "sursur")
                $.when(APC.collections.sursurCollection.findBySelection()).done(function() {
                    APC.selection.sursur = {
                        cols: {
                            areacooperacion: [],
                            sectorliderpolitica: []
                        }
                    };
                });
        },

        chkItem: function(e) {
            var self = this;
            if (e.currentTarget.checked) {
                APC.selection[self.options.table]["cols"][self.options.cols].push(e.currentTarget.value);
            } else {
                APC.selection[self.options.table]["cols"][self.options.cols].splice(APC.selection[self.options.table]["cols"][self.options.cols].indexOf(e.currentTarget.value), 1);
            }
        },

        render: function() {            
            this.$el.html(this.template);        
            this.$el.modal('show');
            this.$el.children(".modal-body").height($(window).height() - 200);
            return this;
        }
    });

    return Backbone.View.extend({
        el: "body",

        template: _.template(tpl),

        initialize: function() {
            
        },

        events: {
            "click .share": "btnShare",
            "click #btnSurAreas": "btnSurAreas",
            "click #btnSurSectores": "btnSurSectores"
        },


        btnShare: function() {
            require(['html2canvas'], function() {
                html2canvas(document.getElementsByTagName("body"), {
                    useCORS: true,
                    onrendered: function(canvas) {                        
                        window.plugins.socialsharing.available(function(isAvailable) {
                            if (isAvailable) {                                
                                window.plugins.socialsharing.share("APC-Mapps", "APC-Mapps", canvas.toDataURL(), "http://www.apccolombia.gov.co/");
                            }
                        });
                    }
                });
            });
            return false;
        },

        btnSurAreas: function() {
            APC.views.surAreasListView = new listEl({
                collection: APC.collections.surAreasCollection
            });

            if (typeof APC.views.surAreasModalListView === "undefined") {
                APC.views.surAreasModalListView = new modalList({
                    id: "surAreasModal",
                    title: "Áreas",
                    list: APC.views.surAreasListView.render().$el.html(),
                    table: "sursur",
                    cols: "areacooperacion"
                });
            }
            APC.views.surAreasModalListView.render();
        },


        btnSurSectores: function() {
            APC.views.surSectoresListView = new listEl({
                collection: APC.collections.surSectoresCollection
            });

            if (typeof APC.views.surSectoresModalListView === "undefined") {
                APC.views.surSectoresModalListView = new modalList({
                    id: "surSectoresModal",
                    title: "Sectores",
                    list: APC.views.surSectoresListView.render().$el.html(),
                    table: "sursur",
                    cols: "sectorliderpolitica"
                });
            }
            APC.views.surSectoresModalListView.render();
        },

        render: function() {
            this.$el.html(this.template);
            APC.views.mapSursur.render();
            return this;
        }
    });

});
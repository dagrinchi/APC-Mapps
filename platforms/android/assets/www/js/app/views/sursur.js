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
        tagName: 'li',
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

            this.$el.on('hidden', function() {
                console.log("Bye modal");
                self.$el.remove();
            });
            this.$el.on('shown', function() {   
                require(['iscroll'], function() {
                    var scroll = new IScroll('#modalList', { mouseWheel: true });  
                });                            
            });
        },

        events: {
            "click .items": "chkItem",
            "click #ok": "btnOK"
        },

        btnOK: function() {
            if (this.options.table === "sursur")
                APC.collections.sursurCollection.findBySelection();
        },

        chkItem: function(e) {
            var self = this;
            if (e.currentTarget.checked) {
                if (APC.selection[self.options.table]["cols"][self.options.cols].length >= 4) {
                    navigator.notification.alert('Sólo puedes hacer una selección de máximo 4 items!', function() {}, 'Atención', 'Aceptar');
                    return false;
                } else {
                    APC.selection[self.options.table]["cols"][self.options.cols].push(e.currentTarget.value);
                }
            } else {
                APC.selection[self.options.table]["cols"][self.options.cols].splice(APC.selection[self.options.table]["cols"][self.options.cols].indexOf(e.currentTarget.value), 1);
            }

            return true;
        },

        render: function() {
            this.$el.html(this.template);
            this.$el.modal('show');
            this.$el.children(".modal-body").height($(window).height() - 210);
            return this;
        }
    });

    return Backbone.View.extend({
        el: "body",

        template: _.template(tpl),

        initialize: function() {
            this.clearSelection();
        },

        events: {
            "click .share": "btnShare",
            "click #btnSurAreas": "btnSurAreas",
            "click #btnSurSectores": "btnSurSectores"
        },

        clearSelection: function() {
            APC.selection.sursur = {
                cols: {
                    'areacooperacion': [],
                    'sectorliderpolitica': [],
                    'pais': []
                }
            };
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
            this.clearSelection();
            APC.views.surAreasListView = new listEl({
                collection: APC.collections.surAreasCollection
            });

            //if (typeof APC.views.surAreasModalListView === "undefined")
            APC.views.surAreasModalListView = new modalList({
                id: "surAreasModal",
                title: "Áreas",
                list: APC.views.surAreasListView.render().$el.html(),
                table: "sursur",
                cols: "areacooperacion"
            });
            APC.views.surAreasModalListView.render();

            return false;
        },


        btnSurSectores: function() {
            this.clearSelection();
            APC.views.surSectoresListView = new listEl({
                collection: APC.collections.surSectoresCollection
            });

            //if (typeof APC.views.surSectoresModalListView === "undefined")
            APC.views.surSectoresModalListView = new modalList({
                id: "surSectoresModal",
                title: "Sectores",
                list: APC.views.surSectoresListView.render().$el.html(),
                table: "sursur",
                cols: "sectorliderpolitica"
            });
            APC.views.surSectoresModalListView.render();

            return false;
        },

        render: function() {
            this.$el.html(this.template);

            var position = {
                coords: {
                    latitude: 4.598055600,
                    longitude: -74.075833300
                }
            };

            var wh = $(window).height();

            navigator.geolocation.getCurrentPosition(function(gp) {
                position = gp;
            }, function(error) {
                console.error('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
            });

            require(['app/views/map'], function(MapView) {
                APC.views.mapSursur = new MapView({
                    id: "map-canvas-c",
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    height: wh - 111,
                    zoomControl: true
                });
                APC.views.mapSursur.render();
            });
            return this;
        }
    });

});
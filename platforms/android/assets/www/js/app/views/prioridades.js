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
        tpl = require('text!tpl/prioridades.html'),
        modalTpl = require('text!tpl/modalList.html'),
        listItemTpl = require('text!tpl/listItem.html'),
        bootstrap = require('bootstrap/bootstrap'),
        CooperacionCollection = require('app/collections/cooperacion');

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
                    var scroll = new IScroll('#modalList', {
                        mouseWheel: true
                    });
                });
            });
        },

        events: {
            "click .items": "chkItem",
            "click #ok": "btnOK"
        },

        btnOK: function() {
            console.log("btnOK: Click boton OK despues de la selección.");

            var table = this.options.table;
            var cols = this.options.cols;

            require(['app/collections/selection', 'app/views/selection'], function(selectionColl, selectionView) {

                if (table === "demanda") {
                    switch (cols) {
                        case "codigoenci":
                            demanda();
                            cooperacion();
                            APC.collections['demandaSelection'] = new selectionColl();
                            drawSelection('demanda', APC.collections['demandaSelection']);
                            APC.collections['dciSelection'] = new selectionColl();
                            drawSelection('dci', APC.collections['dciSelection']);
                            break;
                        case "territorio":
                            demanda();
                            cooperacion();
                            APC.collections['demandaSelection'] = new selectionColl();
                            drawSelection('demanda', APC.collections['demandaSelection']);
                            APC.collections['dciSelection'] = new selectionColl();
                            drawSelection('dci', APC.collections['dciSelection']);
                            break;
                        default:
                            demanda();
                            APC.collections['demandaSelection'] = new selectionColl();
                            drawSelection('demanda', APC.collections['demandaSelection']);
                            if (typeof APC.views.mapCooperacion.markerCluster !== "undefined") {
                                APC.views.mapCooperacion.markerCluster.clearMarkers();
                            }
                            break;
                    }
                } else if (table === "dci") {
                    switch (cols) {
                        case "codigocomponente":
                            demanda();
                            cooperacion();
                            APC.collections['demandaSelection'] = new selectionColl();
                            drawSelection('demanda', APC.collections['demandaSelection']);
                            APC.collections['dciSelection'] = new selectionColl();
                            drawSelection('dci', APC.collections['dciSelection']);
                            break;
                        case "terrirorio":
                            demanda();
                            cooperacion();
                            APC.collections['demandaSelection'] = new selectionColl();
                            drawSelection('demanda', APC.collections['demandaSelection']);
                            APC.collections['dciSelection'] = new selectionColl();
                            drawSelection('dci', APC.collections['dciSelection']);
                            break;
                        default:
                            cooperacion();
                            break;
                    }
                }

                function demanda() {
                    APC.collections.demCollection.selection = true;
                    APC.collections.demCollection.fetch({
                        "success": function() {
                            APC.collections.demCollection.initMapMarkersWithDb();
                        }
                    });
                }

                function cooperacion() {
                    APC.collections.coopCollection.selection = true;
                    APC.collections.coopCollection.fetch({
                        "success": function() {
                            APC.collections.coopCollection.initMapMarkersWithDb();
                        }
                    });
                }

                function drawSelection(table, collection) {
                    $.when(collection.findSelection(table)).done(function() {
                        APC.views[table + 'Selection'] = new selectionView({
                            collection: collection,
                            table: table
                        });
                        $("#" + table + "SelectionList").html(APC.views[table + 'Selection'].render().$el);
                    });
                }

            });
        },

        chkItem: function(e) {
            var self = this;

            if (e.currentTarget.checked) {

                if (APC.selection[self.options.table]["cols"][self.options.cols].length >= 4) {
                    navigator.notification.alert('Sólo puedes hacer una selección de máximo 4 items!', function() {}, 'Atención', 'Aceptar');
                    return false;
                } else {
                    APC.selection[self.options.table]["cols"][self.options.cols].push(e.currentTarget.value);
                    if (self.options.table === "demanda" && self.options.cols === "codigoenci") {
                        APC.selection["dci"]["cols"]["codigocomponente"].push(e.currentTarget.value);
                    } else if (self.options.table === "demanda" && self.options.cols === "territorio") {
                        APC.selection["dci"]["cols"]["terrirorio"].push(e.currentTarget.value);
                    } else if (self.options.table === "dci" && self.options.cols === "codigocomponente") {
                        APC.selection["demanda"]["cols"]["codigoenci"].push(e.currentTarget.value);
                    } else if (self.options.table === "dci" && self.options.cols === "terrirorio") {
                        APC.selection["demanda"]["cols"]["territorio"].push(e.currentTarget.value);
                    }
                }


            } else {
                APC.selection[self.options.table]["cols"][self.options.cols].splice(APC.selection[self.options.table]["cols"][self.options.cols].indexOf(e.currentTarget.value), 1);
                if (self.options.table === "demanda" && self.options.cols === "codigoenci") {
                    APC.selection["dci"]["cols"]["codigocomponente"].splice(APC.selection["dci"]["cols"]["codigocomponente"].indexOf(e.currentTarget.value), 1);
                } else if (self.options.table === "demanda" && self.options.cols === "territorio") {
                    APC.selection["dci"]["cols"]["terrirorio"].splice(APC.selection["dci"]["cols"]["terrirorio"].indexOf(e.currentTarget.value), 1);
                } else if (self.options.table === "dci" && self.options.cols === "codigocomponente") {
                    APC.selection["demanda"]["cols"]["codigoenci"].splice(APC.selection["demanda"]["cols"]["codigoenci"].indexOf(e.currentTarget.value), 1);
                } else if (self.options.table === "dci" && self.options.cols === "terrirorio") {
                    APC.selection["demanda"]["cols"]["territorio"].splice(APC.selection["demanda"]["cols"]["territorio"].indexOf(e.currentTarget.value), 1);
                }
            }

            return true;

        },

        render: function() {
            this.$el.html(this.template);
            this.$el.modal('show');
            this.$el.children(".modal-body").height($(window).height() - 220);
            return this;
        }
    });

    return Backbone.View.extend({
        el: "body",

        template: _.template(tpl),

        initialize: function() {

        },

        events: {
            "click #btnDemActores": "btnDemActores",
            "click #btnDemTerritorios": "btnDemTerritorios",
            "click #btnDemMunicipios": "btnDemMunicipios",
            "click #btnDemAreas": "btnDemAreas",
            "click #btnDemSectores": "btnDemSectores",
            "click #btnProTerritorios": "btnProTerritorios",
            "click #btnProAreas": "btnProAreas",
            "click .share": "btnShare"
        },

        clearSelection: function() {
            APC.selection.demanda = {
                cols: {
                    'actor': [],
                    'territorio': [],
                    'municipio': [],
                    'codigoenci': [],
                    'sectorliderpolitica': [],
                    'lat': [],
                    'long': []
                }
            };
            APC.selection.dci = {
                cols: {
                    'terrirorio': [],
                    'codigocomponente': [],
                    'lat': [],
                    'long': []
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

        btnDemActores: function() {
            console.log("btnDemActores: Click en btnDemActores");
            this.clearSelection();
            APC.views.demActoresListView = new listEl({
                collection: APC.collections.demActoresCollection
            });

            //if (typeof APC.views.demActoresModal === "undefined") {
            APC.views.demActoresModal = new modalList({
                id: "demActoresModal",
                title: "Cooperantes",
                list: APC.views.demActoresListView.render().$el.html(),
                table: "demanda",
                cols: "actor"
            });
            APC.views.demActoresModal.render();
        },

        btnDemTerritorios: function() {
            this.clearSelection();
            APC.views.demTerritoriosListView = new listEl({
                collection: APC.collections.demTerritoriosCollection
            });

            //if (typeof APC.views.demTerritoriosModal === "undefined") {
            APC.views.demTerritoriosModal = new modalList({
                id: "demTerritoriosModal",
                title: "Territorios",
                list: APC.views.demTerritoriosListView.render().$el.html(),
                table: "demanda",
                cols: "territorio"
            });
            APC.views.demTerritoriosModal.render();
        },

        btnDemMunicipios: function() {
            this.clearSelection();
            APC.views.demMunicipiosListView = new listEl({
                collection: APC.collections.demMunicipiosCollection
            });

            //if (typeof APC.views.demMunicipiosModalListView === "undefined") {
            APC.views.demMunicipiosModalListView = new modalList({
                id: "demMunicipiosModal",
                title: "Municipios",
                list: APC.views.demMunicipiosListView.render().$el.html(),
                table: "demanda",
                cols: "municipio"
            });
            APC.views.demMunicipiosModalListView.render();
        },

        btnDemAreas: function() {
            this.clearSelection();
            APC.views.demAreasListView = new listEl({
                collection: APC.collections.demAreasCollection
            });

            //if (typeof APC.views.demAreasModalListView === "undefined") {
            APC.views.demAreasModalListView = new modalList({
                id: "demAreasModal",
                title: "Areas / Componente ENCI",
                list: APC.views.demAreasListView.render().$el.html(),
                table: "demanda",
                cols: "codigoenci"
            });
            APC.views.demAreasModalListView.render();
        },

        btnDemSectores: function() {
            this.clearSelection();
            APC.views.demSectoresListView = new listEl({
                collection: APC.collections.demSectoresCollection
            });

            //if (typeof APC.views.demSectoresModalListView === "undefined") {
            APC.views.demSectoresModalListView = new modalList({
                id: "demSectoresModal",
                title: "Sectores",
                list: APC.views.demSectoresListView.render().$el.html(),
                table: "demanda",
                cols: "sectorliderpolitica"
            });
            APC.views.demSectoresModalListView.render();
        },

        btnProTerritorios: function() {
            this.clearSelection();
            APC.views.proTerritoriosListView = new listEl({
                collection: APC.collections.proTerritoriosCollection
            });

            //if (typeof APC.views.proTerritoriosModalListView === "undefined") {
            APC.views.proTerritoriosModalListView = new modalList({
                id: "proTerritoriosModal",
                title: "Territorios",
                list: APC.views.proTerritoriosListView.render().$el.html(),
                table: "dci",
                cols: "terrirorio"
            });
            APC.views.proTerritoriosModalListView.render();
        },

        btnProAreas: function() {
            this.clearSelection();
            APC.views.proAreasListView = new listEl({
                collection: APC.collections.proAreasCollection
            });

            //if (typeof APC.views.proAreasModalListView === "undefined") {
            APC.views.proAreasModalListView = new modalList({
                id: "proAreasModal",
                title: "Áreas",
                list: APC.views.proAreasListView.render().$el.html(),
                table: "dci",
                cols: "codigocomponente"
            });
            APC.views.proAreasModalListView.render();
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

            require(['app/views/map'], function(MapView) {

                APC.views.mapDemanda = new MapView({
                    id: "map-canvas-a",
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    height: (wh - 152) / 2,
                    zoomControl: true
                });
                APC.views.mapDemanda.render();

                APC.views.mapCooperacion = new MapView({
                    id: "map-canvas-b",
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    height: (wh - 152) / 2,
                    zoomControl: false
                });
                APC.views.mapCooperacion.render();

                var mapDemanda = APC.views.mapDemanda.map;
                var mapCooperacion = APC.views.mapCooperacion.map;

                //ZOOM
                google.maps.event.addListener(mapDemanda, 'zoom_changed', function() {
                    mapCooperacion.setZoom(mapDemanda.getZoom());
                });

                google.maps.event.addListener(mapDemanda, 'drag', function() {
                    google.maps.event.clearListeners(mapCooperacion, 'center_changed');
                    // google.maps.event.clearListeners(mapCooperacion, 'zoom_changed');

                    //CENTER
                    google.maps.event.addListener(mapDemanda, 'center_changed', function() {
                        mapCooperacion.setCenter(mapDemanda.getCenter());
                    });

                    //ZOOM
                    // google.maps.event.addListener(mapDemanda, 'zoom_changed', function() {
                    //     mapCooperacion.setZoom(mapDemanda.getZoom());    
                    // });                    
                });
                google.maps.event.addListener(mapCooperacion, 'drag', function() {
                    google.maps.event.clearListeners(mapDemanda, 'center_changed');
                    // google.maps.event.clearListeners(mapDemanda, 'zoom_changed');

                    //CENTER
                    google.maps.event.addListener(mapCooperacion, 'center_changed', function() {
                        mapDemanda.setCenter(mapCooperacion.getCenter());
                    });

                    //ZOOM
                    // google.maps.event.addListener(mapCooperacion, 'zoom_changed', function() {
                    //     mapDemanda.setZoom(mapCooperacion.getZoom());    
                    // });                    
                });

            });
        }
    });

});
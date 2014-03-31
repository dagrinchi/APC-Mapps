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

    var Backbone = require('backbone'),
        model = require('app/models/cooperacion'),
        modalView = require('app/views/modalCoop'),
        ApcCooperacion = require('app/utils/cooperacion-data'),
        coopByDepto = require('app/collections/coopByDepartamento');

    var $ = require('jquery'),
        deferred = $.Deferred();

    return Backbone.Collection.extend({

        selection: false,

        markers: [],

        model: model,

        sync: function(method, model, options) {
            if (method === "read") {
                if (this.selection) {
                    // var terrirorio = APC.selection.dci.cols['terrirorio'].length;
                    // var areas = APC.selection.dci.cols['codigocomponente'].length;
                    // if (terrirorio > 0 ||  areas > 0) {
                    ApcCooperacion.findBySelection().done(function(data) {
                        options.success(data);
                    });
                    // } else {
                    //     if (typeof APC.views.mapCooperacion.markerCluster !== "undefined") {
                    //         APC.views.mapCooperacion.markerCluster.clearMarkers();
                    //     }
                    // }
                } else {
                    ApcCooperacion.findAll().done(function(data) {
                        options.success(data);
                    });
                }

            }
        },

        initialize: function() {
            this.geo = new google.maps.Geocoder();
            this.bounds = new google.maps.LatLngBounds();
            this.infowindow = new google.maps.InfoWindow();
        },

        initMapMarkersWithDb: function() {
            var self = this;
            self.markers = [];
            $.each(self.models, function(k1, v1) {
                self.createMarker(v1.get("RowKey"), v1.get("terrirorio").trim(), parseFloat(v1.get("lat")), parseFloat(v1.get("long")));
            });

            if (typeof APC.views.mapCooperacion.markerCluster !== "undefined") {
                APC.views.mapCooperacion.markerCluster.clearMarkers();
            }
            require(['markerclustererCompiled'], function() {
                APC.views.mapCooperacion.markerCluster = new MarkerClusterer(APC.views.mapCooperacion.map, self.markers, {
                    maxZoom: 11,
                    gridSize: 50
                });
            });
            // APC.views.mapCooperacion.map.fitBounds(self.bounds);    
        },

        createMarker: function(RowKey, add, lat, lng) {
            var self = this;

            var marker = new google.maps.Marker({
                position: new google.maps.LatLng(lat, lng),
                map: APC.views.mapCooperacion.map,
                zIndex: Math.round(4.5 * -100000) << 5
            });

            self.markers.push(marker);

            google.maps.event.addListener(marker, 'click', function() {

                $("#loadingBox").fadeIn();

                if (typeof APC.collections.coopByDepartamento === 'undefined')
                    APC.collections.coopByDepartamento = new coopByDepto();

                APC.selection.dci.cols['lat'] = [];
                APC.selection.dci.cols['lat'].push(lat);

                APC.selection.dci.cols['long'] = [];
                APC.selection.dci.cols['long'].push(lng);

                APC.selection.dci.cols['terrirorio'] = [];
                APC.selection.dci.cols['terrirorio'].push(add);

                APC.collections.coopByDepartamento.fetch({
                    success: function(territorioCollection) {
                        territorioCollection.each(function(territorio) {
                            territorio.get("areas").fetch({
                                success: function(areasCollection) {
                                    var len = areasCollection.length;
                                    areasCollection.each(function(area, k) {
                                        area.get("componentes").fetch({
                                            data: area.get("codigoarea"),
                                            success: function(componentesCollection) {
                                                if (len === k + 1) {
                                                    $("#loadingBox").hide();
                                                    var modal = new modalView({
                                                        id: RowKey,
                                                        title: add,
                                                        collection: APC.collections.coopByDepartamento
                                                    });
                                                    modal.render();
                                                }
                                            }
                                        });
                                    });
                                }
                            });
                        });

                    }
                });

                // self.infowindow.setContent(add);
                // self.infowindow.open(APC.views.mapCooperacion.map, marker);
            });

            self.bounds.extend(marker.position);

        }

    });

});
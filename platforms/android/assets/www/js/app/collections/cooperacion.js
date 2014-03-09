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
        DB = require('app/utils/db'),
        model = require('app/models/cooperacion'),
        modalView = require('app/views/modalCoop'),
        coopByDepto = require('app/collections/coopByDepartamento');

    var $ = require('jquery'),
        deferred = $.Deferred();

    return Backbone.Collection.extend({

        sql: "SELECT DISTINCT * FROM dci INNER JOIN (SELECT dci.terrirorio terr, dane.lat, dane.long FROM dci INNER JOIN dane ON (dane.nomdep LIKE dci.terrirorio and dane.codmun = '') or(dane.nommun LIKE dci.terrirorio) GROUP BY dci.terrirorio) dciterr ON dciterr.terr = dci.terrirorio ",
        markers: [],

        delay: 100,

        nextAddress: 0,

        model: model,

        baseapc: {},

        initialize: function() {
            var self = this;

            self.geo = new google.maps.Geocoder();
            self.bounds = new google.maps.LatLngBounds();
            self.infowindow = new google.maps.InfoWindow();

            this.baseapc = new DB(window.openDatabase("apc", "1.0", "APC - Agencia Presidencial de la Cooperación en Colombia", 4145728));
        },

        findAll: function() {
            var deferred = $.Deferred();
            var self = this;

            this.baseapc.execute(self.sql, model, function(data) {
                self.reset(data);
                deferred.resolve();
                setTimeout(self.initMapMarkersWithDb, 3500);
            });
            return deferred.promise();
        },

        findBySelection: function() {
            var deferred = $.Deferred();
            var self = this;

            this.baseapc.execute(this.buildSQL(), model, function(data) {
                self.reset(data);
                deferred.resolve();
                self.initMapMarkersWithDb();
            });

            return deferred.promise();
        },

        buildSQL: function() {
            var selection = {
                cols: [],
                vals: []
            };
            $.each(APC.selection.dci.cols, function(k1, v1) {
                if (v1.length > 0) {
                    selection.cols.push(k1);
                    selection.vals.push(v1);
                }
            });
            var sql = this.sql;

            $.each(selection.vals, function(k1, v1) {
                if (k1 === 0) {
                    sql += "WHERE (";
                } else {
                    sql += " AND (";
                }
                $.each(v1, function(k2, v2) {
                    if (k2 > 0) {
                        sql += " OR ";
                    }
                    sql += selection.cols[k1] + " LIKE " + "'" + v2 + "'";
                });
                sql += ")";
            });
            console.log(sql);
            return sql;
        },

        initMapMarkersWithDb: function() {
            var self = this;
            if (typeof this.models === "undefined" || this.models.length <= 0) {
                APC.collections.coopCollection.initMapMarkersWithDb();
            } else {
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
            }
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
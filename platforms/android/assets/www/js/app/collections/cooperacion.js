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

        sql: "SELECT DISTINCT * FROM dci INNER JOIN (SELECT DISTINCT dci.terrirorio terr, dane.lat, dane.long FROM dci INNER JOIN dane ON dane.nomdep LIKE dci.terrirorio WHERE dane.codmun = '' GROUP BY dci.terrirorio) dciterr ON dciterr.terr = dci.terrirorio ",

        markers: [],

        delay: 100,

        nextAddress: 0,

        model: model,

        baseapc: {},

        initialize: function() {
            var self = this;
            require(['async!https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false'], function() {
                self.geo = new google.maps.Geocoder();
                self.bounds = new google.maps.LatLngBounds();
                self.infowindow = new google.maps.InfoWindow();
            });
            this.baseapc = new DB(window.openDatabase("apc", "1.0", "APC - Agencia Presidencial de la Cooperación en Colombia", 4145728));
        },

        findAll: function() {
            var deferred = $.Deferred();
            var self = this;

            this.baseapc.execute(self.sql, model, function(data) {
                self.reset(data);
                deferred.resolve();
                setTimeout(function() {
                    self.initMapMarkersWithDb();
                }, 3000);
            });
            return deferred.promise();
        },

        findBySelection: function() {
            var deferred = $.Deferred();
            var self = this;

            this.baseapc.execute(this.buildSQL(), model, function(data) {
                self.reset(data);
                deferred.resolve();
                setTimeout(function() {
                    self.initMapMarkersWithDb();
                }, 3000);
            });

            return deferred.promise();
        },

        buildSQL: function() {
            var selection = [];
            var sql = this.sql;

            $.each(APC.selection, function(k1, v1) {
                var item = [];
                $.each(v1["cols"], function(k2, v2) {
                    $.each(v2, function(k3, v3) {
                        var val = {};
                        val[k2] = v3;
                        item.push(val);
                    });
                });
                if (item[0]) {
                    selection.push(item);
                }
            });

            $.each(selection, function(k1, v1) {
                if (k1 === 0) {
                    sql += "WHERE ";
                } else {
                    sql += " AND (";
                }
                $.each(v1, function(k2, v2) {
                    if (k2 > 0) {
                        sql += " OR ";
                    }
                    $.each(v2, function(k3, v3) {
                        sql += k3 + " = " + "'" + v3 + "'";
                    });
                });
                if (k1 !== 0) {
                    sql += ")";
                }
            });
            return sql;
        },

        initMapMarkersWithDb: function() {
            this.markers = [];
            var self = this;

            $.each(this.models, function(k1, v1) {
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

            require(['async!https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false'], function() {

                var marker = new google.maps.Marker({
                    position: new google.maps.LatLng(lat, lng),
                    map: APC.views.mapCooperacion.map,
                    zIndex: Math.round(4.5 * -100000) << 5
                });

                self.markers.push(marker);

                google.maps.event.addListener(marker, 'click', function() {

                    if (typeof APC.collections.coopByDepartamento === 'undefined')
                        APC.collections.coopByDepartamento = new coopByDepto();

                    $.when(APC.collections.coopByDepartamento.findByDepartamento(add)).done(function() {
                        var modal = new modalView({
                            id: RowKey,
                            title: add,
                            collection: APC.collections.coopByDepartamento
                        });
                        setTimeout(function() {
                            modal.render();
                        }, 600);
                    });

                    // self.infowindow.setContent(add);
                    // self.infowindow.open(APC.views.mapCooperacion.map, marker);
                });

                self.bounds.extend(marker.position);

            });
        }

    });

});
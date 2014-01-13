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
        model = require('app/models/demanda'),
        modalView = require('app/views/modal'),
        demandaByMunicipios = require('app/collections/demandaByMunicipios');

    var $ = require('jquery');

    return Backbone.Collection.extend({

        sqlInit: "SELECT DISTINCT * FROM demanda LEFT JOIN (SELECT DISTINCT demanda.municipio mun, dane.lat, dane.long FROM demanda INNER JOIN dane ON dane.nommun LIKE demanda.municipio WHERE demanda.municipio IS NOT '' GROUP BY demanda.municipio) municipios ON municipios.mun = demanda.municipio ",

        sqlEnd: " GROUP BY demanda.codigoproyecto, demanda.municipio",

        markers: [],

        delay: 100,

        nextAddress: 0,

        model: model,

        baseapc: {},

        initialize: function() {
            this.geo = new google.maps.Geocoder();
            this.bounds = new google.maps.LatLngBounds();
            this.infowindow = new google.maps.InfoWindow();
            this.baseapc = new DB(window.openDatabase("apc", "1.0", "APC - Agencia Presidencial de la Cooperación en Colombia", 4145728));
        },

        findAll: function() {

            var deferred = $.Deferred();

            var self = this;
            this.baseapc.execute(self.sqlInit + self.sqlEnd, model, function(data) {
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
            var sql = this.sqlInit;

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
                sql += " AND (";
                $.each(v1, function(k2, v2) {
                    if (k2 > 0) {
                        sql += " OR ";
                    }
                    $.each(v2, function(k3, v3) {
                        sql += k3 + " = " + "'" + v3 + "'";
                    });
                });
                sql += ")";
            });

            sql += this.sqlEnd;
            return sql;
        },

        initMapMarkersWithDb: function() {
            this.markers = [];
            var self = this;

            $.each(this.models, function(k1, v1) {
                if (v1.get("long") > 0 || v1.get("lat") > 0)
                    self.createMarker(v1.get("RowKey"), v1.get("municipio").trim(), parseFloat(v1.get("lat")), parseFloat(v1.get("long")));
            });

            if (typeof APC.views.mapDemanda.markerCluster !== "undefined") {
                APC.views.mapDemanda.markerCluster.clearMarkers();
            }
            require(['markerclustererCompiled'], function() {
                APC.views.mapDemanda.markerCluster = new MarkerClusterer(APC.views.mapDemanda.map, self.markers, {
                    maxZoom: 11,
                    gridSize: 50
                });
            });
            APC.views.mapDemanda.map.fitBounds(self.bounds);
        },

        initMapMarkersWithGeo: function() {
            var self = this;
            this.geoCoder().done(function() {
                APC.views.mapDemanda.map.fitBounds(self.bounds);
            });
        },

        geoCoder: function() {
            var geoDeferred = $.Deferred();

            var search = this.models[this.nextAddress].get("municipio");
            if (this.nextAddress < this.length - 1) {
                setTimeout("APC.collections.demCollection.getAddress('" + search + "')", this.delay);
                this.nextAddress++;
            } else {
                geoDeferred.resolve();
            }
            return geoDeferred.promise();
        },

        getAddress: function(search) {
            var self = this;
            this.geo.geocode({
                address: search
            }, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    var p = results[0].geometry.location;
                    var lat = p.lat();
                    var lng = p.lng();
                    self.createMarker(search, lat, lng);
                    self.delay = 100;
                } else {
                    if (status == google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
                        self.nextAddress--;
                        self.delay++;
                    } else {
                        var reason = "Code " + status;
                        console.error('address="' + search + '" error=' + reason + '(delay=' + self.delay + 'ms)');
                    }
                }
                self.geoCoder();
            });
        },

        createMarker: function(RowKey, add, lat, lng) {
            var self = this;
            var contentString = '<a href="#proyectos/' + RowKey + '">' + add + '</a>';
            var marker = new google.maps.Marker({
                position: new google.maps.LatLng(lat, lng),
                map: APC.views.mapDemanda.map,
                zIndex: Math.round(4.5 * -100000) << 5
            });

            this.markers.push(marker);

            google.maps.event.addListener(marker, 'click', function() {

                if (typeof APC.collections.demByMunicipios === 'undefined')
                    APC.collections.demByMunicipios = new demandaByMunicipios();

                $.when(APC.collections.demByMunicipios.findByMunicipio(add)).done(function() {
                    var modal = new modalView({
                        id: RowKey,
                        title: add,
                        collection: APC.collections.demByMunicipios
                    });
                    setTimeout(function() {
                        modal.render();
                    }, 600);
                });
            });

            this.bounds.extend(marker.position);
        }

    });

});
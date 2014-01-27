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

        sqlInit: "select * from demanda LEFT join dane on (((demanda.municipio like dane.nommun) and (demanda.territorio like dane.nomdep)) or ((demanda.municipio NOT like dane.nommun) and (demanda.territorio like dane.nomdep) and demanda.municipio = '' and demanda.territorio = 'AMBITO NACIONAL') OR ((demanda.municipio = dane.nommun) and (demanda.territorio like dane.nomdep) and demanda.municipio = '' and demanda.territorio != 'AMBITO NACIONAL' AND dane.nommun != 'AMBITO NACIONAL')) ",

        sqlEnd: "",

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
                sql += " WHERE (";
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
            console.log(sql);
            return sql;
        },

        initMapMarkersWithDb: function() {
            this.markers = [];
            var self = this;

            $.each(this.models, function(k1, v1) {
                if (v1.get("long") > 0 || v1.get("lat") > 0)                    
                    self.createMarker(v1.get("RowKey"), v1.get("territorio").trim(), parseFloat(v1.get("lat")), parseFloat(v1.get("long")));
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
            // APC.views.mapDemanda.map.fitBounds(self.bounds);
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
            
            require(['async!https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false'], function() {
                
                var marker = new google.maps.Marker({
                    position: new google.maps.LatLng(lat, lng),
                    map: APC.views.mapDemanda.map,
                    zIndex: Math.round(4.5 * -100000) << 5
                });

                self.markers.push(marker);

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

                self.bounds.extend(marker.position);
            });
        }

    });

});
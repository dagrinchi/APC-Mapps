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

        sqlInit: "select DISTINCT * from demanda inner join dane on (((CAST(demanda.codigomunicipios AS UNSIGNED) = CAST(dane.codmun AS UNSIGNED)) and (CAST(demanda.codigoterritorios AS UNSIGNED) = CAST(dane.coddep AS UNSIGNED))))",

        sqlEnd: "",

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
            this.baseapc.execute(self.sqlInit + self.sqlEnd, model, function(data) {
                self.reset(data);
                deferred.resolve();
            });

            return deferred.promise();
        },

        findBySelection: function() {
            var deferred = $.Deferred();
            var self = this;

            var actores = APC.selection.demanda.cols['actor'].length;
            var territorios = APC.selection.demanda.cols['territorio'].length;
            var municipios = APC.selection.demanda.cols['municipio'].length;
            var areas = APC.selection.demanda.cols['codigoenci'].length;
            var sectores = APC.selection.demanda.cols['sectorliderpolitica'].length;

            if (actores > 0 || territorios > 0 || municipios > 0 || areas > 0 || sectores > 0) {
                this.baseapc.execute(this.buildSQL(), model, function(data) {
                    self.reset(data);
                    deferred.resolve();
                    self.initMapMarkersWithDb();
                });
            } else {
                APC.views.mapDemanda.markerCluster.clearMarkers();
                deferred.resolve();
            }

            return deferred.promise();
        },

        buildSQL: function() {
            var selection = {
                cols: [],
                vals: []
            };
            $.each(APC.selection.demanda.cols, function(k1, v1) {
                if (v1.length > 0) {
                    selection.cols.push(k1);
                    selection.vals.push(v1);
                }
            });
            var sql = this.sqlInit;

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
            return sql;
        },

        initMapMarkersWithDb: function() {            
            var self = this;
            if (typeof this.models === "undefined") {
                console.log("initMapMarkersWithDb: Nothing!");
                APC.collections.demCollection.initMapMarkersWithDb();
            } else {
                self.markers = [];
                $.each(self.models, function(k1, v1) {
                    //if (v1.get("long") > 0 || v1.get("lat") > 0)
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
            }
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

            var marker = new google.maps.Marker({
                position: new google.maps.LatLng(lat, lng),
                map: APC.views.mapDemanda.map,
                zIndex: Math.round(4.5 * -100000) << 5
            });

            self.markers.push(marker);

            google.maps.event.addListener(marker, 'click', function() {

                if (typeof APC.collections.demByMunicipios === 'undefined')
                    APC.collections.demByMunicipios = new demandaByMunicipios();

                APC.selection.demanda.cols['lat'] = [];
                APC.selection.demanda.cols['lat'].push(lat);

                APC.selection.demanda.cols['long'] = [];
                APC.selection.demanda.cols['long'].push(lng);

                APC.selection.demanda.cols['territorio'] = [];
                APC.selection.demanda.cols['territorio'].push(add);

                $.when(APC.collections.demByMunicipios.findByMunicipio()).done(function() {
                    var modal = new modalView({
                        id: RowKey,
                        title: add,
                        collection: APC.collections.demByMunicipios
                    });
                    modal.render();
                });
            });

            self.bounds.extend(marker.position);
        }

    });

});
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
        model = require('app/models/sursur'),
        modalView = require('app/views/modalSursur'),
        sursurByCountry = require('app/collections/sursurByCountry');

    var $ = require('jquery');

    return Backbone.Collection.extend({

        markers: [],

        sqlInit: "SELECT DISTINCT pais FROM sursur ",

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

            this.baseapc.execute("SELECT DISTINCT pais FROM sursur ORDER BY pais", model, function(data) {
                self.reset(data);
                deferred.resolve();
            });

            return deferred.promise();
        },

        findBySelection: function() {
            console.log("findBySelection: " + this.buildSQL());

            var deferred = $.Deferred();
            var self = this;

            this.baseapc.execute(this.buildSQL(), model, function(data) {
                self.reset(data);
                deferred.resolve();
                setTimeout(function() {
                    self.clearMarkers();
                    self.initMapMarkers();
                }, 3000);
            });

            return deferred.promise();
        },

        buildSQL: function() {
            var selection = {
                cols: [],
                vals: []
            };
            $.each(APC.selection.sursur.cols, function(k1, v1) {
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
                    sql += selection.cols[k1] + " = " + "'" + v2 + "'";
                });
                sql += ")";
            });
            return sql;
        },

        initMapMarkers: function() {
            var self = this;
            this.geoCoder().done(function() {
                APC.views.mapSursur.map.fitBounds(self.bounds);
            });
        },

        geoCoder: function() {
            var geoDeferred = $.Deferred();
            var pais = this.models[this.nextAddress].get("pais");

            if (this.nextAddress < this.length) {
                setTimeout("APC.collections.sursurCollection.getAddress('" + pais + "')", this.delay);
                this.nextAddress++;
            } else {
                geoDeferred.resolve();
            }
            return geoDeferred.promise();
        },

        getAddress: function(pais) {
            var self = this;

            self.geo.geocode({
                address: pais
            }, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    var p = results[0].geometry.location;
                    var lat = p.lat();
                    var lng = p.lng();
                    self.createMarker(lat, lng, pais);
                    // console.log('address=' + search + ' lat=' + lat + ' lng=' + lng + '(delay=' + self.delay + 'ms)');
                    self.delay = 100;
                } else {
                    if (status == google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
                        self.nextAddress--;
                        self.delay++;
                    } else {
                        var reason = "Code " + status;
                        console.error('address="' + pais + '" error=' + reason + '(delay=' + self.delay + 'ms)');
                    }
                }
                self.geoCoder();
            });
        },

        createMarker: function(lat, lng, pais) {
            var self = this;

            var marker = new google.maps.Marker({
                position: new google.maps.LatLng(lat, lng),
                map: APC.views.mapSursur.map,
                zIndex: Math.round(4.5 * -100000) << 5,
                icon: "img/sursur/" + pais + ".png",
                animation: google.maps.Animation.DROP
            });

            self.markers.push(marker);

            google.maps.event.addListener(marker, 'click', function() {

                if (typeof APC.collections.sursurByCountry === 'undefined')
                    APC.collections.sursurByCountry = new sursurByCountry();

                APC.selection.sursur.cols['pais'] = [];
                APC.selection.sursur.cols['pais'].push(pais);

                $.when(APC.collections.sursurByCountry.findByCountry()).done(function() {
                    var modal = new modalView({
                        id: pais,
                        title: pais,
                        collection: APC.collections.sursurByCountry
                    });
                    setTimeout(function() {
                        modal.render();
                    }, 500);
                });
            });

            self.bounds.extend(marker.position);
        },

        clearMarkers: function() {
            var self = this;
            this.delay = 100;
            this.nextAddress = 0;
            for (var i = 0; i < self.markers.length; i++) {
                self.markers[i].setMap(null);
            }
        }

    });

});
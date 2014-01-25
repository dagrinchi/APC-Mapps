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

            this.baseapc.execute("SELECT DISTINCT pais FROM sursur ORDER BY pais", model, function(data) {
                self.reset(data);
                deferred.resolve();
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
                    self.clearMarkers();
                    self.initMapMarkers();
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

            console.log(sql);
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

            require(['async!https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false'], function() {
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
            });
        },

        createMarker: function(lat, lng, pais) {
            var self = this;

            require(['async!https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false'], function() {
                var marker = new google.maps.Marker({
                    position: new google.maps.LatLng(lat, lng),
                    map: APC.views.mapSursur.map,
                    zIndex: Math.round(4.5 * -100000) << 5,
                    icon: "img/sursur/" + pais + ".png"
                    //animation: google.maps.Animation.DROP
                });

                self.markers.push(marker);

                google.maps.event.addListener(marker, 'click', function() {

                    if (typeof APC.collections.sursurByCountry === 'undefined')
                        APC.collections.sursurByCountry = new sursurByCountry();

                    $.when(APC.collections.sursurByCountry.findByCountry(pais)).done(function() {
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
            });
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
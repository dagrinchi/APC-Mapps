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
        model = require('app/models/directorio');

    var $ = require('jquery'),
        deferred = $.Deferred();

    return Backbone.Collection.extend({

        model: model,

        baseapc: {},

        limit : 20,

        offset : 0,

        offByName : 0,

        initialize: function() {
            this.baseapc = new DB(window.openDatabase("apc", "1.0", "APC - Agencia Presidencial de la Cooperación en Colombia", 4145728));
        },

        findByName: function(key) {
            var self = this;
            this.offByName = 0;
            var sql = "SELECT * FROM directorio WHERE nombredelaorganizacion LIKE '%" + key + "%' LIMIT 0, " + this.limit;
            this.baseapc.execute(sql, model, function(data) {
                self.reset(data);
            });
        },

        findByNameNext: function(key) {
            var self = this;
            var sql = "SELECT * FROM directorio WHERE nombredelaorganizacion LIKE '%" + key + "%' LIMIT " + this.offByName + ", " + this.limit;
            this.baseapc.execute(sql, model, function(data) {
                if (data.length > 0) {
                    self.add(data);
                }
            });
        },

        findAll: function() {
            var self = this;
            this.offset = 0;
            var sql = "SELECT * FROM directorio LIMIT 0, " + this.limit;
            this.baseapc.execute(sql, model, function(data) {
                self.reset(data);
                deferred.resolve();
            });
            return deferred.promise();
        },

        findNext: function() {
            var self = this;
            var sql = "SELECT * FROM directorio LIMIT " + this.offset + ", " + this.limit;
            this.baseapc.execute(sql, model, function(data) {
                self.add(data);
            });
        }

    });

});
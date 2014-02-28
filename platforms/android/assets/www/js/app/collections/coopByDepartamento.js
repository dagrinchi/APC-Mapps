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
        DB = require('app/utils/db');

    var $ = require('jquery');

    function buildSQL(sql) {
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
    }

    var ComponenteCooperacion = Backbone.RelationalModel.extend({});

    var ComponenteCollection = Backbone.Collection.extend({

        model: ComponenteCooperacion,

        baseapc: {},

        sync: function(method, model, options) {

            this.baseapc = new DB(window.openDatabase("apc", "1.0", "APC - Agencia Presidencial de la Cooperación en Colombia", 4145728));

            if (method === "read") {
                this.findByArea(options.data, function(data) {
                    options.success(data);
                });
            }

        },

        findByArea: function(codigoarea, cb) {
            var sql = buildSQL("SELECT DISTINCT codigocomponente, componentecooperacion FROM dci INNER JOIN (SELECT dci.terrirorio terr, dane.lat, dane.long FROM dci INNER JOIN dane ON (dane.nomdep LIKE dci.terrirorio and dane.codmun = '') or(dane.nommun LIKE dci.terrirorio) GROUP BY dci.terrirorio) dciterr ON dciterr.terr = dci.terrirorio ");

            if (typeof codigoarea !== "undefined" || codigoarea !== "") {
                sql += " AND (codigoarea = '" + codigoarea + "') ";
            }

            sql += " ORDER BY codigocomponente, componentecooperacion";

            this.baseapc.execute(sql, ComponenteCooperacion, function(data) {
                cb(data);
            });
        }
    });

    var AreaCooperacion = Backbone.RelationalModel.extend({

        // initialize: function() {
        //     this.get("componentes").fetch({
        //         data: this.get("codigoarea")
        //     });
        // },

        relations: [{
            type: Backbone.HasMany,
            key: 'componentes',
            relatedModel: ComponenteCooperacion,
            collectionType: ComponenteCollection
        }]

    });

    var AreaCollection = Backbone.Collection.extend({

        model: AreaCooperacion,

        baseapc: {},

        sync: function(method, model, options) {

            this.baseapc = new DB(window.openDatabase("apc", "1.0", "APC - Agencia Presidencial de la Cooperación en Colombia", 4145728));

            if (method === "read") {
                this.findByTerritorio(function(data) {
                    options.success(data);
                });
            }

        },

        findByTerritorio: function(cb) {
            var sql = buildSQL("SELECT DISTINCT codigoarea, areacooperacion FROM dci INNER JOIN (SELECT dci.terrirorio terr, dane.lat, dane.long FROM dci INNER JOIN dane ON (dane.nomdep LIKE dci.terrirorio and dane.codmun = '') or(dane.nommun LIKE dci.terrirorio) GROUP BY dci.terrirorio) dciterr ON dciterr.terr = dci.terrirorio ");
            sql += " ORDER BY codigoarea, areacooperacion";
            this.baseapc.execute(sql, AreaCooperacion, function(data) {
                cb(data);
            });
        }
    });

    var Territorio = Backbone.RelationalModel.extend({

        // initialize: function() {
        //     this.get("areas").fetch();
        // },

        relations: [{
            type: Backbone.HasMany,
            key: 'areas',
            relatedModel: AreaCooperacion,
            collectionType: AreaCollection
        }]
    });

    return Backbone.Collection.extend({

        baseapc: {},

        model: Territorio,

        sync: function(method, model, options) {

            this.baseapc = new DB(window.openDatabase("apc", "1.0", "APC - Agencia Presidencial de la Cooperación en Colombia", 4145728));

            if (method === "read") {
                this.findByDepartamento(function(data) {
                    options.success(data);
                });
            }

        },

        findByDepartamento: function(cb) {
            var self = this;
            var sql = buildSQL("SELECT DISTINCT terrirorio, puntofocal, direccionpuntofocal, miembrocomite FROM dci INNER JOIN (SELECT dci.terrirorio terr, dane.lat, dane.long FROM dci INNER JOIN dane ON (dane.nomdep LIKE dci.terrirorio and dane.codmun = '') or(dane.nommun LIKE dci.terrirorio) GROUP BY dci.terrirorio) dciterr ON dciterr.terr = dci.terrirorio ");
            this.baseapc.execute(sql, Territorio, function(data) {
                cb(data);
            });
        }

    });

});
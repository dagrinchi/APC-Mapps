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

    var $ = require('jquery'),
        Backbone = require('backbone');

    return Backbone.Router.extend({

        routes: {
            "": "intro",
            "inicio": "inicio",
            "prioridadesdecooperacion": "prioridades",
            "cooperacionsursur": "sursur",
            "proyectos": "proyectos",
            "proyectos/:RowKey": "detalleProyecto",
            "directorio": "directorio",
            "ejecutasproyectos": "ejecutas",
            "acercade": "acercade"
        },

        checkConnection: function() {
            console.log("checkConnection: Comprobando conectividad a internet!");
            var networkState = navigator.connection.type;
            if (networkState == Connection.NONE || networkState == Connection.UNKNOWN) {
                console.log("checkConnection: No hay internet!");
                return false;
            } else {
                console.log("checkConnection: Si hay internet!");
                return true;
            }
        },

        initialize: function() {
            if (this.checkConnection()) {
                require(['app/views/map'], function(MapView) {
                    if (typeof APC.views.mapDemanda === 'undefined')
                        APC.views.mapDemanda = new MapView({
                            id: "map-canvas-a",
                            className: "map-canvas map-canvas-a",
                            zoom: 4,
                            minZoom: 4,
                            latitude: 19.872195816700884,
                            longitude: -106.65585937499998
                            // ,
                            // styles: [{
                            //     "stylers": [{
                            //         "invert_lightness": true
                            //     }]
                            // }, {
                            //     "featureType": "landscape",
                            //     "stylers": [{
                            //         "color": "#003c81"
                            //     }]
                            // }, {
                            //     "featureType": "road",
                            //     "stylers": [{
                            //         "color": "#d4e4e4"
                            //     }, {
                            //         "lightness": -19
                            //     }]
                            // }, {
                            //     "featureType": "poi",
                            //     "stylers": [{
                            //         "visibility": "off"
                            //     }]
                            // }, {
                            //     "featureType": "administrative",
                            //     "stylers": [{
                            //         "lightness": 25
                            //     }]
                            // }]
                        });

                    if (typeof APC.views.mapCooperacion === 'undefined')
                        APC.views.mapCooperacion = new MapView({
                            id: "map-canvas-b",
                            className: "map-canvas map-canvas-b",
                            zoom: 4,
                            minZoom: 4,
                            latitude: 19.872195816700884,
                            longitude: -106.65585937499998
                            // ,
                            // styles: [{
                            //     "stylers": [{
                            //         "invert_lightness": true
                            //     }]
                            // }, {
                            //     "featureType": "landscape",
                            //     "stylers": [{
                            //         "color": "#003c81"
                            //     }]
                            // }, {
                            //     "featureType": "road",
                            //     "stylers": [{
                            //         "color": "#d4e4e4"
                            //     }, {
                            //         "lightness": -19
                            //     }]
                            // }, {
                            //     "featureType": "poi",
                            //     "stylers": [{
                            //         "visibility": "off"
                            //     }]
                            // }, {
                            //     "featureType": "administrative",
                            //     "stylers": [{
                            //         "lightness": 25
                            //     }]
                            // }]
                        });

                    if (typeof APC.views.mapSursur === 'undefined')
                        APC.views.mapSursur = new MapView({
                            id: "map-canvas-c",
                            className: "map-canvas map-canvas-c",
                            zoom: 1,
                            minZoom: 1,
                            latitude: 84.82717505894134,
                            longitude: -182.87009974999998
                            // ,
                            // styles: [{
                            //     "stylers": [{
                            //         "invert_lightness": true
                            //     }]
                            // }, {
                            //     "featureType": "landscape",
                            //     "stylers": [{
                            //         "color": "#8c44ae"
                            //     }]
                            // }, {
                            //     "featureType": "road",
                            //     "stylers": [{
                            //         "color": "#d4e4e4"
                            //     }, {
                            //         "lightness": -19
                            //     }]
                            // }, {
                            //     "featureType": "poi",
                            //     "stylers": [{
                            //         "visibility": "off"
                            //     }]
                            // }, {
                            //     "featureType": "administrative",
                            //     "stylers": [{
                            //         "lightness": 25
                            //     }]
                            // }]
                        });

                });
            } else {
                navigator.notification.alert('No hay una conexión a internet!', function() {
                }, 'Atención', 'Reintentar');
            }
        },

        intro: function() {
            require(['app/utils/init', 'app/views/intro'], function(Initdb, IntroView) {

                APC.views.introView = new IntroView();
                APC.views.introView.render();

                APC.utils.initdb = new Initdb();
                $.when(APC.utils.initdb).then(function(r) {
                    APC.views.introView.progressBar(r.count, r.msg);
                    setTimeout(function() {
                        APC.router.navigate("inicio", {
                            trigger: true
                        });
                    }, 1000);
                }, function(err) {
                    navigator.notification.alert('El repositorio de datos Open Data no está disponible ó se ha perdido la conexión con la red, inténtalo más tarde!', function() {}, 'Atención', 'Reintentar');
                }, function(r) {
                    APC.views.introView.progressBar(r.count, r.msg);
                });
            });

            return this;
        },

        inicio: function() {
            require(['app/views/home'], function(HomeView) {
                if (typeof APC.views.homeView === 'undefined') {
                    APC.views.homeView = new HomeView();
                }
                APC.views.homeView.render();
            });
        },

        prioridades: function() {
            require([
                'app/collections/demanda',
                'app/collections/demActores',
                'app/collections/demTerritorios',
                'app/collections/demMunicipios',
                'app/collections/demAreas',
                'app/collections/demSectores',
                'app/collections/proTerritorios',
                'app/collections/proAreas',
                'app/collections/cooperacion',
                'app/views/prioridades'
            ], function(
                DemandaCollection,
                DemActoresCollection,
                DemTerritoriosCollection,
                DemMunicipiosCollection,
                DemAreasCollection,
                DemSectoresCollection,
                ProTerritoriosCollection,
                ProAreasCollection,
                CooperacionCollection,
                PrioridadesPageView) {

                $("#loadingBox").fadeIn(500, function() {
                    if (typeof APC.collections.demCollection === 'undefined')
                        APC.collections.demCollection = new DemandaCollection();

                    if (typeof APC.collections.demActoresCollection === 'undefined')
                        APC.collections.demActoresCollection = new DemActoresCollection();
                    if (typeof APC.collections.demTerritoriosCollection === 'undefined')
                        APC.collections.demTerritoriosCollection = new DemTerritoriosCollection();
                    if (typeof APC.collections.demMunicipiosCollection === 'undefined')
                        APC.collections.demMunicipiosCollection = new DemMunicipiosCollection();
                    if (typeof APC.collections.demAreasCollection === 'undefined')
                        APC.collections.demAreasCollection = new DemAreasCollection();
                    if (typeof APC.collections.demSectoresCollection === 'undefined')
                        APC.collections.demSectoresCollection = new DemSectoresCollection();

                    if (typeof APC.collections.proTerritoriosCollection === 'undefined')
                        APC.collections.proTerritoriosCollection = new ProTerritoriosCollection();
                    if (typeof APC.collections.proAreasCollection === 'undefined')
                        APC.collections.proAreasCollection = new ProAreasCollection();

                    if (typeof APC.collections.coopCollection === 'undefined')
                        APC.collections.coopCollection = new CooperacionCollection();

                    $.when(APC.collections.demCollection.findAll(),
                        APC.collections.coopCollection.findAll(),
                        APC.collections.demActoresCollection.findAll(),
                        APC.collections.demTerritoriosCollection.findAll(),
                        APC.collections.demMunicipiosCollection.findAll(),
                        APC.collections.demAreasCollection.findAll(),
                        APC.collections.demSectoresCollection.findAll(),
                        APC.collections.proTerritoriosCollection.findAll(),
                        APC.collections.proAreasCollection.findAll()).done(function() {

                        if (typeof APC.views.prioridadesPageView === 'undefined')
                            APC.views.prioridadesPageView = new PrioridadesPageView();
                        APC.views.prioridadesPageView.render();
                    });
                });
            });
        },

        sursur: function() {
            require(['app/views/sursur', 'app/collections/sursur'], function(sursurview, sursurCollection) {
                $("#loadingBox").fadeIn(500, function() {
                    if (typeof APC.collections.sursurCollection === 'undefined')
                        APC.collections.sursurCollection = new sursurCollection();
                    $.when(APC.collections.sursurCollection.findAll()).done(function() {
                        APC.views.sursurview = new sursurview();
                        APC.views.sursurview.render();
                        APC.collections.sursurCollection.initMapMarkers();
                    });
                });
            });
        },

        proyectos: function() {
            var self = this;
            require(['app/collections/proyectos', 'app/views/proyectos'], function(ProyectosCollection, ProyectosPageView) {
                $("#loadingBox").fadeIn(500, function() {
                    if (typeof APC.collections.proCollection === 'undefined')
                        APC.collections.proCollection = new ProyectosCollection();
                    $.when(APC.collections.proCollection.findAll()).done(function() {
                        APC.views.ProyectosPageView = new ProyectosPageView({
                            collection: APC.collections.proCollection
                        });
                        APC.views.ProyectosPageView.render();
                    });
                });
            });
        },

        detalleProyecto: function(RowKey) {
            var self = this;
            require(['app/models/proyectos', 'app/views/detalleProyecto'], function(proyectoModel, detalleProyectoView) {
                APC.models.proyecto = new proyectoModel();
                APC.models.proyecto.findByRowKey(RowKey, function(model) {
                    APC.views.detalleProyectoPage = new detalleProyectoView({
                        model: model
                    });
                    APC.views.detalleProyectoPage.render();
                });
            });
        },

        directorio: function() {
            require(['app/collections/directorio', 'app/views/directorio'], function(DirectorioCollection, DirectorioPageView) {
                $("#loadingBox").fadeIn(500, function() {
                    if (typeof APC.collections.directorioCollection === 'undefined')
                        APC.collections.directorioCollection = new DirectorioCollection();
                    $.when(APC.collections.directorioCollection.findAll()).done(function() {
                        APC.views.DirectorioPageView = new DirectorioPageView({
                            collection: APC.collections.directorioCollection
                        });
                        APC.views.DirectorioPageView.render();
                    });
                });
            });

        },

        ejecutas: function() {
            require(['app/views/ejecutas'], function(EjecutasView) {
                $("#loadingBox").fadeIn(500, function() {
                    APC.views.ejecutasView = new EjecutasView();
                    APC.views.ejecutasView.render();
                });
            });
        },

        acercade: function() {
            require(['app/views/acercade'], function(AcercadeView) {
                $("#loadingBox").fadeIn(500, function() {
                    APC.views.acercadeView = new AcercadeView();
                    APC.views.acercadeView.render();
                });
            });
        }

    });

});
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
            "sursur/:RowKey": "detalleSursur",
            "dci/:RowKey": "detalleDci",
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

        },

        intro: function() {
            var position = {
                coords: {
                    latitude: 4.598055600,
                    longitude: -74.075833300
                }
            };
            
            var wh = $(window).height();

            navigator.geolocation.getCurrentPosition(function(gp) {
                position = gp;
            }, function(error) {
                console.error('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
            });
            
            if (this.checkConnection()) {

                require(['app/utils/init', 'app/views/intro', 'app/views/map'], function(Initdb, IntroView, MapView) {

                    APC.views.mapDemanda = new MapView({
                        id: "map-canvas-a",
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        height: (wh - 152) / 2
                    });

                    APC.views.mapCooperacion = new MapView({
                        id: "map-canvas-b",
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        height: (wh - 152) / 2
                    });

                    APC.views.mapSursur = new MapView({
                        id: "map-canvas-c",
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        height: wh - 111
                    });

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
                        navigator.notification.alert('El repositorio de datos Open Data no está disponible ó se ha perdido la conexión con la red, inténtalo más tarde!', function() {
                            Backbone.history.loadUrl("/");
                        }, 'Atención', 'Reintentar');
                    }, function(r) {
                        APC.views.introView.progressBar(r.count, r.msg);
                    });
                    
                });
            } else {
                navigator.notification.alert('No hay una conexión a internet!', function() {
                    console.log("Start again!!!");
                    Backbone.history.loadUrl("/");
                }, 'Atención', 'Reintentar');
            }
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
            if (this.checkConnection() && typeof google !== 'undefined') {
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
            } else {
                navigator.notification.alert('No hay una conexión a internet!', function() {
                    console.log("Start again!!!");
                    Backbone.history.loadUrl("/");
                }, 'Atención', 'Reintentar');
            }
        },

        sursur: function() {
            if (this.checkConnection() && typeof google !== 'undefined') {
                require(['app/views/sursur', 'app/collections/surAreas', 'app/collections/surSectores', 'app/collections/sursur'], function(sursurview, SurAreasCollection, SurSectoresCollection, sursurCollection) {
                    $("#loadingBox").fadeIn(500, function() {
                        
                        if (typeof APC.collections.surAreasCollection === 'undefined')
                            APC.collections.surAreasCollection = new SurAreasCollection();
                        if (typeof APC.collections.surSectoresCollection === 'undefined')
                            APC.collections.surSectoresCollection = new SurSectoresCollection();
                        if (typeof APC.collections.sursurCollection === 'undefined')
                            APC.collections.sursurCollection = new sursurCollection();

                        $.when(APC.collections.surAreasCollection.findAll(),
                            APC.collections.surSectoresCollection.findAll(),
                            APC.collections.sursurCollection.findAll()).done(function() {
                            APC.views.sursurview = new sursurview();
                            APC.views.sursurview.render();
                            APC.collections.sursurCollection.initMapMarkers();
                        });
                    });
                });
            } else {
                navigator.notification.alert('No hay una conexión a internet!', function() {
                    console.log("Start again!!!");
                    Backbone.history.loadUrl("/");
                }, 'Atención', 'Reintentar');
            }
        },

        detalleSursur: function(RowKey) {
            var self = this;
            require(['app/models/sursur', 'app/views/detalleSursurModal'], function(sursurModel, detalleSursurModalView) {
                APC.models.sursur = new sursurModel();
                APC.models.sursur.findByRowKey(RowKey, function(model) {
                    APC.views.detalleSursurModal = new detalleSursurModalView({
                        id: RowKey,
                        model: model
                    });
                    APC.views.detalleSursurModal.render();
                });
            });
            return false;
        },

        proyectos: function() {
            var self = this;
            var wh = $(window).height();
            var limit = 10;

            require(['app/collections/proyectos', 'app/views/proyectos'], function(ProyectosCollection, ProyectosPageView) {
                $("#loadingBox").fadeIn(500, function() {

                    if (typeof APC.collections.proCollection === 'undefined')
                        APC.collections.proCollection = new ProyectosCollection();

                    APC.collections.proCollection.proOff = 0;
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
            require(['app/models/proyectos', 'app/views/detalleProyectoModal'], function(proyectoModel, detalleProyectoModalView) {
                APC.models.proyecto = new proyectoModel();
                APC.models.proyecto.findByRowKey(RowKey, function(model) {
                    APC.views.detalleProyectoModal = new detalleProyectoModalView({
                        id: RowKey,
                        model: model
                    });
                    APC.views.detalleProyectoModal.render();
                });
            });
            return false;
        },

        detalleDci: function(RowKey) {
            var self = this;
            require(['app/models/dci', 'app/views/detalleDciModal'], function(dciModel, detalleDciModalView) {
                APC.models.dci = new dciModel();
                APC.models.dci.findByRowKey(RowKey, function(model) {
                    APC.views.detalleDciModal = new detalleDciModalView({
                        id: RowKey,
                        model: model
                    });
                    APC.views.detalleDciModal.render();
                });
            });
            return false;
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
            if (this.checkConnection()) {
                require(['app/views/acercade'], function(AcercadeView) {
                    $("#loadingBox").fadeIn(500, function() {
                        APC.views.acercadeView = new AcercadeView();
                        APC.views.acercadeView.render();
                    });
                });
            } else {
                navigator.notification.alert('No hay una conexión a internet!', function() {
                    console.log("Start again!!!");
                    Backbone.history.loadUrl("/");
                }, 'Atención', 'Reintentar');
            }
        }

    });

});
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
            "acercade": "acercade",
            "ayuda/:seccion": "ayuda"
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

            if (this.checkConnection()) {

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
            $("#loadingBox").fadeIn();

            var self = this;
            require(['async!https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false'], function() {

                if (self.checkConnection() && typeof google !== 'undefined') {
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
                        'app/views/prioridades',
                        'backbone-relational'
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


                        //if (typeof APC.collections.demCollection === 'undefined')
                            APC.collections.demCollection = new DemandaCollection();
                            APC.collections.demCollection.selection = false;

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

                        //if (typeof APC.collections.coopCollection === 'undefined')
                            APC.collections.coopCollection = new CooperacionCollection();
                            APC.collections.coopCollection.selection = false;

                        $.when(APC.collections.demActoresCollection.findAll(),
                            APC.collections.demTerritoriosCollection.findAll(),
                            APC.collections.demMunicipiosCollection.findAll(),
                            APC.collections.demAreasCollection.findAll(),
                            APC.collections.demSectoresCollection.findAll(),
                            APC.collections.proTerritoriosCollection.findAll(),
                            APC.collections.proAreasCollection.findAll()).done(function() {

                            APC.collections.coopCollection.fetch({
                                "success": function() {
                                    if (typeof APC.views.prioridadesPageView === 'undefined')
                                        APC.views.prioridadesPageView = new PrioridadesPageView();

                                    APC.views.prioridadesPageView.clearSelection();
                                    APC.views.prioridadesPageView.render();

                                    APC.collections.coopCollection.initMapMarkersWithDb();
                                }
                            });
                        });
                    });
                } else {
                    navigator.notification.alert('No hay una conexión a internet!', function() {
                        console.log("Start again!!!");
                        Backbone.history.loadUrl("/");
                    }, 'Atención', 'Reintentar');
                }

            });
        },

        sursur: function() {
            $("#loadingBox").fadeIn();

            var self = this;
            require(['async!https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false'], function() {

                if (self.checkConnection() && typeof google !== 'undefined') {
                    require(['app/views/sursur', 'app/collections/surAreas', 'app/collections/surSectores', 'app/collections/sursur'], function(sursurview, SurAreasCollection, SurSectoresCollection, sursurCollection) {

                        if (typeof APC.collections.surAreasCollection === 'undefined')
                            APC.collections.surAreasCollection = new SurAreasCollection();
                        if (typeof APC.collections.surSectoresCollection === 'undefined')
                            APC.collections.surSectoresCollection = new SurSectoresCollection();
                        if (typeof APC.collections.sursurCollection === 'undefined')
                            APC.collections.sursurCollection = new sursurCollection();

                        $.when(APC.collections.surAreasCollection.findAll(),
                            APC.collections.surSectoresCollection.findAll(),
                            APC.collections.sursurCollection.findAll()).done(function() {

                            if (typeof APC.views.sursurview === 'undefined')
                                APC.views.sursurview = new sursurview();

                            APC.views.sursurview.clearSelection();
                            APC.collections.sursurCollection.clearMarkers();
                            APC.collections.sursurCollection.initMapMarkers();
                            APC.views.sursurview.render();
                        });
                    });
                } else {
                    navigator.notification.alert('No hay una conexión a internet!', function() {
                        console.log("Start again!!!");
                        Backbone.history.loadUrl("/");
                    }, 'Atención', 'Reintentar');
                }

            });
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
            $("#loadingBox").fadeIn();
            var self = this;
            var wh = $(window).height();
            var limit = 10;

            require(['app/collections/proyectos', 'app/collections/sursurProyectos', 'app/views/proyectos'], function(ProyectosCollection, SursurProyectosColl, ProyectosPageView) {
                if (typeof APC.collections.proCollection === 'undefined')
                    APC.collections.proCollection = new ProyectosCollection();

                if (typeof APC.collections.sursurProCollection === 'undefined')
                    APC.collections.sursurProCollection = new SursurProyectosColl();

                $.when(APC.collections.proCollection.findAll(), APC.collections.sursurProCollection.findAll()).done(function() {
                    APC.views.ProyectosPageView = new ProyectosPageView();
                    APC.views.ProyectosPageView.render();
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
            $("#loadingBox").fadeIn();
            require(['app/collections/directorio', 'app/views/directorio'], function(DirectorioCollection, DirectorioPageView) {
                if (typeof APC.collections.directorioCollection === 'undefined')
                    APC.collections.directorioCollection = new DirectorioCollection();
                $.when(APC.collections.directorioCollection.findAll()).done(function() {
                    APC.views.DirectorioPageView = new DirectorioPageView({
                        collection: APC.collections.directorioCollection
                    });
                    APC.views.DirectorioPageView.render();
                });
            });

        },

        ejecutas: function() {
            $("#loadingBox").fadeIn();
            require(['app/views/ejecutas'], function(EjecutasView) {
                if (typeof APC.views.ejecutasView === "undefined")
                    APC.views.ejecutasView = new EjecutasView();
                APC.views.ejecutasView.render();
            });
        },

        acercade: function() {
            $("#loadingBox").fadeIn();
            if (this.checkConnection()) {
                require(['app/views/acercade'], function(AcercadeView) {
                    if (typeof APC.views.acercadeView === "undefined")
                        APC.views.acercadeView = new AcercadeView();
                    APC.views.acercadeView.render();
                });
            } else {
                navigator.notification.alert('No hay una conexión a internet!', function() {
                    console.log("Start again!!!");
                    Backbone.history.loadUrl("/");
                }, 'Atención', 'Reintentar');
            }
        },

        ayuda: function(seccion) {
            require(['app/views/modalHelp', 'text!tpl/' + seccion + '.html'], function(modalHelp, tpl) {
                if (typeof APC.views[seccion] === "undefined")
                    APC.views[seccion] = new modalHelp({
                        id: seccion,
                        title: "Ayuda",
                        content: tpl
                    });
                APC.views[seccion].render();
            });

            return false;
        }

    });

});
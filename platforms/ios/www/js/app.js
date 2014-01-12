/**
 * COOL4CODE
 * Authors:
 *
 * Alejandro Zarate: azarate@cool4code.com,
 * Marcos Aguilera: maguilera@cool4code.com,
 * Paola Vanegas: pvanegas@cool4code.com,
 * David Alméciga: walmeciga@cool4code.com"
 */
var APC = {
    router: {},
    models: {},
    collections: {},
    views: {},
    utils: {},
    selection: {
        demanda: {
            cols: {
                actor: [],
                territorio: [],
                municipio: [],
                otrossectoresrelacionados: [],
                sectorliderpolitica: []
            }
        },
        dci: {
            cols: {
                terrirorio: [],
                areacooperacion: []
            }
        }
    }
};

require.config({

    waitSeconds: 120,

    baseUrl: 'js/lib',

    paths: {
        app: '../app',
        tpl: '../tpl',
        bootstrap: '../../bootstrap/js',
        async: '../lib/requirejs-plugins/async',
        goog: '../lib/requirejs-plugins/goog'
    },

    shim: {
        'backbone': {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        'underscore': {
            exports: '_'
        }
    }
});

require(['../../phonegap', 'fastclick', 'app/router'], function(phonegap, fclick, router) {
    document.addEventListener('deviceready', function() {
        document.addEventListener("offline", function() {
            navigator.notification.alert('No hay una conexión a internet!', function() {}, 'Atención', 'Reintentar');
        }, false);

        fclick.attach(document.body);
        APC.router = new router();
        Backbone.history.start();
    });   
});
// require(['fastclick', 'app/router'], function(fclick, router) {
//     fclick.attach(document.body);
//     APC.router = new router();
//     Backbone.history.start();
// });
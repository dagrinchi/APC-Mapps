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
        Backbone = require('backbone'),
        _ = require('underscore'),
        tpl = require('text!tpl/prioridades.html'),
        modalTpl = require('text!tpl/modalList.html'),
        listItemTpl = require('text!tpl/listItem.html'),
        bootstrap = require('bootstrap/bootstrap');

    var listItemView = Backbone.View.extend({
        tagName: 'div',
        className: '',
        template: _.template(listItemTpl),
        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        }
    });

    var listEl = Backbone.View.extend({
        render: function() {
            this.collection.each(function(m) {
                var itemView = new listItemView({
                    model: m
                });
                this.$el.append(itemView.render().el);
            }, this);
            return this;
        }
    });

    var modalList = Backbone.View.extend({

        className: "modal hide fade",

        initialize: function() {
            var self = this;
            this.template = _.template(modalTpl, {
                title: self.options.title,
                list: self.options.list
            });            
        },

        events: {
            "click .items": "chkItem",
            "click .ok": "btnOK"
        },

        btnOK: function() {
            if (this.options.table === "demanda")
                $.when(APC.collections.demCollection.findBySelection()).done(function() {
                    APC.selection.demanda = {
                        cols: {
                            actor: [],
                            territorio: [],
                            municipio: [],
                            otrossectoresrelacionados: [],
                            sectorliderpolitica: []
                        }
                    };
                });

            if (this.options.table === "dci")
                $.when(APC.collections.coopCollection.findBySelection()).done(function() {
                    APC.selection.dci = {
                        cols: {
                            terrirorio: [],
                            areacooperacion: []
                        }
                    };
                });
        },

        chkItem: function(e) {
            var self = this;
            if (e.currentTarget.checked) {
                APC.selection[self.options.table]["cols"][self.options.cols].push(e.currentTarget.value);
            } else {
                APC.selection[self.options.table]["cols"][self.options.cols].splice(APC.selection[self.options.table]["cols"][self.options.cols].indexOf(e.currentTarget.value), 1);
            }
        },

        render: function() {            
            this.$el.html(this.template);
            this.$el.modal('show');
            this.$el.children(".modal-body").height($(window).height() - 200);
            return this;
        }
    });

    return Backbone.View.extend({
        el: "body",

        template: _.template(tpl),

        initialize: function() {
            
        },

        events: {
            "click #btnDemActores": "btnDemActores",
            "click #btnDemTerritorios": "btnDemTerritorios",
            "click #btnDemMunicipios": "btnDemMunicipios",
            "click #btnDemAreas": "btnDemAreas",
            "click #btnDemSectores": "btnDemSectores",
            "click #btnProTerritorios": "btnProTerritorios",
            "click #btnProAreas": "btnProAreas",
            "click .share": "btnShare"
        },

        btnShare: function() {
            require(['html2canvas'], function() {
                html2canvas(document.getElementsByTagName("body"), {
                    useCORS: true,
                    onrendered: function(canvas) {                        
                        window.plugins.socialsharing.available(function(isAvailable) {
                            if (isAvailable) {                                
                                window.plugins.socialsharing.share("APC-Mapps", "APC-Mapps", canvas.toDataURL(), "http://www.apccolombia.gov.co/",
                                function(){
                                    console.log("THE MUSIC IS THE ANSWER!!!!");
                                },
                                function(e){
                                    console.log("WITHOUT MUSIC THE LIFE IS A MISTAKE!!!!" + e);
                                });
                            }
                        });
                    }
                });
            });
        },

        btnDemActores: function() {            
            APC.views.demActoresListView = new listEl({
                collection: APC.collections.demActoresCollection
            });

            APC.views.demActoresModal = new modalList({
                id: "demActoresModal",
                title: "Cooperantes",
                list: APC.views.demActoresListView.render().$el.html(),
                table: "demanda",
                cols: "actor"
            });
            APC.views.demActoresModal.render();
        },

        btnDemTerritorios: function() {            
            APC.views.demTerritoriosListView = new listEl({
                collection: APC.collections.demTerritoriosCollection
            });

            APC.views.demTerritoriosModal = new modalList({
                id: "demTerritoriosModal",
                title: "Territorios",
                list: APC.views.demTerritoriosListView.render().$el.html(),
                table: "demanda",
                cols: "territorio"
            });
            APC.views.demTerritoriosModal.render();
        },

        btnDemMunicipios: function() {            
            APC.views.demMunicipiosListView = new listEl({
                collection: APC.collections.demMunicipiosCollection
            });

            APC.views.demMunicipiosModalListView = new modalList({
                id: "demMunicipiosModal",
                title: "Municipios",
                list: APC.views.demMunicipiosListView.render().$el.html(),
                table: "demanda",
                cols: "municipio"
            });
            APC.views.demMunicipiosModalListView.render();
        },

        btnDemAreas: function() {            
            APC.views.demAreasListView = new listEl({
                collection: APC.collections.demAreasCollection
            });

            APC.views.demAreasModalListView = new modalList({
                id: "demAreasModal",
                title: "Áreas",
                list: APC.views.demAreasListView.render().$el.html(),
                table: "demanda",
                cols: "otrossectoresrelacionados"
            });
            APC.views.demAreasModalListView.render();
        },

        btnDemSectores: function() {            
            APC.views.demSectoresListView = new listEl({
                collection: APC.collections.demSectoresCollection
            });

            APC.views.demSectoresModalListView = new modalList({
                id: "demSectoresModal",
                title: "Sectores",
                list: APC.views.demSectoresListView.render().$el.html(),
                table: "demanda",
                cols: "sectorliderpolitica"
            });
            APC.views.demSectoresModalListView.render();
        },

        btnProTerritorios: function() {            
            APC.views.proTerritoriosListView = new listEl({
                collection: APC.collections.proTerritoriosCollection
            });

            APC.views.proTerritoriosModalListView = new modalList({
                id: "proTerritoriosModal",
                title: "Territorios",
                list: APC.views.proTerritoriosListView.render().$el.html(),
                table: "dci",
                cols: "terrirorio"
            });
            APC.views.proTerritoriosModalListView.render();
        },

        btnProAreas: function() {            
            APC.views.proAreasListView = new listEl({
                collection: APC.collections.proAreasCollection
            });

            APC.views.proAreasModalListView = new modalList({
                id: "proAreasModal",
                title: "Áreas",
                list: APC.views.proAreasListView.render().$el.html(),
                table: "dci",
                cols: "areacooperacion"
            });
            APC.views.proAreasModalListView.render();
        },

        render: function() {
            this.$el.html(this.template);

            APC.views.mapDemanda.render();
            APC.views.mapCooperacion.render();

            google.maps.event.addListener(APC.views.mapDemanda.map, 'dragend', function() {
                APC.views.mapCooperacion.map.setCenter(APC.views.mapDemanda.map.getCenter());
                APC.views.mapCooperacion.map.setZoom(APC.views.mapDemanda.map.getZoom());
            });
            google.maps.event.addListener(APC.views.mapCooperacion.map, 'dragend', function() {
                APC.views.mapDemanda.map.setCenter(APC.views.mapCooperacion.map.getCenter());
                APC.views.mapDemanda.map.setZoom(APC.views.mapCooperacion.map.getZoom());
            });
            
            return this;
        }
    });

});
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
     proyectoTpl = require('text!tpl/proyectosItem.html'),
     sursurTpl = require('text!tpl/sursurItem.html'),
     proyectosPageTpl = require('text!tpl/proyectosPage.html');

   var ProyectoView = Backbone.View.extend({

     tagName: 'li',
     className: 'topcoat-list__item',
     template: _.template(proyectoTpl),

     initialize: function() {
       var data = this.model.toJSON();
       this.$el.on("tap", function() {
         document.location.hash = "#proyectos/" + data["RowKey"];
       });
     },

     render: function() {
       this.$el.html(this.template(this.model.toJSON()));
       return this;
     }
   });

   var ProyectosView = Backbone.View.extend({

     tagName: "ul",
     className: 'topcoat-list__container',

     initialize: function() {
       this.collection.bind("add", this.addOne, this);
       this.collection.bind("reset", this.render, this);
     },

     addOne: function(proyecto) {
       var proyectoView = new ProyectoView({
         model: proyecto
       });
       this.$el.append(proyectoView.render().el);
     },

     render: function() {
       this.$el.empty();

       var frag = document.createDocumentFragment();
       this.collection.each(function(proyecto) {
         var proyectoView = new ProyectoView({
           model: proyecto
         });
         this.$el.append(frag.appendChild(proyectoView.render().el));
       }, this);
       return this;
     }
   });

   var SursurView = Backbone.View.extend({

     tagName: 'li',
     className: 'topcoat-list__item',
     template: _.template(sursurTpl),

     initialize: function() {
       var data = this.model.toJSON();
       this.$el.on("tap", function() {
         document.location.hash = "#sursur/" + data["RowKey"];
       });
     },

     render: function() {
       this.$el.html(this.template(this.model.toJSON()));
       return this;
     }
   });


   var sursurListView = Backbone.View.extend({

     tagName: "ul",
     className: 'topcoat-list__container',

     initialize: function() {
       this.collection.bind("add", this.addOne, this);
       this.collection.bind("reset", this.render, this);
     },

     addOne: function(sursur) {
       var sursurView = new SursurView({
         model: sursur
       });
       this.$el.append(sursurView.render().el);
     },

     render: function() {
       this.$el.empty();

       var frag = document.createDocumentFragment();
       this.collection.each(function(sursur) {
         var sursurView = new SursurView({
           model: sursur
         });
         this.$el.append(frag.appendChild(sursurView.render().el));
       }, this);
       return this;
     }
   });

   return Backbone.View.extend({

     el: "body",

     events: {
       "keyup #search-project": "searchProyectos",
       "click #demandProyects": "proyectosDemanda",
       "click #southProyects": "proyectosSursur"
     },

     searchProyectos: function(event) {
       var key = $('#search-project').val();
       if (key.length > 0) {
         APC.collections.proCollection.findByName(key);
         APC.collections.sursurProCollection.findByName(key);
       } else {
         APC.collections.proCollection.findAll();
         APC.collections.sursurProCollection.findAll();
       }

       // $("#projectList").off("scroll");
       // $("#sursurList").off("scroll");
     },

     proyectosDemanda: function() {
       $("#demandProyects").addClass("active");
       $("#southProyects").removeClass("active");
       $("#sursurList").hide();
       $("#projectList").fadeIn();

       $('#search-project').val("");
       APC.collections.proCollection.findAll();

       return false;
     },

     proyectosSursur: function() {
       $("#southProyects").addClass("active");
       $("#demandProyects").removeClass("active");
       var self = this;

       $("#projectList").hide();
       $("#sursurList").fadeIn();

       $('#search-project').val("");
       APC.collections.sursurProCollection.findAll();

       require(['iscroll'], function() {
         var sursurScroll = new IScroll('#sursurList', {
           tap: true
         });
         sursurScroll.on('scrollEnd', self.scrollSursurList);
       });

       return false;
     },

     scrollProyectosList: function() {
       if (this.y === this.maxScrollY) {
         if ($('#search-project').val().length > 0) {
           APC.collections.proCollection.proByNameOff += 20;
           APC.collections.proCollection.findByNameNext($('#search-project').val());
         } else {
           APC.collections.proCollection.proOff += 20;
           APC.collections.proCollection.findNext();
         }
         this.refresh();
       }
     },

     scrollSursurList: function() {
       if (this.y === this.maxScrollY) {
         if ($('#search-project').val().length > 0) {
           APC.collections.sursurProCollection.surOsurByNameOff += 20;
           APC.collections.sursurProCollection.findByNameNext($('#search-project').val());
         } else {
           APC.collections.sursurProCollection.surOff += 20;
           APC.collections.sursurProCollection.findNext();
         }
         this.refresh();
       }
     },

     render: function() {
       var self = this;
       var listProyectos = new ProyectosView({
         collection: APC.collections.proCollection
       });

       var listSursur = new sursurListView({
         collection: APC.collections.sursurProCollection
       });

       this.$el.html(_.template(proyectosPageTpl));

       $("#projectList").height($(window).height() - 167);
       $("#projectList").children().html(listProyectos.render().el);
       $("#sursurList").height($(window).height() - 167);
       $("#sursurList").children().html(listSursur.render().el);

       require(['iscroll'], function() {
         var projectScroll = new IScroll('#projectList', {
           tap: true
         });
         projectScroll.on('scrollEnd', self.scrollProyectosList);
       });

       return this;
     }
   });
 });
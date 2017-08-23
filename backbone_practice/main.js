require.config({
	paths: {
		jquery: "https://cdn.bootcss.com/jquery/3.2.1/jquery.min",
		jqueryui: "https://cdn.bootcss.com/jqueryui/1.12.1/jquery-ui",
		underscore: "https://cdn.bootcss.com/underscore.js/1.8.3/underscore-min",
		underscore_string: "https://cdn.bootcss.com/underscore.string/3.3.4/underscore.string.min",
		backbone: "https://cdn.bootcss.com/backbone.js/1.3.3/backbone-min",
		localStorage: "https://cdn.bootcss.com/backbone-localstorage.js/1.1.16/backbone.localStorage-min",
		bootstrap: "https://cdn.bootcss.com/bootstrap/3.3.7/js/bootstrap.min",
		bootbox: "https://cdn.bootcss.com/bootbox.js/4.4.0/bootbox.min",
	},
	shim: {
		underscore: {
			exports: '_',
		},
		underscore_string: {
			deps: ['underscore'],
			exports: '_s',
		},
		backbone: {
			deps: ['underscore', 'jquery'],
			exports: 'Backbone',
		},
		localStorage: {
			deps: ['backbone'],
		},
		bootbox: {
			deps: ['jquery', 'bootstrap'],
			exports: 'bootbox'
		},
		bootstrap: {
			deps: ['jquery'],
		},
		jqueryui: {
			deps: ['jquery'],
		}
	},
})


require(
	[
		'underscore_string',
		'backbone',
		'localStorage',
		'bootbox',
		'jqueryui',
		'nodeText',
		'nodeImg',
	],
	function (_s, Backbone, LocalStorage, bootbox) {
		// log function wrapper
		var info = console.log.bind(console)
		var log = console.log.bind(console)
		$(function () {

			// namespace
			// debug escape
			window.bApp = {}

			bApp.nodeText = require('nodeText')
			bApp.nodeImg = require('nodeImg')

			// element collection
			bApp.showList = new(Backbone.Collection.extend({
				localStorage: new LocalStorage("localList"),
				saveAll: function () {
					_.each(this.models, function (item) {
						item.save()
					})
				},
				saveAll: function () {
					localStorage.setItem("localListRaw", JSON.stringify(this.toJSON()))
				},
			}))()

			// meta info
			bApp.metaInfo = new(Backbone.Model.extend({
				localStorage: new LocalStorage("localMeta"),
				defaults: {
					currentId: 0,
				},
				initialize: function () {
					this.fetch()
				},
				nextId: function () {
					this.save({
						currentId: this.get("currentId") + 1
					})
					return this.get("currentId")
				},
			}))({
				id: "metaInfo"
			})

			// app start
			bApp.main = new(Backbone.View.extend({
				el: $("#mainWrapper"),
				events: {
					"click .btnAddEle": "addNewEle",
					"click #btnPreview": "showPreview",
					"click #btnSaveAll": "saveList",
					"click #btnClearAll": "clearAll",
					"droppedEvent": "updateShowList",
				},
				initialize: function () {
					__this = this
					this.$showWrapper = this.$("#showWrapper")
					this.$attrEditor = this.$("#editorWrapper")
					this.listenTo(bApp.showList, "add", this.renderOne)
					this.listenTo(bApp.showList, "reset", this.renderAll)
					// this.listenTo(bApp.showList, "all", this.renderAll)

					Backbone.on("openEditor", this.renderEditor, this)

					bApp.showList.fetch({
						reset: true,
					})
					this.$showWrapper.sortable({
						update: function (event, ui) {
							__this.updateList(event, ui)
						}
					})
				},
				renderEditor: function (model, showView) {
					$(".itemFocused").removeClass("itemFocused")
					showView.addClass("itemFocused")
					var nodeTypeRaw = model.get("type")
					var nodeType = "node" + _s.capitalize(nodeTypeRaw)
					var node = bApp[nodeType]
					var $view = new node.editor({
						model: model
					})
					bApp.main.$attrEditor.empty().append($view.render().el)
				},
				updateList: function (event, ui) {
					localStorage.setItem("localList",
						Array.prototype.map.call(
							$("#showWrapper").children(),
							function (e) {
								return $(e).data("node-id")
							}
						).join(",")
					)
					this.saveList()
				},
				saveList: function () {
					bApp.showList.saveAll()
				},
				clearAll: function () {
					while (bApp.showList.length) {
						bApp.showList.last().destroy()
					}
				},
				renderOne: function (item, list, options) {
					// if (!options.ignore) {
					var nodeType = "node" + _s.capitalize(item.get("type"))
					var node = bApp[nodeType]
					// bApp[nodeType] : bApp["nodeDefault"]
					var view = new node.view({
						model: item
					})
					this.$showWrapper.append(view.render().el)
					// }
				},
				renderAll: function () {
					log("renderAll")
					bApp.showList.each(this.renderOne, this)
				},
				addNewEle: function (e) {
					var nodeTypeRaw = $(e.target).data("node-type")
					var nodeType = "node" + _s.capitalize(nodeTypeRaw)
					var node = bApp[nodeType]
					// bApp[nodeType] : bApp["nodeDefault"]
					bApp.showList.create(
						new node.model({
							id: "" + nodeTypeRaw + bApp.metaInfo.nextId(),
						})
					)
				},
				showPreview: function () {
					bootbox.alert({
						title: '预览',
						message: $('#showWrapper').html(),
					})
				},
			}))()
			info("loaded")
		})
	})
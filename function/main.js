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

require(['underscore_string', 'backbone', 'localStorage', 'bootbox', 'jqueryui', 'nodeDefault'], function (_s, Backbone, LocalStorage, bootbox) {
	// log function wrapper
	var info = console.log.bind(console)
	var log = console.log.bind(console)
	$(function () {
		// namespace
		window.bApp = {}
		bApp.nodeDefault = require('nodeDefault')
		// default element
		// text element
		bApp.nodeText = {
			model: Backbone.Model.extend({
				defaults: function () {
					return {
						type: "text",
						html: "empty text",
						id: "text" + bApp.metaInfo.nextId(),
					}
				}
			}),
			view: Backbone.View.extend({
				temp: _.template(`
				<p><%= html %></p>
			`),
				events: {
					"click": "openEditor",
					"dragDropped": "fireDropped",
				},
				initialize: function () {
					this.listenTo(this.model, "change", this.render)
					this.listenTo(this.model, "destroy", this.remove)
				},
				render: function () {
					this.$el.html(this.temp(this.model.toJSON()))
					this.$el.data("node-id", this.model.get("id"))
					return this
				},
				fireDropped: function (event, newIndex) {
					this.$el.trigger("droppedEvent", [this.model, newIndex])
				},
				openEditor: function () {
					$(".itemFocused").removeClass("itemFocused")
					this.$el.addClass("itemFocused")
					var $view = new bApp.nodeText.editor({
						model: this.model
					})
					bApp.main.$attrEditor.empty().append($view.render().el)
				},
			}),
			editor: Backbone.View.extend({
				temp: _.template(`
					<textarea id="textInputer" name="" cols="30" rows="5"><%= html %></textarea>
					<button class="btnUpdate">修改</button>
					<button class="btnDelete">删除</button>
				`),
				events: {
					"click .btnUdpate": "modifyNode",
					"click .btnDelete": "deleteNode",
				},
				initialize: function () {
					this.openMce()
					this.listenTo(this.model, "destroy", this.remove)
				},
				render: function () {
					this.$el.html(this.temp(this.model.toJSON()))
					return this
				},
				modifyNode: function () {
					this.model.save({
						html: this.$("#textInputer").val()
					})
				},
				deleteNode: function () {
					this.model.destroy()
				},
				openMce: function () {
					var model = this.model
					setTimeout(function () {
						tinymce.EditorManager.editors = []
						tinymce.init({
							selector: "#textInputer",
							setup: function (editor) {
								editor.on('keyup change paste cut', function (e) {
									model.save({
										html: editor.getContent()
									})
								})
							}
						})
					}, 0)
				},
			}),
		}

		// img element
		bApp.nodeImg = {
			model: Backbone.Model.extend({
				defaults: function () {
					return {
						type: "img",
						src: "http://www.baidu.com/img/bd_logo1.png",
						id: "img" + bApp.metaInfo.nextId(),
					}
				}
			}),
			view: Backbone.View.extend({
				temp: _.template(`
				<img src="<%= src %>">
			`),
				events: {
					"click": "openEditor",
					"dragDropped": "fireDropped",
				},
				initialize: function () {
					this.listenTo(this.model, "change", this.render)
					this.listenTo(this.model, "destroy", this.remove)
				},
				fireDropped: function (event, newIndex) {
					this.$el.trigger("droppedEvent", [this.model, newIndex])
				},
				render: function () {
					this.$el.html(this.temp(this.model.toJSON()))
					// this.$el.html("<p>空的2内容</p>")
					this.$el.data("node-id", this.model.get("id"))
					return this
				},
				openEditor: function () {
					$(".itemFocused").removeClass("itemFocused")
					this.$el.addClass("itemFocused")
					var $view = new bApp.nodeImg.editor({
						model: this.model
					})
					bApp.main.$attrEditor.empty().append($view.render().el)
				}
			}),
			editor: Backbone.View.extend({
				temp: _.template(`
				<textarea name="" cols="30" rows="5"><%= src %></textarea>
				<button class="btnUpdate">修改</button>
				<button class="btnDelete">删除</button>
			`),
				events: {
					"click .btnUpdate": "modifyNode",
					"click .btnDelete": "deleteNode",
				},
				initialize: function () {
					this.listenTo(this.model, "destroy", this.remove)
				},
				render: function () {
					this.$el.html(this.temp(this.model.toJSON()))
					return this
				},
				modifyNode: function () {
					this.model.save({
						src: this.$("textarea").val()
					})
				},
				deleteNode: function () {
					this.model.destroy()
				},
			}),
		}

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
			el: $("#main"),
			events: {
				"click .btnAddNode": "addNewEle",
				"click #btnPreview": "showPreview",
				"droppedEvent": "updateShowList",
				"click #btnSaveAll": "saveList",
			},
			initialize: function () {
				this.$showWrapper = this.$("#showWrapper")
				this.$attrEditor = this.$("#attrEditor")
				this.listenTo(bApp.showList, "add", this.renderOne)
				this.listenTo(bApp.showList, "reset", this.renderAll)
				// this.listenTo(bApp.showList, "all", this.renderAll)
				bApp.showList.fetch({
					reset: true,
				})
				this.$showWrapper.sortable({
					update: function (event, ui) {
						localStorage.setItem("localList",
							Array.prototype.map.call(
								$("#showWrapper").children(),
								function (e) {
									return $(e).data("node-id")
								}
							).join(",")
						)
						// log(event, ui)
						// ui.item.trigger('dragDropped', ui.item.index());
						// this.$showWrapper.children().each(function(i,e){
						// 	$(e).data()
						// })
					}
				})
			},
			saveList: function () {
				bApp.showList.saveAll()
			},
			updateShowList: function (event, model, newIndex) {
				this.$showWrapper.children()
				// var oldIndex = bApp.showList.indexOf(model)
				// // log(oldIndex, newIndex)
				// bApp.showList.remove(model);
				// bApp.showList.each(function (model, index) {
				// 	var ordinal = index
				// 	if (index >= newIndex)
				// 		ordinal += 1
				// 	model.set('ordinal', ordinal)
				// })
				// model.set('ordinal', newIndex)
				// bApp.showList.add(model, {
				// 	at: newIndex,
				// 	ignore: true,
				// })
				// bApp.showList.saveAll()
			},
			renderOne: function (item, list, options) {
				// log("renderOne", item, list, options)
				if (!options.ignore) {
					var nodeType = "node" + _s.capitalize(item.get("type"))
					var node = bApp[nodeType] ? bApp[nodeType] : bApp["nodeDefault"]
					var view = new node.view({
						model: item
					})
					this.$showWrapper.append(view.render().el)
				}
			},
			renderAll: function () {
				log("renderAll")
				bApp.showList.each(this.renderOne, this)
			},
			addNewEle: function (e) {
				var nodeType = "node" + _s.capitalize($(e.target).data("node-type"))
				var node = bApp[nodeType] ? bApp[nodeType] : bApp["nodeDefault"]
				bApp.showList.create(
					new node.model
				)
			},
			showPreview: function () {
				log(bootbox)
				bootbox.alert({
					title: '预览',
					message: $('#showWrapper').html()
				})
			}
		}))()
		info("loaded")
	})
})
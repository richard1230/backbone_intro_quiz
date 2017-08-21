require.config({
	paths: {
		jquery: "https://cdn.bootcss.com/jquery/3.2.1/jquery.min",
		underscore: "https://cdn.bootcss.com/underscore.js/1.8.3/underscore-min",
		underscore_string: "https://cdn.bootcss.com/underscore.string/3.3.4/underscore.string.min",
		backbone: "https://cdn.bootcss.com/backbone.js/1.3.3/backbone-min",
		localStorage: "https://cdn.bootcss.com/backbone-localstorage.js/1.1.16/backbone.localStorage-min",
		// tinymce: "https://cdn.bootcss.com/tinymce/4.6.5/tinymce.min",
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
		// tinymce: {
		// 	exports: 'tinymce',
		// 	init: function () {
		// 		this.tinymce.DOM.events.domLoaded = true
		// 		return this.tinymce
		// 	}
		// },
		localStorage: {
			deps: ['backbone']
		},
	},
});

require(['underscore_string', 'backbone', 'localStorage'], function (_s, Backbone, LocalStorage) {
	// log function wrapper
	var info = console.log.bind(console)
	var log = console.log.bind(console)

	// window.tinymce = require(["tinymce"]) // ???
	// tinymce()
	// log("tiny", tinymce)
	// setTimeout(function () {
	// 	log("tiny", tinymce)
	// }, 1000);
	$(function () {
		// namespace
		bApp = {}

		// default element
		bApp.nodeDefault = {
			model: Backbone.Model.extend({
				defaults: function () {
					return {
						type: "default",
						nodeId: bApp.metaInfo.nextId(),
					}
				}
			}),
			view: Backbone.View.extend({
				render: function () {
					this.$el.html("未定义元素")
					return this
				},
				events: {
					"click": "openEditor",
				},
				initialize: function () {
					this.listenTo(this.model, "change", this.render)
					this.listenTo(this.model, "destroy", this.remove)
				},
				openEditor: function () {
					$(".itemFocused").removeClass("itemFocused")
					this.$el.addClass("itemFocused")
					var $view = new bApp.nodeDefault.editor({
						model: this.model
					})
					bApp.main.$attrEditor.empty().append($view.render().el)
				},
			}),
			editor: Backbone.View.extend({
				temp: _.template(`
					<button class="btnDelete">删除</button>
				`),
				events: {
					"click .btnDelete": "deleteNode",
				},
				initialize: function () {
					this.listenTo(this.model, "destroy", this.remove)
				},
				render: function () {
					this.$el.html(this.temp(this.model.toJSON()))
					return this
				},
				deleteNode: function () {
					this.model.destroy()
				},
			}),
		}
		// text element
		bApp.nodeText = {
			model: Backbone.Model.extend({
				defaults: function () {
					return {
						type: "text",
						html: "empty text",
						nodeId: bApp.metaInfo.nextId(),
					}
				}
			}),
			view: Backbone.View.extend({
				temp: _.template(`
				<p><%= html %></p>
			`),
				events: {
					"click": "openEditor",
				},
				initialize: function () {
					this.listenTo(this.model, "change", this.render)
					this.listenTo(this.model, "destroy", this.remove)
				},
				render: function () {
					this.$el.html(this.temp(this.model.toJSON()))
					return this
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
								});
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
						nodeId: bApp.metaInfo.nextId(),
					}
				}
			}),
			view: Backbone.View.extend({
				temp: _.template(`
				<img src="<%= src %>">
			`),
				events: {
					"click": "openEditor",
				},
				initialize: function () {
					this.listenTo(this.model, "change", this.render)
					this.listenTo(this.model, "destroy", this.remove)
				},
				render: function () {
					this.$el.html(this.temp(this.model.toJSON()))
					// this.$el.html("<p>空的2内容</p>")
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
			},
			initialize: function () {
				this.$showWtrapper = this.$("#showWrapper")
				this.$attrEditor = this.$("#attrEditor")
				this.listenTo(bApp.showList, "add", this.renderOne)
				// this.listenTo(bApp.showList, "change", this.renderOne)
				this.listenTo(bApp.showList, "all", this.renderAll)
				bApp.showList.fetch()
			},
			renderOne: function (item) {
				var nodeType = "node" + _s.capitalize(item.get("type"))
				var node = bApp[nodeType] ? bApp[nodeType] : bApp["nodeDefault"]
				var view = new node.view({
					model: item
				})
				this.$showWtrapper.append(view.render().el)
			},

			// renderAll: function () {
			// 	bApp.showList.each(this.renderOne, this)
			// },
			addNewEle: function (e) {
				var nodeType = "node" + _s.capitalize($(e.target).data("node-type"))
				var node = bApp[nodeType] ? bApp[nodeType] : bApp["nodeDefault"]
				bApp.showList.create(
					new node.model
				)
			}
		}))()
		info("loaded")
	})
})
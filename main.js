require.config({
	paths: {
		jquery: "https://cdn.bootcss.com/jquery/3.2.1/jquery.min",
		underscore: "https://cdn.bootcss.com/underscore.js/1.8.3/underscore-min",
		underscore_string: "https://cdn.bootcss.com/underscore.string/3.3.4/underscore.string.min",
		backbone: "https://cdn.bootcss.com/backbone.js/1.3.3/backbone-min",
		localStorage: "https://cdn.bootcss.com/backbone-localstorage.js/1.1.16/backbone.localStorage-min",
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
			deps: ['backbone']
		},
	},
});

require(['underscore_string', 'backbone', 'localStorage'], function (_s, Backbone, LocalStorage) {
	$(function () {

		// namespace
		bApp = {}

		// log function wrapper
		var info = console.log.bind(console)
		var log = console.log.bind(console)


		// default element
		bApp.modelDefault = Backbone.Model.extend({
			defaults: function () {
				return {
					type: "default",
					nodeId: bApp.metaInfo.nextId(),
				}
			}
		})
		bApp.viewDefault = Backbone.View.extend({
			render: function () {
				this.$el.html("<p>未定义元素</p>")
				return this
			}
		})

		// text element
		bApp.modelText = Backbone.Model.extend({
			defaults: function () {
				return {
					type: "text",
					html: "empty text",
					nodeId: bApp.metaInfo.nextId(),
				}
			}
		})
		bApp.viewText = Backbone.View.extend({
			temp: _.template(`
				<%= html %>
			`),
			events: {
				"click": "openEditor",
			},
			initialize: function () {
				this.listenTo(this.model, "change", this.render)
			},
			render: function () {
				this.$el.html(this.temp(this.model.toJSON()))
				return this
			},
			openEditor: function () {
				$(".itemFocused").removeClass("itemFocused")
				this.$el.addClass("itemFocused")
				log(this.$el)
				var $view = new bApp.textEditor({
					model: this.model
				})
				bApp.main.$attrEditor.empty().append($view.render().el)
			},
		})
		bApp.textEditor = Backbone.View.extend({
			temp: _.template(`
				<textarea name="" cols="30" rows="5"><%= html %></textarea>
				<button>修改</button>
			`),
			events: {
				"click button": "changeText"
			},
			initialize: function () {},
			render: function () {
				this.$el.html(this.temp(this.model.toJSON()))
				return this
			},
			changeText: function () {
				this.model.save({
					html: this.$("textarea").val()
				})
				log(this.$("textarea").val())
			},
		})

		// img element
		bApp.modelImg = Backbone.Model.extend({
			defaults: function () {
				return {
					type: "img",
					src: "http://www.baidu.com/img/bd_logo1.png",
					nodeId: bApp.metaInfo.nextId(),
				}
			}
		})
		bApp.viewImg = Backbone.View.extend({
			temp: _.template(`
				<img src="<%= src %>">
			`),
			events: {
				"click": "openEditor",
			},
			initialize: function () {
				this.listenTo(this.model, "change", this.render)
			},
			render: function () {
				this.$el.html(this.temp(this.model.toJSON()))
				// this.$el.html("<p>空的2内容</p>")
				return this
			},
			openEditor: function () {
				$(".itemFocused").removeClass("itemFocused")
				this.$el.addClass("itemFocused")
				var $view = new bApp.imgEditor({
					model: this.model
				})
				bApp.main.$attrEditor.empty().append($view.render().el)
			}
		})
		bApp.imgEditor = Backbone.View.extend({
			temp: _.template(`
				<textarea name="" cols="30" rows="5"><%= src %></textarea>
				<button>修改</button>
			`),
			events: {
				"click button": "changeImg"
			},
			initialize: function () {},
			render: function () {
				this.$el.html(this.temp(this.model.toJSON()))
				return this
			},
			changeImg: function () {
				this.model.save({
					src: this.$("textarea").val()
				})
			}
		})

		// element collection
		bApp.showList = new(Backbone.Collection.extend({
			model: function (model, options) {
				switch (model.type) {
					case 'img':
						return new bApp.modelImg(model, options);
						break;
					case 'text':
						return new bApp.modelText(model, options);
						break;
				}
			},
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
				var viewType = "view" + _s.capitalize(item.get("type"))
				var $view = new(bApp[viewType] ? bApp[viewType] : bApp["viewDefault"])({
					model: item
				})
				this.$showWtrapper.append($view.render().el)
			},

			// renderAll: function () {
			// 	bApp.showList.each(this.renderOne, this)
			// },
			addNewEle: function (e) {
				var modelType = "model" + _s.capitalize($(e.target).data("node-type"))
				bApp.showList.create(
					bApp[modelType] ? new bApp[modelType] : new bApp["modelDefault"]
				)
			}
		}))()
		info("loaded")
	})
})
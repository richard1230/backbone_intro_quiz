define([
	'backbone',
], function (Backbone) {
	var n = {
		node: this,
		model: Backbone.Model.extend({
			defaults: function () {
				return {
					type: "default",
					nodeId: bApp.metaInfo.nextId(), // ???
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
				Backbone.cache = this
				console.log(this, this.model)
				$(".itemFocused").removeClass("itemFocused")
				this.$el.addClass("itemFocused")
				var $view = new n.editor({
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
	return n
});
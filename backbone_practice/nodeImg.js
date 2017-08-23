define([
	'backbone',
], function (Backbone) {
	return {
		model: Backbone.Model.extend({
			defaults: function () {
				return {
					type: "img",
					src: "http://www.baidu.com/img/bd_logo1.png",
					// id: "img" + bApp.metaInfo.nextId(),
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
				this.$el.data("node-id", this.model.get("id"))
				return this
			},
			openEditor: function () {
				Backbone.trigger("openEditor", this.model, this.$el)
			},
		}),
		editor: Backbone.View.extend({
			temp: _.template(`
				<div class="panel-component">
					<div class="c-div div_AXed7o">
						<a class="btn-default btn-action btn btnDelete" sizes="" type="button">
							删除
						</a>
					</div>
				</div>
				<div class="panel-component">
					<label class="">
						编辑
					</label>
					<div class="c-div div_AXed7o">
						<textarea id="textInputer" name="" rows="5"><%= src %></textarea>
						<a class="btn-default btn-action btn btnUpdate" sizes="" type="button">
							修改图片
						</a>
					</div>
				</div>
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

});
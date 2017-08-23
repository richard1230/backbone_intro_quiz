define([
	'backbone',
], function (Backbone) {
	return {
		model: Backbone.Model.extend({
			defaults: function () {
				return {
					type: "text",
					html: "empty text",
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
						<textarea id="textInputer" name="" rows="5">
							<%= html %>
						</textarea>
					</div>
				</div>
			`),
			events: {
				"click .btnUdpate": "modifyNode",
				"click .btnDelete": "deleteNode",
			},
			initialize: function () {
				var __this = this
				this.listenTo(this.model, "destroy", this.remove)

				setTimeout(function () {
					__this.openMce()
				}, 0)
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

			},
		}),
	}

});
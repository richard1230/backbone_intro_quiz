require.config({
	paths: {
		'jquery': "https://cdn.bootcss.com/jquery/3.2.1/jquery.min",
		underscore: "https://cdn.bootcss.com/underscore.js/1.8.3/underscore-min",
		backbone: "https://cdn.bootcss.com/backbone.js/1.3.3/backbone-min",
	},
	shim: {
		'underscore': {
			exports: '_',
		},
		'backbone': {
			deps: ['underscore', 'jquery'],
			exports: 'Backbone',
		},
	},
});

require(['jquery', 'underscore'], function ($,_) {
	$(function () {
		console.log(12)
	});
})
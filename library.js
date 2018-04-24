(function(module) {
	"use strict";

	var nconf = module.parent.require( 'nconf' );
	var async = module.parent.require( 'async' );
	var fs = require( 'fs' );
	var path = require( 'path' );
	var categories = module.parent.require( './categories' );
	var topics = module.parent.require( './topics' );
	var db = module.parent.require( './database' );
	var helpers = module.parent.require('./routes/helpers');
	var app;
	var Plugin = { "templates": { } };

	Plugin.initialize = function ( params, callback )
	{
		app = params.app;
		helpers.setupPageRoute( params.router, '/qtdream', params.middleware, [ ],
			function ( req, res )
			{
				res.render( "qtdream",
					{
						template: { name: "qtdream" },
						title: "萌梦主页"
					} );
			} );
		helpers.setupPageRoute( params.router, '/about', params.middleware, [ ],
			function ( req, res )
			{
				res.render( "about",
					{
						template: { name: "about" },
						title: "关于"
					} );
			} );

		var templates =
			[
				"admin/carousel-3d.tpl",
				"admin/qtdream-player.tpl",
				"admin/imageitem-view-4.tpl",
				"admin/imageitem-view-8.tpl",
				"admin/live2d.tpl"
			];
		var loadTemplate = function ( template, next )
		{
			fs.readFile( path.resolve( __dirname, './templates/' + template ),
				function ( err, data ) {
					if ( err ) {
						console.log( err.message );
						return next( err );
					}
					Plugin.templates[template] = data.toString( );
					next( null );
				} );
		};

		async.each( templates, loadTemplate );

		callback( );
	};

	Plugin.serveQtDream = function(params){
		params.res.render('qtdream', {
			template: {
				name: 'qtdream'
			}
		});
	};

	Plugin.addListing = function(data, callback){
		data.routes.push({
			route: 'qtdream',
			name: 'QtDream Homepage'
		});
		data.routes.push({
			route: 'about',
			name: 'About page'
		});
		callback(null, data);
	};

	Plugin.addNavigation = function(header, callback) {
		header.navigation.push(
			{
				route: '/qtdream',
				class: '',
				text: 'QtDreamHomepage',
				iconClass: 'fa-comments',
				title: 'Home',
				textClass: 'visible-xs-inline'
			}
		);
		header.navigation.push(
			{
				route: '/about',
				class: '',
				text: 'QtDreamAbout',
				iconClass: 'fa-comments',
				title: 'Forum',
				textClass: 'visible-xs-inline'
			}
		);
		callback(null, header);
	};

	Plugin.defineWidgetAreas = function(areas, callback) {
		var qtdreamWidgets =
			[
				{
					'name': 'QtDream header',
					'template': 'qtdream.tpl',
					'location': 'header'
				},
				{
					'name': 'QtDream fancy widget',
					'template': 'qtdream.tpl',
					'location': 'fancy_widget'
				},
				{
					'name': 'QtDream AD banner',
					'template': 'qtdream.tpl',
					'location': 'banner'
				},
				{
					'name': 'QtDream categories',
					'template': 'qtdream.tpl',
					'location': 'categories'
				},
				{
					'name': 'QtDream side bar',
					'template': 'qtdream.tpl',
					'location': 'sidebar'
				},
				{
					'name': 'QtDream home page footer',
					'template': 'qtdream.tpl',
					'location': 'footer'
				},
			];
		var aboutWidgets =
			[
				{
					'name': 'About page header',
					'template': 'about.tpl',
					'location': 'header'
				},
				{
					'name': 'About page main',
					'template': 'about.tpl',
					'location': 'main'
				},
				{
					'name': 'About page side bar',
					'template': 'about.tpl',
					'location': 'sidebar'
				}
			];
		areas = areas.concat( qtdreamWidgets, aboutWidgets );
		callback(null, areas);
	};

	Plugin.defineWidgets = function( widgets, callback )
	{
		// 这里定义了需要的widgets
		widgets = widgets.concat( [
			{
				widget: "carousel-3d",
				name: "Carousel 3D",
				description: "The Carousel 3D defined by our site",
				content: Plugin.templates["admin/carousel-3d.tpl"]
			},
			{
				widget: "qtdream-player",
				name: "QtDream Player",
				description: "The default player for our site",
				content: Plugin.templates["admin/qtdream-player.tpl"]
			},
			{
				widget: "imageitem-view-4",
				name: "Image item view 4",
				description: "The image item view for our site",
				content: Plugin.templates["admin/imageitem-view-4.tpl"]
			},
			{
				widget: "imageitem-view-8",
				name: "Image item view 8",
				description: "The image item view for our site",
				content: Plugin.templates["admin/imageitem-view-8.tpl"]
			},
			{
				widget: "live2d",
				name: "Live2D",
				description: "The live2D model for this site",
				content: Plugin.templates["admin/live2d.tpl"]
			}
		] );
		callback( null, widgets );
	};

	Plugin.renderCarousel3DWidget = function ( widget, callback )
	{
		var data =
			{
				"htmls": [ ],
				"relative_path": nconf.get( "relative_path" ),
				"infinite": ( widget.data.infinite == "on" || false ),
				"interval": ( widget.data.interval || 3000 )
			};
		var htmlCount = 6;
		for ( var i = 0; i < htmlCount; ++i )
		{
			var html =
				{
					"index": i,
					"value": widget.data["html" + i]
				};
			data.htmls.push( html );
		}
		app.render( "widgets/carousel-3d",
			data,
			function( err, html )
			{
				widget.html = html;
				callback( err, widget );
			} );
	};

	Plugin.renderQtDreamPlayerWidget = function ( widget, callback )
	{
		var data =
			{
				"moefouAPIKey": widget.data.moefouAPIKey,
				"radioID": widget.data.radioID
			};
		app.render( "widgets/qtdream-player",
			data,
			function( err, html )
			{
				widget.html = html;
				callback( err, widget );
			} );
	};

	Plugin.renderLive2DWidget = function ( widget, callback )
	{
		var data =
			{
				"turing": widget.data.turing
			};
		app.render( "widgets/live2d",
			data,
			function( err, html )
			{
				widget.html = html;
				callback( err, widget );
			} );
	};

	Plugin.onPluginUninstall = function ( id )
	{
		// 这里数据库的内容，当触发卸载的时候，会删除数据
		console.log( "the plugin: " + id + ", can be uninstalled." );
	};

	function getImageItem( topic, uid, callback )
	{
		async.waterfall(
			[
				function ( next )
				{
					topics.getMainPost( topic.id, uid, next );
				},
				function ( post, next )
				{
					var cover = "";
					var hasCover = true;
					if ( post && post.content )
					{
						var imgPrefix = "<img src=\"";
						var i = post.content.indexOf( imgPrefix );
						if ( i >= 0 )
						{
							i += imgPrefix.length;
							while ( post.content[i] !== '\"' )
							{
								cover += post.content[i++];
							}
						}
					}
					var pluginPrefix = "plugins/nodebb-plugin-qtdream-homepage/imageitem-view_image";
					if ( !cover.startsWith( "/" ) &&
						!cover.startsWith( "http" ) )
					{
						// 使用一个替代的图片URL
						cover = pluginPrefix + "/no-picture.png";
						hasCover = false;
					}
					topics.getTopicsByTids( [ topic.id ], uid, function ( err, _topics )
					{
						var _topic = _topics[0];
						var data =
						{
							"id": _topic.tid,
							"hasCover": hasCover,
							"cover": cover,
							"bgColor": topic.bgColor,
							"title": _topic.title,
							"titleUrl": "/topic/" + _topic.tid,
							"author": _topic.user.username,
							"authorUrl": "/user/" + _topic.user.username,
							"popularity": _topic.viewcount,
							"brief": _topic.title.substr( 0, 4 )
						};
						next( err, data );
					} );
				}
			], callback );
	}

	function getCategoryColor( cid, callback )
	{
		categories.getCategoryField( cid, "bgColor", callback );
	}

	function getRecentTopicTids( count, cid, callback )
	{
		categories.getCategoryField( cid, "bgColor", function ( err, bgColor )
		{
			if (err ){
				return callback( err );
			}
			if (count === 1) {
				async.waterfall([
					function (next) {
						db.getSortedSetRevRange('cid:' + cid + ':pids', 0, 0, next);
					},
					function (pid, next) {
						posts.getPostField(pid, 'tid', next);
					},
					function (tid, next) {
						var topic = { "id": tid, "bgColor": bgColor };
						next( null, topic );
					}
				], callback);
				return;
			}

			async.parallel({
				pinnedTids: function(next) {
					db.getSortedSetRevRangeByScore('cid:' + cid + ':tids', 0, -1, '+inf', Date.now(), next);
				},
				tids: function(next) {
					db.getSortedSetRevRangeByScore('cid:' + cid + ':tids', 0, Math.max(1, count), Date.now(), '-inf', next);
				}
			}, function(err, results) {
				if (err) {
					return callback(err);
				}
				results.tids = results.tids.concat(results.pinnedTids);
				var topics = [ ];
				results.tids.forEach( function ( tid )
				{
					topics.push( { "id": tid, "bgColor": bgColor } );
				} );
				callback( null, topics );
			} );
		} );



	}

	Plugin.renderImageItemViewWidget = function ( widget, callback )
	{
		async.waterfall(
			[
				function ( next )
				{
					var topicCount = 0;
					do// 决定图形项目的个数
					{
						var tid = widget.data["tid" + topicCount];
						if ( typeof ( tid ) !== "undefined" ) topicCount++;
						else break;
					}
					while ( true );

					var renderImageItemView = function ( topics, theNext )
					{
						async.map( topics, function ( topic, callback )
							{
								getImageItem( topic, widget.uid, callback )
							},
							function ( err, imageitems )
							{
								var data =
								{
									"imageitems": imageitems,
									"heading": widget.data.heading,
									"relative_path": nconf.get('relative_path')
								};
								app.render( "widgets/imageitem-view",
									data, theNext );
							} );
					};

					if ( widget.data.autoUpdate == "on" )
					{
						// 可能使用async.parallel来实现效果
						var categories = widget.data.category.split( "," );
						for ( var i in categories )
						{
							categories[i] = categories[i].replace(/(^\s*)|(\s*$)/g, "");
						}
						async.map( categories,
							async.apply( getRecentTopicTids, topicCount ),
							function ( err, topics )// 注意tids是一个二维数组
							{
								var totalTopics = [ ];
								topics.forEach( function ( eachTopics )
								{
									eachTopics.forEach( function ( eachTopic )
									{
										totalTopics.push( eachTopic );
									} );
								} );

								// 根据tids的大小来设定，最大的tid放在最前
								totalTopics.sort( function ( a, b )
								{ return parseInt( a.id ) > parseInt( b.id )? -1: 1; } );

								// 最终要限制到topicCount个帖子大小
								totalTopics = totalTopics.slice( 0, topicCount );

								renderImageItemView( totalTopics, next );
							} );
					}
					else
					{
						var topics = [ ];
						for ( var i = 0; i < topicCount; ++i )
						{
							var topic =
							{
								"id": widget.data["tid" + i],
								"bgColor": "white"// 这里需要判定tid来自哪个category
							};
							topics.push( topic );
						}
						renderImageItemView( topics, next );
					}
				},
				function ( html, next )
				{
					widget.html = html;
					next( null, widget );
				}
			], callback );
	};

	///////////////////////////////////////////////////////////////////////////
	//
	//	这里是有关About的操作
	Plugin.serveAboutPage = function ( params )
	{
		params.res.render( "about",
			{
				template:
					{
						name: "about"
					}
			} );
	};


	module.exports = Plugin;
}(module));
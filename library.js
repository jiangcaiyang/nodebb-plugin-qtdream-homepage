(function(module) {
	"use strict";

	var nconf = module.parent.require( 'nconf' );
	var async = module.parent.require( 'async' );
	var fs = require( 'fs' );
	var path = require( 'path' );
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
				res.render( "homepage",
					{
						template: { name: "homepage" },
						title: "主页"
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
			"admin/imageitem-view-8.tpl"
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

	Plugin.serveHomepage = function(params){
		params.res.render('homepage', {
			template: {
				name: 'homepage'
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
				title: 'Forum',
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
		var homepageWidgets =
			[
				{
					'name': 'Homepage header',
					'template': 'homepage.tpl',
					'location': 'header'
				},
				{
					'name': 'Homepage fancy widget',
					'template': 'homepage.tpl',
					'location': 'fancy_widget'
				},
				{
					'name': 'Homepage AD banner',
					'template': 'homepage.tpl',
					'location': 'banner'
				},
				{
					'name': 'Homepage categories',
					'template': 'homepage.tpl',
					'location': 'categories'
				},
				{
					'name': 'Homepage side bar',
					'template': 'homepage.tpl',
					'location': 'sidebar'
				},
				{
					'name': 'Homepage home page footer',
					'template': 'homepage.tpl',
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
		areas = areas.concat( homepageWidgets, aboutWidgets );
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

	Plugin.onPluginUninstall = function ( id )
	{
		// 这里数据库的内容，当触发卸载的时候，会删除数据
		console.log( "the plugin: " + id + ", can be uninstalled." );
	};

	function getImageItem( tid, uid, callback )
	{
		async.waterfall(
		[
			function ( next )
			{
				topics.getMainPost( tid, uid, next );
			},
			function ( post, next )
			{
				var cover = "";
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
				}
				topics.getTopicsByTids( [ tid ], uid, function ( err, topics )
				{
					topics[0].cover = cover;
					next( err, topics[0] );
				} );
			},
			function ( topic, next )
			{
				var data =
				{
					"cover": topic.cover,
					"title": topic.title,
					"titleUrl": "/topic/" + topic.tid,
					"author": topic.user.username,
					"authorUrl": "/user/" + topic.user.username,
					"popularity": topic.viewcount,
					"id": topic.tid
				};
				next( null, data );
			}
		], callback );
	}

	function getRecentTopicTids( count, cid, callback )
	{
		if (count === 1) {
			async.waterfall([
				function (next) {
					db.getSortedSetRevRange('cid:' + cid + ':pids', 0, 0, next);
				},
				function (pid, next) {
					posts.getPostField(pid, 'tid', next);
				},
				function (tid, next) {
					next(null, [tid]);
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

			callback(null, results.tids);
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

				var renderImageItemView = function ( tids, theNext )
				{
					async.map( tids, function ( tid, callback )
						{
							getImageItem( tid, widget.uid, callback )
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
						function ( err, tids )// 注意tids是一个二维数组
						{
							var totalTids = [ ];
							tids.forEach( function ( eachTids )
							{
								eachTids.forEach( function ( eachTid )
								{
									totalTids.push( eachTid );
								} );
							} );

							// 根据tids的大小来设定，最大的tid放在最前
							totalTids.sort( function ( a, b ) { return parseInt( a ) > parseInt( b )? -1: 1; } );

							// 最终要限制到topicCount个帖子大小
							totalTids = totalTids.slice( 0, topicCount );

							renderImageItemView( totalTids, next );
						} );
				}
				else
				{
					var tids = [ ];
					for ( var i = 0; i < topicCount; ++i )
					{
						tids.push( widget.data["tid" + i] );
					}
					renderImageItemView( tids, next );
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
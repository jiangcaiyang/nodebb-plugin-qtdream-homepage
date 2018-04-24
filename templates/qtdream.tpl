<div widget-area="header">
	<!-- BEGIN widgets.header -->
	{{widgets.header.html}}
	<!-- END widgets -->
</div>

<div widget-area="fancy_widget">
	<!-- BEGIN widgets.fancy_widget -->
	{{widgets.fancy_widget.html}}
	<!-- END widgets -->
</div>

<div class="row">
    <div class="col-md-9 col-xs-12" no-widget-class="col-lg-12 col-xs-12" no-widget-target="sidebar">
        <div class="column">
            <div widget-area="banner">
                <!-- BEGIN widgets.banner -->
                {{widgets.banner.html}}
                <!-- END widgets -->
            </div>
            <div widget-area="categories">
                <!-- BEGIN widgets.categories -->
                {{widgets.categories.html}}
                <!-- END widgets -->
            </div>
        </div>
    </div>
	<div class="col-md-3 col-xs-12">
		<div widget-area="sidebar">
			<!-- BEGIN widgets.sidebar -->
			{{widgets.sidebar.html}}
			<!-- END widgets -->
		</div>
	</div>
</div>

<div widget-area="footer">
	<!-- BEGIN widgets.footer -->
	{{widgets.footer.html}}
	<!-- END widgets -->
</div>
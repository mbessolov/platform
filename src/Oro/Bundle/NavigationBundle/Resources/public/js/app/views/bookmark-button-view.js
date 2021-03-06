define([
    'oroui/js/mediator',
    'oroui/js/app/views/base/page-region-view'
], function(mediator, PageRegionView) {
    'use strict';

    var BookmarkButtonView;
    var document = window.document;
    var titleRendered = null;

    BookmarkButtonView = PageRegionView.extend({
        pageItems: ['navigationElements', 'titleShort', 'titleSerialized'],

        /**
         * Type of element will be used to check that this navigation element enabled for current page. Data comes
         * from backend generated by NavigationElementsContentProvider
         *
         * @type string
         */
        navigationElementType: null,

        events: {
            click: 'onToggle'
        },

        listen: {
            'add collection': 'updateState',
            'remove collection': 'updateState',
            'reset collection': 'updateState'
        },

        /**
         * @inheritDoc
         */
        constructor: function BookmarkButtonView() {
            BookmarkButtonView.__super__.constructor.apply(this, arguments);
        },

        /**
         * @inheritDoc
         */
        initialize: function(options) {
            if (!options.navigationElementType) {
                throw new Error('"navigationItemElementType" is required option for bookmark button');
            }

            this.navigationElementType = options.navigationElementType;

            // handles page update
            mediator.on('page:update', function(page, args) {
                titleRendered = page.title;
            });
        },

        render: function() {
            var titleSerialized;
            var titleShort;

            this.updateState();

            var data = this.getTemplateData();
            if (!data || !data.navigationElements) {
                // no data, it is initial auto render, skip rendering
                return this;
            }

            if (data.navigationElements[this.navigationElementType]) {
                titleShort = data.titleShort;
                this.$el.show();
                /**
                 * Setting serialized titles for pinbar button
                 */
                if (data.titleSerialized) {
                    titleSerialized = JSON.parse(data.titleSerialized);
                    this.$el.data('title', titleSerialized);
                }
                this.$el.data('title-rendered-short', titleShort);
            } else {
                this.$el.hide();
            }

            return this;
        },

        updateState: function() {
            var model;
            model = this.collection.getCurrentModel();
            this.$el.toggleClass('gold-icon', Boolean(model));
        },

        onToggle: function() {
            var attrs;
            var Model;
            var model = this.collection.getCurrentModel();
            if (model) {
                this.collection.trigger('toRemove', model);
            } else {
                Model = this.collection.model;
                attrs = this.getItemAttrs();
                model = new Model(attrs);
                this.collection.trigger('toAdd', model);
            }
        },

        getItemAttrs: function() {
            var title = this.$el.data('title');
            return {
                url: mediator.execute('currentUrl'),
                title_rendered: titleRendered || this.$el.data('title-rendered'),
                title_rendered_short: this.$el.data('title-rendered-short') || document.title,
                title: title ? JSON.stringify(title) : '{"template": "' + document.title + '"}'
            };
        }
    });

    return BookmarkButtonView;
});

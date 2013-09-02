(function($) {
    
    function Selectable(elem, options) {
        this.elem = elem;
        var defaultOptions = {
            filter: '*',
            selectedClass: 'selected',
            helper: '.helper',
            helperVisClass: 'show',
            onSelect: null
        }
        options || (options = {});
        this.options = $.merge(options, defaultOptions);
        this.selectEles = elem.querySelectorAll(options.filter);
        var data = $.data;
        $.each(this.selectEles, function(ele) {
            var left = ele.offsetLeft;
            var top = ele.offsetTop;
            data(ele, 'selectItem', {
                left: left,
                top: top,
                right: ele.offsetWidth + left,
                bottom: ele.offsetHeight + top,
                selected: ele.classList.contains(options.selectedClass)
            });
        });
        this.helper = $(options.helper);
        this.helperStyle = this.helper.style;
        this.helperClassList = this.helper.classList;
        this.downed = false;
        this.pos = {};
        this.init();
    }

    Selectable.prototype = {
        constructor: Selectable,

        init: function() {
            var DOC = document;
            $.on(this.elem, 'mousedown', this._mouseStart.bind(this));
            $.on(this.elem, 'click', this._click.bind(this));
            $.on(DOC, 'mousemove', this._mouseDrag.bind(this));
            $.on(DOC, 'mouseup', this._mouseEnd.bind(this));
        },

        _click: function(e) {
            $.each(this.selectEles, function(ele) {
                var clsList = ele.classList;
                clsList.remove(this.options.selectedClass);
            }, this);
            var target = $.closest(e.target, 'li');
            if (target) {
                target.classList.add(this.options.selectedClass);
            }
        },

        _mouseStart: function(e) {
            e.preventDefault();
            this.downed = true;
            this.pos.x = e.pageX;
            this.pos.y = e.pageY;
        },

        _mouseDrag: function(e) {
            if (this.downed) {
                e.preventDefault();
                var x = e.pageX, y = e.pageY, x1 = this.pos.x, y1 = this.pos.y, tmp;
                var tmpWidth = x - x1;
                var tmpHeight = y - y1;
                if (tmpWidth > 0) {
                    tmp = x;
                    x = x1;
                    x1 = tmp;
                }
                if (tmpHeight > 0) {
                    tmp = y;
                    y = y1;
                    y1 = tmp;
                }
                this.helperStyle.left = x + 'px';
                this.helperStyle.top = y + 'px';
                this.helperStyle.width = Math.abs(tmpWidth) + 'px';
                this.helperStyle.height = Math.abs(tmpHeight) + 'px';
                this.helperClassList.add(this.options.helperVisClass);

                // 处理范围计算
                $.each(this.selectEles, function(ele) {
                    var clsList = ele.classList;
                    clsList.remove(this.options.selectedClass);
                    var bounds = $.data(ele, 'selectItem');
                    var hit = (!(bounds.left > x1 || bounds.right < x || bounds.top > y1 || bounds.bottom < y));
                    if (hit) {
                        clsList.add(this.options.selectedClass);
                    }
                }, this);
            }
        },

        _mouseEnd: function(e) {
            this.downed = false;
            this.helperClassList.remove(this.options.helperVisClass);
        },

        destroy: function() {
            //...
        }
    };

    $.ui.Selectable = Selectable;
})($);
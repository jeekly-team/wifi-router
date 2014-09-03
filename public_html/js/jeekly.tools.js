/*
 * 扩展JQ类,使用时需引用jquery-1.8.3.min.js
 */
(function($) {
    /*
     使用方法：
     var hb=$.jeekly;        
     var o_list = hb.getJsonData('eqjson', 'dt', $('#dt').val());
     console.log(o_list);
     */
    $.jeekly = {
        testdata: [{
                'id': 'aQYG6uOratRkXspOqQBCFQkPmoroowZb',
                'dt': '2014-4-24',
                'eqname': '配电室',
                'category': 'D',
                'area': '任南',
                'status': '运行',
                'amount': 5
            }, {
                'id': 'bQIHxqFlbTmFLWMQt7KZwULaIEB1MG5q',
                'dt': '2014-4-24',
                'eqname': '配电室',
                'category': 'D',
                'area': '任北',
                'status': '运行',
                'amount': 4
            }, {
                'id': 'ySGZZXYykWSh7ze6dt8f75nKu8xtKtjV',
                'dt': '2014-4-24',
                'eqname': '变压器',
                'category': 'D',
                'area': '运行',
                'status': '备用',
                'amount': 10
            }],
        getJsonData: function(url, data) {
            var v = data === undefined || data.length === 0 ? {} : data;
            var err = '';
            var ret = [];
            $.ajax({url: url, data: v, dataType: 'json', async: false,
                success: function(v) {
                    ret = v;
                },
                error: function(XMLHttpRequest, textStatus, errorThrown) {
                    err = textStatus + ':' + XMLHttpRequest.status;
                    console.log(XMLHttpRequest.status);
                    console.log(XMLHttpRequest.readyState);
                    console.log(textStatus);
                }});
            if (err)
                return err;
            return ret;
        },
        /* filter list 
         * ol:对象集合[{k:v,k:v},{k:v,k:v}...]
         * k:属性名
         * v:属性值
         * 过滤ol中k=v的 对象o,并返回符合该条件的对象o的集合
         */
        fList: function(ol, k, v) {
            return $.grep(ol, function(o, i) {
                return o[k] === v;
            });
        },
        /*
         * 注:必须每个参赛负值
         * sol = {'l': 源JSON, 'f': '字段(属性)', 'c': '要统计的字段(属性)'};
         * tol = {'l': 目标JSON, 'f': '字段(属性)', 'c': '存储统计值'};
         * 根据sol.l[索引][属性f]=tol.l[索引][属性f]统计sol.l[索引][属性c]的值,并累计存储tol.l[i][tol.c] += o[sol.c],返回tol.l
         * @param {type} src_ol
         * @param {type} tag_ol
         * @returns {tol.l|Array}
         */
        sum: function(src_ol, tag_ol) {
            var sol = {'l': [], 'f': '', 'c': ''};
            var tol = {'l': [], 'f': '', 'c': ''};
            if (src_ol) {
                //引用合并
                $.extend(sol, src_ol);
            }
            if (tag_ol) {
                //深度拷贝合并
                $.extend(true, tol, tag_ol);
            }
            var r = tol.l;
            for (var i = 0; i < sol.l.length; i++) {
                var o = sol.l[i];
                for (var n in r) {
                    if (r[n][tol.f] === o[sol.f])
                        r[n][tol.c] += o[sol.c] - 0;
                }
            }
            return r;
        },
        avg: function(src_ol, tag_ol) {
            var sol = {'l': [], 'f': '', 'c': ''};
            var tol = {'l': [], 'f': '', 'c': ''};
            if (src_ol) {
                //引用合并
                $.extend(sol, src_ol);
            }
            if (tag_ol) {
                //深度拷贝合并
                $.extend(true, tol, tag_ol);
            }
            var r = tol.l;
            var t = {};
            for (var i = 0; i < sol.l.length; i++) {
                var o = sol.l[i];
                var c = o[sol.f];
                //!t[c]表示t[c]为空时 t[c]＝0 用于循环内第一次碰到该对象
                if (!t[c])
                    t[c] = 0;
                t[c]++;
                for (var n in r) {
                    if (r[n][tol.f] === o[sol.f])
                        r[n][tol.c] += parseFloat(o[sol.c]);
                }
            }
            //娘的 要计算评价数还得再循环
            for (var to in t) {
                for (var no in r) {
                    if (r[no][tol.f] === to)
                        r[no][tol.c] = r[no][tol.c] / t[to];
                }
            }
            //console.log(t);
            return r;
        },
        /*
         * object list to Arr list
         * 对象集合[{k:v,k:v},{k:v,k:v}...] 转成 Arrylist  [[k,v],[k,v][k,v]...]
         * @param {type} ol
         * @returns {Array}
         */
        Ol2Arr: function(ol) {
            var ret = [], o = [], c, i = 0, length = ol.length;
            for (; i < length; i++) {
                o = ol[i];
                c = [];
                for (var u in o) {
                    c.push(o[u]);
                }
                ret.push(c);
            }
            return ret;
        },
        /*
         * 移除JSON中的属性
         * @param {type} d
         * @param {type} attr
         * @returns {Object}
         */
        popAttr: function(d, attr) {
            return $.each(d, function(i, v) {
                delete this[attr];
            });
        },
        /*******box************/
        boxmethods: {
            /*
             * 定义box元素,只定义css,class;不予组合,以便新增加元素;
             * 元素的组合在INIT方法中
             */
            el: {fullbg: $('<div>')
                        .css({
                            'background-color': 'Gray',
                            'left': '0px', 'top': '0px',
                            'opacity': '0.5',
                            'position': 'absolute',
                            'z-index': '1010'})
                        .attr('class', '_fullbg_'),
                box: $('<div>')
                        .css({
                            'width': '168px',
                            'min-height': '80px',
                            'background-color': '#FFF',
                            'box-shadow': '1px 2px 5px rgba(0, 0, 0, 0.5)',
                            'left': '40%',
                            'top': '40%',
                            'display': 'none',
                            'position': 'fixed',
                            'z-index': '1011',
                            'font-size': '14px'
                        })
                        .attr('class', '_box_'),
                closeui: $('<div>')
                        .css({
                            'width': '20px',
                            'height': '20px',
                            'float': 'right',
                            'margin-right': '2px'}),
                closebtn: $('<a>')
                        .attr('class', 'close')
                        .html('&times;'),
                msg: $('<div>')
                        .css({'margin': '0 auto',
                            'padding': '4px',
                            'text-align': 'center',
                            'white-space': 'normal',
                            'word-wrap': 'break-word'})
                        .attr('class', '_msg_'),
                timer: $('<div>')
                        .css({'width': '20px', 'height': '20px', 'float': 'left'})
                        .attr('class', '_timer_')
            },
            /*
             * 初始化元素 绑定事件
             * @param {type} options
             * @returns {undefined}
             */
            init: function() {
                var el = $.jeekly.boxmethods.el, box;
                var initdata;
                //判断页面存在$('._box_')否 不存在则插入BOX对象
                if ($('._box_').length > 0) {
                    initdata = el.box;
                }
                else {
                    box = el.box
                            .append(el.closeui.append(el.closebtn))
                            .append("<hr style='clear:both;top:20px'>")
                            .append(el.msg);
                    box.appendTo('body');
                    initdata = box;
                }
                //绑定事件
                el.closebtn.on('click', function() {
                    $.jeekly.boxmethods.hide([el.box, el.fullbg]);
                });
                return initdata;
            },
            /*
             * 根据条件显示dom 
             * @param {type} options
             * @returns {undefined}
             */
            show: function(options) {
                var el = $.jeekly.boxmethods.el;
                var settings = {
                    'showtime': 0,
                    'showbg': 0,
                    'msg': '',
                    'init_callback': {}
                };
                // 传参 如果存在选项则合并之
                if (options) {
                    $.extend(settings, options);
                }
                //实例化init
                settings.init_callback = $.jeekly.boxmethods.init();
                //显示影藏的BOX
                el.box.show();
                //显示遮罩
                if (settings.showbg) {
                    //get body dom
                    var w = $(document);
                    el.fullbg.css({'height': w.height(), 'width': w.width(), 'display': 'block'}).appendTo('body');
                }
                //插入时间DIV 每隔一段时机重写timer的内容
                if (settings.showtime > 0) {
                    el.closeui.before(el.timer); // wait change
                    var timer = function(i) {
                        var c = setInterval(
                                function() {                              
                                    if (i === 0) {
                                        clearInterval(c);
                                        $.jeekly.boxmethods.hide([el.box, el.fullbg]);
                                    }
                                    el.timer.html('[<font color="red">' + i-- + '</font>]');
                                }, 1000);
                    }(settings.showtime);
                }
                if (settings.msg.length > 0) {
                    el.msg.html(settings.msg);
                }
                return settings;
            },
            /*
             * 隐藏DOM
             * @returns {undefined}
             */
            hide: function(objs) {
                var el = $.jeekly.boxmethods.el;
                var settings = [el.box, el.fullbg];
                var hidedata;
                if (objs === undefined || objs.length === 0) {
                    hidedata = settings;
                }
                else {
                    hidedata = objs;
                }

                $.each(hidedata, function(i, v) {
                    hidedata[i].hide();
                });
                //console.log(hidedata);
                return hidedata;
            }
        },
        box: function(method) {
            /*
             {Array.prototype.slice.call(arguments,1)
             将具有length属性的对象转成数组
             arguments是一个关键字，代表当前参数，在javascript中虽然arguments表面上以数组形式来表示，但实际上没有原生数组slice的功能，这里使用call方法算是对arguments对象不完整数组功能的修正。
             slice返回一个数组，该方法只有一个参数的情况下表示除去数组内的第一个元素。就本上下文而言，原数组的第一个参数是“事件名称”，具体像“click”,'render'般的字符串，其后的元素才是处理函数所接纳的参数列表。
             }
             {obj.apply(this,[])将函数的属性与方法进行拷贝}
             **/
            if (this.boxmethods[method]) {
                //console.log(this);
                return this.boxmethods[method].apply(this, Array.prototype.slice.call(arguments, 1));

            } else {
                $.error('Method ' + method + ' does not exist on jQuery.box');
            }
        }
    };
    /*
     使用方法：
     var a = new $.DragField({ title: 'Hi' });
     var b = new $.DragField({ title: 'Hello' });
     a.testFun();
     b.testFun();
     */
    $.DragField = function(arg) {
        var name = '你好'; //这个是私有变量,外部无法访问
        this.testFun = function() {     //this.testFun方法,加上了this,就是公有方法了,外部可以访问
            alert(arg.title + ',' + name);
        };
    };
})(jQuery);

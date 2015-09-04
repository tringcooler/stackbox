
var __extends = this.__extends || function (d, b) {
	// for property own by base_class itself
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	/*
	for property define in constructor
	inhert_class's constructor must excute base_class's constructor by base_class.apply(this)
	*/
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
	/*
	new object means:
	obj.__proto__ = class.prototype
	extends means:
	inhert_class.prototype.__proto__ = base_class.prototype
	then:
	inhert_class.prototype must be created by new base_class without constructor
	*/
    d.prototype = new __();
};

var stackbox_main = (function() {
	function stackbox_main() {
		
	}
	return stackbox_main;
})();

var sbtp = {
	'pos': stackbox_type_position,
	'rng': stackbox_type_range,
};

var stackbox_type_position = (function() {
	function stackbox_type_position(x, y, z) {
		this.x = x;
		this.y = y;
		if(z == undefined)
			z = null;
		this.z = z;
	}
	stackbox_type_position.prototype.dim = function() {
		if(this.z == null)
			return 2;
		else
			return 3;
	};
	stackbox_type_position.prototype.tuple = function() {
		if(this.z == null)
			return [this.x, this.y];
		else
			return [this.x, this.y, this.z];
	};
	stackbox_type_position.prototype.assign = function(p) {
		this.x = p.x;
		this.y = p.y;
		this.z = p.z;
	};
	stackbox_type_position.prototype.copy = function() {
		return new stackbox_type_position(this.x, this.y, this.z);
	};
	stackbox_type_position.prototype.eq = function(p) {
		return this.x == p.x && this.y == p.y;
	};
	stackbox_type_position.prototype.is_zero = function() {
		return this.x == 0 && this.y == 0;
	};
	stackbox_type_position.prototype.add = function(p) {
		this.x += p.x;
		this.y += p.y;
		if(this.z != null || p.z != null)
			this.z += p.z;
	};
	stackbox_type_position.prototype.sub = function(p) {
		this.x -= p.x;
		this.y -= p.y;
		if(this.z != null || p.z != null)
			this.z -= p.z;
	};
	stackbox_type_position.prototype.plus = function(p) {
		var r = this.copy();
		r.add(p);
		return r;
	};
	stackbox_type_position.prototype.minus = function(p) {
		var r = this.copy();
		r.sub(p);
		return r;
	};
	stackbox_type_position.prototype.flat = function() {
		var r = this.copy();
		r.z = null;
		return r;
	};
	return stackbox_type_position;
})();

var stackbox_type_range = (function() {
	function stackbox_type_range(top, bot) {
		if(top.dim() != bot.dim()) throw 'range assert';
		if(top.x > bot.x || top.y > bot.y || (bot.z != null && top.z > bot.z)) throw 'range assert';
		this.top = top;
		this.bot = bot;
	}
	stackbox_type_range.prototype.dim = function() {
		if(this.top.dim() == 3)
			return 3;
		else
			return 2;
	};
	stackbox_type_range.prototype.add = function(pos) {
		this.top.add(pos);
		this.bot.add(pos);
	};
	stackbox_type_range.prototype.sub = function(pos) {
		this.top.sub(pos);
		this.bot.sub(pos);
	};
	stackbox_type_range.prototype.plus = function(pos) {
		return new stackbox_type_range(
			this.top.plus(pos),
			this.bot.plus(pos)
		);
	};
	stackbox_type_range.prototype.minus = function(pos) {
		return new stackbox_type_range(
			this.top.minus(pos),
			this.bot.minus(pos)
		);
	};
	stackbox_type_range.prototype.move_to = function(pos) {
		var _bot = this.len();
		var _top = pos.copy();
		if(this.dim() == 3 && _top.dim() == 2)
			_top.z = this.top.z;
		_bot.add(_top);
		return new stackbox_type_range(_top, _bot);
	};
	stackbox_type_range.prototype.len = function(dim) {
		if(dim != undefined) {
			return this.bot.tuple[dim] - this.top.tuple[dim];
		} else {
			var _z = null;
			if(this.dim() == 3)
				_z = this.bot.z - this.top.z;
			return new stackbox_type_position(
				this.bot.x - this.top.x,
				this.bot.y - this.top.y,
				_z
			);
		}
	};
	stackbox_type_range.prototype.copy = function() {
		var _top = this.top.copy();
		var _bot = this.bot.copy();
		return new stackbox_type_range(_top, _bot); 
	};
	stackbox_type_range.prototype.flat = function() {
		var _r = this.copy();
		if(this.dim() == 3) {
			_r.top.z = null;
			_r.bot.z = null;
		}
		return _r;
	};
	stackbox_type_range.prototype.collision_with = function(dst) {
		return !(this.bot.x > dst.top.x
			|| this.top.x < dst.bot.x
			|| this.bot.y > dst.top.y
			|| this.top.y < dst.bot.y
			|| this.bot.z > dst.top.z
			|| this.top.z < dst.bot.z);
	};
	stackbox_type_range.prototype.distance_from = function(dst) {
		var _t1, _t2;
		var _r = [0, 0, null];
		(_t1 = this.bot.x - dst.top.x) > 0 || (_t1 = 0);
		(_t2 = dst.bot.x - this.top.x) > 0 || (_t2 = 0);
		_r[0] = _t2 - _t1;
		(_t1 = this.bot.y - dst.top.y) > 0 || (_t1 = 0);
		(_t2 = dst.bot.y - this.top.y) > 0 || (_t2 = 0);
		_r[1] = _t2 - _t1;
		if(this.dim() == 3 && dst.dim() == 3) {
			(_t1 = this.bot.z - dst.top.z) > 0 || (_t1 = 0);
			(_t2 = dst.bot.z - this.top.z) > 0 || (_t2 = 0);
			_r[2] = _t2 - _t1;
		}
	};
	stackbox_type_range.prototype.max = function(dst) {
		var _top = this.top.copy();
		var _bot = this.bot.copy();
		_top.x = (_top.x > dst.top.x) ? dst.top.x : _top.x;
		_bot.x = (_bot.x < dst.bot.x) ? dst.bot.x : _bot.x;
		_top.y = (_top.y > dst.top.y) ? dst.top.y : _top.y;
		_bot.y = (_bot.y < dst.bot.y) ? dst.bot.y : _bot.y;
		if(this.dim() == 3 && dst.dim() == 3) {
			_top.z = (_top.z > dst.top.z) ? dst.top.z : _top.z;
			_bot.z = (_bot.z < dst.bot.z) ? dst.bot.z : _bot.z;
		} else if(dst.dim() == 3) {
			_top.z = dst.top.z;
			_bot.z = dst.bot.z;
		}
		return new stackbox_type_range(_top, _bot);
	};
	stackbox_type_range.prototype.min = function(dst) {
		var _top = this.top.copy();
		var _bot = this.bot.copy();
		_top.x = (_top.x < dst.top.x) ? dst.top.x : _top.x;
		_bot.x = (_bot.x > dst.bot.x) ? dst.bot.x : _bot.x;
		_top.y = (_top.y < dst.top.y) ? dst.top.y : _top.y;
		_bot.y = (_bot.y > dst.bot.y) ? dst.bot.y : _bot.y;
		if(this.dim() == 3 && dst.dim() == 3) {
			_top.z = (_top.z < dst.top.z) ? dst.top.z : _top.z;
			_bot.z = (_bot.z > dst.bot.z) ? dst.bot.z : _bot.z;
		} else if(dst.dim() == 3) {
			_top.z = dst.top.z;
			_bot.z = dst.bot.z;
		}
		return new stackbox_type_range(_top, _bot);
	};
	return stackbox_type_range;
})();

var stackbox_atom = (function() {
	function stackbox_atom(range) {
		this.spec = {};
		this.range = range;
	}
	return stackbox_atom;
})();

var stackbox_spec_graph = (function() {
	function stackbox_spec_graph(pos, type, frames) {
		this.pos = pos;
		this.type = type;
		if(frames == undefined)
			frames = {};
		this.frames = frames
	}
	stackbox_spec_graph.prototype.set_frame = function(name, frame) {
		if(frame == undefined)
			delete this.frames[name];
		else
			this.frames[name] = frame;
	};
	return stackbox_spec_graph;
})();

var stackbox_graph = (function() {
	function stackbox_graph(layers) {
		this.layers = layers;
		
	}
	return stackbox_graph;
})();

var stackbox_graph_box = (function() {
	function stackbox_graph_box(deep) {
		this.static_layers ={};
		this.dynamic_layers = [];
		this.ztp2layer = function(z, tp, box) {return z;};
		this.layer2ztp = function(idx, box) {return [idx, 'stand'];};
		this.layer_load = function(z, tp, box) {return null;};
		this.win_deep = deep;
		this.win_start = 0;
	}
	stackbox_graph_box.prototype.get_layer = function(idx) {
		var layer;
		if(typeof(idx) == 'number') {
			if(idx < this.win_start || idx >= this.win_start + this.win_deep)
				return null;
			layer = this.dynamic_layers[idx - win_start];
		} else {
			layer = this.static_layers[idx];
		}
		return layer;
	};
	stackbox_graph_box.prototype.z2layer = function(z) {
		var lyr_first = this.ztp2layer(z, null, this);
		var lyr_next = lyr_first;
		while(this.layer2ztp(lyr_next)[0] == z)
			lyr_next ++;
		return [lyr_first, lyr_next];
	};
	stackbox_graph_box.prototype.draw = function(frame, pos, tp, trans) {
		var layer_idx = this.ztp2layer(pos.z, tp, this);
		var layer = this.get_layer(layer_idx);
		if(!layer) 
			return {
				"id": -1,
				"err": "draw out of window",
			};
		var info = layer.draw(frame, pos.flat(), trans);
		info['z'] = pos.z;
		info['tp'] = tp;
		return info;
	};
	stackbox_graph_box.prototype.clear = function(info) {
		if(info.id == -1) return false;
		var layer_idx = this.ztp2layer(info.z, info.tp, this);
		var layer = this.get_layer(layer_idx);
		if(!layer) return false;
		return layer.clear(info);
	};
	stackbox_graph_box.prototype.move_to = function(z, tp) {
		var _ztp;
		var win_dst = this.ztp2layer(z, tp, this);
		if(win_dst >= this.win_start + this.win_deep || this.win_start >= win_dst + this.win_deep || this.dynamic_layers.length < this.win_deep) {
			this.dynamic_layers = [];
			for(var i = win_dst; i < win_dst + this.win_deep; i++) {
				_ztp = this.layer2ztp(i, this);
				this.dynamic_layers.push(this.layer_load(_ztp[0], _ztp[1], this));
			}
		} else if(win_dst < this.win_start) {
			this.dynamic_layers = this.dynamic_layers.slice(0, win_dst + this.win_deep - this.win_start);
			for(var i = this.win_start - 1; i >= win_dst; i--) {
				_ztp = this.layer2ztp(i, this);
				this.dynamic_layers.unshift(this.layer_load(_ztp[0], _ztp[1], this));
			}
		} else if(win_dst > this.win_start) {
			this.dynamic_layers = this.dynamic_layers.slice(win_dst - this.win_start);
			for(var i = this.win_start + this.win_deep; i < win_dst + this.win_deep; i++) {
				_ztp = this.layer2ztp(i, this);
				this.dynamic_layers.push(this.layer_load(_ztp[0], _ztp[1], this));
			}
		}
		this.win_start = win_dst;
	};
	return stackbox_graph_box;
})();

/* Simple layer, rects shouldn't overlap */
var stackbox_graph_layer = (function() {
	var layer_id = 1;
	function stackbox_graph_layer() {
		argv = stackbox_util.parse_argv(arguments, {
			"default": [],
			"surf": ["surface"],
			"new": ["width", "height"],
		});
		var surface;
		switch(argv.patt) {
			case 'surf':
				surface = argv.surface;
				break;
			case 'new':
				surface = new stackbox_graph_surface(argv.width, argv.height);
				break;
			case 'default':
			default:
				surface = new stackbox_graph_surface();
				break;
		}
		this.surface = surface;
		this.range2local = function(range) {return range;};
		this.id = layer_id;
		layer_id ++;
	}
	stackbox_graph_layer.prototype.draw = function(frame, pos, trans) {
		var dst_range = frame.range.move_to(pos);
		var loc_range = this.range2local(dst_range);
		frame.blit(this.surface, loc_range.top, trans);
		return {
			"id": this.id,
			"range": loc_range,
		};
	};
	stackbox_graph_layer.prototype.blit = function(src_rng, dst_surf, dst_pos, dst_trans) {
		var loc_range = this.range2local(src_rng);
		this.surface.blit(loc_range, dst_surf, dst_pos, dst_trans);
	};
	stackbox_graph_layer.prototype.clear = function(info) {
		if(info.id != this.id) return false;
		this.surface.clear(info.range);
		return true;
	};
	return stackbox_graph_layer;
})();

var stackbox_graph_camera = (function() {
	function stackbox_graph_camera(box, range, deep, order) {
		this.box = box;
		this.surfaces = {
			"static": {},
			"dynamic": [],
			"order": order,
		};
		this.range = range;
		this.base = range.top;
		this.size = range.len();
		this.win_deep = this.win_end() - this.win_start();
		this.moved = true;
		this.dirty_range = {
			"static": {},
			"dynamic": {},
		};
		this.init_screen();
	}
	stackbox_graph_camera.prototype.win_start = function() {
		return this.box.z2layer(this.range.top.z)[0];
	};
	stackbox_graph_camera.prototype.win_end = function() {
		return this.box.z2layer(this.range.bot.z)[1];
	};
	stackbox_graph_camera.prototype.init_surfaces = function() {
		for(var i = 0; i < this.surfaces.order.length; i++) {
			var key = this.surfaces.order[i];
			var surface;
			if(key == 'dynamic') {
				for(var j = 0; j < this.win_deep; j++) {
					surface = new stackbox_graph_surface();
					this.surfaces.dynamic.push(surface);
					stackbox_graph_system.append_ctx(surface);
				}
			} else {
				surface = new stackbox_graph_surface();
				this.surfaces.static[key] = surface;
				stackbox_graph_system.append_ctx(surface);
			}
		}
	};
	stackbox_graph_camera.prototype.move = function(pos) {
		if(!pos.is_zero()) {
			this.range.top.add(pos);
			this.moved = true;
		}
	};
	stackbox_graph_camera.prototype.move_to = function(pos) {
		if(!this.range.top.eq(pos)) {
			this.range.top.assign(pos);
			this.moved = true;
		}
	};
	stackbox_graph_camera.prototype.dirty = function(range, tp) {
		if(this.moved) return;
		var range_f = range.flat();
		if(tp && this.surfaces.static.hasOwnProperty(tp)) {
			if(range_f.collision_with(this.range.flat())) {
				if(this.dirty_range.static.hasOwnProperty(tp)) {
					range_f = this.dirty_range.static[tp][0].max(range_f);
					this.dirty_range.static[tp] = [range_f, range_f.top.minus(this.range.top)];
				} else {
					this.dirty_range.static[tp] = [range_f, range_f.top.minus(this.range.top)];
				}
			}
		} else {
			if(range.collision_with(this.range)) {
				var lyr = this.box.ztp2layer(range.top.z, tp, this.box);
				if(this.dirty_range.dynamic.hasOwnProperty(lyr)) {
					range_f = this.dirty_range.dynamic[lyr][0].max(range_f);
					this.dirty_range.dynamic[lyr] = [range_f, range_f.top.minus(this.range.top)];
				} else {
					this.dirty_range.dynamic[lyr] = [range_f, range_f.top.minus(this.range.top)];
				}
			}
		}
	};
	stackbox_graph_camera.prototype.update = function() {
		if(this.moved) {
			for(var i = 0; i < this.surfaces.order.length; i++) {
				var key = this.surfaces.order[i];
				if(key == 'dynamic') {
					for(var j = 0; j < this.win_deep; j++) {
						this.box.get_layer(j + this.win_start()).blit(
							this.range.flat(),
							this.surfaces.dynamic[j],
							new stackbox_type_position(0, 0)
						);
					}
				} else {
					this.box.get_layer(key).blit(
						this.range.flat(),
						this.surfaces.static[key],
						new stackbox_type_position(0, 0)
					);
				}
			}
		} else {
			for(var key in this.dirty_range.dynamic) {
				var ikey = Number(key);
				this.box.get_layer(ikey).blit(
					this.dirty_range.dynamic[key][0],
					this.surfaces.dynamic[ikey - this.win_start()],
					this.dirty_range.dynamic[key][1]
				);
			}
			for(var key in this.dirty_range.static) {
				this.box.get_layer(key).blit(
					this.dirty_range.static[key][0],
					this.surfaces.static[key],
					this.dirty_range.static[key][1]
				);
			}
		}
		this.moved = false;
		this.dirty_range.static = {};
		this.dirty_range.dynamic = {};
	};
	return stackbox_graph_camera;
})();

var stackbox_graph_surface = (function() {
	function stackbox_graph_surface() {
		argv = stackbox_util.parse_argv(arguments, {
			"default": [],
			"ctx": ["ctx"],
			"new": ["width", "height"],
		});
		var ctx;
		switch(argv.patt) {
			case 'ctx':
				ctx = argv.ctx;
				break;
			case 'new':
				ctx = stackbox_graph_system.new_ctx(argv.width, argv.height);
				break
			case 'default':
			default:
				ctx = stackbox_graph_system.new_ctx();
				break;
		}
		this.ctx = ctx;
	}
	stackbox_graph_surface.prototype.blit = function(src_rng, dst, dst_pos, dst_trans) {
		if(dst_trans) {
		} else {
			stackbox_graph_system.blit(this.ctx, src_rng, dst.ctx, dst_pos);
		}
	};
	stackbox_graph_surface.prototype.clear = function(rng) {
		stackbox_graph_system.clear(this.ctx, rng);
	};
	return stackbox_graph_surface;
})();

var stackbox_graph_trans = (function() {
	function stackbox_graph_trans(info) {
		this.info = info;
	}
	stackbox_graph_trans.prototype.copy = function() {
		var r = {};
		for(var k in this.info) {
			r[k] = this.info[k];
		}
		return new stackbox_graph_trans(r);
	};
	stackbox_graph_trans.prototype.add = function(t) {
		for(var k in t.info) {
			switch(k) {
				case 'angle':
					var ang = this.info[k] + t.info[k];
					while(ang > 2 * Math.PI) ang -= 2 * Math.PI;
					while(ang < 0) ang += 2 * Math.PI;
					this.info[k] = ang;
					break;
				case 'flip':
				case 'scare':
				case 'scare2':
				default:
					break;
			}
		}
	};
	stackbox_graph_trans.prototype.plus = function(t) {
		var r = this.copy();
		r.add(t);
		return r;
	}
	return stackbox_graph_trans;
})();

var stackbox_graph_frame = (function() {
	function stackbox_graph_frame(surface, range, trans) {
		this.surface = surface;
		this.range = range;
		if(trans = undefined)
			trans = null;
		this.trans = trans;
	}
	stackbox_graph_frame.prototype.blit = function(dst, pos, trans) {
		if(!trans)
			trans = this.trans;
		else if(this.trans != null)
			trans = this.trans.plus(trans);
		this.surface.blit(this.range, dst, pos, trans);
	};
	return stackbox_graph_frame;
})();

var stackbox_graph_system = {
	screen_div: null,
	screen_width: 0,
	screen_height: 0,
	ctx_idx: 0,
	//ctxs: {},
	init: function(div, width, height) {
		this.screen_div = div;
		this.screen_width = width;
		this.screen_height = height;
	},
	new_ctx: function(width, height) {
		var new_canvas = document.createElement('canvas');
		if(!width) width = this.screen_width;
		if(!height) height = this.screen_height;
		new_canvas.width = width;
		new_canvas.height = height;
		var ctx = new_canvas.getContext("2d");
		//this.ctxs[this.ctx_idx] = [ctx, new_canvas];
		this.ctx_idx += 1;
		return ctx;
	},
	image_ctx: function(img) {
		var ctx = this.new_ctx(1,1);
		var image = new Image();
		var loading_id;
		image.onload = function() {
			ctx.canvas.width = this.width;
			ctx.canvas.height = this.height;
			ctx.drawImage(this, 0, 0);
			stackbox_util.loading_checker.done(loading_id);
		};
		image.src = img;
		loading_id = stackbox_util.loading_checker.start();
		return ctx;
	},
	get_canvas: function(ctx) {
		/*for(var k in this.ctxs) {
			if(this.ctxs[k][0] == ctx)
				return this.ctxs[k][1];
		}
		return null;*/
		return ctx.canvas;
	},
	append_ctx: function(ctx) {
		screen_div.appendChild(ctx.canvas);
	},
	blit: function(src_ctx, src_rng, dst_ctx, dst_pos) {
		dst_ctx.drawImage(src_ctx, src_rng.top.x, src_rng.top.y, src_rng.len(0), src_rng.len(1), dst_pos.x, dst_pos.y);
	},
	clear: function(ctx, rng) {
		ctx.clearRect(rng.top.x, rng.top.y, rng.len(0), rng.len(1));
	},
};

var stackbox_util = {
	parse_argv: function(argv, argtab) {
		var rslt = {};
		var len = argv.length;
		for(var patt in argtab) {
			if(argtab[patt].length == len) {
				rslt['patt'] = patt;
				for(var i = 0; i < len; i++) {
					rslt[argtab[patt][i]] = argv[i];
				}
				return rslt;
			}
		}
		rslt['patt'] = 'none';
		return rslt;
	},
	async_checker: (function() {
		function async_checker() {
			this.que = [];
			this.idx = 1;
		}
		async_checker.prototype.start = function() {
			this.que.push(this.idx);
			return this.idx++;
		};
		async_checker.prototype.done = function(id) {
			var idx = this.que.indexOf(id);
			if(idx > -1) {
				this.que.splice(idx, 1);
			}
		};
		async_checker.prototype.check = function() {
			return this.que.length == 0;
		};
		return async_checker;
	})(),
	init: function() {
		this.loading_checker = new this.async_checker();
		return this;
	},
}.init();

$(document).ready(function() {
	console.log('ready');
	console.log('done');
});


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

/*************************************************************************************/

var stackbox_main = (function() {
	function stackbox_main() {
		
	}
	return stackbox_main;
})();

/*************************************************************************************/

var stackbox_type_position = (function() {
	function stackbox_type_position(x, y, z) {
		this.x = x;
		this.y = y;
		if(z === undefined)
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
	stackbox_type_position.prototype.flip = function(flp, cen) {
		if(this.dim() == 2) {
			if(cen === undefined)
				cen = new stackbox_type_position(0, 0);
			var _x = this.x;
			var _y = this.y;
			if(flp & 1) _x = 2 * cen.x - _x;
			if(flp & 2) _y = 2 * cen.y - _y;
			return new stackbox_type_position(_x, _y);
		} else {
			throw '3d rotate unsupported.';
		}
	};
	stackbox_type_position.prototype.scale = function(scl, cen) {
		if(this.dim() == 2) {
			if(cen === undefined)
				cen = new stackbox_type_position(0, 0);
			var _x = (this.x - cen.x) * scl + cen.x;
			var _y = (this.y - cen.y) * scl + cen.y;
			return new stackbox_type_position(_x, _y);
		} else {
			throw '3d rotate unsupported.';
		}
	};
	stackbox_type_position.prototype.rotate = function(rad, cen) {
		if(this.dim() == 2) {
			if(cen === undefined)
				cen = new stackbox_type_position(0, 0);
			var _x = this.x - cen.x;
			var _y = this.y - cen.y;
			var _nx = /*Math.floor*/(_x * Math.cos(rad) - _y * Math.sin(rad));
			var _ny = /*Math.floor*/(_x * Math.sin(rad) + _y * Math.cos(rad));
			return new stackbox_type_position(_nx + cen.x, _ny + cen.y);
		} else {
			throw '3d rotate unsupported.';
		}
	};
	return stackbox_type_position;
})();

var stackbox_type_range = (function() {
	function stackbox_type_range() {
		argv = stackbox_util.parse_argv(arguments, {
			"pos": ["top", "bot"],
			"poslen": ["top", "len", "dummy"],
			"val2": ["topx", "topy", "botx", "boty"],
			"val3": ["topx", "topy", "topz", "botx", "boty", "botz"],
		});
		var top, bot;
		switch(argv.patt) {
			case 'pos':
				top = argv.top;
				bot = argv.bot;
				break;
			case 'poslen':
				top = argv.top;
				bot = argv.len.plus(top);
				break;
			case 'val2':
				top = new stackbox_type_position(argv.topx, argv.topy);
				bot = new stackbox_type_position(argv.botx, argv.boty);
				break;
			case 'val3':
				top = new stackbox_type_position(argv.topx, argv.topy, argv.topz);
				bot = new stackbox_type_position(argv.botx, argv.boty, argv.botz);
				break;
			default:
				throw 'args error';
		}
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
	stackbox_type_range.prototype.righttop = function() {
		return new stackbox_type_position(this.bot.x, this.top.y);
	};
	stackbox_type_range.prototype.leftbot = function() {
		return new stackbox_type_position(this.top.x, this.bot.y);
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
		if(this.dim() == 2 && pos.dim() == 2) {
			//for fast
			return new stackbox_type_range(
				pos.x, pos.y,
				pos.x + this.bot.x - this.top.x,
				pos.y + this.bot.y - this.top.y
			);
		}
		var _bot = this.len();
		var _top = pos.copy();
		if(this.dim() == 3 && _top.dim() == 2)
			_top.z = this.top.z;
		_bot.add(_top);
		return new stackbox_type_range(_top, _bot);
	};
	stackbox_type_range.prototype.len = function(dim) {
		if(dim !== undefined) {
			return this.bot.tuple()[dim] - this.top.tuple()[dim];
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
		var _r = (this.bot.x < dst.top.x
			|| this.top.x > dst.bot.x
			|| this.bot.y < dst.top.y
			|| this.top.y > dst.bot.y);
		if(this.dim() == 3 && dst.dim() == 3) {
			_r = (_r 
				|| this.bot.z < dst.top.z
				|| this.top.z > dst.bot.z);
		}
		return !_r;
	};
	stackbox_type_range.prototype.contain = function(dst) {
		var _r = (this.top.x > dst.top.x
			|| this.bot.x < dst.bot.x
			|| this.top.y > dst.top.y
			|| this.bot.y < dst.bot.y);
		if(this.dim() == 3 && dst.dim() == 3) {
			_r = (_r 
				|| this.top.z > dst.top.z
				|| this.bot.z < dst.bot.z);
		}
		return !_r;
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
	stackbox_type_range.prototype._modrng = function(_r, np) {
		if(np.x < _r.top.x)
			_r.top.x = np.x;
		if(np.y < _r.top.y)
			_r.top.y = np.y;
		if(np.x > _r.bot.x)
			_r.bot.x = np.x;
		if(np.y > _r.bot.y)
			_r.bot.y = np.y;
	};
	stackbox_type_range.prototype.flip = function(flp, cen) {
		if(this.dim() == 2) {
			if(cen === undefined)
				cen = new stackbox_type_position(0, 0);
			var _p = this.top.flip(flp, cen);
			var _r = new stackbox_type_range(_p.x, _p.y, _p.x, _p.y);
			this._modrng(_r, this.righttop().flip(flp, cen));
			this._modrng(_r, this.leftbot().flip(flp, cen));
			this._modrng(_r, this.bot.flip(flp, cen));
			return _r;
		} else {
			throw '3d rotate unsupported.';
		}
	};
	stackbox_type_range.prototype.scale = function(scl, cen) {
		if(this.dim() == 2) {
			if(cen === undefined)
				cen = new stackbox_type_position(0, 0);
			var _p = this.top.scale(scl, cen);
			var _r = new stackbox_type_range(_p.x, _p.y, _p.x, _p.y);
			this._modrng(_r, this.righttop().scale(scl, cen));
			this._modrng(_r, this.leftbot().scale(scl, cen));
			this._modrng(_r, this.bot.scale(scl, cen));
			return _r;
		} else {
			throw '3d rotate unsupported.';
		}
	};
	stackbox_type_range.prototype.rotate = function(rad, cen) {
		if(this.dim() == 2) {
			if(cen === undefined)
				cen = new stackbox_type_position(0, 0);
			var _p = this.top.rotate(rad, cen);
			var _r = new stackbox_type_range(_p.x, _p.y, _p.x, _p.y);
			this._modrng(_r, this.righttop().rotate(rad, cen));
			this._modrng(_r, this.leftbot().rotate(rad, cen));
			this._modrng(_r, this.bot.rotate(rad, cen));
			return _r;
		} else {
			throw '3d rotate unsupported.';
		}
	};
	return stackbox_type_range;
})();

var stackbox_type_collection = (function() {
	var g_cid = 1;
	function stackbox_type_collection() {
		this.vals = {};
	}
	stackbox_type_collection.prototype.add = function(val) {
		this.vals[g_cid] = val;
		return g_cid++;
	};
	stackbox_type_collection.prototype.remove = function(cid) {
		if(!(cid in this.vals)) return false;
		return (delete this.vals[cid]);
	};
	stackbox_type_collection.prototype.length = function() {
		return Object.keys(this.vals).length;
	};
	return stackbox_type_collection;
})();

var sbtp = {
	'pos': stackbox_type_position,
	'rng': stackbox_type_range,
};

/*************************************************************************************/

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
		if(frames === undefined)
			frames = {};
		this.frames = frames
	}
	stackbox_spec_graph.prototype.set_frame = function(name, frame) {
		if(frame === undefined)
			delete this.frames[name];
		else
			this.frames[name] = frame;
	};
	return stackbox_spec_graph;
})();

/***********************************DFAN***********************************************/
/*Deterministic Finite Automation Network*/

/* perf_importance: most */
var stackbox_dfan_hook = (function() {
	var g_fid = 1;
	var default_results = function(rslt_list) {return rslt_list[0];};
	function stackbox_dfan_hook() {
		this.func_list = {};
		this.results = default_results;
	}
	stackbox_dfan_hook.prototype.invoke_args = function(args) {
		var rs = [];
		//for(var k in this.func_list) {
		for(var ki = 0, kl = Object.keys(this.func_list), k;
			k = kl[ki], ki < kl.length; ki++) {
			var r = this.func_list[k].apply(this, args);
			if(r !== undefined)
				rs.push(r);
		}
		if(rs.length > 0)
			return this.results(rs);
	};
	stackbox_dfan_hook.prototype.invoke = function() {
		return this.invoke_args(arguments);
	};
	stackbox_dfan_hook.prototype.add = function(func) {
		this.func_list[g_fid] = func;
		return g_fid++;
	};
	stackbox_dfan_hook.prototype.remove = function(fid) {
		if(/*!in*/this.func_list[fid] === undefined) return false;
		return (delete this.func_list[fid]);
	};
	return stackbox_dfan_hook;
})();

/* perf_importance: most */
var stackbox_dfan_hooks = (function() {
	function stackbox_dfan_hooks() {
		this.hooks = {};
	}
	stackbox_dfan_hooks.prototype.invoke = function(hk) {
		if(/*!hasOwnProperty*/this.hooks[hk] === undefined) return;
		var args = Array.prototype.slice.call(arguments, 1);
		return this.hooks[hk].invoke_args(args);
	};
	stackbox_dfan_hooks.prototype.add = function(hk, func) {
		if(/*!hasOwnProperty*/this.hooks[hk] === undefined)
			this.hooks[hk] = new stackbox_dfan_hook();
		var fid = this.hooks[hk].add(func);
		return hk + ':' + fid;
	};
	stackbox_dfan_hooks.prototype.remove = function(hid) {
		var ids = hid.split(':');
		var hk = ids[0];
		var fid = ids[1];
		if(/*!hasOwnProperty*/this.hooks[hk] === undefined) return false;
		return this.hooks[hk].remove(fid);
	};
	stackbox_dfan_hooks.prototype.results_handle = function(hk, func) {
		if(/*!hasOwnProperty*/this.hooks[hk] === undefined) return;
		if(func !== undefined) 
			this.hooks[hk].results = func;
		return this.hooks[hk].results;
	};
	return stackbox_dfan_hooks;
})();

/* perf_importance: most */
var stackbox_dfan_lock_simple = (function() {
	function stackbox_dfan_lock_simple() {}
	stackbox_dfan_lock_simple.prototype.lock = function(hk) {
		this._lock = true;
	};
	stackbox_dfan_lock_simple.prototype.unlock = function(hk) {
		this._lock = false;
	};
	stackbox_dfan_lock_simple.prototype.enable = function() {
		this._disable = false;
	};
	stackbox_dfan_lock_simple.prototype.disable = function() {
		this._disable = true;
	};
	stackbox_dfan_lock_simple.prototype.bypass = function(n) {
		if(!(n >= 0)) n = 0;
		this._bypass = n;
	};
	stackbox_dfan_lock_simple.prototype.check = function(hk) {
		return (!!this._lock) && (!this._disable) 
			&& ((!this._bypass) || (!this._bypass--));
	};
	return stackbox_dfan_lock_simple;
})();

var stackbox_dfan_property = (function() {
	var HK_GET = 'get';
	var HK_SET = 'set';
	var HK_CHANGE = 'change';
	var default_eq = function(a, b) {
		return a == b;
	};
	function stackbox_dfan_property(val) {
		if(val === undefined) val = null;
		this._value = val;
		this._hooks = new stackbox_dfan_hooks();
		this._hooks_lock = new stackbox_dfan_lock_simple();
		this.__eq__ = default_eq;
	}
	/* perf_importance: most */
	stackbox_dfan_property.prototype.get = function() {
		var val = this._value;
		if(!this._hooks_lock.check(HK_GET)) {
			this._hooks_lock.lock(HK_GET);
			var r = this._hooks.invoke(HK_GET, r, this);
			if(r !== undefined)
				val = r;
			this._hooks_lock.unlock(HK_GET);
		}
		return val;
	};
	/* perf_importance: most */
	stackbox_dfan_property.prototype.set = function(val) {
		if(!this._hooks_lock.check(HK_SET)) {
			this._hooks_lock.lock(HK_SET);
			var r = this._hooks.invoke(HK_SET, val, this._value, this);
			if(r !== undefined)
				val = r;
			this._hooks_lock.unlock(HK_SET);
		}
		if(!this._hooks_lock.check(HK_CHANGE)) {
			if(!this.__eq__(this._value, val)) {
				this._hooks_lock.lock(HK_CHANGE);
				var r = this._hooks.invoke(HK_CHANGE, val, this._value, this);
				if(r !== undefined)
					val = r;
				this._hooks_lock.unlock(HK_CHANGE);
			}
		}
		this._value = val;
		return val;
	};
	/* perf_importance: much */
	stackbox_dfan_property.prototype.hook = function(hk, func) {
		return this._hooks.add(hk, func);
	};
	/* perf_importance: most */
	stackbox_dfan_property.prototype.results_handle = function(hk, func) {
		return this._hooks.results_handle(hk, func);
	};
	stackbox_dfan_property.prototype.dishook = function(hid) {
		return this._hooks.remove(hid);
	};
	/* perf_importance: much */
	stackbox_dfan_property.prototype.islocked = function(hk) {
		return this._hooks_lock.check(hk);
	};
	stackbox_dfan_property.prototype.lock_turn = function(tn) {
		if(tn)
			this._hooks_lock.enable();
		else
			this._hooks_lock.disable();
	};
	stackbox_dfan_property.prototype.lock_bypass = function(n) {
		if(n === undefined) n = 1;
		this._hooks_lock.bypass(n);
	};
	stackbox_dfan_property.prototype.lock_bypass_safedone = function() {
		this._hooks_lock.bypass(0);
	};
	return stackbox_dfan_property;
})();

var stackbox_dfan_automaton = (function() {
	var HK_GET = 'get';
	var HK_SET = 'set';
	var HK_CHANGE = 'change';
	var SYM_TRIG = '*';
	var SYM_TRIG_SPLIT = ':';
	var SYM_IMPT = '@';
	var SYM_EXPT = '#';
	var SYM_BYPS = '%';
	function stackbox_dfan_automaton() {
		this._props_info = {};
		this._state = null;
	}
	stackbox_dfan_automaton.prototype.handled_trigger = [
		//HK_GET, HK_SET, HK_CHANGE
		HK_CHANGE
	];
	/* perf_importance: most */
	stackbox_dfan_automaton.prototype._prop_handler = function(name, trigger) {
		if(/*!in*/this._props_info[name].triggers[this._state] === undefined
			|| /*!in*/this._props_info[name].triggers[this._state][trigger] === undefined) return;
		var args = Array.prototype.slice.call(arguments, 2);
		var info = {
			'name': name,
			'trigger': trigger,
		}
		switch(trigger) {
			case HK_GET:
				info['val'] = args[0];
				info['prop'] = args[1];
				break;
			case HK_SET:
			case HK_CHANGE:
				info['val'] = args[0];
				info['old_val'] = args[1];
				info['prop'] = args[2];
				break;
			default:
				info['args'] = args;
				break;
		}
		var _ts = this._props_info[name].triggers[this._state][trigger];
		if(_ts) {
			var r = null;
			for(var i = 0; i < _ts.length; i++) {
				r = _ts[i].call(this, info);
				if(r === null)
					break;
			}
			return r;
		}
	};
	/* perf_importance: most */
	stackbox_dfan_automaton.prototype._exec_state = function(info, state) {
		var name = info.name;
		var trigger = info.trigger;
		if(/*!in*/this._props_info[name].triggers[state] === undefined
			|| /*!in*/this._props_info[name].triggers[state][trigger] === undefined) return;
		var _ts = this._props_info[name].triggers[state][trigger];
		if(_ts) {
			var r = null;
			for(var i = 0; i < _ts.length; i++) {
				r = _ts[i].call(this, info);
				if(r === null)
					break;
			}
			return r;
		}
	};
	/* perf_importance: much n */
	stackbox_dfan_automaton.prototype._set_triggers = function(sta, trigs, func) {
		//console.log('set_triggers', sta, trigs, func);
		for(var i = 0; i < trigs.length; i++) {
			var prop_trig = trigs[i];
			var prop = prop_trig;
			var hndl_trig = this.handled_trigger;
			if(prop_trig[0] == SYM_TRIG) {
				var _splt = prop_trig.slice(1).split(SYM_TRIG_SPLIT);
				var prop = _splt[0];
				var trig = _splt[1];
				var _info = this._props_info[prop];
				if(/*in*/_info.handled_triggers !== undefined)
					hndl_trig = _info.handled_triggers;
				if(hndl_trig.indexOf(trig) < 0) continue;
				if(/*!in*/_info.triggers[sta] === undefined)
					_info.triggers[sta] = {};
				if(/*!in*/_info.triggers[sta][trig] === undefined)
					_info.triggers[sta][trig] = [];
				_info.triggers[sta][trig].push(func);
			} else {
				var _info = this._props_info[prop];
				if(/*in*/_info.handled_triggers !== undefined)
					hndl_trig = _info.handled_triggers;
				if(/*!in*/_info.triggers[sta] === undefined)
					_info.triggers[sta] = {};
				for(var j = 0; j < hndl_trig.length; j++) {
					var _tg = hndl_trig[j];
					if(/*!in*/_info.triggers[sta][_tg] === undefined)
						_info.triggers[sta][_tg] = [];
					_info.triggers[sta][_tg].push(func);
				}
			}
		}
	};
	/* perf_importance: much n */
	stackbox_dfan_automaton.prototype._flood_trig = function(rec, src, ext) {
		var _trigs_flags = {};
		var _set_flags = (function(tidx) {
			var _trigs = rec.trig[tidx][0];
			for(var i = 0; i < _trigs.length; i++) {
				var prop_trig = _trigs[i];
				if(prop_trig[0] == SYM_TRIG) {
					_trigs_flags[prop_trig] = tidx;
				} else {
					var _info = this._props_info[prop_trig];
					var hndl_trig = this.handled_trigger;
					if(/*in*/_info.handled_triggers !== undefined)
						hndl_trig = _info.handled_triggers;
					for(var j = 0; j < hndl_trig.length; j++) {
						var _pt = SYM_TRIG + prop_trig + SYM_TRIG_SPLIT + hndl_trig[j];
						_trigs_flags[_pt] = tidx;
					}
				}
			}
		}).bind(this);
		var _get_results = (function() {
			var _rvrs = {};
			//for(var tg in _trigs_flags) {
			for(var tgi = 0, tgl = Object.keys(_trigs_flags), tg;
				tg = tgl[tgi], tgi < tgl.length; tgi++) {
				var _tidx = _trigs_flags[tg];
				if(/*!in*/_rvrs[_tidx] === undefined)
					_rvrs[_tidx] = [];
				_rvrs[_tidx].push(tg);
			}
			var _rslt = [];
			//for(var _tidx in _rvrs) {
			for(var ii = 0, il = Object.keys(_rvrs), _tidx;
				_tidx = il[ii], ii < il.length; ii++) {
				//console.log(_rvrs[_tidx],  rec.trig[_tidx][1]);
				this._record_trig(rec, _rvrs[_tidx],  rec.trig[_tidx][1]);
				_rslt.push(rec.tidx);
			}
			return _rslt;
		}).bind(this);
		if(src instanceof Array) {
			for(var i = 0; i < src.length; i++) {
				_set_flags(src[i]);
			}
		} else {
			_set_flags(src);
		}
		_set_flags(ext[0]);
		for(var i = 3; i < ext.length; i++) {
			_set_flags(ext[i]);
		}
		//console.log(_trigs_flags);
		return _get_results();
	};
	/* perf_importance: much n */
	stackbox_dfan_automaton.prototype._parse_prio = function(s) {
		//var re_p = /^(\w+)(\$(\$)?(\d*)(\$)?)?$/.exec(s);
		//var re_p = /^(\w+)(?=.*?(?:\$(i)?(n)?(\d+)?)?)(?=.*?(?:\$t(t)?)?)$/.exec(s);
		//var re_p = /^(\w+)(\$(m)?(n)?([1-9]\d*)?(\$(h)?)?)?$/.exec(s);
		/*
		$[a/m][n][num]: [modify]/append [+]/- [1]/num prios
			append should be without num  n: [after]/before
		$t[h]: term [tail]/head
		$v[comment]: comment
		$f: flood mode
		*/
		var re_p = /^\w+(?=(?:.*?(\$([a|m])(n)?([1-9]\d*)?))?)(?=(?:.*?(\$t(h)?))?)(?=(?:.*?(\$v(\w+)))?)(?=(?:.*?(\$f))?)/.exec(s);
		var prio = 1;
		var modify = true;
		var term = 0;
		var comm = null;
		var flood = false;
		if(re_p) {
			var rs = re_p[0];
			if(re_p[1]) {
				if(re_p[2] == 'a')
					modify = false;
				if(re_p[4])
					//prio = parseInt(re_p[4]);
					prio = +re_p[4];
				if(re_p[3])
					prio = - prio;
			}
			if(re_p[5])
				term = re_p[6]?-1:1;
			if(re_p[7])
				comm = re_p[8];
			if(re_p[9])
				flood = true;
		} else {
			throw 'unknown statename ext.';
		}
		return [rs, prio, modify, term, flood, comm];
	};
	/* perf_importance: much n */
	stackbox_dfan_automaton.prototype._key_level = function(key) {
		if(/*!in*/this[key] === undefined) return -1;
		var r = this;
		var lvl = 0;
		while(r != Object.prototype) {
			if(r.hasOwnProperty(key)) break;
			lvl ++;
			r = r.__proto__;
		}
		return lvl;
	};
	/* perf_importance: much n */
	stackbox_dfan_automaton.prototype.default_trigger = function() {
		return Object.keys(this._props_info);
	};
	/* perf_importance: much n */
	stackbox_dfan_automaton.prototype._record_trig = function(rec, trig, func) {
		if(trig === undefined)
			trig = this.default_trigger();
		rec.tidx = rec.trig.length;
		rec.trig.push([trig, func]);
	};
	/* perf_importance: much n */
	stackbox_dfan_automaton.prototype._record_cond = function(rec, state, lvl, prio, modi, term, floo, tidx) {
		if(tidx === undefined) tidx = rec.tidx;
		var t = rec.cond;
		if(/*!in*/t[state] === undefined) t[state] = {};
		t = t[state];
		if(/*!in*/t[lvl] === undefined) t[lvl] = {};
		t = t[lvl];
		if(/*!in*/t[modi] === undefined) t[modi] = {};
		t = t[modi];
		if(t[prio]) {
			if(floo) {
				if(!t[prio][2]) throw 'flood mixed.';
				t[prio].push(tidx);
			} else {
				throw 'overwrite state: ' + state + '.';
			}
		} else {
			t[prio] = [tidx, term, floo];
		}
	};
	/* perf_importance: much n */
	stackbox_dfan_automaton.prototype._record_cond_ex = function(rec, state) {
		if(/*!in*/rec.cond_ex[state] === undefined) rec.cond_ex[state] = {};
		rec.cond_ex[state][rec.tidx] = true;
	};
	/* perf_importance: much n */
	stackbox_dfan_automaton.prototype._record_cond_all = function(rec, lvl, prio, modi, term, floo) {
		rec.cond_all.push([rec.tidx, lvl, prio, modi, term, floo]);
	};
	/* perf_importance: much */
	stackbox_dfan_automaton.prototype._imp_record_ex = function(rec) {
		if(!rec.cond_all.length) return;
		for(var i = 0; i < rec.cond_all.length; i++) {
			var c_t = rec.cond_all[i];
			var c_i = c_t[0];
			//for(var st in rec.cond) {
			for(var sti = 0, stl = Object.keys(rec.cond), st;
				st = stl[sti], sti < stl.length; sti++) {
				/* state named "__xxxx" exclude with cond all */
				if(st.length > 2 && st[0] == '_' && st[1] == '_')
					continue;
				if(/*!in*/rec.cond_ex[st] === undefined 
					|| rec.cond_ex[st][c_i] === undefined) {
					this._record_cond(rec, st, c_t[1], c_t[2], c_t[3], c_t[4], c_t[5], c_i);
				}
			}
		}
	};
	/* perf_importance: much */
	stackbox_dfan_automaton.prototype._impl_record = function(rec) {
		this._imp_record_ex(rec);
		//for(var st in rec.cond) {
		for(var sti = 0, stl = Object.keys(rec.cond), st;
			st = stl[sti], sti < stl.length; sti++) {
			var rc_st = rec.cond[st];
			var lvl_ks = Object.keys(rc_st).sort(function(a, b){return b - a});
			var r_stack = [];
			for(var i = 0; i < lvl_ks.length; i++) {
				//var lvl = parseInt(lvl_ks[i]);
				var lvl = +lvl_ks[i];
				var rc_lvl = rc_st[lvl];
				var modi_ks = Object.keys(rc_lvl).sort(function(a, b){return b - a});
				for(var j = 0; j < modi_ks.length; j++) {
					var modi = (modi_ks[j] == 'true');
					var rc_modi = rc_lvl[modi];
					var prio_ks = Object.keys(rc_modi).sort(function(a, b){return a - b});
					for(var k = 0; k < prio_ks.length; k++) {
						//if(k && prio_ks[k] == prio_ks[k-1]) throw 'overwrite state.';
						//var prio = parseInt(prio_ks[k]);
						var prio = +prio_ks[k];
						var rc_prio = rc_modi[prio];
						var term = rc_prio[1];
						var floo = rc_prio[2];
						var tidx = rc_prio[0];
						var stack_idx;
						if(r_stack.length == 0) {
							if(prio != 1) throw 'invalid prio.';
							modi = false;
						}
						if(modi) {
							if(prio > 0)
								stack_idx = r_stack.length - prio;
							else
								stack_idx = - 1 - prio;
							if(stack_idx < 0 || stack_idx >= r_stack.length)
								throw 'invalid prio.';
							if(floo) {
								r_stack[stack_idx] = this._flood_trig(rec, r_stack[stack_idx], rc_prio);
							} else {
								r_stack[stack_idx] = tidx;
							}
						} else {
							if(floo && rc_prio.length > 3) {
								tidx = this._flood_trig(rec, [], rc_prio);
							}
							if(prio > 0) {
								r_stack.push(tidx);
								stack_idx = r_stack.length - 1;
							} else {
								r_stack.unshift(tidx);
								stack_idx = 0;
							}
						}
						if(term > 0) {
							r_stack.splice(stack_idx + 1, 0, '>');
						} else if(term < 0) {
							r_stack.splice(stack_idx, 0, '<');
						}
					}
				}
				var _tailpos = r_stack.indexOf('>');
				_tailpos = _tailpos < 0 ? undefined : _tailpos;
				r_stack = r_stack.slice(r_stack.lastIndexOf('<') + 1, _tailpos);
			}
			for(var i = 0; i < r_stack.length; i++) {
				var _rsi = r_stack[i]
				if(_rsi instanceof Array) {
					for(var j = 0; j < _rsi.length; j++) {
						var c_t = rec.trig[_rsi[j]];
						this._set_triggers(st, c_t[0], c_t[1]);
					}
				} else {
					var c_t = rec.trig[_rsi];
					this._set_triggers(st, c_t[0], c_t[1]);
				}
			}
		}
	};
	/* perf_importance: much */
	stackbox_dfan_automaton.prototype._init_triggers = function() {
		var _rec = {
			'trig': [],
			'tidx': 0,
			'cond': {},
			'cond_ex': {},
			'cond_all': [],
		};
		for(var key in this) {
		//for(var keyi = 0, keyl = Object.keys(this), key;
		//	key = keyl[keyi], keyi < keyl.length; keyi++) {
			if(key.slice(0, 6) == 'state_') {
				var sta_lvl = this._key_level(key) * 2 + 1;
				var sta_name = key.slice(6);
				var sta_func = this[key];
				var sta_trig = this['statrig_' + sta_name];
				var _prio = this._parse_prio(sta_name);
				var sta_state = _prio[0];
				var sta_prio = _prio[1];
				var sta_modi = _prio[2];
				var sta_term = _prio[3];
				var sta_floo = _prio[4];
				this._record_trig(_rec, sta_trig, sta_func);
				this._record_cond(_rec, sta_state, sta_lvl, sta_prio, sta_modi, sta_term, sta_floo);
			} else if(key.slice(0, 10) == 'interrupt_') {
				var int_lvl = this._key_level(key) * 2;
				var int_cmds = key.slice(10).split('_');
				var int_name = int_cmds[0];
				var int_func = this[key];
				var int_trig = this['inttrig_' + int_name];
				var _prio = this._parse_prio(int_name);
				var int_prio = _prio[1];
				var int_modi = _prio[2];
				var int_term = _prio[3];
				var int_floo = true; //_prio[4];
				var sta_no_set = true;
				var sta_ex_name = [];
				this._record_trig(_rec, int_trig, int_func);
				for(var i = 1; i < int_cmds.length; i++) {
					var cmd = int_cmds[i].split('$');
					switch(cmd[0]) {
						case 'st':
							for(var j = 1; j < cmd.length; j++) {
								this._record_cond(_rec, cmd[j], int_lvl, int_prio, int_modi, int_term, int_floo);
							}
							sta_no_set = false;
							break;
						case 'ex':
							for(var j = 1; j < cmd.length; j++) {
								sta_ex_name.push(cmd[j]);
								this._record_cond_ex(_rec, cmd[j]);
							}
							break;
						default:
							continue;
					}
				}
				if(sta_no_set) {
					this._record_cond_all(_rec, int_lvl, int_prio, int_modi, int_term, int_floo);
				}
			}
		}
		this._impl_record(_rec);
	};
	/* perf_importance: most */
	stackbox_dfan_automaton.prototype.goto_state = function(state) {
		if(this._state === null)
			this._init_triggers();
		this._state = state;
		//console.log('goto', state);
	};
	/* perf_importance: most */
	stackbox_dfan_automaton.prototype.jump_state = function(info, state) {
		this.goto_state(state);
		this._exec_state(info, state);
	};
	/* perf_importance: most */
	stackbox_dfan_automaton.prototype.from_state = function(state) {
		return this._state == state;
	};
	/* perf_importance: more */
	stackbox_dfan_automaton.prototype.prop_islocked = function(name, trig) {
		return this._props_info[name].prop.islocked(trig);
	};
	/* perf_importance: more */
	stackbox_dfan_automaton.prototype.prop_lock_bypass = function(name, n) {
		return this._props_info[name].prop.lock_bypass(n);
	};
	/* perf_importance: more */
	stackbox_dfan_automaton.prototype.prop_lock_bypass_safedone = function(name) {
		return this._props_info[name].prop.lock_bypass_safedone();
	};
	/* perf_importance: more */
	stackbox_dfan_automaton.prototype.prop_exist = function(name) {
		return !(this._props_info[name] === undefined);
	};
	/* perf_importance: more */
	stackbox_dfan_automaton.prototype.prop_get = function(name) {
		if(name[0] == SYM_BYPS) return this._props_info[name].prop;
		return this._props_info[name].prop.get();
	};
	/* perf_importance: more */
	stackbox_dfan_automaton.prototype.prop_set = function(name, val) {
		if(name[0] == SYM_IMPT) return; //Read only property (import from extra)
		if(name[0] == SYM_BYPS) return (this._props_info[name].prop = val);
		return this._props_info[name].prop.set(val);
	};
	/* perf_importance: more */
	stackbox_dfan_automaton.prototype.prop_input = function(name, val) {
		if(name[0] != SYM_IMPT) return;
		return this._props_info[name].prop.set(val);
	};
	/* perf_importance: much */
	stackbox_dfan_automaton.prototype.bind_prop = function(name, prop, hndl_trig) {
		if(/*in*/this._props_info[name] !== undefined) this.remove_prop(name);
		var prop_info = {
			'prop': prop,
			'hids': {},
			'triggers': {},
		};
		if(hndl_trig) {
			prop_info.handled_triggers = hndl_trig;
		} else {
			hndl_trig = this.handled_trigger;
		}
		if(name[0] != SYM_BYPS) {
			for(var i = 0; i < hndl_trig.length; i++) {
				var hk = hndl_trig[i];
				var hid = prop.hook(hk, this._prop_handler.bind(this, name, hk));
				prop_info.hids[hk] = hid;
			}
		}
		this._props_info[name] = prop_info;
	};
	stackbox_dfan_automaton.prototype.remove_prop = function(name) {
		if(/*!in*/this._props_info[name] === undefined) return false;
		if(name[0] != SYM_BYPS) {
			var prop_info = this._props_info[name];
			var hndl_trig = this.handled_trigger;
			if(/*in*/prop_info.handled_triggers !== undefined) hndl_trig = prop_info.handled_triggers;
			for(var i = 0; i < hndl_trig.length; i++) {
				var hk = hndl_trig[i];
				prop_info.prop.dishook(prop_info.hids[hk]);
			}
		}
		return (delete this._props_info[name]);
	};
	/* perf_importance: more */
	stackbox_dfan_automaton.prototype.export_prop = function(name) {
		if(name[0] != SYM_EXPT) return;
		return this._props_info[name].prop;
	};
	stackbox_dfan_automaton.prototype.list_props = function(own) {
		var r = [];
		//for(var k in this._props_info) {
		for(var ki = 0, kl = Object.keys(this._props_info), k;
			k = kl[ki], ki < kl.length; ki++) {
			if(own) {
				if(k[0] != SYM_IMPT) r.push(k);
			} else {
				r.push(k);
			}
		}
		return r;
	};
	/* perf_importance: much */
	stackbox_dfan_automaton.prototype.check_props = function(need_list) {
		for(var i = 0; i < need_list.length; i++) {
			if(/*!in*/this._props_info[need_list[i]] === undefined)
				throw 'properties unbind';
		}
		return true;
	};
	stackbox_dfan_automaton.prototype.free_props = function() {
		//for(var key in this._props_info) {
		for(var ii = 0, il = Object.keys(this._props_info), key;
			key = il[ii], ii < il.length; ii++) {
			this.remove_prop(key);
		}
	};
	return stackbox_dfan_automaton;
})();

var stackbox_dfan_automaton_multithread = (function(_super) {
	__extends(stackbox_dfan_automaton_multithread, _super);
	function stackbox_dfan_automaton_multithread() {
		_super.call(this);
		this._last_tid = 1;
		this._cur_tid = null;
		this._thread_state = {};
		this._thread_local = {};
	}
	stackbox_dfan_automaton_multithread.prototype.new_thread = function(state, tid) {
		if(!state)
			state = null;
		if(tid === undefined) {
			tid = this._last_tid++;
		} else {
			if(this._thread_state[tid] !== undefined)
				throw 'tid used.';
			if(this._last_tid < tid + 1)
				this._last_tid = tid + 1;
		}
		this._thread_state[tid] = state;
		this._thread_local[tid] = {};
		if(this._cur_tid === null)
			this._cur_tid = tid;
		console.log('new_thread', tid);
		return tid;
	};
	stackbox_dfan_automaton_multithread.prototype.exist_thread = function(tid) {
		return this._thread_state[tid] !== undefined;
	};
	stackbox_dfan_automaton_multithread.prototype.current_thread = function() {
		return this._cur_tid;
	};
	stackbox_dfan_automaton_multithread.prototype.threads_count = function() {
		return Object.keys(this._thread_state).length;
	};
	stackbox_dfan_automaton_multithread.prototype.del_thread = function(tid) {
		if(!this.exist_thread(tid)) return false;
		if(tid == this._cur_tid) this._cur_tid = null;
		console.log('del_thread', tid);
		return (delete this._thread_state[tid]) && (delete this._thread_local[tid]);
	};
	stackbox_dfan_automaton_multithread.prototype.done_thread = function() {
		this.del_thread(this._cur_tid);
	};
	stackbox_dfan_automaton_multithread.prototype.switch_thread = function(info, tid) {
		if(tid === undefined)
			tid = this._cur_tid;
		else
			this._cur_tid = tid;
		var thread_state = this._thread_state[tid];
		if(thread_state === undefined) return;
		return this._exec_state(info, thread_state);
	};
	stackbox_dfan_automaton_multithread.prototype.local_get = function(name) {
		return this._thread_local[this._cur_tid][name];
	};
	stackbox_dfan_automaton_multithread.prototype.local_set = function(name, val) {
		this._thread_local[this._cur_tid][name] = val;
	};
	stackbox_dfan_automaton_multithread.prototype.root_state = function(state) {
		if(this._state === null)
			this._init_triggers();
		if(state === undefined)
			state = '__mt_root__'
		this._state = state;
	};
	stackbox_dfan_automaton_multithread.prototype.goto_state = function(state) {
		if(this._state === null) {
			this.root_state();
			if(this._cur_tid === null)
				this.new_thread();
		}
		if(this._cur_tid === null)
			/* no thread to goto, do nothing */
			return;
		if(this._thread_state[this._cur_tid] === undefined)
			/* current thread is done, do nothing */
			return;
		this._thread_state[this._cur_tid] = state;
		//console.log('goto', state);
	};
	stackbox_dfan_automaton_multithread.prototype.jump_state = function(info, state) {
		this.goto_state(state);
		this._exec_state(info, state);
	};
	stackbox_dfan_automaton_multithread.prototype.from_state = function(state) {
		return this._thread_state[this._cur_tid] == state;
	};
	/* perf_importance: more */
	stackbox_dfan_automaton_multithread.prototype.prop_get = function(name) {
		var tid = this._cur_tid;
		var r = _super.prototype.prop_get.call(this, name);
		this._cur_tid = tid;
		return r;
	};
	/* perf_importance: more */
	stackbox_dfan_automaton_multithread.prototype.prop_set = function(name, val) {
		var tid = this._cur_tid;
		var r = _super.prototype.prop_set.call(this, name, val);
		this._cur_tid = tid;
		return r;
	};
	/* perf_importance: more */
	stackbox_dfan_automaton_multithread.prototype.prop_input = function(name, val) {
		var tid = this._cur_tid;
		var r = _super.prototype.prop_input.call(this, name, val);
		this._cur_tid = tid;
		return r;
	};
	stackbox_dfan_automaton_multithread.prototype.state___mt_root__ = function(info) {
		this.switch_thread(info);
	};
	return stackbox_dfan_automaton_multithread;
})(stackbox_dfan_automaton);

/***********************************SPECS**********************************************/

var stackbox_spec_prop = stackbox_dfan_property;

var stackbox_spec_prop_eqtp = (function(_super) {
	__extends(stackbox_spec_prop_eqtp, _super);
	var HK_SET = 'set';
	var HK_CHANGE = 'change';
	var pos_eq = function(a, b) {
		return a === b || a.eq(b);
	};
	function stackbox_spec_prop_eqtp(val) {
		_super.call(this, val);
		this.__eq__ = pos_eq;
	}
	stackbox_spec_prop_eqtp.prototype.set_elem = function(val, elems) {
		var _t = this._value;
		var _ve = [];
		for(var i = 1; i < arguments.length - 1; i++) {
			_t = _t[arguments[i]];
			_ve.push(arguments[i]);
		}
		var _k = arguments[i];
		var _v = _t[_k];
		_ve.push(_k);
		_ve.unshift(_v);
		if(!this._hooks_lock.check(HK_SET)) {
			this._hooks_lock.lock(HK_SET);
			var r = this._hooks.invoke(HK_SET, val, _ve, this);
			if(r !== undefined)
				val = r;
			this._hooks_lock.unlock(HK_SET);
		}
		if(!this._hooks_lock.check(HK_CHANGE)) {
			if(_v != val) {
				this._hooks_lock.lock(HK_CHANGE);
				var r = this._hooks.invoke(HK_CHANGE, val, _ve, this);
				if(r !== undefined)
					val = r;
				this._hooks_lock.unlock(HK_CHANGE);
			}
		}
		_t[_k] = val;
		return val;
	};
	return stackbox_spec_prop_eqtp;
})(stackbox_dfan_property);

var stackbox_spec_prop_pos = stackbox_spec_prop_eqtp;
var stackbox_spec_prop_trans = stackbox_spec_prop_eqtp;

var stackbox_spec_prop_range = (function(_super) {
	__extends(stackbox_spec_prop_range, _super);
	var HK_MOVE = 'rng_move';
	var HK_TRANS = 'rng_trans';
	var HK_COLLISION = 'rng_collision';
	function stackbox_spec_prop_range(val, collection) {
		_super.call(this, val);
		this._collection = collection;
	}
	stackbox_spec_prop_range.prototype.set_range = function() {
		argv = stackbox_util.parse_argv(arguments, {
			"pos": ["pos"],
			"range": ["top", "bot"],
		});
		var changed = false;
		switch(argv.patt) {
			case 'pos':
				if(!argv.pos.eq(this._value.top)) {
					this._value.move_to(argv.pos);
					changed = true;
				}
				break;
			case 'range':
				if(!argv.top.eq(this._value.top)) {
					this._value.top = argv.top;
					changed = true;
				}
				if(!argv.bot.eq(this._value.bot)) {
					this._value.bot = argv.bot;
					changed = true;
				}
				break;
			default:
				throw 'args error';
		}
		if(changed) {
			this.check_collision();
		}
	};
	stackbox_spec_prop_range.prototype.check_collision = function() {
		for(var cid in this._collection.vals) {
			var t_rng = this._collection.vals[cid];
			if(this._value.collision_with(t_rng)) {
				this._hooks_lock.lock(HK_COLLISION);
				var r = this._hooks.invoke(HK_COLLISION, t_rng, this._value, this);
				this._hooks_lock.unlock(HK_COLLISION);
			}
		}
	};
	return stackbox_spec_prop_range;
})(stackbox_dfan_property);

/*************************************************************************************/

var stackbox_spec_actions = (function(_super) {
	__extends(stackbox_spec_actions, _super);
	var need_prop = [
		'#action',
		'#done',
		'%aniframe',
		'%duration',
		'@tick',
	];
	function stackbox_spec_actions() {
		_super.call(this);
		this.act_info = {};
	}
	stackbox_spec_actions.prototype.init = function() {
		if(!this.actions_check()) throw 'action uninited';
		this.bind_prop('#action', new stackbox_spec_prop('__none__'));
		this.bind_prop('#done', new stackbox_spec_prop(false));
		this.bind_prop('%aniframe', 0);
		this.bind_prop('%duration', 0);
		this.check_props(need_prop);
		this.goto_state('idle');
		//this.state_idle();
	};
	stackbox_spec_actions.prototype.actions_check = function() {
		/*
		{
			act_name: [
				{
					'frame': stackbox_graph_frame,
					'duration': number,
					(last)'loop': boolean,
				},
				...
			],
			...
		}
		*/
		if(!(this.act_info instanceof Object)) return false;
		for(var k in this.act_info) {
			var act = this.act_info[k];
			if(!(act instanceof Array)) return false;
			for(var i = 0; i < act.length; i++) {
				var fi = act[i];
				if(!(fi instanceof Object)) return false;
				//if(!(fi.frame instanceof stackbox_graph_frame)) return false;
				if(!(typeof(fi.duration) == 'number')) return false;
				if(i == act.length - 1) {
					if(!(typeof(fi.loop) == 'boolean')) return false;
				}
			}
		}
		return true;
	};
	stackbox_spec_actions.prototype.append_action = function(name, loop) {
		var frm_q = Array.prototype.slice.call(arguments, 2);
	};
	stackbox_spec_actions.prototype.set_frame = function(name, cnt) {
		console.log('set', name, cnt);
	};
	stackbox_spec_actions.prototype.statrig_idle = ['@tick'];
	stackbox_spec_actions.prototype.state_idle = function(info) {
		this.prop_set('#action', 'idle');
	};
	stackbox_spec_actions.prototype.inttrig_actset = ['#action'];
	stackbox_spec_actions.prototype.interrupt_actset = function(info) {
		this.prop_set('%aniframe', 0);
		this.prop_set('%duration', 0);
		this.set_frame(info.val, 0);
		this.goto_state('action');
	};
	stackbox_spec_actions.prototype.statrig_action = ['@tick'];
	stackbox_spec_actions.prototype.state_action = function(info) {
		var delt = info.val - info.old_val;
		if(delt < 0) throw 'tick down';
		var af = this.prop_get('%aniframe');
		var dur = this.prop_get('%duration') + delt;
		var act = this.act_info[this.prop_get('#action')];
		var fi = act[af];
		if(dur >= fi.duration) {
			this.prop_set('%duration', dur - fi.duration);
			if(af >= act.length - 1) {
				if(fi.loop) {
					this.prop_set('%aniframe', 0);
				} else {
					this.prop_set('#done', true);
					this.goto_state('idle');
					return;
				}
			} else {
				this.prop_set('%aniframe', af + 1);
			}
			this.set_frame(this.prop_get('#action'), this.prop_get('%aniframe'));
		} else {
			this.prop_set('%duration', dur);
		}
		this.goto_state('action');
	};
	return stackbox_spec_actions;
})(stackbox_dfan_automaton);

var stackbox_spec_graph = (function(_super) {
	__extends(stackbox_spec_graph, _super);
	var need_prop = [
		'@pos',
		'#trans',
		'%dirty',
	];
	function stackbox_spec_graph(sprite, box, layer) {
		_super.call(this);
		this.box = box;
		this.sprite = sprite;
		this.layer = layer;
	}
	stackbox_spec_graph.prototype.init = function() {
		this.bind_prop('#trans', new stackbox_spec_prop_trans(null));
		this.bind_prop('%dirty', true);
		this.check_props(need_prop);
		_super.prototype.init.call(this);
	};
	stackbox_spec_graph.prototype.set_frame = function(name, cnt) {
		//console.log('set', name, cnt);
		this.frame =  this.sprite.frame(name, cnt);
		this.prop_set('%dirty', true);
	};
	stackbox_spec_graph.prototype.inttrig_move = ['@pos', '#trans'];
	stackbox_spec_graph.prototype.interrupt_move = function(info) {
		this.prop_set('%dirty', true);
	};
	stackbox_spec_graph.prototype.inttrig_updatedraw$a = ['@tick'];
	stackbox_spec_graph.prototype.interrupt_updatedraw$a = function(info) {
		if(this.prop_get('%dirty')) {
			if(this._last_drawinfo)
				this.box.clear(this._last_drawinfo);
			this._last_drawinfo = this.box.draw(
				this.frame, this.prop_get('@pos'), this.layer);
			this.prop_set('%dirty', false);
		}
	};
	return stackbox_spec_graph;
})(stackbox_spec_actions);

var stackbox_spec_bone = (function(_super) {
	__extends(stackbox_spec_bone, _super);
	var need_prop = [
		'#rad',
	];
	function stackbox_spec_bone() {
		_super.call(this);
	}
	return stackbox_spec_bone;
})(stackbox_dfan_automaton);

var stackbox_spec_bone_node = (function(_super) {
	__extends(stackbox_spec_bone_node, _super);
	var need_prop = [
		'#pos',
	];
	function stackbox_spec_bone_node() {
		_super.call(this);
	}
	return stackbox_spec_bone_node;
})(stackbox_dfan_automaton);

/*************************************************************************************/

var stackbox_spec_prop_controller = (function(_super) {
	__extends(stackbox_spec_prop_controller, _super);
	var ctrl_eq = function(a, b) {
		return a[0] == b[0] && a[1] == b[1];
	};
	function stackbox_spec_prop_controller() {
		_super.call(this, [false, 0]);
		this.__eq__ = ctrl_eq;
		stackbox_keyboard_system.bind(this._handler.bind(this));
	}
	stackbox_spec_prop_controller.prototype._handler = function(down, key) {
		this.set([down, key]);
	};
	return stackbox_spec_prop_controller;
})(stackbox_dfan_property);

var stackbox_spec_prop_hotkey = (function(_super) {
	__extends(stackbox_spec_prop_hotkey, _super);
	var HK_SET = 'set';
	var HK_CHANGE = 'change';
	var HK_KEYDOWN = 'key_down';
	var HK_KEYUP = 'key_up';
	function stackbox_spec_prop_hotkey() {
		_super.call(this, false);
	}
	stackbox_spec_prop_hotkey.prototype.set = function(val) {
		if(!this._hooks_lock.check(HK_SET)) {
			this._hooks_lock.lock(HK_SET);
			var r = this._hooks.invoke(HK_SET, val, this._value, this);
			if(r !== undefined)
				val = r;
			this._hooks_lock.unlock(HK_SET);
		}
		if(!this.__eq__(this._value, val)) {
			if(!this._hooks_lock.check(HK_CHANGE)) {
				this._hooks_lock.lock(HK_CHANGE);
				var r = this._hooks.invoke(HK_CHANGE, val, this._value, this);
				if(r !== undefined)
					val = r;
				this._hooks_lock.unlock(HK_CHANGE);
			}
			if(val /*== true*/) {
				if(!this._hooks_lock.check(HK_KEYDOWN)) {
					this._hooks_lock.lock(HK_KEYDOWN);
					var r = this._hooks.invoke(HK_KEYDOWN, this);
					this._hooks_lock.unlock(HK_KEYDOWN);
				}
			} else {
				if(!this._hooks_lock.check(HK_KEYUP)) {
					this._hooks_lock.lock(HK_KEYUP);
					var r = this._hooks.invoke(HK_KEYUP, this);
					this._hooks_lock.unlock(HK_KEYUP);
				}
			}
		}
		this._value = val;
		return val;
	};
	return stackbox_spec_prop_hotkey;
})(stackbox_dfan_property);

var stackbox_spec_control = (function(_super) {
	__extends(stackbox_spec_control, _super);
	var need_prop = [
		'@controller',
	];
	var g_hkid = 1;
	function stackbox_spec_control() {
		_super.call(this);
		this.keymap = {};
	}
	stackbox_spec_control.prototype.add_key = function(key) {
		if(key in this.keymap) return this.keymap[key];
		var hotkey = new stackbox_spec_prop_hotkey();
		this.keymap[key] = hotkey;
		return hotkey;
	};
	stackbox_spec_control.prototype.remove_key = function(key) {
		if(!(key in this.keymap)) return false;
		return (delete this.keymap[key]);
	};
	stackbox_spec_control.prototype.change_key = function(key1, key2) {
		if(key1 in this.keymap) {
			var _k = this.keymap[key1];
			if(key2 in this.keymap) {
				this.keymap[key1] = this.keymap[key2];
			} else {
				delete this.keymap[key1];
			}
			this.keymap[key2] = _k;
		} else {
			if(key2 in this.keymap) {
				this.keymap[key1] = this.keymap[key2];
				delete this.keymap[key2];
			}
		}
	};
	stackbox_spec_control.prototype.init = function() {
		this.check_props(need_prop);
		this.goto_state('ready');
	};
	stackbox_spec_control.prototype.statrig_ready = ['@controller'];
	stackbox_spec_control.prototype.state_ready = function(info) {
		var keystat = info.val;
		if(keystat[1] in this.keymap) {
			this.keymap[keystat[1]].set(keystat[0]);
		}
	};
	return stackbox_spec_control;
})(stackbox_dfan_automaton);

/*************************************************************************************/

var stackbox_spec_serial_bus = stackbox_dfan_property;

var stackbox_spec_serial_node = (function(_super) {
	__extends(stackbox_spec_serial_node, _super);
	var need_prop = [
		'#proto_in',
		'#proto_out',
	];
	function stackbox_spec_serial_node(id) {
		_super.call(this);
		this.id = id;
		this.ports = [];
	}
	stackbox_spec_serial_node.prototype.handled_trigger = ["set"];
	stackbox_spec_serial_node.prototype.init = function() {
		this.bind_prop('#proto_in', new stackbox_spec_serial_bus([]));
		this.bind_prop('#proto_out', new stackbox_spec_serial_bus([]));
		this.statrig_ready = this.ports;
		this.check_props(need_prop);
		this.goto_state('ready');
		this._started = true;
	};
	stackbox_spec_serial_node.prototype.add_port = function(name, bus) {
		if(this._started) throw 'node is already working.'
		if(bus === undefined)
			bus = new stackbox_spec_serial_bus('');
		this.bind_prop(name, bus);
		this.ports.push(name);
	};
	stackbox_spec_serial_node.prototype.proto_in = function() {
		return this.export_prop('#proto_in');
	};
	stackbox_spec_serial_node.prototype.proto_out = function() {
		return this.export_prop('#proto_out');
	};
	stackbox_spec_serial_node.prototype.state_ready = function(info) {
		this.prop_set('#proto_in', [info.name, info.val]);
	};
	stackbox_spec_serial_node.prototype.inttrig_output = ['#proto_out'];
	stackbox_spec_serial_node.prototype.interrupt_output = function(info) {
		if(this.prop_exist(info.val[0])) {
			console.log('port output', info.val[0], info.val[1]);
			this.prop_set(info.val[0], info.val[1]);
		} else {
			throw 'unknown port: ' + info.val[0];
		}
	};
	return stackbox_spec_serial_node;
})(stackbox_dfan_automaton);

var stackbox_spec_serial_protocol = (function(_super) {
	__extends(stackbox_spec_serial_protocol, _super);
	var need_prop = [
		'@proto_in',
		'@proto_back',
		'#proto_return',
		'#proto_out',
	];
	function stackbox_spec_serial_protocol() {
		_super.call(this);
		this.bind_prop('#proto_out', new stackbox_spec_serial_bus([]));
		this.bind_prop('#proto_return', new stackbox_spec_serial_bus([]));
	}
	stackbox_spec_serial_protocol.prototype.proto_name = "base";
	stackbox_spec_serial_protocol.prototype.handled_trigger = ["set"];
	stackbox_spec_serial_protocol.prototype.default_trigger = function() {
		return ['@proto_in'];
	};
	stackbox_spec_serial_protocol.prototype.init = function() {
		this.check_props(need_prop);
		this.root_state('main');
	};
	stackbox_spec_serial_protocol.prototype.data_in = function(info) {
		var dat = info.val;
		var val = dat[dat.length - 1];
		var context = dat.slice(0, -1);
		return {
			"val": val,
			"context": context,
		};
	};
	stackbox_spec_serial_protocol.prototype.data_in_v = function(info) {
		return info.val[info.val.length - 1];
	};
	stackbox_spec_serial_protocol.prototype.data_out = function(dat) {
		this.prop_set('#proto_out', dat.context.concat(dat.val));
	};
	stackbox_spec_serial_protocol.prototype.data_return = function(dat) {
		this.prop_set('#proto_return', dat.context.concat(dat.val));
	};
	stackbox_spec_serial_protocol.prototype.port_out = function(port, val) {
		if(this.prop_exist('@port_out'))
			this.prop_input('@port_out', [port, val]);
	};
	stackbox_spec_serial_protocol.prototype.bind_in = function(bus) {
		this.bind_prop('@proto_in', bus);
	};
	stackbox_spec_serial_protocol.prototype.bind_next = function(prtcl) {
		prtcl.bind_prop('@proto_in', this.export_prop('#proto_out'));
		this.bind_prop('@proto_back', prtcl.export_prop('#proto_return'));
	};
	stackbox_spec_serial_protocol.prototype.bind_next_none = function() {
		this.bind_prop('@proto_back', this.export_prop('#proto_out'));
	};
	stackbox_spec_serial_protocol.prototype.bind_ports = function(bus) {
		this.bind_prop('@port_out', bus);
	};
	stackbox_spec_serial_protocol.prototype.copy_data = function(dat) {
		var n_dat = {
			"val": dat.val,
			"context": dat.context.slice(),
		};
		return n_dat;
	};
	stackbox_spec_serial_protocol.prototype.get_context = function(dat, deep) {
		if(deep < 0)
			deep = dat.context.length + deep;
		if(deep < 0 || deep >= dat.context.length)
			return null;
		return dat.context[deep];
	};
	stackbox_spec_serial_protocol.prototype.set_context = function(dat, deep, val) {
		if(deep < 0)
			deep = dat.context.length + deep;
		if(deep < 0 || deep >= dat.context.length)
			throw 'invalid deep.';
		dat.context[deep] = val;
	};
	stackbox_spec_serial_protocol.prototype.push_context = function(dat, val) {
		dat.context.unshift(val);
	};
	stackbox_spec_serial_protocol.prototype.set_srcinfo = function(info, dat) {
		info.val = dat.context.concat(dat.val);
	};
	stackbox_spec_serial_protocol.prototype.check_done = function() {
		if(this.threads_count() != 0)
			throw 'some streams is still alive.';
	};
	/* Base on mulport protocol */
	var CONTEXT_DEEP_TID = -2;
	stackbox_spec_serial_protocol.prototype.state_main$f = function(info) {
		var dat = this.data_in(info);
		var tid = this.get_context(dat, CONTEXT_DEEP_TID);
		if(tid === null) throw 'should base on mulport protocol.';
		if(!this.exist_thread(tid)) {
			this.new_thread('idle', tid);
		}
		this.switch_thread(info, tid);
	};
	stackbox_spec_serial_protocol.prototype.statrig_main$f$vret = ['@proto_back'];
	stackbox_spec_serial_protocol.prototype.state_main$f$vret = function(info) {
		var dat = this.data_in(info);
		var tid = this.get_context(dat, CONTEXT_DEEP_TID);
		if(tid === null) throw 'should base on mulport protocol.';
		this.switch_thread(info, tid);
	};
	return stackbox_spec_serial_protocol;
})(stackbox_dfan_automaton_multithread);

var stackbox_spec_serial_proto_basemid = (function(_super) {
	__extends(stackbox_spec_serial_proto_basemid, _super);
	function stackbox_spec_serial_proto_basemid() {
		_super.call(this);
	}
	stackbox_spec_serial_proto_basemid.prototype.proto_name = "BMID";
	var CONTEXT_DEEP_TID = -2;
	var CONTEXT_DEEP_DSTPROTO = 0;
	var DATACMD_TOKEN_DONE = 'done';
	var DATACMD_TOKEN_BYPASS = '__bypass__';
	var LOCAL_CONTEXT_OUT = 'context_out';
	var LOCAL_CONTEXT_RET = 'context_ret';
	stackbox_spec_serial_proto_basemid.prototype.push_to_out = function(dat, val) {
		this.push_context(dat, val);
		this.local_set(LOCAL_CONTEXT_OUT, dat.context);
	};
	stackbox_spec_serial_proto_basemid.prototype.push_to_ret = function(dat, val) {
		this.push_context(dat, val);
		this.local_set(LOCAL_CONTEXT_RET, dat.context);
	};
	stackbox_spec_serial_proto_basemid.prototype.done_stream = function(dat) {
		var context = this.local_get(LOCAL_CONTEXT_RET);
		if(context === undefined)
			context = dat.context;
		this.data_return({
			"val": DATACMD_TOKEN_DONE,
			"context": context,
		});
		this.done_thread();
	};
	stackbox_spec_serial_proto_basemid.prototype.channel_bypass = function(to_proto) {
		var tid = this.new_thread('transdata');
		var dat = {
			"val": DATACMD_TOKEN_BYPASS,
			"context": [to_proto, tid, "__dummy_port__"],
		};
		this.data_out(dat);
		return {
			"tid": tid,
			"context": [tid, "__dummy_port__"],
		};
	};
	stackbox_spec_serial_proto_basemid.prototype.send_bypass = function(val, chn) {
		var dat = {
			"val": val,
			"context": chn.context,
		};
		this.data_out(dat);
	};
	stackbox_spec_serial_proto_basemid.prototype.data_bypass = function(dat, chn) {
		var n_dat = this.copy_data(dat);
		this.set_context(n_dat, CONTEXT_DEEP_TID, chn.tid);
		this.data_out(n_dat);
	};
	stackbox_spec_serial_proto_basemid.prototype.trans_bypass = function(info) {
		var dat = this.data_in(info);
		var dst_proto = this.get_context(dat, CONTEXT_DEEP_DSTPROTO);
		if(dat.val != DATACMD_TOKEN_BYPASS)
			return false;
		if(dst_proto == this.proto_name) {
			this.goto_state('idle');
		} else {
			this.data_out(dat);
			this.goto_state('transdata');
		}
		return true;
	};
	stackbox_spec_serial_proto_basemid.prototype.state_transdata$f = function(info) {
		var dat = this.data_in(info);
		var context = this.local_get(LOCAL_CONTEXT_OUT);
		if(context === undefined) {
			this.prop_set('#proto_out', info.val);
		} else {
			dat.context = context;
			this.data_out(dat);
		}
		this.goto_state('transdata');
	};
	stackbox_spec_serial_proto_basemid.prototype.statrig_transdata$f$vret = ['@proto_back'];
	stackbox_spec_serial_proto_basemid.prototype.state_transdata$f$vret = function(info) {
		var dat = this.data_in(info);
		if(dat.val == DATACMD_TOKEN_DONE) {
			var context = this.local_get(LOCAL_CONTEXT_RET);
			if(context === undefined) {
				this.prop_set('#proto_return', info.val);
			} else {
				dat.context = context;
				this.data_return(dat);
			}
			this.done_thread();
		}
	};
	return stackbox_spec_serial_proto_basemid;
})(stackbox_spec_serial_protocol);

var stackbox_spec_serial_proto_mulport = (function(_super) {
	__extends(stackbox_spec_serial_proto_mulport, _super);
	function stackbox_spec_serial_proto_mulport() {
		_super.call(this);
		this.port_thread_map = {};
	}
	stackbox_spec_serial_proto_mulport.prototype.proto_name = "mulport";
	var CONTEXT_DEEP_PORT = -1;
	var CONTEXT_DEEP_TID = -2;
	var DATACMD_TOKEN_DONE = 'done';
	stackbox_spec_serial_proto_mulport.prototype.state_main$f = function(info) {
		var dat = this.data_in(info);
		var port = this.get_context(dat, CONTEXT_DEEP_PORT);
		var tid = this.port_thread_map[port];
		if(tid === undefined) {
			tid = this.new_thread('idle');
			this.port_thread_map[port] = tid;
		}
		this.switch_thread(info, tid);
	};
	stackbox_spec_serial_proto_mulport.prototype.state_idle = function(info) {
		var dat = this.data_in(info);
		this.push_to_out(dat, this.current_thread());
		this.jump_state(info, 'transdata');
	};
	stackbox_spec_serial_proto_mulport.prototype.state_transdata$f$vret = function(info) {
		var dat = this.data_in(info);
		if(dat.val == DATACMD_TOKEN_DONE) {
			var port = this.get_context(dat, CONTEXT_DEEP_PORT);
			var tid = this.get_context(dat, CONTEXT_DEEP_TID);
			if(this.port_thread_map[port] !== tid)
				throw 'invalid port tid.';
			delete this.port_thread_map[port];
			this.done_thread();
		}
	};
	return stackbox_spec_serial_proto_mulport;
})(stackbox_spec_serial_proto_basemid);

var stackbox_spec_serial_proto_baseterm = (function(_super, _refer) {
	__extends(stackbox_spec_serial_proto_baseterm, _super);
	function stackbox_spec_serial_proto_baseterm() {
		_super.call(this);
		this._wait_ports = {};
		this._isawake = false;
	}
	stackbox_spec_serial_proto_baseterm.prototype.proto_name = "BTERM";
	var CONTEXT_DEEP_PORT = -1;
	var CONTEXT_DEEP_TID = -2;
	var BUSCMD_TOKEN_DONE = 'done';
	var LOCAL_PORT_DST = 'port_dst';
	var LOCAL_PORT_SRC = 'port_src';
	stackbox_spec_serial_proto_baseterm.prototype.wait_port = function(port) {
		var tid = this.current_thread();
		if(tid === null)
			throw 'thread is already done.';
		if(this._wait_ports[port] !== undefined) {
			if(this._wait_ports[port] == tid)
				return;
			else
				throw 'port is already waited by other thread.';
		}
		this._wait_ports[port] = tid;
	};
	stackbox_spec_serial_proto_baseterm.prototype.cancel_wait = function() {
		var tid = this.current_thread();
		for(port in this._wait_ports) {
			if(this._wait_ports[port] == tid)
				delete this._wait_ports[port];
		}
	};
	stackbox_spec_serial_proto_baseterm.prototype.awake_port = function(info) {
		var dat = this.data_in(info);
		var port = this.get_context(dat, CONTEXT_DEEP_PORT);
		var dst_tid = this._wait_ports[port];
		if(dst_tid === undefined)
			return false;
		delete this._wait_ports[port];
		this.done_stream(dat);
		/* terminal protocol do not care about tid, don't handle. */
		/* this.set_context(dat, CONTEXT_DEEP_TID, dst_tid);
		this.set_srcinfo(info, dat); */
		this._isawake = true;
		this.switch_thread(info, dst_tid);
		this._isawake = false;
		return true;
	};
	stackbox_spec_serial_proto_baseterm.prototype.is_awake = function() {
		return this._isawake;
	};
	stackbox_spec_serial_proto_baseterm.prototype.wait_state = function(state) {
		var dport = this.local_get(LOCAL_PORT_DST);
		if(dport !== undefined)
			this.wait_port(dport);
		this.goto_state(state);
	};
	stackbox_spec_serial_proto_baseterm.prototype.fix_dat = function(dat) {
		if(this.is_awake()) {
			this.set_context(dat, CONTEXT_DEEP_TID, this.current_thread());
			var port = this.local_get(LOCAL_PORT_SRC);
			if(port !== undefined)
				this.set_context(dat, CONTEXT_DEEP_PORT, port);
		}
	};
	stackbox_spec_serial_proto_baseterm.prototype.done_stream = function(dat) {
		this.fix_dat(dat);
		_refer.prototype.done_stream.call(this, dat);
	};
	stackbox_spec_serial_proto_baseterm.prototype.state_transdata = function(info) {
		if(this.is_awake()) {
			this.jump_state(info, 'transdone');
			return;
		}
		var dat = this.data_in(info);
		var sport = this.get_context(dat, CONTEXT_DEEP_PORT);
		if(sport !== this.local_get(LOCAL_PORT_SRC))
			this.local_set(LOCAL_PORT_SRC, sport);
		var dport = this.local_get(LOCAL_PORT_DST);
		if(dport !== undefined) {
			this.port_out(dport, dat.val);
			this.wait_port(dport);
		}
		this.goto_state('transdata');
	};
	stackbox_spec_serial_proto_baseterm.prototype.state_transdone = function(info) {
		var dat = this.data_in(info);
		if(dat.val == BUSCMD_TOKEN_DONE) {
			this.done_stream(dat);
		} else {
			this.wait_state('transdata');
		}
	};
	return stackbox_spec_serial_proto_baseterm;
})(stackbox_spec_serial_protocol, stackbox_spec_serial_proto_basemid);

var stackbox_spec_serial_proto_termport = (function(_super) {
	__extends(stackbox_spec_serial_proto_termport, _super);
	function stackbox_spec_serial_proto_termport() {
		_super.call(this);
	}
	stackbox_spec_serial_proto_termport.prototype.proto_name = "termport";
	var CONTEXT_DEEP_DSTPORT = 0;
	var DATACMD_TOKEN_KILL = '__kill__';
	var LOCAL_PORT_DST = 'port_dst';
	stackbox_spec_serial_proto_termport.prototype.state_idle = function(info) {
		if(this.awake_port(info)) return;
		var dat = this.data_in(info);
		if(dat.val == '__bypass__')
			return;
		var dport = this.get_context(dat, CONTEXT_DEEP_DSTPORT);
		this.local_set(LOCAL_PORT_DST, dport);
		this.jump_state(info, 'transdata');
	};
	stackbox_spec_serial_proto_termport.prototype.state_transdata$an = function(info) {
		var dat = this.data_in(info);
		if(dat.val == DATACMD_TOKEN_KILL) {
			this.cancel_wait();
			this.done_stream(dat);
			return null;
		}
	};
	return stackbox_spec_serial_proto_termport;
})(stackbox_spec_serial_proto_baseterm);

var stackbox_spec_serial_proto_router = (function(_super) {
	__extends(stackbox_spec_serial_proto_router, _super);
	function stackbox_spec_serial_proto_router() {
		_super.call(this);
	}
	stackbox_spec_serial_proto_router.prototype.proto_name = "router";
	var BUSCMD_TOKEN_START = "";
	var BUSCMD_TOKEN_END = "";
	var BUSCMD_TOKEN_DONE = "";
	stackbox_spec_serial_proto_router.prototype.state_idle = function(info) {
		if(this.awake_port(info)) return;
		var dat = this.data_in(info);
		if(dat.val == BUSCMD_TOKEN_START) {
			console.log('route_start');
			this.goto_state('branch');
		} else {
			this.done_stream(dat);
		}
	};
	stackbox_spec_serial_proto_router.prototype.state_branch = function(info) {
		var dat = this.data_in(info);
		if(dat.val == BUSCMD_TOKEN_END) {
			this.done_stream(dat);
		} else {
			var dport = dat.val;
			console.log('route_dport', dport);
			this.local_set('port_dst', dport);
			this.port_out(dport, BUSCMD_TOKEN_START);
			this.goto_state('transdata');
		}
	};
	return stackbox_spec_serial_proto_router;
})(stackbox_spec_serial_proto_baseterm);

/*************************************************************************************/

var stackbox_spec_order_triggers = (function(_super) {
	__extends(stackbox_spec_order_triggers, _super);
	var need_prop = [
		'@src',
	];
	function stackbox_spec_order_triggers() {
		_super.call(this);
		this.last_idx = -1;
		this._trigs = [];
	}
	//stackbox_spec_order_triggers.prototype.handled_trigger = ['get', 'set'];
	stackbox_spec_order_triggers.prototype.init = function() {
		this.check_props(need_prop);
		if(typeof(this._props_info['@src'].prop._value) == 'object')
			throw "order trigger doesn't support object value prop.";
		if(this.handled_trigger.indexOf('set') > -1
			&& this.handled_trigger.indexOf('change') > -1)
			throw "shouldn't trigger both set and change";
		//this.new_trigger();
		this.goto_state('ready');
	};
	stackbox_spec_order_triggers.prototype.new_trigger = function(cnt) {
		if(cnt === undefined) cnt = 1;
		var src_val = this._props_info['@src'].prop._value;
		for(var i = 0; i < cnt; i++) {
			this.last_idx ++;
			var _nprop = new stackbox_spec_prop(src_val);
			this.bind_prop('#dst' + this.last_idx, _nprop);
			this._trigs.push(_nprop);
		}
		return this.last_idx;
	};
	stackbox_spec_order_triggers.prototype.get_trigger = function(idx) {
		if(idx > this.last_idx)
			this.new_trigger(idx - this.last_idx);
		return this.export_prop('#dst' + idx);
	};
	stackbox_spec_order_triggers.prototype.inttrig_set = ['*@src:change', '*@src:set'];
	stackbox_spec_order_triggers.prototype.interrupt_set_st$ready = function(info) {
		//console.log('otrigger', info.name, info.trigger, info.val, info.old_val)
		for(var i = 0; i < this._trigs.length; i++) {
			this._trigs[i].set(info.val);
		}
	};
	stackbox_spec_order_triggers.prototype.inttrig_get = ['*@src:get'];
	stackbox_spec_order_triggers.prototype.interrupt_get_st$ready = function(info) {
		//console.log('otrigger', info.name, info.trigger)
		for(var i = 0; i < this._trigs.length; i++) {
			this._trigs[i].get();
		}
	};
	return stackbox_spec_order_triggers;
})(stackbox_dfan_automaton);

/***********************************GRAPH**********************************************/

var stackbox_graph = (function() {
	function stackbox_graph(layers) {
		this.layers = layers;
		
	}
	return stackbox_graph;
})();

var stackbox_graph_box = (function() {
	var default_ztp2layer = function(z, tp, box) {return z;};
	var default_layer2ztp = function(idx, box) {return [idx, 'stand'];};
	var default_layer_load = function(z, tp, box) {return null;};
	var default_dirty_mark = function(range, tp) {};
	function stackbox_graph_box(deep) {
		this.static_layers ={};
		this.dynamic_layers = [];
		this.ztp2layer = default_ztp2layer;
		this.layer2ztp = default_layer2ztp;
		this.layer_load = default_layer_load;
		this.dirty_mark = default_dirty_mark;
		this.win_deep = deep;
		this.win_start = 0;
	}
	stackbox_graph_box.prototype.get_layer = function(idx) {
		var layer;
		if(typeof(idx) == 'number') {
			if(idx < this.win_start || idx >= this.win_start + this.win_deep)
				return null;
			layer = this.dynamic_layers[idx - this.win_start];
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
		var dirty_range = frame.trans_range(trans).plus(pos);
		this.dirty_mark(dirty_range, tp);
		info['dirty_range'] = dirty_range;
		info['z'] = pos.z;
		info['tp'] = tp;
		return info;
	};
	stackbox_graph_box.prototype.clear = function(info) {
		if(info.id == -1) return false;
		var layer_idx = this.ztp2layer(info.z, info.tp, this);
		var layer = this.get_layer(layer_idx);
		if(!layer) return false;
		this.dirty_mark(info.dirty_range, info.tp);
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
	stackbox_graph_box.prototype.set_static_layer = function(idx, layer) {
		if(!layer) {
			delete this.static_layers[idx];
		} else {
			this.static_layers[idx] = layer;
		}
	};
	return stackbox_graph_box;
})();

/* Simple layer, rects shouldn't overlap */
var stackbox_graph_layer = (function() {
	var layer_id = 1;
	var default_range2local = function(range) {return range;};
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
		this.trans = null;
		this.range2local = default_range2local;
		this.id = layer_id;
		layer_id ++;
	}
	stackbox_graph_layer.prototype.draw = function(frame, pos, trans) {
		var dst_range = frame.range.move_to(pos);
		var loc_range = this.range2local(dst_range);
		var dirty_range = frame.blit(this.surface, loc_range.top, trans);
		return {
			"id": this.id,
			"range": dirty_range,
		};
	};
	stackbox_graph_layer.prototype.blit = function(src_rng, dst_surf, dst_pos, dst_trans, f_clear) {
		var loc_range = this.range2local(src_rng);
		if(!dst_trans)
			dst_trans = this.trans;
		else if(this.trans != null)
			dst_trans = dst_trans.plus(this.trans);
		return this.surface.blit(loc_range, dst_surf, dst_pos, dst_trans, f_clear);
	};
	stackbox_graph_layer.prototype.clear = function(info) {
		if(info.id != this.id) return false;
		this.surface.clear(info.range);
		return true;
	};
	stackbox_graph_layer.prototype.reset = function() {
		this.surface.reset();
	};
	return stackbox_graph_layer;
})();

/* Dynamic layer */
var stackbox_graph_layer_dynamic = (function() {
	var layer_id = 100000;
	var dl_id = 1;
	var default_range2local = function(range) {return range;};
	function stackbox_graph_layer_dynamic() {
		this.trans = null;
		this.range2local = default_range2local;
		this.id = layer_id;
		layer_id ++;
		this.draw_list = {};
	}
	stackbox_graph_layer_dynamic.prototype.draw = function(frame, pos, trans) {
		var dst_range = frame.range.move_to(pos);
		var loc_range = this.range2local(dst_range);
		var dirty_range = frame.trans_range(trans).plus(pos);
		var loc_dirty_range = this.range2local(dirty_range);
		this.draw_list[dl_id] = [loc_range, frame, trans, loc_dirty_range];
		return {
			"id": this.id,
			"range": loc_dirty_range,
			"dlid": dl_id++,
		};
	};
	stackbox_graph_layer_dynamic.prototype.blit = function(src_rng, dst_surf, dst_pos, dst_trans, f_clear) {
		var loc_range = this.range2local(src_rng);
		if(!dst_trans)
			dst_trans = this.trans;
		else if(this.trans != null)
			dst_trans = dst_trans.plus(this.trans);
		if(f_clear) {
			var dirty_range;
			if(dst_trans) {
				dirty_range = dst_trans.range(loc_range.minus(loc_range.top)).plus(dst_pos);
			} else {
				dirty_range = loc_range.move_to(dst_pos);
			}
			dst_surf.clear(dirty_range);
		}
		var dl_keys = Object.keys(this.draw_list).sort(function(a,b){return a-b;});
		for(var i = 0; i < dl_keys.length; i++) {
			var dl = this.draw_list[dl_keys[i]];
			var loc_pos = dl[0].top.minus(loc_range.top);
			if(loc_range.collision_with(dl[3])) {
				dl[1].blit(
					dst_surf, dst_pos.plus(loc_pos),
					dst_trans && dl[2] && dst_trans.move_to(loc_pos).plus(dl[2]) || dl[2] || dst_trans && dst_trans.move_to(loc_pos)
				);
			}
		}
		return dirty_range;
	};
	stackbox_graph_layer_dynamic.prototype.clear = function(info) {
		if(info.id != this.id) return false;
		return (delete this.draw_list[info.dlid]);
	};
	stackbox_graph_layer_dynamic.prototype.reset = function() {
		this.draw_list = {};
	};
	return stackbox_graph_layer_dynamic;
})();

var stackbox_graph_camera = (function() {
	function stackbox_graph_camera(box, range, order) {
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
		box.dirty_mark = this.dirty.bind(this);
		this.init_surfaces();
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
					stackbox_graph_system.append_ctx(surface.ctx);
				}
			} else {
				surface = new stackbox_graph_surface();
				this.surfaces.static[key] = surface;
				stackbox_graph_system.append_ctx(surface.ctx);
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
					range_f = this.dirty_range.static[tp].max(range_f);
				}
				this.dirty_range.static[tp] = range_f;
			}
		} else {
			if(range.collision_with(this.range)) {
				var lyr = this.box.ztp2layer(range.top.z, tp, this.box);
				if(this.dirty_range.dynamic.hasOwnProperty(lyr)) {
					range_f = this.dirty_range.dynamic[lyr].max(range_f);	
				}
				this.dirty_range.dynamic[lyr] = range_f;
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
							this.range.flat(), this.surfaces.dynamic[j],
							new stackbox_type_position(0, 0),
							null, true
						);
					}
				} else {
					if(key.slice(-4) == '_fix') {
						if(this.dirty_range.static[key] !== undefined) {
							var range_s = this.dirty_range.static[key];
							range_s = range_s.min(this.range.flat());
							this.box.get_layer(key).blit(
								range_s, this.surfaces.static[key],
								range_s.top.minus(this.range.top.flat()),
								null, true
							);
						}
					} else {
						this.box.get_layer(key).blit(
							this.range.flat(), this.surfaces.static[key],
							new stackbox_type_position(0, 0),
							null, true
						);
					}
				}
			}
		} else {
			var range_s;
			for(var key in this.dirty_range.dynamic) {
				//var ikey = Number(key);
				var ikey = +key;
				range_s = this.dirty_range.dynamic[key];
				range_s = range_s.min(this.range.flat());
				this.box.get_layer(ikey).blit(
					range_s, this.surfaces.dynamic[ikey - this.win_start()],
					range_s.top.minus(this.range.top.flat()),
					null, true
				);
			}
			for(var key in this.dirty_range.static) {
				range_s = this.dirty_range.static[key];
				range_s = range_s.min(this.range.flat());
				this.box.get_layer(key).blit(
					range_s, this.surfaces.static[key],
					range_s.top.minus(this.range.top.flat()),
					null, true
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
		var csize = stackbox_graph_system.get_size(ctx);
		this.width = csize[0];
		this.height = csize[1];
	}
	stackbox_graph_surface.prototype.blit = function(src_rng, dst, dst_pos, dst_trans, f_clear) {
		var dst_rng;
		if(dst_trans) {
			dst_rng = dst_trans.range(src_rng.minus(src_rng.top)).plus(dst_pos);
			if(f_clear)
				stackbox_graph_system.clear(dst.ctx, dst_rng);
			stackbox_graph_system.blit_trans(this.ctx, src_rng, dst.ctx, dst_pos, dst_trans);
		} else {
			dst_rng = src_rng.move_to(dst_pos);
			if(f_clear)
				stackbox_graph_system.clear(dst.ctx, dst_rng);
			stackbox_graph_system.blit(this.ctx, src_rng, dst.ctx, dst_pos);
		}
		return dst_rng;
	};
	stackbox_graph_surface.prototype.clear = function(rng) {
		stackbox_graph_system.clear(this.ctx, rng);
	};
	stackbox_graph_surface.prototype.reset = function() {
		stackbox_graph_system.reset(this.ctx);
	};
	return stackbox_graph_surface;
})();

var stackbox_graph_trans = (function() {
	function stackbox_graph_trans(info) {
		if(info === undefined)
			this.info = {};
		else if(typeof(info) == 'string')
			this.info = this.parse_str(info);
		else
			this.info = info;
	}
	stackbox_graph_trans.prototype.parse_str = function(s) {
		/*
		rotate(flipa(scale(flip(alpha(P)), Cs), Cf), Cr)
		=> shift(rotate(flipa(scale(flip(alpha(P))))), Ps)
		*/
		var ti = s.split(',');
		var info = {};
		var rcen = null;
		var fcen = null;
		var scen = null;
		for(var i = 0; i < ti.length; i++) {
			var kv = ti[i].split(':');
			var k = kv[0];
			var v = kv[1];
			switch(kv[0]) {
				case 'scale-center':
					var cpos = v.split('_');
					var scen = new stackbox_type_position(parseInt(cpos[0]), parseInt(cpos[1]));
					break;
				case 'flipa-center':
					var cpos = v.split('_');
					var fcen = new stackbox_type_position(parseInt(cpos[0]), parseInt(cpos[1]));
					break;
				case 'rotate-center':
					var cpos = v.split('_');
					var rcen = new stackbox_type_position(parseInt(cpos[0]), parseInt(cpos[1]));
					break;
				case 'shift':
					var spos = v.split('_');
					info[k] =  new stackbox_type_position(parseInt(spos[0]), parseInt(spos[1]));
				case 'rotate':
					if(v[v.length-1] == 'd') {
						v = parseFloat(v);
						info[k] = v * Math.PI / 180;
						break;
					}
				case 'flipa':
				case 'scale':
				case 'flip':
				case 'alpha':
					info[k] = parseFloat(v);
					break;	
				default:
					break;
			}
		}
		if(rcen || fcen) {
			var shft = new stackbox_type_position(0, 0);
			var rad = info['rotate'];
			if(rad !== undefined)
				rad = {
					"cos": Math.cos(rad),
					"sin": Math.sin(rad),
				};
			var flp = info['flipa'];
			var scl = info['scale'];
			if(rcen) {
				if(rad === undefined) throw 'need rotate.';
				var _x = (1 - rad.cos) * rcen.x + rad.sin * rcen.y;
				var _y = - rad.sin * rcen.x + (1 - rad.cos) * rcen.y;
				shft.x += _x;
				shft.y += _y;
			}
			if(fcen) {
				if(flp === undefined) throw 'need flipa.';
				var _x = 0;
				var _y = 0;
				if(flp & 1) _x = 2 * fcen.x;
				if(flp & 2) _y = 2 * fcen.y;
				if(rad) {
					var __x = rad.cos * _x - rad.sin * _y;
					var __y = rad.sin * _x + rad.cos * _y;
					_x = __x;
					_y = __y;
				}
				shft.x += _x;
				shft.y += _y;
			}
			if(scen) {
				if(scl === undefined) throw 'need scale.';
				var _x = (1 - scl) * scen.x;
				var _y = (1 - scl) * scen.y;
				if(flp) {
					if(flp & 1) _x = -_x;
					if(flp & 2) _y = -_y;
				}
				if(rad) {
					var __x = rad.cos * _x - rad.sin * _y;
					var __y = rad.sin * _x + rad.cos * _y;
					_x = __x;
					_y = __y;
				}
				shft.x += _x;
				shft.y += _y;
			}
			if(info['shift'] === undefined)
				info['shift'] = shft;
			else
				info['shift'].add(shft);
		}
		return info;
	};
	stackbox_graph_trans.prototype.copy = function() {
		var r = {};
		for(var k in this.info) {
			r[k] = this.info[k];
		}
		return new stackbox_graph_trans(r);
	};
	stackbox_graph_trans.prototype.eq = function(t) {
		if(this.info === t) return true;
		var sk = Object.keys(this.info);
		var dk = Object.keys(t.info);
		if(sk.length != dk.length) return false;
		for(var i = 0; i < sk.length; i++) {
			var _k = sk[i];
			if(t.info[_k] === undefined) return false;
			if(t.info[_k] != this.info[_k]) return false;
		}
		return true;
	};
	stackbox_graph_trans.prototype.add = function(t, dpos) {
		/*      commutative  associative  distributive
		rotate:     X            O           + (flip-all *)
		*/
		/*
		shift(rotate(flip(shift(rotate(flipa(scale(flip(P)))), S1 + dPos))), S2)
		=> shift(rotate(flipa(scale(flip(P)))), S3)
		*/
		if(!t) return;
		var di, si;
		var _chk = (function(k) {
			if((di = t.info[k]) !== undefined) {
				if((si = this.info[k]) !== undefined)
					return true;
				else
					this.info[k] = di;
			}
			return false;
		}).bind(this);
		if(dpos || (di = t.info['shift']) !== undefined) {
			if(di === undefined)
				di = dpos;
			else if(dpos)
				di = di.plus(dpos);
			var rad = this.info['rotate'];
			var flp = this.info['flipa'];
			var scl = this.info['scale'];
			if(rad !== undefined) {
				rad = {
					"cos": Math.cos(rad),
					"sin": Math.sin(rad),
				};
			}
			var _x = di.x;
			var _y = di.y;
			if(scl !== undefined) {
				_x *= scl;
				_y *= scl;
			}
			if(flp) {
				if(flp & 1) _x = -_x;
				if(flp & 2) _y = -_y;
			}
			if(rad) {
				var __x = rad.cos * _x - rad.sin * _y;
				var __y = rad.sin * _x + rad.cos * _y;
				_x = __x;
				_y = __y;
			}
			var shft = new stackbox_type_position(_x, _y);
			if((si = this.info['shift']) !== undefined) {
				this.info['shift'] = this.info['shift'].plus(shft);
			} else {
				this.info['shift'] = shft;
			}
		}
		if(_chk('rotate')) {
			var ang;
			var _flp = this.info['flipa']
			if(_flp == 1 || _flp == 2) {
				ang = si - di;
			} else {
				ang = si + di;
			}
			while(ang > 2 * Math.PI) ang -= 2 * Math.PI;
			while(ang < 0) ang += 2 * Math.PI;
			this.info['rotate'] = ang;
		}
		if(_chk('flipa')) {
			//1:x 2:y
			this.info['flipa'] = (si ^ di);
		}
		if(_chk('scale')) {
			this.info['scale'] = si * di;
		}
		if(_chk('flip')) {
			//1:x 2:y
			this.info['flip'] = (si ^ di);
		}
		if(_chk('alpha')) {
			this.info['alpha'] = si * di;
		}
	};
	stackbox_graph_trans.prototype.plus = function(t, dpos) {
		var r = this.copy();
		r.add(t, dpos);
		return r;
	};
	stackbox_graph_trans.prototype.range = function(src_rng) {
		var scl, flp, rad, shft;
		var r_rng = src_rng;
		if((scl = this.info['scale']) !== undefined) {
			r_rng = src_rng.scale(scl);
		}
		if((flp = this.info['flipa']) !== undefined) {
			r_rng = src_rng.flip(flp);
		}
		if((rad = this.info['rotate']) !== undefined) {
			r_rng = r_rng.rotate(rad);
		}
		if((shft = this.info['shift']) !== undefined) {
			r_rng = r_rng.plus(shft);
		}
		return r_rng;
	};
	stackbox_graph_trans.prototype.move_to = function(src_pos) {
		var r = this.copy();
		if(src_pos.is_zero()) return r;
		r.add(new stackbox_graph_trans(), src_pos);
		r.info['shift'].sub(src_pos);
		return r;
	};
	return stackbox_graph_trans;
})();

var stackbox_graph_frame = (function() {
	function stackbox_graph_frame(surface, range, trans) {
		this.surface = surface;
		this.range = range;
		this.dst_range = range.move_to(new stackbox_type_position(0, 0));
		if(trans === undefined)
			trans = null;
		this.trans = trans;
	}
	stackbox_graph_frame.prototype.blit = function(dst_surf, dst_pos, dst_trans, f_clear) {
		if(!dst_trans)
			dst_trans = this.trans;
		else if(this.trans != null)
			dst_trans = dst_trans.plus(this.trans);
		return this.surface.blit(this.range, dst_surf, dst_pos, dst_trans, f_clear);
	};
	stackbox_graph_frame.prototype.trans_range = function(dst_trans) {
		// dst_trans must be OUT trans, so no dst_pos
		var r_trans =
			dst_trans && this.trans && dst_trans.plus(this.trans) || dst_trans || this.trans;
		if(!r_trans)
			return this.dst_range;
		else
			return r_trans.range(this.dst_range);
	};
	return stackbox_graph_frame;
})();

var stackbox_graph_frame_comb = (function(_super) {
	__extends(stackbox_graph_frame_comb, _super);
	var fc_id = 200000;
	var frm_id = 1;
	function stackbox_graph_frame_comb(size, trans) {
		this.range = new stackbox_type_range(
			0, 0, size.x, size.y);
		this.dst_range = this.range;
		if(trans === undefined)
			trans = null;
		this.trans = trans;
		this.frame_list = {};
		this.id = fc_id++;
	}
	stackbox_graph_frame_comb.prototype.draw = function(src, pos, trans) {
		var dirty_range = src.trans_range(trans).plus(pos);
		if(!this.range.contain(dirty_range)) {
			return {
				"id": -1,
				"range": dirty_range,
				"err": "draw out of frame_comb",
			};
		}
		this.frame_list[frm_id] = [src, pos, trans, dirty_range];
		return {
			"id": this.id,
			"range": dirty_range,
			"frmid": frm_id++,
		};
	};
	stackbox_graph_frame_comb.prototype.clear = function(info) {
		if(info.id != this.id) return false;
		return (delete this.frame_list[info.frmid]);
	};
	stackbox_graph_frame_comb.prototype.blit = function(dst_surf, dst_pos, dst_trans, f_clear) {
		if(!dst_trans)
			dst_trans = this.trans;
		else if(this.trans != null)
			dst_trans = dst_trans.plus(this.trans);
		if(f_clear) {
			var dirty_range;
			if(dst_trans) {
				dirty_range = dst_trans.range(this.dst_range).plus(dst_pos);
			} else {
				dirty_range = this.range.move_to(dst_pos);
			}
			dst_surf.clear(dirty_range);
		}
		var frm_keys = Object.keys(this.frame_list).sort(function(a,b){return a-b;});
		for(var i = 0; i < frm_keys.length; i++) {
			var frm = this.frame_list[frm_keys[i]];
			var src_frame = frm[0];
			var frm_pos = frm[1];
			var frm_ext_trans = frm[2];
			var frm_dirty_range = frm[3];
			src_frame.blit(
				dst_surf, dst_pos.plus(frm_pos),
				dst_trans && frm_ext_trans && dst_trans.move_to(frm_pos).plus(frm_ext_trans) || frm_ext_trans || dst_trans && dst_trans.move_to(frm_pos)
			);
		}
		return dirty_range;
	};
	stackbox_graph_frame_comb.prototype.reset = function() {
		this.frame_list = {};
	};
	return stackbox_graph_frame_comb;
})(stackbox_graph_frame);

var stackbox_graph_sprite = (function() {
	function stackbox_graph_sprite(surf, rect_size, actions) {
		this.surface = surf;
		this.rect = rect_size;
		this.acts = this._init_acts(actions);
	}
	stackbox_graph_sprite.prototype._init_acts = function(acts) {
		/*
		acts -> acts , act | act
		act -> name : infos
		infos -> infos , info | info
		info -> pos | dir pn cnt
		dir -> "x" | "y"
		pn -> + | -
		cnt -> number
		name -> string
		pos -> (number , number)
		acts = {
			name: [
				pos | brief_string , ...
			],
			...
		}
		*/
		result = {}
		for(var name in acts) {
			var trans = null;
			var pos = null;
			var frames = [];
			for(var i = 0; i < acts[name].length; i++) {
				info = acts[name][i];
				if(typeof(info) == 'string') {
					var re_trans = /^\s*trans\s*:\s*(.*?)\s*$/.exec(info);
					var re_pos = /^\s*\(\s*(\d*)\s*,\s*(\d*)\s*\)\s*$/.exec(info);
					var re_brief = /^\s*([xy])\s*([+-])\s*(\d*)\s*$/.exec(info);
					if(re_trans) {
						trans = new stackbox_graph_trans(re_trans[1]);
					} else if(re_pos) {
						pos = new stackbox_type_position(
							parseInt(re_pos[1]), parseInt(re_pos[2])
						);
						frames.push(this._init_frames(pos, trans));
					} else if(re_brief) {
						if(!pos) throw 'pos need init.';
						var count = 1;
						if(re_brief[3])
							count = parseInt(re_brief[3]);
						var step;
						if(re_brief[2] == '+') step = 1;
						else step = -1;
						for(var j = 0; j < count; j++) {
							if(re_brief[1] == 'x') {
								pos.x += step;
							} else {
								pos.y += step;
							}
							frames.push(this._init_frames(pos, trans));
						}
					}
				} else if(info instanceof stackbox_type_position) {
					pos = info;
					frames.push(this._init_frames(pos, trans));
				}
			}
			result[name] = frames;
		}
		return result;
	};
	stackbox_graph_sprite.prototype._init_frames = function(pos, trans) {
		return new stackbox_graph_frame(
			this.surface,
			this._calc_range(pos),
			trans
		);
	};
	stackbox_graph_sprite.prototype._calc_range = function(pos) {
		var n_pos = new stackbox_type_position(pos.x * this.rect.x, pos.y * this.rect.y);
		return new stackbox_type_range(n_pos, this.rect, 'len-dummy');
	}
	stackbox_graph_sprite.prototype.frame = function(name, cnt) {
		return this.acts[name][cnt];
	};
	return stackbox_graph_sprite;
})();

/*************************************************************************************/

var stackbox_test_sprite = (function(_super) {
	__extends(stackbox_test_sprite, _super);
	function stackbox_test_sprite(rect_width, rect_height, grid_width, grid_height, actions) {
		var surf = new stackbox_graph_surface(grid_width * rect_width, grid_height * rect_height);
		var rect = new stackbox_type_position(rect_width, rect_height);
		_super.call(this, surf, rect, actions);
		this._draw_all();
	}
	stackbox_test_sprite.prototype._draw_all = function() {
		var grid = {};
		for(var k in this.acts) {
			for(var i = 0; i < this.acts[k].length; i++) {
				var frame = this.acts[k][i];
				var x = frame.range.top.x;
				var y = frame.range.top.y;
				if(stackbox_util.dtab_op(grid, 'get', x, y)) {
					if(grid[x][y][2] != null)
						grid[x][y] = [k, i, frame.trans];
				} else {
					stackbox_util.dtab_op(grid, 'set', x, y, [k, i, frame.trans]);
				}
			}
		}
		for(var x in grid) {
			for(var y in grid[x]) {
				this._draw_frame(parseInt(x), parseInt(y), grid[x][y][0], grid[x][y][1]);
			}
		}
	};
	stackbox_test_sprite.prototype._draw_frame = function(x, y, name, cnt) {
		var cx = x + this.rect.x / 2;
		var cy = y + this.rect.y / 2;
		stackbox_graph_system.draw_text(this.surface.ctx,
			new stackbox_type_position(cx, cy),
			name + cnt, 'verdana', 'center', 'middle', null, null, true);
		stackbox_graph_system.draw_rect(this.surface.ctx,
			new stackbox_type_range(x, y, x + this.rect.x, y + this.rect.y), true);
	};
	return stackbox_test_sprite;
})(stackbox_graph_sprite);

var stackbox_test_rect_frame = (function(_super) {
	__extends(stackbox_test_rect_frame, _super);
	function stackbox_test_rect_frame() {
		argv = stackbox_util.parse_argv(arguments, {
			"rng": ["range"],
			"sz": ["width", "height"],
		});
		var width, height;
		switch(argv.patt) {
			case 'rng':
				width = argv.range.len(0);
				height = argv.range.len(1);
				break;
			case 'sz':
				width = argv.width;
				height = argv.height;
				break
			default:
				break;
		}
		var surf = new stackbox_graph_surface(width+1, height+1);
		var range = new stackbox_type_range(0, 0, width, height);
		stackbox_graph_system.draw_rect(surf.ctx, range, true);
		_super.call(this, surf, range);
	}
	return stackbox_test_rect_frame;
})(stackbox_graph_frame);

/*************************************************************************************/

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
	get_size: function(ctx) {
		return [ctx.canvas.width, ctx.canvas.height];
	},
	append_ctx: function(ctx) {
		if(!this._cnvs_z) this._cnvs_z = 0;
		ctx.canvas.style.position = 'absolute';
		ctx.canvas.style.left = 0;
		ctx.canvas.style.top = 0;
		ctx.canvas.style.background = 'transparent';
		ctx.canvas.style['z-index'] = this._cnvs_z ++;
		this.screen_div.appendChild(ctx.canvas);
	},
	blit: function(src_ctx, src_rng, dst_ctx, dst_pos) {
		var w = src_rng.len(0);
		var h = src_rng.len(1);
		dst_ctx.drawImage(src_ctx.canvas, src_rng.top.x, src_rng.top.y, w, h, dst_pos.x, dst_pos.y, w, h);
	},
	blit_trans: function(src_ctx, src_rng, dst_ctx, dst_pos, dst_trans) {
		var w = src_rng.len(0);
		var h = src_rng.len(1);
		dst_ctx.save();
		this.trans(dst_ctx, dst_trans.info, dst_pos);
		if(dst_trans.info.flip) {
			if(dst_trans.info.flip & 1) {
				dst_ctx.translate(-w, 0);
			}
			if(dst_trans.info.flip & 2) {
				dst_ctx.translate(0, -h);
			}
		}
		dst_ctx.drawImage(src_ctx.canvas, src_rng.top.x, src_rng.top.y, w, h, 0, 0, w, h);
		dst_ctx.restore();
	},
	clear: function(ctx, rng) {
		ctx.clearRect(rng.top.x, rng.top.y, rng.len(0), rng.len(1));
	},
	reset: function(ctx) {
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	},
	trans: function(ctx, info, dpos) {
		/*
		P1 = rotate(rad, flip(xy, scale(sc, P0))) + Shift
		*/
		var ti;
		if((ti = info['shift']) !== undefined) {
			dpos = dpos.plus(ti);
		}
		ctx.translate(dpos.x, dpos.y);
		if((ti = info['rotate']) !== undefined) {
			ctx.rotate(ti);
		}
		if((ti = info['flipa']) !== undefined) {
			var _x = 1;
			var _y = 1;
			if(ti & 1) _x = -1;
			if(ti & 2) _y = -1;
			ctx.scale(_x, _y);
		}
		if((ti = info['scale']) !== undefined) {
			ctx.scale(ti, ti);
		}
		if((ti = info['flip']) !== undefined) {
			var _x = 1;
			var _y = 1;
			if(ti & 1) _x = -1;
			if(ti & 2) _y = -1;
			ctx.scale(_x, _y);
		}
		if((ti = info['alpha']) !== undefined) {
			ctx.globalAlpha = ti;
		}
	},
	set_fill_style: function(ctx, style) {
		ctx.fillStyle = style;
	},
	set_stroke_style: function(ctx, style) {
		ctx.strokeStyle = style;
	},
	draw_text: function(ctx, pos, text, font, align, baseline, width, stroke, rect) {
		if(!font) font = '20px Arial';
		if(!align) align = 'left';
		if(!baseline) baseline = 'top';
		ctx.save();
		ctx.font = font;
		ctx.textAlign = align;
		ctx.textBaseline = baseline;
		if(!width) {
			if(!stroke)
				ctx.fillText(text, pos.x, pos.y);
			else
				ctx.strokeText(text, pos.x, pos.y);
		} else {
			if(!stroke)
				ctx.fillText(text, pos.x, pos.y, width);
			else
				ctx.strokeText(text, pos.x, pos.y, width);
		}
		if(rect && !width) {
			var txt_width =  ctx.measureText(text).width;
			var txt_height = font.split(' ')[0].split('px')[0];
			ctx.strokeRect(pos.x, pos.y, txt_width, txt_height);
		}
		ctx.restore();
	},
	draw_rect: function(ctx, rng, stroke) {
		if(!stroke)
			ctx.fillRect(rng.top.x, rng.top.y, rng.len(0), rng.len(1));
		else
			ctx.strokeRect(rng.top.x, rng.top.y, rng.len(0), rng.len(1));
	},
	debug_show: function(ctx, rng) {
		if(!this._debug_ctx) {
			this._debug_ctx = this.new_ctx();
			this.append_ctx(this._debug_ctx);
		}
		this.blit(ctx, rng, this._debug_ctx, new stackbox_type_position(0, 0));
	},
	debug_split_canvas: function() {
		var cvns = this.screen_div.children;
		var splt = false;
		if(cvns[0].style.position == 'absolute') splt = true;
		for(var i = 0; i < cvns.length; i++) {
			if(splt) {
				cvns[i].style.removeProperty('position');
				cvns[i].style.removeProperty('left');
				cvns[i].style.removeProperty('top');
			} else {
				cvns[i].style.position = 'absolute';
				cvns[i].style.left = 0;
				cvns[i].style.top = 0;
			}
		}
	},
};

/*************************************************************************************/

var stackbox_mainloop_system = {
	fps: 100, //dest
	tpf: 10, //tick_per_frame
	tick: new stackbox_dfan_property(0),
	otrigger: new stackbox_spec_order_triggers(),
	current_fps: new stackbox_dfan_property(0),
	_last_time: 0,
	_loop_handle: null,
	init: function(fps, tpf) {
		if(fps) this.fps = fps;
		if(tpf) this.tpf = tpf;
		this.otrigger.bind_prop('@src', this.tick);
		this.otrigger.init();
	},
	otick: function(lvl) {
		return this.otrigger.get_trigger(lvl);
	},
	start_loop: function() {
		var msec = 1000/this.fps;
		this._last_time = new Date();
		this._loop_handle = setInterval(this.mainloop.bind(this), msec);
	},
	stop_loop: function() {
		if(this._loop_handle != null)
			clearInterval(this._loop_handle);
	},
	mainloop: function() {
		var cur_time = new Date();
		var delt_time = cur_time - this._last_time;
		this._last_time = cur_time;
		this.current_fps.set(Math.floor(1000 / delt_time));
		this.tick.set(this.tick.get() + this.tpf);
	},
};

/*************************************************************************************/

var stackbox_keyboard_system = {
	bind: function(func) {
		document.addEventListener('keydown', function (event) {
			//console.log('keydown', event.which);
			func(true, event.which);
			event.preventDefault();
			return false;
		}, false);
		document.addEventListener('keyup', function (event) {
			//console.log('keyup', event.which);
			func(false, event.which);
			event.preventDefault();
			return false;
		}, false);
	},
};

/*************************************************************************************/

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
	comb2: function(a, b, c) {
		// a && b && c || a || b
		if(a && b)
			return c;
		else if(a)
			return a;
		else if(b)
			return b;
		else
			return null;
	},
	dtab_op: function(dtab, op) {
		var r = dtab;
		switch(op) {
			case 'set':
				for(var i = 2; i < arguments.length - 2; i++) {
					if(!(arguments[i] in r)) r[arguments[i]] = {};
					r = r[arguments[i]];
				}
				if(i < arguments.length - 1) {
					r[arguments[i]] = arguments[i + 1];
				}
				return dtab;
			case 'get':
				for(var i = 2; i < arguments.length; i++) {
					if(typeof(r) != 'object' || !(arguments[i] in r)) return undefined;
					r = r[arguments[i]];
				}
				return r;
			case 'del':
				var _stck = [];
				for(var i = 2; i < arguments.length; i++) {
					if(typeof(r) != 'object' || !(arguments[i] in r)) return false;
					_stck.push([r, arguments[i]]);
					r = r[arguments[i]];
				}
				r = {};
				while(Object.keys(r).length == 0 && _stck.length > 0) {
					var _ti = _stck.pop();
					r = _ti[0];
					delete r[_ti[1]];
				}
				return true;
			default:
				return;
		}
	},
	rotate_comb: function(rad1, cen1, rad2, cen2) {
		/*
		cen3 = cen1 + M (cen2 - cen1)
		M = [ (1 + cos1 - cos2 - cos3)  (sin1 + sin2 - sin3), (sin3 - sin1 - sin2)  (1 + cos1 - cos2 - cos3)] / (1 - cos3) / 2
		*/
		var sin1 = Math.sin(rad1);
		var sin2 = Math.sin(rad2);
		var sin3 = Math.sin(rad1 + rad2);
		var cos1 = Math.cos(rad1);
		var cos2 = Math.cos(rad2);
		var cos3 = Math.cos(rad1 + rad2);
		var cen3x = cen1.x + ((cen2.x - cen1.x) * (1 + cos1 - cos2 - cos3) + (cen2.y - cen1.y) * (sin1 + sin2 - sin3)) / (1 - cos3) / 2;
		var cen3y = cen1.y + ((cen2.x - cen1.x) * (sin3 - sin1 - sin2) + (cen2.y - cen1.y) * (1 + cos1 - cos2 - cos3)) / (1 - cos3) / 2;
		return new stackbox_type_position(cen3x, cen3y);
	},
	flip_comb: function(flip1, cen1, flip2, cen2) {
		
	},
	//flip->rotate  <=>  rotate->flip 
	frswap_r_cen: function(flip, cenf, cenr) {
		var cen = cenr.copy();
		if(flip & 1) cen.x = 2 * cenf.x - cenr.x;
		if(flip & 2) cen.y = 2 * cenf.y - cenr.y;
		return cen;
	},
	frswap_r_rad: function(flip, rad) {
		return
			(flip == 1 || flip == 2)
			&& - rad || rad;
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

/*************************************************************************************/

function test1() {
	stackbox_graph_system.screen_div = document.getElementById('sb_screen');
	stackbox_graph_system.screen_width = 600;
	stackbox_graph_system.screen_height = 500;
	var t_surf_rng = new sbtp['rng'](new sbtp['pos'](0, 0), new sbtp['pos'](200, 100));
	var t_surf = new stackbox_graph_surface(t_surf_rng.len(0), t_surf_rng.len(1));
	//stackbox_graph_system.draw_text(t_surf.ctx, t_surf_rng.top, 'Hello World!');
	//stackbox_graph_system.draw_rect(t_surf.ctx, t_surf_rng, true);
	//stackbox_graph_system.draw_text(t_surf.ctx, t_surf_rng.top, 'Hello World!', null, 'center', 'middle', null, null, true);
	stackbox_graph_system.draw_text(t_surf.ctx, t_surf_rng.top, 'Hello World!', null, null, null, null, null, true);
	var t_frame = new stackbox_graph_frame(t_surf, t_surf_rng);
	var box = new stackbox_graph_box(6);
	box.layer_load = function(z, tp, box) {
		console.log('load layer:', z, tp);
		return new stackbox_graph_layer();
	};
	box.move_to(0, 'stand');
	box.set_static_layer('bg', new stackbox_graph_layer());
	var camera = new stackbox_graph_camera(box,
		new sbtp['rng'](new sbtp['pos'](0, 0, 0), new sbtp['pos'](600, 500, 2)),
		['dynamic', 'bg']);
	box.draw(t_frame, new sbtp['pos'](0, 0, 0), 'stand');
	camera.update();
	//stackbox_graph_system.set_fill_style(camera.surfaces.dynamic[0].ctx, 'red');
	//stackbox_graph_system.draw_text(camera.surfaces.dynamic[0].ctx, t_surf_rng.top, 'Hello World');
}

function test2() {
	var inttest = (function(_super) {
		__extends(inttest, _super);
		var need_prop = [
			'@aa',
			'bb',
			'cc',
		];
		function inttest() {
			_super.call(this);
		}
		inttest.prototype.handled_trigger = [
			'get', 'set', 'change'
		];
		inttest.prototype.init = function() {
			this.check_props(need_prop);
			this.goto_state('start');
		};
		inttest.prototype.statrig_start = ['@aa', 'bb'];
		inttest.prototype.state_start = function(info) {
			console.log('start', info, this);
			this.goto_state('end');
		};
		inttest.prototype.statrig_end = ['bb'];
		inttest.prototype.state_end = function(info) {
			console.log('end', info, this);
			this.goto_state('start');
		};
		inttest.prototype.statrig_int = ['@aa'];
		inttest.prototype.state_int = function(info) {
			console.log('int', info, this);
			this.goto_state('start');
		};
		inttest.prototype.inttrig_int1 = ['cc'];
		inttest.prototype.interrupt_int1 = function(info) {
			console.log('int1', info, this);
			this.goto_state('int');
		};
		inttest.prototype.inttrig_int2 = ['*@aa:get', '*bb:set'];
		inttest.prototype.interrupt_int2_st$start = function(info) {
			console.log('int2', info, this);
			this.goto_state('int');
		};
		inttest.prototype.inttrig_int3 = ['cc', '*bb:set'];
		inttest.prototype.interrupt_int3_ex$start$int = function(info) {
			console.log('int3', info, this);
			this.goto_state('int');
		};
		return inttest;
	})(stackbox_dfan_automaton);
	var t = new inttest();
	t.bind_prop('@aa', new stackbox_dfan_property(123));
	t.bind_prop('bb', new stackbox_dfan_property(123));
	t.bind_prop('cc', new stackbox_dfan_property(123));
	t.init();
	return t;
}

function test3() {
	var inttest = (function(_super) {
		__extends(inttest, _super);
		function inttest() {
			_super.call(this);
		}
		return inttest;
	})(stackbox_spec_actions);
	var sg = new inttest();
	sg.act_info = {
		'idle': [{'duration':1}, {'duration':3, 'loop':true}],
		'jump': [{'duration':5}, {'duration':10}, {'duration':4, 'loop':false}],
		'run': [{'duration':3}, {'duration':3}, {'duration':3}, {'duration':3, 'loop':true}],
	}
	var tck = new stackbox_dfan_property(0);
	sg.bind_prop('@tick', tck);
	sg.init();
	
	var inttest2 = (function(_super) {
		__extends(inttest2, _super);
		function inttest2() {
			_super.call(this);
		}
		inttest2.prototype.state_done = function(info) {
			console.log('done', info.val, info.old_val);
			//this.prop_set('#done', false);
			this.goto_state('done');
			return false;
		};
		return inttest2;
	})(stackbox_dfan_automaton);
	var dc = new inttest2();
	dc.bind_prop('@done', sg.export_prop('#done'));
	dc.goto_state('done');
	
	var act = sg.export_prop('#action');
	
	tck.add = function(a) {
		this.set(this.get() + a);
	};
	
	console.log('init done');
	
	tck.add(10);
	tck.add(10);
	act.set('jump');
	tck.add(10);
	tck.add(10);
	tck.add(10);
	tck.add(10);
	act.set('jump');
	tck.add(10);
	tck.add(10);
	tck.add(10);
	tck.add(10);
	
	return [sg, tck, act, dc];
}

function test_key_loop_stepbystep() {
	var foo = {};
	var bar = {};
	var foobar = {};
	foo[1000] = 123;
	bar['aaa'] = 456;
	foobar[2000] = 321;
	foobar['bbb'] = 654;
	for(var k in foo) {
		console.log(k);
	}
	for(var k in bar) {
		console.log(k);
	}
	for(var k in foobar) {
		console.log(k);
	}
}

function test4() {
	var inttest = (function(_super) {
		__extends(inttest, _super);
		function inttest() {
			_super.call(this);
		}
		inttest.prototype.state_idle = function(info) {
			console.log('idle', info);
		};
		inttest.prototype.inttrig_int1 = ['*@ka:key_down'];
		inttest.prototype.interrupt_int1 = function(info) {
			console.log('ka down', info);
		};
		inttest.prototype.inttrig_int2 = ['*@ka:key_up'];
		inttest.prototype.interrupt_int2 = function(info) {
			console.log('ka up', info);
		};
		inttest.prototype.inttrig_int3 = ['*@kb:key_down'];
		inttest.prototype.interrupt_int3 = function(info) {
			console.log('kb down', info);
		};
		inttest.prototype.inttrig_int4 = ['*@kb:key_up'];
		inttest.prototype.interrupt_int4 = function(info) {
			console.log('kb up', info);
		};
		return inttest;
	})(stackbox_dfan_automaton);
	var pl = new inttest();
	var kb = new stackbox_spec_control();
	var kp = new stackbox_spec_prop_controller();
	kb.bind_prop('@controller', kp);
	kb.init();
	pl.bind_prop('@ka', kb.add_key(65), ['key_down', 'key_up']);
	pl.bind_prop('@kb', kb.add_key(66), ['key_down', 'key_up']);
	pl.goto_state('idle');
}

function test_inherit_lvl_spec() {
	var foo1 = (function() {
		function foo1() {
		}
		foo1.prototype.a = 123;
		foo1.prototype.b = 123;
		foo1.prototype.c = 123;
		return foo1;
	})();
	var foo2 = (function(_super) {
		__extends(foo2, _super);
		function foo2() {
			_super.call(this);
		}
		foo2.prototype.b = 456;
		foo2.prototype.c = 456;
		foo2.prototype.d = 456;
		return foo2;
	})(foo1);
	var foo3 = (function(_super) {
		__extends(foo3, _super);
		function foo3() {
			_super.call(this);
		}
		foo3.prototype.c = 789;
		foo3.prototype.d = 789;
		foo3.prototype.e = 789;
		return foo3;
	})(foo2);
	return new foo3();
}

function test5() {
	var inttest = (function(_super) {
		__extends(inttest, _super);
		function inttest(idx) {
			_super.call(this);
			this.idx = idx
		}
		inttest.prototype.handled_trigger = ['get', 'set', 'change'];
		inttest.prototype.state_any = function(info) {
			console.log('trigged', this.idx,
				info.name, info.trigger, info.val, info.old_val);
			this.goto_state('any');
		};
		return inttest;
	})(stackbox_dfan_automaton);
	var ot = new stackbox_spec_order_triggers();
	var st = new stackbox_spec_prop(0);
	ot.bind_prop('@src', st);
	ot.init();
	var dt1 = new inttest(1);
	var dt2 = new inttest(2);
	var dt0 = new inttest(0);
	/*ot.new_trigger(3);
	dt1.bind_prop('@dst', ot.export_prop('#dst1'));
	dt1.goto_state('any');
	dt2.bind_prop('@dst', ot.export_prop('#dst2'));
	dt2.goto_state('any');
	dt0.bind_prop('@dst', ot.export_prop('#dst0'));
	dt0.goto_state('any');*/
	dt1.bind_prop('@dst', ot.get_trigger(1));
	dt1.goto_state('any');
	dt2.bind_prop('@dst', ot.get_trigger(2));
	dt2.goto_state('any');
	dt0.bind_prop('@dst', ot.get_trigger(0));
	dt0.goto_state('any');
	
	st.set(123);
	st.set(123);
	st.set(456);
	st.get();
	
	var st2 = new stackbox_spec_prop_pos(new sbtp['pos'](0, 0));
	var dt3 = new inttest(3);
	dt3.bind_prop('@dst', st2);
	dt3.goto_state('any');
	st2.set_elem(123, 'x');
	st2.set_elem(123, 'x');
	st2.set_elem(456, 'x');
	st2.get();
	
	return [ot, st]
}

function test6() {
	stackbox_graph_system.init(
		document.getElementById('sb_screen'),
		600, 500
	);
	var box = new stackbox_graph_box(6);
	box.layer_load = function(z, tp, box) {
		console.log('load layer:', z, tp);
		var r;
		if(z == 1) {
			r = new stackbox_graph_layer(1000,1000);
			r.trans = new stackbox_graph_trans('scale:0.5');
			r.range2local = function(range) {
				return range.scale(2);
			};
		} else {
			r = new stackbox_graph_layer_dynamic();
		}
		return r;
	};
	box.move_to(0, 'stand');
	box.set_static_layer('bg', new stackbox_graph_layer());
	var camera = new stackbox_graph_camera(box,
		new sbtp['rng'](new sbtp['pos'](0, 0, 0), new sbtp['pos'](600, 500, 2)),
		['dynamic', 'bg']
	);
	var tst_sprt = new stackbox_test_sprite(
		100, 50, 5, 6, {
			'idle': [
				'(0, 0)', 'x+2', 'trans:scale:2,flip:1,rotate:-85d,rotate-center:0_25', 'x+'
			],
			'walk': [
				'(0, 1)', 'x+4'
			],
			'jump': [
				'(0, 2)', 'x+4'
			],
		}
	);
	
	//stackbox_graph_system.debug_show(tst_sprt.surface.ctx, new sbtp['rng'](0, 0, 600, 500))
	//stackbox_graph_system.append_ctx(box.get_layer(1).surface.ctx);
	stackbox_graph_system.debug_split_canvas();
	
	var graph_atom = new stackbox_spec_graph(tst_sprt, box, 'stand');
	graph_atom.act_info = {
		'idle': [{'duration':200}, {'duration':200}, {'duration':200}, {'duration':800, 'loop':true}],
		'jump': [{'duration':5}, {'duration':10}, {'duration':4, 'loop':false}],
		'walk': [{'duration':3}, {'duration':3}, {'duration':3}, {'duration':3, 'loop':true}],
	};
	
	stackbox_mainloop_system.init();
	
	var _daemon_g = (function(_super) {
		__extends(_daemon_g, _super);
		function _daemon_g(camera) {
			_super.call(this);
			this.camera = camera;
		}
		_daemon_g.prototype.inttrig_tick = ['@tick'];
		_daemon_g.prototype.interrupt_tick_st$ready = function(info) {
			this.camera.update();
		};
		_daemon_g.prototype.inttrig_fps = ['@fps'];
		_daemon_g.prototype.interrupt_fps_st$ready = function(info) {
			document.title = 'sb test fps: ' + info.val;
		};
		return _daemon_g;
	})(stackbox_dfan_automaton);
	var graph_daemon = new _daemon_g(camera);
	graph_daemon.bind_prop('@tick', stackbox_mainloop_system.otick(4));
	graph_daemon.bind_prop('@fps', stackbox_mainloop_system.current_fps);
	graph_daemon.goto_state('ready');
	
	graph_atom.bind_prop('@tick', stackbox_mainloop_system.otick(2));
	var pos = new stackbox_spec_prop_pos(new sbtp['pos'](100, 100, 1));
	graph_atom.bind_prop('@pos', pos);
	graph_atom.init();
	
	//stackbox_mainloop_system.start_loop();
	//stackbox_mainloop_system.mainloop();
	//stackbox_mainloop_system.mainloop();
	
	var frmc = new stackbox_graph_frame_comb(new sbtp.pos(400, 400));
	var _throw_info = function(info) {
		return _info.err + ': (' +
			_info.range.top.x + ', ' +
			_info.range.top.y + ', ' +
			_info.range.bot.x + ', ' +
			_info.range.bot.y + ', ' + ')';
	};
	var _info = frmc.draw(new stackbox_test_rect_frame(400, 400), new sbtp.pos(0, 0));
	if(_info.id == -1) throw _throw_info(_info);
	
	_info = frmc.draw(tst_sprt.frame('idle', 0), new sbtp.pos(100, 30));
	if(_info.id == -1) throw _throw_info(_info);
	_info = frmc.draw(tst_sprt.frame('idle', 0), new sbtp.pos(100, 30),
		new stackbox_graph_trans('flip:2,rotate:30d,rotate-center:50_-25'));
	if(_info.id == -1) throw _throw_info(_info);
	frmc.draw(new stackbox_test_rect_frame(_info.range), _info.range.top);
	
	_info = frmc.draw(tst_sprt.frame('idle', 3), new sbtp.pos(30, 240));
	if(_info.id == -1) throw _throw_info(_info);
	_info = frmc.draw(tst_sprt.frame('idle', 3), new sbtp.pos(30, 240),
		new stackbox_graph_trans('flip:1,rotate:50d,rotate-center:100_25'));
	if(_info.id == -1) throw _throw_info(_info);
	frmc.draw(new stackbox_test_rect_frame(_info.range), _info.range.top);
	
	box.draw(frmc, new sbtp.pos(150, 0, 0), 'stand');
	box.draw(frmc, new sbtp.pos(150, 0, 1), 'stand',
		new stackbox_graph_trans('scale:1.2,scale-center:400_400,flipa:3,flipa-center:200_200,rotate:15d,rotate-center:0_0'));
	/*box.draw(frmc, new sbtp.pos(150, 0, 2), 'stand',
		new stackbox_graph_trans('scale:1.2'));*/
	camera.update();
	
	return [graph_atom, pos];
}

function test7() {
	var randparm = function(max) {
		return [
			new stackbox_type_position(Math.random() * max, Math.random() * max),
			Math.random() * Math.PI * 2,
			new stackbox_type_position(Math.random() * max, Math.random() * max),
			Math.random() * Math.PI * 2,
			new stackbox_type_position(Math.random() * max, Math.random() * max),
		];
	};
	var calc1 = function(pos, rad1, cen1, rad2, cen2) {
		return pos.rotate(rad1, cen1).rotate(rad2, cen2);
	};
	var calc2 = function(pos, rad1, cen1, rad2, cen2) {
		return pos.rotate(rad1 + rad2,
			stackbox_util.rotate_comb(rad1, cen1, rad2, cen2));
	};
	var delt = function(v1, v2) {
		return Math.abs((v1-v2)/(v1+v2));
	};
	for(var i = 1; i < 10000; i++) {
		var rnd = randparm(1000);
		var p1 = calc1.apply(this, rnd);
		var p2 = calc2.apply(this, rnd);
		if(delt(p1.x, p2.x) > 0.001 || delt(p1.y, p2.y) > 0.001)
			console.log('x:', p1.x, p2.x, 'y:', p1.y, p2.y);
	}
	console.log('done');
	
	console.log(Math.PI*3/2+35*Math.PI/180, stackbox_util.rotate_comb(Math.PI*3/2, new sbtp.pos(0,25), 35*Math.PI/180, new sbtp.pos(100,25)));
	console.log(Math.PI*3/2+35*Math.PI/180, stackbox_util.rotate_comb(35*Math.PI/180, new sbtp.pos(100,25), Math.PI*3/2, new sbtp.pos(0,25)));
	var p1 = calc1(new sbtp.pos(0,0), -Math.PI/2, new sbtp.pos(0,25), 35*Math.PI/180, new sbtp.pos(100,25));
	var p2 = calc2(new sbtp.pos(0,0), Math.PI*3/2, new sbtp.pos(0,25), 35*Math.PI/180, new sbtp.pos(100,25));
	console.log('x:', p1.x, p2.x, 'y:', p1.y, p2.y);
	var p1 = calc1(new sbtp.pos(100,50), -Math.PI/2, new sbtp.pos(0,25), 35*Math.PI/180, new sbtp.pos(100,25));
	var p2 = calc2(new sbtp.pos(100,50), Math.PI*3/2, new sbtp.pos(0,25), 35*Math.PI/180, new sbtp.pos(100,25));
	console.log('x:', p1.x, p2.x, 'y:', p1.y, p2.y);
}

function test8() {
	var inttest = (function(_super) {
		__extends(inttest, _super);
		function inttest() {
			_super.call(this);
		}
		inttest.prototype.state_any = function(info) {
			console.log('trigged',
				info.name, info.trigger, info.val, info.old_val);
			info.prop.lock_turn(false);
			if(info.val > 0)
				this.prop_set(info.name, info.val-1);
			info.prop.lock_turn(true);
			console.log(info.name, this.prop_get(info.name));
			this.goto_state('any');
		};
		return inttest;
	})(stackbox_dfan_automaton);
	var tg1 = new inttest();
	tg1.bind_prop('#val', new stackbox_dfan_property(0));
	tg1.goto_state('any');
	tg1.prop_set('#val', 3);
	tg1.prop_set('#val', 10);
	
	console.log('==============');
	
	var inttest = (function(_super) {
		__extends(inttest, _super);
		function inttest() {
			_super.call(this);
		}
		inttest.prototype.state_idle = function(info) {
			this.jump_state(info, 'ready');
		};
		inttest.prototype.statrig_ready = [];
		inttest.prototype.state_ready = function(info) {
			console.log('trigged',
				info.name, info.trigger, info.val, info.old_val);
			this.prop_set('#val1', info.val+1);
			this.prop_set('#val2', info.val+1);
			this.prop_set('#val3', info.val+1);
			this.goto_state('idle');
		};
		return inttest;
	})(stackbox_dfan_automaton);
	var tg1 = new inttest();
	tg1.bind_prop('#val1', new stackbox_dfan_property(0));
	tg1.bind_prop('#val2', new stackbox_dfan_property(0));
	tg1.bind_prop('#val3', new stackbox_dfan_property(0));
	tg1.goto_state('idle');
	tg1.prop_set('#val1', 3);
	console.log(tg1.prop_get('#val1'), tg1.prop_get('#val2'), tg1.prop_get('#val3'));
	tg1.prop_set('#val1', 10);
	console.log(tg1.prop_get('#val1'), tg1.prop_get('#val2'), tg1.prop_get('#val3'));
	
	console.log('==============');
	
	var inttest = (function(_super) {
		__extends(inttest, _super);
		function inttest() {
			_super.call(this);
		}
		inttest.prototype.state_any = function(info) {
			console.log('trigged',
				info.name, info.trigger, info.val, info.old_val);
			if(info.val == 10)
				//info.prop.lock_bypass(3);
				this.prop_lock_bypass(info.name, 3);
			//this.prop_lock_bypass(info.name);
			this.prop_set(info.name, info.val-1);
			//info.prop.lock_bypass_safedone();
			this.prop_lock_bypass_safedone(info.name);
			this.goto_state('any');
		};
		return inttest;
	})(stackbox_dfan_automaton);
	var tg1 = new inttest();
	tg1.bind_prop('#val', new stackbox_dfan_property(0));
	tg1.goto_state('any');
	tg1.prop_set('#val', 3);
	tg1.prop_set('#val', 10);
	
	return tg1;
}

function test9() {
	var mttest = (function(_super) {
		__extends(mttest, _super);
		function mttest() {
			_super.call(this);
		}
		mttest.prototype.state_any = function(info) {
			console.log('any', info);
			this.goto_state('any');
		};
		mttest.prototype.statrig___mmm$f = ['#val1'];
		mttest.prototype.state___mmm$f = function(info) {
			console.log('mmm1', info);
			this.goto_state('any');
		};
		mttest.prototype.statrig___mmm$f$v2 = ['#val2'];
		mttest.prototype.state___mmm$f$v2 = function(info) {
			console.log('mmm2', info);
			this.goto_state('any');
		};
		mttest.prototype.interrupt_intr = function(info) {
			console.log('intr', info);
			this.goto_state('__mmm');
		};
		return mttest;
	})(stackbox_dfan_automaton_multithread);
	var mt = new mttest();
	var v1 = new stackbox_dfan_property(0);
	var v2 = new stackbox_dfan_property(0);
	mt.bind_prop('#val1', v1);
	mt.bind_prop('#val2', v2);
	mt.goto_state('any');
	v1.set(123);
	v1.set(456);
	v1.set(789);
	console.log('=========');
	v2.set(123);
	v2.set(456);
	v2.set(789);
	return mt;
}

function test10() {
	
	var tstproto = (function(_super) {
		__extends(tstproto, _super);
		function tstproto() {
			_super.call(this);
		}
		tstproto.prototype.proto_name = "tstp";
		tstproto.prototype.state_idle = function(info) {
			var dat = this.data_in(info);
			if(dat.val == this.proto_name) {
				console.log('proto_token', this.proto_name);
				this.goto_state('s1');
			} else {
				this.done_stream(dat);
			}
		};
		tstproto.prototype.state_s1 = function(info) {
			var dat = this.data_in(info);
			console.log('s1', dat.val);
			this.local_set('port_str', dat.val);
			this.goto_state('s2');
		};
		tstproto.prototype.state_s2 = function(info) {
			var dat = this.data_in(info);
			console.log('s2', dat.val);
			var ps = this.local_get('port_str') + dat.val;
			this.push_context(dat, ps);
			this.local_set('context_out', dat.context);
			this.goto_state('transdata');
		};
		return tstproto;
	})(stackbox_spec_serial_proto_basemid);
	
	var tstproto2 = (function(_super) {
		__extends(tstproto2, _super);
		function tstproto2() {
			_super.call(this);
		}
		tstproto2.prototype.proto_name = "tstp2";
		tstproto2.prototype.state_s2 = function(info) {
			var dat = this.data_in(info);
			console.log('s2', dat.val);
			var ps = this.get_context(dat, 0) + this.local_get('port_str') + dat.val;
			this.local_set('port_str_all', ps);
			this.goto_state('last');
		};
		tstproto2.prototype.state_last = function(info) {
			var dat = this.data_in(info);
			var port = this.local_get('port_str_all');
			console.log('last', port, dat.val);
			this.port_out(port, dat.val);
			this.done_stream(dat);
		};
		return tstproto2;
	})(tstproto);
	
	var tstproto3 = (function(_super) {
		__extends(tstproto3, _super);
		function tstproto3() {
			_super.call(this);
		}
		tstproto3.prototype.proto_name = "tstp2";
		tstproto3.prototype.state_idle = function(info) {
			if(this.awake_port(info)) return;
			var dat = this.data_in(info);
			if(dat.val == this.proto_name) {
				console.log('proto_token', this.proto_name);
				this.goto_state('s1');
			} else {
				this.done_stream(dat);
			}
		};
		tstproto3.prototype.state_s1 = function(info) {
			var dat = this.data_in(info);
			console.log('s1', dat.val);
			this.local_set('port_str', dat.val);
			this.goto_state('s2');
		};
		tstproto3.prototype.state_s2 = function(info) {
			var dat = this.data_in(info);
			console.log('s2', dat.val);
			var ps = this.get_context(dat, 0) + this.local_get('port_str') + dat.val;
			this.local_set('port_dst', ps);
			this.goto_state('transdata');
		};
		return tstproto3;
	})(stackbox_spec_serial_proto_baseterm);
	
	var ib1 = new stackbox_spec_serial_bus('');
	var ib2 = new stackbox_spec_serial_bus('');
	var ib3 = new stackbox_spec_serial_bus('');
	var ib4 = new stackbox_spec_serial_bus('');
	var ib5 = new stackbox_spec_serial_bus('');
	
	var nd = new stackbox_spec_serial_node();
	nd.add_port('aaaa', ib1);
	nd.add_port('bbbb', ib2);
	nd.add_port('cccc', ib3);
	nd.add_port('dddd', ib4);
	nd.add_port('abcd', ib5);
	nd.init();
	
	var mp = new stackbox_spec_serial_proto_mulport();
	mp.bind_in(nd.proto_in());
	var t1p = new tstproto();
	mp.bind_next(t1p);
	mp.init();
	var t2p = new tstproto3();
	t1p.bind_next(t2p);
	t1p.init();
	t2p.bind_ports(nd.proto_out());
	t2p.bind_next_none();
	t2p.init();
	
	ib1.set('aaaaa');
	ib1.set('tstp');
	ib1.set('a');
	ib2.set('tstp');
	ib1.set('b');
	ib2.set('d');
	ib1.set('tstp2');
	ib2.set('d');
	ib2.set('tstp2');
	ib1.set('c');
	ib2.set('d');
	ib2.set('d');
	ib2.set('456');
	ib1.set('d');
	ib4.set('tstp');
	ib4.set('e');
	ib4.set('f');
	ib4.set('aaaaa');
	ib1.set('123');
	ib5.set('tstp');
	ib5.set('e');
	ib5.set('f');
	ib5.set('done');
	ib4.set('tstp');
	ib4.set('e');
	ib4.set('f');
	ib4.set('done');
	ib4.set('tstp');
	ib4.set('e');
	ib4.set('f');
	ib4.set('done');
	
	mp.check_done();
	t1p.check_done();
	t2p.check_done();
}

function test11() {
	var tstproto = (function(_super) {
		__extends(tstproto, _super);
		function tstproto() {
			_super.call(this);
		}
		tstproto.prototype.proto_name = "tstp";
		tstproto.prototype.state_idle = function(info) {
			if(this.trans_bypass(info)) return;
			var dat = this.data_in(info);
			if(dat.val == this.proto_name) {
				console.log('proto_token', this.proto_name);
				this.goto_state('s1');
			} else if(dat.val == 'done') {
				var chn = this.channel_bypass('termport');
				this.data_bypass(dat, chn);
				this.done_stream(dat);
			} else {
				this.done_stream(dat);
			}
		};
		tstproto.prototype.state_s1 = function(info) {
			var dat = this.data_in(info);
			console.log('s1', dat.val);
			this.local_set('port_str', dat.val);
			this.goto_state('s2');
		};
		tstproto.prototype.state_s2 = function(info) {
			var dat = this.data_in(info);
			console.log('s2', dat.val);
			var ps = this.local_get('port_str') + dat.val;
			this.push_to_out(dat, ps);
			this.goto_state('transdata');
		};
		return tstproto;
	})(stackbox_spec_serial_proto_basemid);
	
	var ib1 = new stackbox_spec_serial_bus('');
	var ib2 = new stackbox_spec_serial_bus('');
	var ib3 = new stackbox_spec_serial_bus('');
	var ib4 = new stackbox_spec_serial_bus('');
	
	var nd = new stackbox_spec_serial_node();
	nd.add_port('ab', ib1);
	nd.add_port('cd', ib2);
	nd.add_port('ef', ib3);
	nd.add_port('gh', ib4);
	nd.init();
	
	var mp = new stackbox_spec_serial_proto_mulport();
	var t1p = new tstproto();
	var t2p = new tstproto();
	var t3p = new tstproto();
	var tmp = new stackbox_spec_serial_proto_termport();
	
	mp.bind_in(nd.proto_in());
	mp.bind_next(t1p);
	mp.init();
	t1p.bind_next(t2p);
	t1p.init();
	t2p.bind_next(t3p);
	t2p.init();
	t3p.bind_next(tmp);
	t3p.init();
	tmp.bind_ports(nd.proto_out());
	tmp.bind_next_none();
	tmp.init();
	
	ib1.set('aaaaa');
	ib1.set('tstp');
	ib1.set('a');
	ib1.set('b');
	ib1.set('tstp');
	ib1.set('c');
	ib1.set('d');
	ib1.set('tstp');
	ib1.set('e');
	ib1.set('f');
	ib1.set('123');
	ib1.set('456');
	//ib1.set('__kill__');
	/*ib3.set('aaaaa');
	ib3.set('tstp');
	ib3.set('k');
	ib3.set('k');
	ib3.set('tstp');
	ib3.set('k');
	ib3.set('k');
	ib3.set('tstp');
	ib3.set('c');
	ib3.set('d');
	ib3.set('done');*/
	ib3.set('done');
	
	mp.check_done();
	t1p.check_done();
	t2p.check_done();
	t3p.check_done();
	tmp.check_done();
}

$(document).ready(function() {
	console.log('ready');
	test6();
	console.log('done');
});

// prevent ctrl+R and F5
/*$(document).bind('keydown keyup', function(e) {
    if(e.which === 116) {
       return false;
    }
    if(e.which === 82 && e.ctrlKey) {
       return false;
    }
});*/

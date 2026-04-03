var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// wrangler-modules-watch:wrangler:modules-watch
var init_wrangler_modules_watch = __esm({
  "wrangler-modules-watch:wrangler:modules-watch"() {
    init_modules_watch_stub();
  }
});

// node_modules/wrangler/templates/modules-watch-stub.js
var init_modules_watch_stub = __esm({
  "node_modules/wrangler/templates/modules-watch-stub.js"() {
    init_wrangler_modules_watch();
  }
});

// node-built-in-modules:crypto
import libDefault from "crypto";
var require_crypto = __commonJS({
  "node-built-in-modules:crypto"(exports, module) {
    init_modules_watch_stub();
    module.exports = libDefault;
  }
});

// node-built-in-modules:buffer
import libDefault2 from "buffer";
var require_buffer = __commonJS({
  "node-built-in-modules:buffer"(exports, module) {
    init_modules_watch_stub();
    module.exports = libDefault2;
  }
});

// node_modules/bn.js/lib/bn.js
var require_bn = __commonJS({
  "node_modules/bn.js/lib/bn.js"(exports, module) {
    init_modules_watch_stub();
    (function(module2, exports2) {
      "use strict";
      function assert(val, msg) {
        if (!val) throw new Error(msg || "Assertion failed");
      }
      __name(assert, "assert");
      function inherits2(ctor, superCtor) {
        ctor.super_ = superCtor;
        var TempCtor = /* @__PURE__ */ __name(function() {
        }, "TempCtor");
        TempCtor.prototype = superCtor.prototype;
        ctor.prototype = new TempCtor();
        ctor.prototype.constructor = ctor;
      }
      __name(inherits2, "inherits");
      function BN(number, base, endian) {
        if (BN.isBN(number)) {
          return number;
        }
        this.negative = 0;
        this.words = null;
        this.length = 0;
        this.red = null;
        if (number !== null) {
          if (base === "le" || base === "be") {
            endian = base;
            base = 10;
          }
          this._init(number || 0, base || 10, endian || "be");
        }
      }
      __name(BN, "BN");
      if (typeof module2 === "object") {
        module2.exports = BN;
      } else {
        exports2.BN = BN;
      }
      BN.BN = BN;
      BN.wordSize = 26;
      var Buffer2;
      try {
        if (typeof window !== "undefined" && typeof window.Buffer !== "undefined") {
          Buffer2 = window.Buffer;
        } else {
          Buffer2 = require_buffer().Buffer;
        }
      } catch (e) {
      }
      BN.isBN = /* @__PURE__ */ __name(function isBN(num) {
        if (num instanceof BN) {
          return true;
        }
        return num !== null && typeof num === "object" && num.constructor.wordSize === BN.wordSize && Array.isArray(num.words);
      }, "isBN");
      BN.max = /* @__PURE__ */ __name(function max(left, right) {
        if (left.cmp(right) > 0) return left;
        return right;
      }, "max");
      BN.min = /* @__PURE__ */ __name(function min(left, right) {
        if (left.cmp(right) < 0) return left;
        return right;
      }, "min");
      BN.prototype._init = /* @__PURE__ */ __name(function init(number, base, endian) {
        if (typeof number === "number") {
          return this._initNumber(number, base, endian);
        }
        if (typeof number === "object") {
          return this._initArray(number, base, endian);
        }
        if (base === "hex") {
          base = 16;
        }
        assert(base === (base | 0) && base >= 2 && base <= 36);
        number = number.toString().replace(/\s+/g, "");
        var start = 0;
        if (number[0] === "-") {
          start++;
          this.negative = 1;
        }
        if (start < number.length) {
          if (base === 16) {
            this._parseHex(number, start, endian);
          } else {
            this._parseBase(number, base, start);
            if (endian === "le") {
              this._initArray(this.toArray(), base, endian);
            }
          }
        }
      }, "init");
      BN.prototype._initNumber = /* @__PURE__ */ __name(function _initNumber(number, base, endian) {
        if (number < 0) {
          this.negative = 1;
          number = -number;
        }
        if (number < 67108864) {
          this.words = [number & 67108863];
          this.length = 1;
        } else if (number < 4503599627370496) {
          this.words = [
            number & 67108863,
            number / 67108864 & 67108863
          ];
          this.length = 2;
        } else {
          assert(number < 9007199254740992);
          this.words = [
            number & 67108863,
            number / 67108864 & 67108863,
            1
          ];
          this.length = 3;
        }
        if (endian !== "le") return;
        this._initArray(this.toArray(), base, endian);
      }, "_initNumber");
      BN.prototype._initArray = /* @__PURE__ */ __name(function _initArray(number, base, endian) {
        assert(typeof number.length === "number");
        if (number.length <= 0) {
          this.words = [0];
          this.length = 1;
          return this;
        }
        this.length = Math.ceil(number.length / 3);
        this.words = new Array(this.length);
        for (var i = 0; i < this.length; i++) {
          this.words[i] = 0;
        }
        var j, w;
        var off = 0;
        if (endian === "be") {
          for (i = number.length - 1, j = 0; i >= 0; i -= 3) {
            w = number[i] | number[i - 1] << 8 | number[i - 2] << 16;
            this.words[j] |= w << off & 67108863;
            this.words[j + 1] = w >>> 26 - off & 67108863;
            off += 24;
            if (off >= 26) {
              off -= 26;
              j++;
            }
          }
        } else if (endian === "le") {
          for (i = 0, j = 0; i < number.length; i += 3) {
            w = number[i] | number[i + 1] << 8 | number[i + 2] << 16;
            this.words[j] |= w << off & 67108863;
            this.words[j + 1] = w >>> 26 - off & 67108863;
            off += 24;
            if (off >= 26) {
              off -= 26;
              j++;
            }
          }
        }
        return this.strip();
      }, "_initArray");
      function parseHex4Bits(string, index) {
        var c = string.charCodeAt(index);
        if (c >= 65 && c <= 70) {
          return c - 55;
        } else if (c >= 97 && c <= 102) {
          return c - 87;
        } else {
          return c - 48 & 15;
        }
      }
      __name(parseHex4Bits, "parseHex4Bits");
      function parseHexByte(string, lowerBound, index) {
        var r = parseHex4Bits(string, index);
        if (index - 1 >= lowerBound) {
          r |= parseHex4Bits(string, index - 1) << 4;
        }
        return r;
      }
      __name(parseHexByte, "parseHexByte");
      BN.prototype._parseHex = /* @__PURE__ */ __name(function _parseHex(number, start, endian) {
        this.length = Math.ceil((number.length - start) / 6);
        this.words = new Array(this.length);
        for (var i = 0; i < this.length; i++) {
          this.words[i] = 0;
        }
        var off = 0;
        var j = 0;
        var w;
        if (endian === "be") {
          for (i = number.length - 1; i >= start; i -= 2) {
            w = parseHexByte(number, start, i) << off;
            this.words[j] |= w & 67108863;
            if (off >= 18) {
              off -= 18;
              j += 1;
              this.words[j] |= w >>> 26;
            } else {
              off += 8;
            }
          }
        } else {
          var parseLength = number.length - start;
          for (i = parseLength % 2 === 0 ? start + 1 : start; i < number.length; i += 2) {
            w = parseHexByte(number, start, i) << off;
            this.words[j] |= w & 67108863;
            if (off >= 18) {
              off -= 18;
              j += 1;
              this.words[j] |= w >>> 26;
            } else {
              off += 8;
            }
          }
        }
        this.strip();
      }, "_parseHex");
      function parseBase(str, start, end, mul) {
        var r = 0;
        var len = Math.min(str.length, end);
        for (var i = start; i < len; i++) {
          var c = str.charCodeAt(i) - 48;
          r *= mul;
          if (c >= 49) {
            r += c - 49 + 10;
          } else if (c >= 17) {
            r += c - 17 + 10;
          } else {
            r += c;
          }
        }
        return r;
      }
      __name(parseBase, "parseBase");
      BN.prototype._parseBase = /* @__PURE__ */ __name(function _parseBase(number, base, start) {
        this.words = [0];
        this.length = 1;
        for (var limbLen = 0, limbPow = 1; limbPow <= 67108863; limbPow *= base) {
          limbLen++;
        }
        limbLen--;
        limbPow = limbPow / base | 0;
        var total = number.length - start;
        var mod = total % limbLen;
        var end = Math.min(total, total - mod) + start;
        var word = 0;
        for (var i = start; i < end; i += limbLen) {
          word = parseBase(number, i, i + limbLen, base);
          this.imuln(limbPow);
          if (this.words[0] + word < 67108864) {
            this.words[0] += word;
          } else {
            this._iaddn(word);
          }
        }
        if (mod !== 0) {
          var pow = 1;
          word = parseBase(number, i, number.length, base);
          for (i = 0; i < mod; i++) {
            pow *= base;
          }
          this.imuln(pow);
          if (this.words[0] + word < 67108864) {
            this.words[0] += word;
          } else {
            this._iaddn(word);
          }
        }
        this.strip();
      }, "_parseBase");
      BN.prototype.copy = /* @__PURE__ */ __name(function copy(dest) {
        dest.words = new Array(this.length);
        for (var i = 0; i < this.length; i++) {
          dest.words[i] = this.words[i];
        }
        dest.length = this.length;
        dest.negative = this.negative;
        dest.red = this.red;
      }, "copy");
      BN.prototype.clone = /* @__PURE__ */ __name(function clone() {
        var r = new BN(null);
        this.copy(r);
        return r;
      }, "clone");
      BN.prototype._expand = /* @__PURE__ */ __name(function _expand(size) {
        while (this.length < size) {
          this.words[this.length++] = 0;
        }
        return this;
      }, "_expand");
      BN.prototype.strip = /* @__PURE__ */ __name(function strip() {
        while (this.length > 1 && this.words[this.length - 1] === 0) {
          this.length--;
        }
        return this._normSign();
      }, "strip");
      BN.prototype._normSign = /* @__PURE__ */ __name(function _normSign() {
        if (this.length === 1 && this.words[0] === 0) {
          this.negative = 0;
        }
        return this;
      }, "_normSign");
      BN.prototype.inspect = /* @__PURE__ */ __name(function inspect() {
        return (this.red ? "<BN-R: " : "<BN: ") + this.toString(16) + ">";
      }, "inspect");
      var zeros = [
        "",
        "0",
        "00",
        "000",
        "0000",
        "00000",
        "000000",
        "0000000",
        "00000000",
        "000000000",
        "0000000000",
        "00000000000",
        "000000000000",
        "0000000000000",
        "00000000000000",
        "000000000000000",
        "0000000000000000",
        "00000000000000000",
        "000000000000000000",
        "0000000000000000000",
        "00000000000000000000",
        "000000000000000000000",
        "0000000000000000000000",
        "00000000000000000000000",
        "000000000000000000000000",
        "0000000000000000000000000"
      ];
      var groupSizes = [
        0,
        0,
        25,
        16,
        12,
        11,
        10,
        9,
        8,
        8,
        7,
        7,
        7,
        7,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5
      ];
      var groupBases = [
        0,
        0,
        33554432,
        43046721,
        16777216,
        48828125,
        60466176,
        40353607,
        16777216,
        43046721,
        1e7,
        19487171,
        35831808,
        62748517,
        7529536,
        11390625,
        16777216,
        24137569,
        34012224,
        47045881,
        64e6,
        4084101,
        5153632,
        6436343,
        7962624,
        9765625,
        11881376,
        14348907,
        17210368,
        20511149,
        243e5,
        28629151,
        33554432,
        39135393,
        45435424,
        52521875,
        60466176
      ];
      BN.prototype.toString = /* @__PURE__ */ __name(function toString(base, padding) {
        base = base || 10;
        padding = padding | 0 || 1;
        var out;
        if (base === 16 || base === "hex") {
          out = "";
          var off = 0;
          var carry = 0;
          for (var i = 0; i < this.length; i++) {
            var w = this.words[i];
            var word = ((w << off | carry) & 16777215).toString(16);
            carry = w >>> 24 - off & 16777215;
            off += 2;
            if (off >= 26) {
              off -= 26;
              i--;
            }
            if (carry !== 0 || i !== this.length - 1) {
              out = zeros[6 - word.length] + word + out;
            } else {
              out = word + out;
            }
          }
          if (carry !== 0) {
            out = carry.toString(16) + out;
          }
          while (out.length % padding !== 0) {
            out = "0" + out;
          }
          if (this.negative !== 0) {
            out = "-" + out;
          }
          return out;
        }
        if (base === (base | 0) && base >= 2 && base <= 36) {
          var groupSize = groupSizes[base];
          var groupBase = groupBases[base];
          out = "";
          var c = this.clone();
          c.negative = 0;
          while (!c.isZero()) {
            var r = c.modn(groupBase).toString(base);
            c = c.idivn(groupBase);
            if (!c.isZero()) {
              out = zeros[groupSize - r.length] + r + out;
            } else {
              out = r + out;
            }
          }
          if (this.isZero()) {
            out = "0" + out;
          }
          while (out.length % padding !== 0) {
            out = "0" + out;
          }
          if (this.negative !== 0) {
            out = "-" + out;
          }
          return out;
        }
        assert(false, "Base should be between 2 and 36");
      }, "toString");
      BN.prototype.toNumber = /* @__PURE__ */ __name(function toNumber() {
        var ret = this.words[0];
        if (this.length === 2) {
          ret += this.words[1] * 67108864;
        } else if (this.length === 3 && this.words[2] === 1) {
          ret += 4503599627370496 + this.words[1] * 67108864;
        } else if (this.length > 2) {
          assert(false, "Number can only safely store up to 53 bits");
        }
        return this.negative !== 0 ? -ret : ret;
      }, "toNumber");
      BN.prototype.toJSON = /* @__PURE__ */ __name(function toJSON() {
        return this.toString(16);
      }, "toJSON");
      BN.prototype.toBuffer = /* @__PURE__ */ __name(function toBuffer(endian, length) {
        assert(typeof Buffer2 !== "undefined");
        return this.toArrayLike(Buffer2, endian, length);
      }, "toBuffer");
      BN.prototype.toArray = /* @__PURE__ */ __name(function toArray(endian, length) {
        return this.toArrayLike(Array, endian, length);
      }, "toArray");
      BN.prototype.toArrayLike = /* @__PURE__ */ __name(function toArrayLike(ArrayType, endian, length) {
        var byteLength = this.byteLength();
        var reqLength = length || Math.max(1, byteLength);
        assert(byteLength <= reqLength, "byte array longer than desired length");
        assert(reqLength > 0, "Requested array length <= 0");
        this.strip();
        var littleEndian = endian === "le";
        var res = new ArrayType(reqLength);
        var b, i;
        var q = this.clone();
        if (!littleEndian) {
          for (i = 0; i < reqLength - byteLength; i++) {
            res[i] = 0;
          }
          for (i = 0; !q.isZero(); i++) {
            b = q.andln(255);
            q.iushrn(8);
            res[reqLength - i - 1] = b;
          }
        } else {
          for (i = 0; !q.isZero(); i++) {
            b = q.andln(255);
            q.iushrn(8);
            res[i] = b;
          }
          for (; i < reqLength; i++) {
            res[i] = 0;
          }
        }
        return res;
      }, "toArrayLike");
      if (Math.clz32) {
        BN.prototype._countBits = /* @__PURE__ */ __name(function _countBits(w) {
          return 32 - Math.clz32(w);
        }, "_countBits");
      } else {
        BN.prototype._countBits = /* @__PURE__ */ __name(function _countBits(w) {
          var t = w;
          var r = 0;
          if (t >= 4096) {
            r += 13;
            t >>>= 13;
          }
          if (t >= 64) {
            r += 7;
            t >>>= 7;
          }
          if (t >= 8) {
            r += 4;
            t >>>= 4;
          }
          if (t >= 2) {
            r += 2;
            t >>>= 2;
          }
          return r + t;
        }, "_countBits");
      }
      BN.prototype._zeroBits = /* @__PURE__ */ __name(function _zeroBits(w) {
        if (w === 0) return 26;
        var t = w;
        var r = 0;
        if ((t & 8191) === 0) {
          r += 13;
          t >>>= 13;
        }
        if ((t & 127) === 0) {
          r += 7;
          t >>>= 7;
        }
        if ((t & 15) === 0) {
          r += 4;
          t >>>= 4;
        }
        if ((t & 3) === 0) {
          r += 2;
          t >>>= 2;
        }
        if ((t & 1) === 0) {
          r++;
        }
        return r;
      }, "_zeroBits");
      BN.prototype.bitLength = /* @__PURE__ */ __name(function bitLength() {
        var w = this.words[this.length - 1];
        var hi = this._countBits(w);
        return (this.length - 1) * 26 + hi;
      }, "bitLength");
      function toBitArray(num) {
        var w = new Array(num.bitLength());
        for (var bit = 0; bit < w.length; bit++) {
          var off = bit / 26 | 0;
          var wbit = bit % 26;
          w[bit] = (num.words[off] & 1 << wbit) >>> wbit;
        }
        return w;
      }
      __name(toBitArray, "toBitArray");
      BN.prototype.zeroBits = /* @__PURE__ */ __name(function zeroBits() {
        if (this.isZero()) return 0;
        var r = 0;
        for (var i = 0; i < this.length; i++) {
          var b = this._zeroBits(this.words[i]);
          r += b;
          if (b !== 26) break;
        }
        return r;
      }, "zeroBits");
      BN.prototype.byteLength = /* @__PURE__ */ __name(function byteLength() {
        return Math.ceil(this.bitLength() / 8);
      }, "byteLength");
      BN.prototype.toTwos = /* @__PURE__ */ __name(function toTwos(width) {
        if (this.negative !== 0) {
          return this.abs().inotn(width).iaddn(1);
        }
        return this.clone();
      }, "toTwos");
      BN.prototype.fromTwos = /* @__PURE__ */ __name(function fromTwos(width) {
        if (this.testn(width - 1)) {
          return this.notn(width).iaddn(1).ineg();
        }
        return this.clone();
      }, "fromTwos");
      BN.prototype.isNeg = /* @__PURE__ */ __name(function isNeg() {
        return this.negative !== 0;
      }, "isNeg");
      BN.prototype.neg = /* @__PURE__ */ __name(function neg() {
        return this.clone().ineg();
      }, "neg");
      BN.prototype.ineg = /* @__PURE__ */ __name(function ineg() {
        if (!this.isZero()) {
          this.negative ^= 1;
        }
        return this;
      }, "ineg");
      BN.prototype.iuor = /* @__PURE__ */ __name(function iuor(num) {
        while (this.length < num.length) {
          this.words[this.length++] = 0;
        }
        for (var i = 0; i < num.length; i++) {
          this.words[i] = this.words[i] | num.words[i];
        }
        return this.strip();
      }, "iuor");
      BN.prototype.ior = /* @__PURE__ */ __name(function ior(num) {
        assert((this.negative | num.negative) === 0);
        return this.iuor(num);
      }, "ior");
      BN.prototype.or = /* @__PURE__ */ __name(function or(num) {
        if (this.length > num.length) return this.clone().ior(num);
        return num.clone().ior(this);
      }, "or");
      BN.prototype.uor = /* @__PURE__ */ __name(function uor(num) {
        if (this.length > num.length) return this.clone().iuor(num);
        return num.clone().iuor(this);
      }, "uor");
      BN.prototype.iuand = /* @__PURE__ */ __name(function iuand(num) {
        var b;
        if (this.length > num.length) {
          b = num;
        } else {
          b = this;
        }
        for (var i = 0; i < b.length; i++) {
          this.words[i] = this.words[i] & num.words[i];
        }
        this.length = b.length;
        return this.strip();
      }, "iuand");
      BN.prototype.iand = /* @__PURE__ */ __name(function iand(num) {
        assert((this.negative | num.negative) === 0);
        return this.iuand(num);
      }, "iand");
      BN.prototype.and = /* @__PURE__ */ __name(function and(num) {
        if (this.length > num.length) return this.clone().iand(num);
        return num.clone().iand(this);
      }, "and");
      BN.prototype.uand = /* @__PURE__ */ __name(function uand(num) {
        if (this.length > num.length) return this.clone().iuand(num);
        return num.clone().iuand(this);
      }, "uand");
      BN.prototype.iuxor = /* @__PURE__ */ __name(function iuxor(num) {
        var a;
        var b;
        if (this.length > num.length) {
          a = this;
          b = num;
        } else {
          a = num;
          b = this;
        }
        for (var i = 0; i < b.length; i++) {
          this.words[i] = a.words[i] ^ b.words[i];
        }
        if (this !== a) {
          for (; i < a.length; i++) {
            this.words[i] = a.words[i];
          }
        }
        this.length = a.length;
        return this.strip();
      }, "iuxor");
      BN.prototype.ixor = /* @__PURE__ */ __name(function ixor(num) {
        assert((this.negative | num.negative) === 0);
        return this.iuxor(num);
      }, "ixor");
      BN.prototype.xor = /* @__PURE__ */ __name(function xor(num) {
        if (this.length > num.length) return this.clone().ixor(num);
        return num.clone().ixor(this);
      }, "xor");
      BN.prototype.uxor = /* @__PURE__ */ __name(function uxor(num) {
        if (this.length > num.length) return this.clone().iuxor(num);
        return num.clone().iuxor(this);
      }, "uxor");
      BN.prototype.inotn = /* @__PURE__ */ __name(function inotn(width) {
        assert(typeof width === "number" && width >= 0);
        var bytesNeeded = Math.ceil(width / 26) | 0;
        var bitsLeft = width % 26;
        this._expand(bytesNeeded);
        if (bitsLeft > 0) {
          bytesNeeded--;
        }
        for (var i = 0; i < bytesNeeded; i++) {
          this.words[i] = ~this.words[i] & 67108863;
        }
        if (bitsLeft > 0) {
          this.words[i] = ~this.words[i] & 67108863 >> 26 - bitsLeft;
        }
        return this.strip();
      }, "inotn");
      BN.prototype.notn = /* @__PURE__ */ __name(function notn(width) {
        return this.clone().inotn(width);
      }, "notn");
      BN.prototype.setn = /* @__PURE__ */ __name(function setn(bit, val) {
        assert(typeof bit === "number" && bit >= 0);
        var off = bit / 26 | 0;
        var wbit = bit % 26;
        this._expand(off + 1);
        if (val) {
          this.words[off] = this.words[off] | 1 << wbit;
        } else {
          this.words[off] = this.words[off] & ~(1 << wbit);
        }
        return this.strip();
      }, "setn");
      BN.prototype.iadd = /* @__PURE__ */ __name(function iadd(num) {
        var r;
        if (this.negative !== 0 && num.negative === 0) {
          this.negative = 0;
          r = this.isub(num);
          this.negative ^= 1;
          return this._normSign();
        } else if (this.negative === 0 && num.negative !== 0) {
          num.negative = 0;
          r = this.isub(num);
          num.negative = 1;
          return r._normSign();
        }
        var a, b;
        if (this.length > num.length) {
          a = this;
          b = num;
        } else {
          a = num;
          b = this;
        }
        var carry = 0;
        for (var i = 0; i < b.length; i++) {
          r = (a.words[i] | 0) + (b.words[i] | 0) + carry;
          this.words[i] = r & 67108863;
          carry = r >>> 26;
        }
        for (; carry !== 0 && i < a.length; i++) {
          r = (a.words[i] | 0) + carry;
          this.words[i] = r & 67108863;
          carry = r >>> 26;
        }
        this.length = a.length;
        if (carry !== 0) {
          this.words[this.length] = carry;
          this.length++;
        } else if (a !== this) {
          for (; i < a.length; i++) {
            this.words[i] = a.words[i];
          }
        }
        return this;
      }, "iadd");
      BN.prototype.add = /* @__PURE__ */ __name(function add(num) {
        var res;
        if (num.negative !== 0 && this.negative === 0) {
          num.negative = 0;
          res = this.sub(num);
          num.negative ^= 1;
          return res;
        } else if (num.negative === 0 && this.negative !== 0) {
          this.negative = 0;
          res = num.sub(this);
          this.negative = 1;
          return res;
        }
        if (this.length > num.length) return this.clone().iadd(num);
        return num.clone().iadd(this);
      }, "add");
      BN.prototype.isub = /* @__PURE__ */ __name(function isub(num) {
        if (num.negative !== 0) {
          num.negative = 0;
          var r = this.iadd(num);
          num.negative = 1;
          return r._normSign();
        } else if (this.negative !== 0) {
          this.negative = 0;
          this.iadd(num);
          this.negative = 1;
          return this._normSign();
        }
        var cmp = this.cmp(num);
        if (cmp === 0) {
          this.negative = 0;
          this.length = 1;
          this.words[0] = 0;
          return this;
        }
        var a, b;
        if (cmp > 0) {
          a = this;
          b = num;
        } else {
          a = num;
          b = this;
        }
        var carry = 0;
        for (var i = 0; i < b.length; i++) {
          r = (a.words[i] | 0) - (b.words[i] | 0) + carry;
          carry = r >> 26;
          this.words[i] = r & 67108863;
        }
        for (; carry !== 0 && i < a.length; i++) {
          r = (a.words[i] | 0) + carry;
          carry = r >> 26;
          this.words[i] = r & 67108863;
        }
        if (carry === 0 && i < a.length && a !== this) {
          for (; i < a.length; i++) {
            this.words[i] = a.words[i];
          }
        }
        this.length = Math.max(this.length, i);
        if (a !== this) {
          this.negative = 1;
        }
        return this.strip();
      }, "isub");
      BN.prototype.sub = /* @__PURE__ */ __name(function sub(num) {
        return this.clone().isub(num);
      }, "sub");
      function smallMulTo(self, num, out) {
        out.negative = num.negative ^ self.negative;
        var len = self.length + num.length | 0;
        out.length = len;
        len = len - 1 | 0;
        var a = self.words[0] | 0;
        var b = num.words[0] | 0;
        var r = a * b;
        var lo = r & 67108863;
        var carry = r / 67108864 | 0;
        out.words[0] = lo;
        for (var k = 1; k < len; k++) {
          var ncarry = carry >>> 26;
          var rword = carry & 67108863;
          var maxJ = Math.min(k, num.length - 1);
          for (var j = Math.max(0, k - self.length + 1); j <= maxJ; j++) {
            var i = k - j | 0;
            a = self.words[i] | 0;
            b = num.words[j] | 0;
            r = a * b + rword;
            ncarry += r / 67108864 | 0;
            rword = r & 67108863;
          }
          out.words[k] = rword | 0;
          carry = ncarry | 0;
        }
        if (carry !== 0) {
          out.words[k] = carry | 0;
        } else {
          out.length--;
        }
        return out.strip();
      }
      __name(smallMulTo, "smallMulTo");
      var comb10MulTo = /* @__PURE__ */ __name(function comb10MulTo2(self, num, out) {
        var a = self.words;
        var b = num.words;
        var o = out.words;
        var c = 0;
        var lo;
        var mid;
        var hi;
        var a0 = a[0] | 0;
        var al0 = a0 & 8191;
        var ah0 = a0 >>> 13;
        var a1 = a[1] | 0;
        var al1 = a1 & 8191;
        var ah1 = a1 >>> 13;
        var a2 = a[2] | 0;
        var al2 = a2 & 8191;
        var ah2 = a2 >>> 13;
        var a3 = a[3] | 0;
        var al3 = a3 & 8191;
        var ah3 = a3 >>> 13;
        var a4 = a[4] | 0;
        var al4 = a4 & 8191;
        var ah4 = a4 >>> 13;
        var a5 = a[5] | 0;
        var al5 = a5 & 8191;
        var ah5 = a5 >>> 13;
        var a6 = a[6] | 0;
        var al6 = a6 & 8191;
        var ah6 = a6 >>> 13;
        var a7 = a[7] | 0;
        var al7 = a7 & 8191;
        var ah7 = a7 >>> 13;
        var a8 = a[8] | 0;
        var al8 = a8 & 8191;
        var ah8 = a8 >>> 13;
        var a9 = a[9] | 0;
        var al9 = a9 & 8191;
        var ah9 = a9 >>> 13;
        var b0 = b[0] | 0;
        var bl0 = b0 & 8191;
        var bh0 = b0 >>> 13;
        var b1 = b[1] | 0;
        var bl1 = b1 & 8191;
        var bh1 = b1 >>> 13;
        var b2 = b[2] | 0;
        var bl2 = b2 & 8191;
        var bh2 = b2 >>> 13;
        var b3 = b[3] | 0;
        var bl3 = b3 & 8191;
        var bh3 = b3 >>> 13;
        var b4 = b[4] | 0;
        var bl4 = b4 & 8191;
        var bh4 = b4 >>> 13;
        var b5 = b[5] | 0;
        var bl5 = b5 & 8191;
        var bh5 = b5 >>> 13;
        var b6 = b[6] | 0;
        var bl6 = b6 & 8191;
        var bh6 = b6 >>> 13;
        var b7 = b[7] | 0;
        var bl7 = b7 & 8191;
        var bh7 = b7 >>> 13;
        var b8 = b[8] | 0;
        var bl8 = b8 & 8191;
        var bh8 = b8 >>> 13;
        var b9 = b[9] | 0;
        var bl9 = b9 & 8191;
        var bh9 = b9 >>> 13;
        out.negative = self.negative ^ num.negative;
        out.length = 19;
        lo = Math.imul(al0, bl0);
        mid = Math.imul(al0, bh0);
        mid = mid + Math.imul(ah0, bl0) | 0;
        hi = Math.imul(ah0, bh0);
        var w0 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w0 >>> 26) | 0;
        w0 &= 67108863;
        lo = Math.imul(al1, bl0);
        mid = Math.imul(al1, bh0);
        mid = mid + Math.imul(ah1, bl0) | 0;
        hi = Math.imul(ah1, bh0);
        lo = lo + Math.imul(al0, bl1) | 0;
        mid = mid + Math.imul(al0, bh1) | 0;
        mid = mid + Math.imul(ah0, bl1) | 0;
        hi = hi + Math.imul(ah0, bh1) | 0;
        var w1 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w1 >>> 26) | 0;
        w1 &= 67108863;
        lo = Math.imul(al2, bl0);
        mid = Math.imul(al2, bh0);
        mid = mid + Math.imul(ah2, bl0) | 0;
        hi = Math.imul(ah2, bh0);
        lo = lo + Math.imul(al1, bl1) | 0;
        mid = mid + Math.imul(al1, bh1) | 0;
        mid = mid + Math.imul(ah1, bl1) | 0;
        hi = hi + Math.imul(ah1, bh1) | 0;
        lo = lo + Math.imul(al0, bl2) | 0;
        mid = mid + Math.imul(al0, bh2) | 0;
        mid = mid + Math.imul(ah0, bl2) | 0;
        hi = hi + Math.imul(ah0, bh2) | 0;
        var w2 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w2 >>> 26) | 0;
        w2 &= 67108863;
        lo = Math.imul(al3, bl0);
        mid = Math.imul(al3, bh0);
        mid = mid + Math.imul(ah3, bl0) | 0;
        hi = Math.imul(ah3, bh0);
        lo = lo + Math.imul(al2, bl1) | 0;
        mid = mid + Math.imul(al2, bh1) | 0;
        mid = mid + Math.imul(ah2, bl1) | 0;
        hi = hi + Math.imul(ah2, bh1) | 0;
        lo = lo + Math.imul(al1, bl2) | 0;
        mid = mid + Math.imul(al1, bh2) | 0;
        mid = mid + Math.imul(ah1, bl2) | 0;
        hi = hi + Math.imul(ah1, bh2) | 0;
        lo = lo + Math.imul(al0, bl3) | 0;
        mid = mid + Math.imul(al0, bh3) | 0;
        mid = mid + Math.imul(ah0, bl3) | 0;
        hi = hi + Math.imul(ah0, bh3) | 0;
        var w3 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w3 >>> 26) | 0;
        w3 &= 67108863;
        lo = Math.imul(al4, bl0);
        mid = Math.imul(al4, bh0);
        mid = mid + Math.imul(ah4, bl0) | 0;
        hi = Math.imul(ah4, bh0);
        lo = lo + Math.imul(al3, bl1) | 0;
        mid = mid + Math.imul(al3, bh1) | 0;
        mid = mid + Math.imul(ah3, bl1) | 0;
        hi = hi + Math.imul(ah3, bh1) | 0;
        lo = lo + Math.imul(al2, bl2) | 0;
        mid = mid + Math.imul(al2, bh2) | 0;
        mid = mid + Math.imul(ah2, bl2) | 0;
        hi = hi + Math.imul(ah2, bh2) | 0;
        lo = lo + Math.imul(al1, bl3) | 0;
        mid = mid + Math.imul(al1, bh3) | 0;
        mid = mid + Math.imul(ah1, bl3) | 0;
        hi = hi + Math.imul(ah1, bh3) | 0;
        lo = lo + Math.imul(al0, bl4) | 0;
        mid = mid + Math.imul(al0, bh4) | 0;
        mid = mid + Math.imul(ah0, bl4) | 0;
        hi = hi + Math.imul(ah0, bh4) | 0;
        var w4 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w4 >>> 26) | 0;
        w4 &= 67108863;
        lo = Math.imul(al5, bl0);
        mid = Math.imul(al5, bh0);
        mid = mid + Math.imul(ah5, bl0) | 0;
        hi = Math.imul(ah5, bh0);
        lo = lo + Math.imul(al4, bl1) | 0;
        mid = mid + Math.imul(al4, bh1) | 0;
        mid = mid + Math.imul(ah4, bl1) | 0;
        hi = hi + Math.imul(ah4, bh1) | 0;
        lo = lo + Math.imul(al3, bl2) | 0;
        mid = mid + Math.imul(al3, bh2) | 0;
        mid = mid + Math.imul(ah3, bl2) | 0;
        hi = hi + Math.imul(ah3, bh2) | 0;
        lo = lo + Math.imul(al2, bl3) | 0;
        mid = mid + Math.imul(al2, bh3) | 0;
        mid = mid + Math.imul(ah2, bl3) | 0;
        hi = hi + Math.imul(ah2, bh3) | 0;
        lo = lo + Math.imul(al1, bl4) | 0;
        mid = mid + Math.imul(al1, bh4) | 0;
        mid = mid + Math.imul(ah1, bl4) | 0;
        hi = hi + Math.imul(ah1, bh4) | 0;
        lo = lo + Math.imul(al0, bl5) | 0;
        mid = mid + Math.imul(al0, bh5) | 0;
        mid = mid + Math.imul(ah0, bl5) | 0;
        hi = hi + Math.imul(ah0, bh5) | 0;
        var w5 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w5 >>> 26) | 0;
        w5 &= 67108863;
        lo = Math.imul(al6, bl0);
        mid = Math.imul(al6, bh0);
        mid = mid + Math.imul(ah6, bl0) | 0;
        hi = Math.imul(ah6, bh0);
        lo = lo + Math.imul(al5, bl1) | 0;
        mid = mid + Math.imul(al5, bh1) | 0;
        mid = mid + Math.imul(ah5, bl1) | 0;
        hi = hi + Math.imul(ah5, bh1) | 0;
        lo = lo + Math.imul(al4, bl2) | 0;
        mid = mid + Math.imul(al4, bh2) | 0;
        mid = mid + Math.imul(ah4, bl2) | 0;
        hi = hi + Math.imul(ah4, bh2) | 0;
        lo = lo + Math.imul(al3, bl3) | 0;
        mid = mid + Math.imul(al3, bh3) | 0;
        mid = mid + Math.imul(ah3, bl3) | 0;
        hi = hi + Math.imul(ah3, bh3) | 0;
        lo = lo + Math.imul(al2, bl4) | 0;
        mid = mid + Math.imul(al2, bh4) | 0;
        mid = mid + Math.imul(ah2, bl4) | 0;
        hi = hi + Math.imul(ah2, bh4) | 0;
        lo = lo + Math.imul(al1, bl5) | 0;
        mid = mid + Math.imul(al1, bh5) | 0;
        mid = mid + Math.imul(ah1, bl5) | 0;
        hi = hi + Math.imul(ah1, bh5) | 0;
        lo = lo + Math.imul(al0, bl6) | 0;
        mid = mid + Math.imul(al0, bh6) | 0;
        mid = mid + Math.imul(ah0, bl6) | 0;
        hi = hi + Math.imul(ah0, bh6) | 0;
        var w6 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w6 >>> 26) | 0;
        w6 &= 67108863;
        lo = Math.imul(al7, bl0);
        mid = Math.imul(al7, bh0);
        mid = mid + Math.imul(ah7, bl0) | 0;
        hi = Math.imul(ah7, bh0);
        lo = lo + Math.imul(al6, bl1) | 0;
        mid = mid + Math.imul(al6, bh1) | 0;
        mid = mid + Math.imul(ah6, bl1) | 0;
        hi = hi + Math.imul(ah6, bh1) | 0;
        lo = lo + Math.imul(al5, bl2) | 0;
        mid = mid + Math.imul(al5, bh2) | 0;
        mid = mid + Math.imul(ah5, bl2) | 0;
        hi = hi + Math.imul(ah5, bh2) | 0;
        lo = lo + Math.imul(al4, bl3) | 0;
        mid = mid + Math.imul(al4, bh3) | 0;
        mid = mid + Math.imul(ah4, bl3) | 0;
        hi = hi + Math.imul(ah4, bh3) | 0;
        lo = lo + Math.imul(al3, bl4) | 0;
        mid = mid + Math.imul(al3, bh4) | 0;
        mid = mid + Math.imul(ah3, bl4) | 0;
        hi = hi + Math.imul(ah3, bh4) | 0;
        lo = lo + Math.imul(al2, bl5) | 0;
        mid = mid + Math.imul(al2, bh5) | 0;
        mid = mid + Math.imul(ah2, bl5) | 0;
        hi = hi + Math.imul(ah2, bh5) | 0;
        lo = lo + Math.imul(al1, bl6) | 0;
        mid = mid + Math.imul(al1, bh6) | 0;
        mid = mid + Math.imul(ah1, bl6) | 0;
        hi = hi + Math.imul(ah1, bh6) | 0;
        lo = lo + Math.imul(al0, bl7) | 0;
        mid = mid + Math.imul(al0, bh7) | 0;
        mid = mid + Math.imul(ah0, bl7) | 0;
        hi = hi + Math.imul(ah0, bh7) | 0;
        var w7 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w7 >>> 26) | 0;
        w7 &= 67108863;
        lo = Math.imul(al8, bl0);
        mid = Math.imul(al8, bh0);
        mid = mid + Math.imul(ah8, bl0) | 0;
        hi = Math.imul(ah8, bh0);
        lo = lo + Math.imul(al7, bl1) | 0;
        mid = mid + Math.imul(al7, bh1) | 0;
        mid = mid + Math.imul(ah7, bl1) | 0;
        hi = hi + Math.imul(ah7, bh1) | 0;
        lo = lo + Math.imul(al6, bl2) | 0;
        mid = mid + Math.imul(al6, bh2) | 0;
        mid = mid + Math.imul(ah6, bl2) | 0;
        hi = hi + Math.imul(ah6, bh2) | 0;
        lo = lo + Math.imul(al5, bl3) | 0;
        mid = mid + Math.imul(al5, bh3) | 0;
        mid = mid + Math.imul(ah5, bl3) | 0;
        hi = hi + Math.imul(ah5, bh3) | 0;
        lo = lo + Math.imul(al4, bl4) | 0;
        mid = mid + Math.imul(al4, bh4) | 0;
        mid = mid + Math.imul(ah4, bl4) | 0;
        hi = hi + Math.imul(ah4, bh4) | 0;
        lo = lo + Math.imul(al3, bl5) | 0;
        mid = mid + Math.imul(al3, bh5) | 0;
        mid = mid + Math.imul(ah3, bl5) | 0;
        hi = hi + Math.imul(ah3, bh5) | 0;
        lo = lo + Math.imul(al2, bl6) | 0;
        mid = mid + Math.imul(al2, bh6) | 0;
        mid = mid + Math.imul(ah2, bl6) | 0;
        hi = hi + Math.imul(ah2, bh6) | 0;
        lo = lo + Math.imul(al1, bl7) | 0;
        mid = mid + Math.imul(al1, bh7) | 0;
        mid = mid + Math.imul(ah1, bl7) | 0;
        hi = hi + Math.imul(ah1, bh7) | 0;
        lo = lo + Math.imul(al0, bl8) | 0;
        mid = mid + Math.imul(al0, bh8) | 0;
        mid = mid + Math.imul(ah0, bl8) | 0;
        hi = hi + Math.imul(ah0, bh8) | 0;
        var w8 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w8 >>> 26) | 0;
        w8 &= 67108863;
        lo = Math.imul(al9, bl0);
        mid = Math.imul(al9, bh0);
        mid = mid + Math.imul(ah9, bl0) | 0;
        hi = Math.imul(ah9, bh0);
        lo = lo + Math.imul(al8, bl1) | 0;
        mid = mid + Math.imul(al8, bh1) | 0;
        mid = mid + Math.imul(ah8, bl1) | 0;
        hi = hi + Math.imul(ah8, bh1) | 0;
        lo = lo + Math.imul(al7, bl2) | 0;
        mid = mid + Math.imul(al7, bh2) | 0;
        mid = mid + Math.imul(ah7, bl2) | 0;
        hi = hi + Math.imul(ah7, bh2) | 0;
        lo = lo + Math.imul(al6, bl3) | 0;
        mid = mid + Math.imul(al6, bh3) | 0;
        mid = mid + Math.imul(ah6, bl3) | 0;
        hi = hi + Math.imul(ah6, bh3) | 0;
        lo = lo + Math.imul(al5, bl4) | 0;
        mid = mid + Math.imul(al5, bh4) | 0;
        mid = mid + Math.imul(ah5, bl4) | 0;
        hi = hi + Math.imul(ah5, bh4) | 0;
        lo = lo + Math.imul(al4, bl5) | 0;
        mid = mid + Math.imul(al4, bh5) | 0;
        mid = mid + Math.imul(ah4, bl5) | 0;
        hi = hi + Math.imul(ah4, bh5) | 0;
        lo = lo + Math.imul(al3, bl6) | 0;
        mid = mid + Math.imul(al3, bh6) | 0;
        mid = mid + Math.imul(ah3, bl6) | 0;
        hi = hi + Math.imul(ah3, bh6) | 0;
        lo = lo + Math.imul(al2, bl7) | 0;
        mid = mid + Math.imul(al2, bh7) | 0;
        mid = mid + Math.imul(ah2, bl7) | 0;
        hi = hi + Math.imul(ah2, bh7) | 0;
        lo = lo + Math.imul(al1, bl8) | 0;
        mid = mid + Math.imul(al1, bh8) | 0;
        mid = mid + Math.imul(ah1, bl8) | 0;
        hi = hi + Math.imul(ah1, bh8) | 0;
        lo = lo + Math.imul(al0, bl9) | 0;
        mid = mid + Math.imul(al0, bh9) | 0;
        mid = mid + Math.imul(ah0, bl9) | 0;
        hi = hi + Math.imul(ah0, bh9) | 0;
        var w9 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w9 >>> 26) | 0;
        w9 &= 67108863;
        lo = Math.imul(al9, bl1);
        mid = Math.imul(al9, bh1);
        mid = mid + Math.imul(ah9, bl1) | 0;
        hi = Math.imul(ah9, bh1);
        lo = lo + Math.imul(al8, bl2) | 0;
        mid = mid + Math.imul(al8, bh2) | 0;
        mid = mid + Math.imul(ah8, bl2) | 0;
        hi = hi + Math.imul(ah8, bh2) | 0;
        lo = lo + Math.imul(al7, bl3) | 0;
        mid = mid + Math.imul(al7, bh3) | 0;
        mid = mid + Math.imul(ah7, bl3) | 0;
        hi = hi + Math.imul(ah7, bh3) | 0;
        lo = lo + Math.imul(al6, bl4) | 0;
        mid = mid + Math.imul(al6, bh4) | 0;
        mid = mid + Math.imul(ah6, bl4) | 0;
        hi = hi + Math.imul(ah6, bh4) | 0;
        lo = lo + Math.imul(al5, bl5) | 0;
        mid = mid + Math.imul(al5, bh5) | 0;
        mid = mid + Math.imul(ah5, bl5) | 0;
        hi = hi + Math.imul(ah5, bh5) | 0;
        lo = lo + Math.imul(al4, bl6) | 0;
        mid = mid + Math.imul(al4, bh6) | 0;
        mid = mid + Math.imul(ah4, bl6) | 0;
        hi = hi + Math.imul(ah4, bh6) | 0;
        lo = lo + Math.imul(al3, bl7) | 0;
        mid = mid + Math.imul(al3, bh7) | 0;
        mid = mid + Math.imul(ah3, bl7) | 0;
        hi = hi + Math.imul(ah3, bh7) | 0;
        lo = lo + Math.imul(al2, bl8) | 0;
        mid = mid + Math.imul(al2, bh8) | 0;
        mid = mid + Math.imul(ah2, bl8) | 0;
        hi = hi + Math.imul(ah2, bh8) | 0;
        lo = lo + Math.imul(al1, bl9) | 0;
        mid = mid + Math.imul(al1, bh9) | 0;
        mid = mid + Math.imul(ah1, bl9) | 0;
        hi = hi + Math.imul(ah1, bh9) | 0;
        var w10 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w10 >>> 26) | 0;
        w10 &= 67108863;
        lo = Math.imul(al9, bl2);
        mid = Math.imul(al9, bh2);
        mid = mid + Math.imul(ah9, bl2) | 0;
        hi = Math.imul(ah9, bh2);
        lo = lo + Math.imul(al8, bl3) | 0;
        mid = mid + Math.imul(al8, bh3) | 0;
        mid = mid + Math.imul(ah8, bl3) | 0;
        hi = hi + Math.imul(ah8, bh3) | 0;
        lo = lo + Math.imul(al7, bl4) | 0;
        mid = mid + Math.imul(al7, bh4) | 0;
        mid = mid + Math.imul(ah7, bl4) | 0;
        hi = hi + Math.imul(ah7, bh4) | 0;
        lo = lo + Math.imul(al6, bl5) | 0;
        mid = mid + Math.imul(al6, bh5) | 0;
        mid = mid + Math.imul(ah6, bl5) | 0;
        hi = hi + Math.imul(ah6, bh5) | 0;
        lo = lo + Math.imul(al5, bl6) | 0;
        mid = mid + Math.imul(al5, bh6) | 0;
        mid = mid + Math.imul(ah5, bl6) | 0;
        hi = hi + Math.imul(ah5, bh6) | 0;
        lo = lo + Math.imul(al4, bl7) | 0;
        mid = mid + Math.imul(al4, bh7) | 0;
        mid = mid + Math.imul(ah4, bl7) | 0;
        hi = hi + Math.imul(ah4, bh7) | 0;
        lo = lo + Math.imul(al3, bl8) | 0;
        mid = mid + Math.imul(al3, bh8) | 0;
        mid = mid + Math.imul(ah3, bl8) | 0;
        hi = hi + Math.imul(ah3, bh8) | 0;
        lo = lo + Math.imul(al2, bl9) | 0;
        mid = mid + Math.imul(al2, bh9) | 0;
        mid = mid + Math.imul(ah2, bl9) | 0;
        hi = hi + Math.imul(ah2, bh9) | 0;
        var w11 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w11 >>> 26) | 0;
        w11 &= 67108863;
        lo = Math.imul(al9, bl3);
        mid = Math.imul(al9, bh3);
        mid = mid + Math.imul(ah9, bl3) | 0;
        hi = Math.imul(ah9, bh3);
        lo = lo + Math.imul(al8, bl4) | 0;
        mid = mid + Math.imul(al8, bh4) | 0;
        mid = mid + Math.imul(ah8, bl4) | 0;
        hi = hi + Math.imul(ah8, bh4) | 0;
        lo = lo + Math.imul(al7, bl5) | 0;
        mid = mid + Math.imul(al7, bh5) | 0;
        mid = mid + Math.imul(ah7, bl5) | 0;
        hi = hi + Math.imul(ah7, bh5) | 0;
        lo = lo + Math.imul(al6, bl6) | 0;
        mid = mid + Math.imul(al6, bh6) | 0;
        mid = mid + Math.imul(ah6, bl6) | 0;
        hi = hi + Math.imul(ah6, bh6) | 0;
        lo = lo + Math.imul(al5, bl7) | 0;
        mid = mid + Math.imul(al5, bh7) | 0;
        mid = mid + Math.imul(ah5, bl7) | 0;
        hi = hi + Math.imul(ah5, bh7) | 0;
        lo = lo + Math.imul(al4, bl8) | 0;
        mid = mid + Math.imul(al4, bh8) | 0;
        mid = mid + Math.imul(ah4, bl8) | 0;
        hi = hi + Math.imul(ah4, bh8) | 0;
        lo = lo + Math.imul(al3, bl9) | 0;
        mid = mid + Math.imul(al3, bh9) | 0;
        mid = mid + Math.imul(ah3, bl9) | 0;
        hi = hi + Math.imul(ah3, bh9) | 0;
        var w12 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w12 >>> 26) | 0;
        w12 &= 67108863;
        lo = Math.imul(al9, bl4);
        mid = Math.imul(al9, bh4);
        mid = mid + Math.imul(ah9, bl4) | 0;
        hi = Math.imul(ah9, bh4);
        lo = lo + Math.imul(al8, bl5) | 0;
        mid = mid + Math.imul(al8, bh5) | 0;
        mid = mid + Math.imul(ah8, bl5) | 0;
        hi = hi + Math.imul(ah8, bh5) | 0;
        lo = lo + Math.imul(al7, bl6) | 0;
        mid = mid + Math.imul(al7, bh6) | 0;
        mid = mid + Math.imul(ah7, bl6) | 0;
        hi = hi + Math.imul(ah7, bh6) | 0;
        lo = lo + Math.imul(al6, bl7) | 0;
        mid = mid + Math.imul(al6, bh7) | 0;
        mid = mid + Math.imul(ah6, bl7) | 0;
        hi = hi + Math.imul(ah6, bh7) | 0;
        lo = lo + Math.imul(al5, bl8) | 0;
        mid = mid + Math.imul(al5, bh8) | 0;
        mid = mid + Math.imul(ah5, bl8) | 0;
        hi = hi + Math.imul(ah5, bh8) | 0;
        lo = lo + Math.imul(al4, bl9) | 0;
        mid = mid + Math.imul(al4, bh9) | 0;
        mid = mid + Math.imul(ah4, bl9) | 0;
        hi = hi + Math.imul(ah4, bh9) | 0;
        var w13 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w13 >>> 26) | 0;
        w13 &= 67108863;
        lo = Math.imul(al9, bl5);
        mid = Math.imul(al9, bh5);
        mid = mid + Math.imul(ah9, bl5) | 0;
        hi = Math.imul(ah9, bh5);
        lo = lo + Math.imul(al8, bl6) | 0;
        mid = mid + Math.imul(al8, bh6) | 0;
        mid = mid + Math.imul(ah8, bl6) | 0;
        hi = hi + Math.imul(ah8, bh6) | 0;
        lo = lo + Math.imul(al7, bl7) | 0;
        mid = mid + Math.imul(al7, bh7) | 0;
        mid = mid + Math.imul(ah7, bl7) | 0;
        hi = hi + Math.imul(ah7, bh7) | 0;
        lo = lo + Math.imul(al6, bl8) | 0;
        mid = mid + Math.imul(al6, bh8) | 0;
        mid = mid + Math.imul(ah6, bl8) | 0;
        hi = hi + Math.imul(ah6, bh8) | 0;
        lo = lo + Math.imul(al5, bl9) | 0;
        mid = mid + Math.imul(al5, bh9) | 0;
        mid = mid + Math.imul(ah5, bl9) | 0;
        hi = hi + Math.imul(ah5, bh9) | 0;
        var w14 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w14 >>> 26) | 0;
        w14 &= 67108863;
        lo = Math.imul(al9, bl6);
        mid = Math.imul(al9, bh6);
        mid = mid + Math.imul(ah9, bl6) | 0;
        hi = Math.imul(ah9, bh6);
        lo = lo + Math.imul(al8, bl7) | 0;
        mid = mid + Math.imul(al8, bh7) | 0;
        mid = mid + Math.imul(ah8, bl7) | 0;
        hi = hi + Math.imul(ah8, bh7) | 0;
        lo = lo + Math.imul(al7, bl8) | 0;
        mid = mid + Math.imul(al7, bh8) | 0;
        mid = mid + Math.imul(ah7, bl8) | 0;
        hi = hi + Math.imul(ah7, bh8) | 0;
        lo = lo + Math.imul(al6, bl9) | 0;
        mid = mid + Math.imul(al6, bh9) | 0;
        mid = mid + Math.imul(ah6, bl9) | 0;
        hi = hi + Math.imul(ah6, bh9) | 0;
        var w15 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w15 >>> 26) | 0;
        w15 &= 67108863;
        lo = Math.imul(al9, bl7);
        mid = Math.imul(al9, bh7);
        mid = mid + Math.imul(ah9, bl7) | 0;
        hi = Math.imul(ah9, bh7);
        lo = lo + Math.imul(al8, bl8) | 0;
        mid = mid + Math.imul(al8, bh8) | 0;
        mid = mid + Math.imul(ah8, bl8) | 0;
        hi = hi + Math.imul(ah8, bh8) | 0;
        lo = lo + Math.imul(al7, bl9) | 0;
        mid = mid + Math.imul(al7, bh9) | 0;
        mid = mid + Math.imul(ah7, bl9) | 0;
        hi = hi + Math.imul(ah7, bh9) | 0;
        var w16 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w16 >>> 26) | 0;
        w16 &= 67108863;
        lo = Math.imul(al9, bl8);
        mid = Math.imul(al9, bh8);
        mid = mid + Math.imul(ah9, bl8) | 0;
        hi = Math.imul(ah9, bh8);
        lo = lo + Math.imul(al8, bl9) | 0;
        mid = mid + Math.imul(al8, bh9) | 0;
        mid = mid + Math.imul(ah8, bl9) | 0;
        hi = hi + Math.imul(ah8, bh9) | 0;
        var w17 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w17 >>> 26) | 0;
        w17 &= 67108863;
        lo = Math.imul(al9, bl9);
        mid = Math.imul(al9, bh9);
        mid = mid + Math.imul(ah9, bl9) | 0;
        hi = Math.imul(ah9, bh9);
        var w18 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w18 >>> 26) | 0;
        w18 &= 67108863;
        o[0] = w0;
        o[1] = w1;
        o[2] = w2;
        o[3] = w3;
        o[4] = w4;
        o[5] = w5;
        o[6] = w6;
        o[7] = w7;
        o[8] = w8;
        o[9] = w9;
        o[10] = w10;
        o[11] = w11;
        o[12] = w12;
        o[13] = w13;
        o[14] = w14;
        o[15] = w15;
        o[16] = w16;
        o[17] = w17;
        o[18] = w18;
        if (c !== 0) {
          o[19] = c;
          out.length++;
        }
        return out;
      }, "comb10MulTo");
      if (!Math.imul) {
        comb10MulTo = smallMulTo;
      }
      function bigMulTo(self, num, out) {
        out.negative = num.negative ^ self.negative;
        out.length = self.length + num.length;
        var carry = 0;
        var hncarry = 0;
        for (var k = 0; k < out.length - 1; k++) {
          var ncarry = hncarry;
          hncarry = 0;
          var rword = carry & 67108863;
          var maxJ = Math.min(k, num.length - 1);
          for (var j = Math.max(0, k - self.length + 1); j <= maxJ; j++) {
            var i = k - j;
            var a = self.words[i] | 0;
            var b = num.words[j] | 0;
            var r = a * b;
            var lo = r & 67108863;
            ncarry = ncarry + (r / 67108864 | 0) | 0;
            lo = lo + rword | 0;
            rword = lo & 67108863;
            ncarry = ncarry + (lo >>> 26) | 0;
            hncarry += ncarry >>> 26;
            ncarry &= 67108863;
          }
          out.words[k] = rword;
          carry = ncarry;
          ncarry = hncarry;
        }
        if (carry !== 0) {
          out.words[k] = carry;
        } else {
          out.length--;
        }
        return out.strip();
      }
      __name(bigMulTo, "bigMulTo");
      function jumboMulTo(self, num, out) {
        var fftm = new FFTM();
        return fftm.mulp(self, num, out);
      }
      __name(jumboMulTo, "jumboMulTo");
      BN.prototype.mulTo = /* @__PURE__ */ __name(function mulTo(num, out) {
        var res;
        var len = this.length + num.length;
        if (this.length === 10 && num.length === 10) {
          res = comb10MulTo(this, num, out);
        } else if (len < 63) {
          res = smallMulTo(this, num, out);
        } else if (len < 1024) {
          res = bigMulTo(this, num, out);
        } else {
          res = jumboMulTo(this, num, out);
        }
        return res;
      }, "mulTo");
      function FFTM(x, y) {
        this.x = x;
        this.y = y;
      }
      __name(FFTM, "FFTM");
      FFTM.prototype.makeRBT = /* @__PURE__ */ __name(function makeRBT(N) {
        var t = new Array(N);
        var l = BN.prototype._countBits(N) - 1;
        for (var i = 0; i < N; i++) {
          t[i] = this.revBin(i, l, N);
        }
        return t;
      }, "makeRBT");
      FFTM.prototype.revBin = /* @__PURE__ */ __name(function revBin(x, l, N) {
        if (x === 0 || x === N - 1) return x;
        var rb = 0;
        for (var i = 0; i < l; i++) {
          rb |= (x & 1) << l - i - 1;
          x >>= 1;
        }
        return rb;
      }, "revBin");
      FFTM.prototype.permute = /* @__PURE__ */ __name(function permute(rbt, rws, iws, rtws, itws, N) {
        for (var i = 0; i < N; i++) {
          rtws[i] = rws[rbt[i]];
          itws[i] = iws[rbt[i]];
        }
      }, "permute");
      FFTM.prototype.transform = /* @__PURE__ */ __name(function transform(rws, iws, rtws, itws, N, rbt) {
        this.permute(rbt, rws, iws, rtws, itws, N);
        for (var s = 1; s < N; s <<= 1) {
          var l = s << 1;
          var rtwdf = Math.cos(2 * Math.PI / l);
          var itwdf = Math.sin(2 * Math.PI / l);
          for (var p = 0; p < N; p += l) {
            var rtwdf_ = rtwdf;
            var itwdf_ = itwdf;
            for (var j = 0; j < s; j++) {
              var re = rtws[p + j];
              var ie = itws[p + j];
              var ro = rtws[p + j + s];
              var io = itws[p + j + s];
              var rx = rtwdf_ * ro - itwdf_ * io;
              io = rtwdf_ * io + itwdf_ * ro;
              ro = rx;
              rtws[p + j] = re + ro;
              itws[p + j] = ie + io;
              rtws[p + j + s] = re - ro;
              itws[p + j + s] = ie - io;
              if (j !== l) {
                rx = rtwdf * rtwdf_ - itwdf * itwdf_;
                itwdf_ = rtwdf * itwdf_ + itwdf * rtwdf_;
                rtwdf_ = rx;
              }
            }
          }
        }
      }, "transform");
      FFTM.prototype.guessLen13b = /* @__PURE__ */ __name(function guessLen13b(n, m) {
        var N = Math.max(m, n) | 1;
        var odd = N & 1;
        var i = 0;
        for (N = N / 2 | 0; N; N = N >>> 1) {
          i++;
        }
        return 1 << i + 1 + odd;
      }, "guessLen13b");
      FFTM.prototype.conjugate = /* @__PURE__ */ __name(function conjugate(rws, iws, N) {
        if (N <= 1) return;
        for (var i = 0; i < N / 2; i++) {
          var t = rws[i];
          rws[i] = rws[N - i - 1];
          rws[N - i - 1] = t;
          t = iws[i];
          iws[i] = -iws[N - i - 1];
          iws[N - i - 1] = -t;
        }
      }, "conjugate");
      FFTM.prototype.normalize13b = /* @__PURE__ */ __name(function normalize13b(ws, N) {
        var carry = 0;
        for (var i = 0; i < N / 2; i++) {
          var w = Math.round(ws[2 * i + 1] / N) * 8192 + Math.round(ws[2 * i] / N) + carry;
          ws[i] = w & 67108863;
          if (w < 67108864) {
            carry = 0;
          } else {
            carry = w / 67108864 | 0;
          }
        }
        return ws;
      }, "normalize13b");
      FFTM.prototype.convert13b = /* @__PURE__ */ __name(function convert13b(ws, len, rws, N) {
        var carry = 0;
        for (var i = 0; i < len; i++) {
          carry = carry + (ws[i] | 0);
          rws[2 * i] = carry & 8191;
          carry = carry >>> 13;
          rws[2 * i + 1] = carry & 8191;
          carry = carry >>> 13;
        }
        for (i = 2 * len; i < N; ++i) {
          rws[i] = 0;
        }
        assert(carry === 0);
        assert((carry & ~8191) === 0);
      }, "convert13b");
      FFTM.prototype.stub = /* @__PURE__ */ __name(function stub(N) {
        var ph = new Array(N);
        for (var i = 0; i < N; i++) {
          ph[i] = 0;
        }
        return ph;
      }, "stub");
      FFTM.prototype.mulp = /* @__PURE__ */ __name(function mulp(x, y, out) {
        var N = 2 * this.guessLen13b(x.length, y.length);
        var rbt = this.makeRBT(N);
        var _ = this.stub(N);
        var rws = new Array(N);
        var rwst = new Array(N);
        var iwst = new Array(N);
        var nrws = new Array(N);
        var nrwst = new Array(N);
        var niwst = new Array(N);
        var rmws = out.words;
        rmws.length = N;
        this.convert13b(x.words, x.length, rws, N);
        this.convert13b(y.words, y.length, nrws, N);
        this.transform(rws, _, rwst, iwst, N, rbt);
        this.transform(nrws, _, nrwst, niwst, N, rbt);
        for (var i = 0; i < N; i++) {
          var rx = rwst[i] * nrwst[i] - iwst[i] * niwst[i];
          iwst[i] = rwst[i] * niwst[i] + iwst[i] * nrwst[i];
          rwst[i] = rx;
        }
        this.conjugate(rwst, iwst, N);
        this.transform(rwst, iwst, rmws, _, N, rbt);
        this.conjugate(rmws, _, N);
        this.normalize13b(rmws, N);
        out.negative = x.negative ^ y.negative;
        out.length = x.length + y.length;
        return out.strip();
      }, "mulp");
      BN.prototype.mul = /* @__PURE__ */ __name(function mul(num) {
        var out = new BN(null);
        out.words = new Array(this.length + num.length);
        return this.mulTo(num, out);
      }, "mul");
      BN.prototype.mulf = /* @__PURE__ */ __name(function mulf(num) {
        var out = new BN(null);
        out.words = new Array(this.length + num.length);
        return jumboMulTo(this, num, out);
      }, "mulf");
      BN.prototype.imul = /* @__PURE__ */ __name(function imul(num) {
        return this.clone().mulTo(num, this);
      }, "imul");
      BN.prototype.imuln = /* @__PURE__ */ __name(function imuln(num) {
        assert(typeof num === "number");
        assert(num < 67108864);
        var carry = 0;
        for (var i = 0; i < this.length; i++) {
          var w = (this.words[i] | 0) * num;
          var lo = (w & 67108863) + (carry & 67108863);
          carry >>= 26;
          carry += w / 67108864 | 0;
          carry += lo >>> 26;
          this.words[i] = lo & 67108863;
        }
        if (carry !== 0) {
          this.words[i] = carry;
          this.length++;
        }
        this.length = num === 0 ? 1 : this.length;
        return this;
      }, "imuln");
      BN.prototype.muln = /* @__PURE__ */ __name(function muln(num) {
        return this.clone().imuln(num);
      }, "muln");
      BN.prototype.sqr = /* @__PURE__ */ __name(function sqr() {
        return this.mul(this);
      }, "sqr");
      BN.prototype.isqr = /* @__PURE__ */ __name(function isqr() {
        return this.imul(this.clone());
      }, "isqr");
      BN.prototype.pow = /* @__PURE__ */ __name(function pow(num) {
        var w = toBitArray(num);
        if (w.length === 0) return new BN(1);
        var res = this;
        for (var i = 0; i < w.length; i++, res = res.sqr()) {
          if (w[i] !== 0) break;
        }
        if (++i < w.length) {
          for (var q = res.sqr(); i < w.length; i++, q = q.sqr()) {
            if (w[i] === 0) continue;
            res = res.mul(q);
          }
        }
        return res;
      }, "pow");
      BN.prototype.iushln = /* @__PURE__ */ __name(function iushln(bits) {
        assert(typeof bits === "number" && bits >= 0);
        var r = bits % 26;
        var s = (bits - r) / 26;
        var carryMask = 67108863 >>> 26 - r << 26 - r;
        var i;
        if (r !== 0) {
          var carry = 0;
          for (i = 0; i < this.length; i++) {
            var newCarry = this.words[i] & carryMask;
            var c = (this.words[i] | 0) - newCarry << r;
            this.words[i] = c | carry;
            carry = newCarry >>> 26 - r;
          }
          if (carry) {
            this.words[i] = carry;
            this.length++;
          }
        }
        if (s !== 0) {
          for (i = this.length - 1; i >= 0; i--) {
            this.words[i + s] = this.words[i];
          }
          for (i = 0; i < s; i++) {
            this.words[i] = 0;
          }
          this.length += s;
        }
        return this.strip();
      }, "iushln");
      BN.prototype.ishln = /* @__PURE__ */ __name(function ishln(bits) {
        assert(this.negative === 0);
        return this.iushln(bits);
      }, "ishln");
      BN.prototype.iushrn = /* @__PURE__ */ __name(function iushrn(bits, hint, extended) {
        assert(typeof bits === "number" && bits >= 0);
        var h;
        if (hint) {
          h = (hint - hint % 26) / 26;
        } else {
          h = 0;
        }
        var r = bits % 26;
        var s = Math.min((bits - r) / 26, this.length);
        var mask = 67108863 ^ 67108863 >>> r << r;
        var maskedWords = extended;
        h -= s;
        h = Math.max(0, h);
        if (maskedWords) {
          for (var i = 0; i < s; i++) {
            maskedWords.words[i] = this.words[i];
          }
          maskedWords.length = s;
        }
        if (s === 0) {
        } else if (this.length > s) {
          this.length -= s;
          for (i = 0; i < this.length; i++) {
            this.words[i] = this.words[i + s];
          }
        } else {
          this.words[0] = 0;
          this.length = 1;
        }
        var carry = 0;
        for (i = this.length - 1; i >= 0 && (carry !== 0 || i >= h); i--) {
          var word = this.words[i] | 0;
          this.words[i] = carry << 26 - r | word >>> r;
          carry = word & mask;
        }
        if (maskedWords && carry !== 0) {
          maskedWords.words[maskedWords.length++] = carry;
        }
        if (this.length === 0) {
          this.words[0] = 0;
          this.length = 1;
        }
        return this.strip();
      }, "iushrn");
      BN.prototype.ishrn = /* @__PURE__ */ __name(function ishrn(bits, hint, extended) {
        assert(this.negative === 0);
        return this.iushrn(bits, hint, extended);
      }, "ishrn");
      BN.prototype.shln = /* @__PURE__ */ __name(function shln(bits) {
        return this.clone().ishln(bits);
      }, "shln");
      BN.prototype.ushln = /* @__PURE__ */ __name(function ushln(bits) {
        return this.clone().iushln(bits);
      }, "ushln");
      BN.prototype.shrn = /* @__PURE__ */ __name(function shrn(bits) {
        return this.clone().ishrn(bits);
      }, "shrn");
      BN.prototype.ushrn = /* @__PURE__ */ __name(function ushrn(bits) {
        return this.clone().iushrn(bits);
      }, "ushrn");
      BN.prototype.testn = /* @__PURE__ */ __name(function testn(bit) {
        assert(typeof bit === "number" && bit >= 0);
        var r = bit % 26;
        var s = (bit - r) / 26;
        var q = 1 << r;
        if (this.length <= s) return false;
        var w = this.words[s];
        return !!(w & q);
      }, "testn");
      BN.prototype.imaskn = /* @__PURE__ */ __name(function imaskn(bits) {
        assert(typeof bits === "number" && bits >= 0);
        var r = bits % 26;
        var s = (bits - r) / 26;
        assert(this.negative === 0, "imaskn works only with positive numbers");
        if (this.length <= s) {
          return this;
        }
        if (r !== 0) {
          s++;
        }
        this.length = Math.min(s, this.length);
        if (r !== 0) {
          var mask = 67108863 ^ 67108863 >>> r << r;
          this.words[this.length - 1] &= mask;
        }
        if (this.length === 0) {
          this.words[0] = 0;
          this.length = 1;
        }
        return this.strip();
      }, "imaskn");
      BN.prototype.maskn = /* @__PURE__ */ __name(function maskn(bits) {
        return this.clone().imaskn(bits);
      }, "maskn");
      BN.prototype.iaddn = /* @__PURE__ */ __name(function iaddn(num) {
        assert(typeof num === "number");
        assert(num < 67108864);
        if (num < 0) return this.isubn(-num);
        if (this.negative !== 0) {
          if (this.length === 1 && (this.words[0] | 0) < num) {
            this.words[0] = num - (this.words[0] | 0);
            this.negative = 0;
            return this;
          }
          this.negative = 0;
          this.isubn(num);
          this.negative = 1;
          return this;
        }
        return this._iaddn(num);
      }, "iaddn");
      BN.prototype._iaddn = /* @__PURE__ */ __name(function _iaddn(num) {
        this.words[0] += num;
        for (var i = 0; i < this.length && this.words[i] >= 67108864; i++) {
          this.words[i] -= 67108864;
          if (i === this.length - 1) {
            this.words[i + 1] = 1;
          } else {
            this.words[i + 1]++;
          }
        }
        this.length = Math.max(this.length, i + 1);
        return this;
      }, "_iaddn");
      BN.prototype.isubn = /* @__PURE__ */ __name(function isubn(num) {
        assert(typeof num === "number");
        assert(num < 67108864);
        if (num < 0) return this.iaddn(-num);
        if (this.negative !== 0) {
          this.negative = 0;
          this.iaddn(num);
          this.negative = 1;
          return this;
        }
        this.words[0] -= num;
        if (this.length === 1 && this.words[0] < 0) {
          this.words[0] = -this.words[0];
          this.negative = 1;
        } else {
          for (var i = 0; i < this.length && this.words[i] < 0; i++) {
            this.words[i] += 67108864;
            this.words[i + 1] -= 1;
          }
        }
        return this.strip();
      }, "isubn");
      BN.prototype.addn = /* @__PURE__ */ __name(function addn(num) {
        return this.clone().iaddn(num);
      }, "addn");
      BN.prototype.subn = /* @__PURE__ */ __name(function subn(num) {
        return this.clone().isubn(num);
      }, "subn");
      BN.prototype.iabs = /* @__PURE__ */ __name(function iabs() {
        this.negative = 0;
        return this;
      }, "iabs");
      BN.prototype.abs = /* @__PURE__ */ __name(function abs() {
        return this.clone().iabs();
      }, "abs");
      BN.prototype._ishlnsubmul = /* @__PURE__ */ __name(function _ishlnsubmul(num, mul, shift) {
        var len = num.length + shift;
        var i;
        this._expand(len);
        var w;
        var carry = 0;
        for (i = 0; i < num.length; i++) {
          w = (this.words[i + shift] | 0) + carry;
          var right = (num.words[i] | 0) * mul;
          w -= right & 67108863;
          carry = (w >> 26) - (right / 67108864 | 0);
          this.words[i + shift] = w & 67108863;
        }
        for (; i < this.length - shift; i++) {
          w = (this.words[i + shift] | 0) + carry;
          carry = w >> 26;
          this.words[i + shift] = w & 67108863;
        }
        if (carry === 0) return this.strip();
        assert(carry === -1);
        carry = 0;
        for (i = 0; i < this.length; i++) {
          w = -(this.words[i] | 0) + carry;
          carry = w >> 26;
          this.words[i] = w & 67108863;
        }
        this.negative = 1;
        return this.strip();
      }, "_ishlnsubmul");
      BN.prototype._wordDiv = /* @__PURE__ */ __name(function _wordDiv(num, mode) {
        var shift = this.length - num.length;
        var a = this.clone();
        var b = num;
        var bhi = b.words[b.length - 1] | 0;
        var bhiBits = this._countBits(bhi);
        shift = 26 - bhiBits;
        if (shift !== 0) {
          b = b.ushln(shift);
          a.iushln(shift);
          bhi = b.words[b.length - 1] | 0;
        }
        var m = a.length - b.length;
        var q;
        if (mode !== "mod") {
          q = new BN(null);
          q.length = m + 1;
          q.words = new Array(q.length);
          for (var i = 0; i < q.length; i++) {
            q.words[i] = 0;
          }
        }
        var diff = a.clone()._ishlnsubmul(b, 1, m);
        if (diff.negative === 0) {
          a = diff;
          if (q) {
            q.words[m] = 1;
          }
        }
        for (var j = m - 1; j >= 0; j--) {
          var qj = (a.words[b.length + j] | 0) * 67108864 + (a.words[b.length + j - 1] | 0);
          qj = Math.min(qj / bhi | 0, 67108863);
          a._ishlnsubmul(b, qj, j);
          while (a.negative !== 0) {
            qj--;
            a.negative = 0;
            a._ishlnsubmul(b, 1, j);
            if (!a.isZero()) {
              a.negative ^= 1;
            }
          }
          if (q) {
            q.words[j] = qj;
          }
        }
        if (q) {
          q.strip();
        }
        a.strip();
        if (mode !== "div" && shift !== 0) {
          a.iushrn(shift);
        }
        return {
          div: q || null,
          mod: a
        };
      }, "_wordDiv");
      BN.prototype.divmod = /* @__PURE__ */ __name(function divmod(num, mode, positive) {
        assert(!num.isZero());
        if (this.isZero()) {
          return {
            div: new BN(0),
            mod: new BN(0)
          };
        }
        var div, mod, res;
        if (this.negative !== 0 && num.negative === 0) {
          res = this.neg().divmod(num, mode);
          if (mode !== "mod") {
            div = res.div.neg();
          }
          if (mode !== "div") {
            mod = res.mod.neg();
            if (positive && mod.negative !== 0) {
              mod.iadd(num);
            }
          }
          return {
            div,
            mod
          };
        }
        if (this.negative === 0 && num.negative !== 0) {
          res = this.divmod(num.neg(), mode);
          if (mode !== "mod") {
            div = res.div.neg();
          }
          return {
            div,
            mod: res.mod
          };
        }
        if ((this.negative & num.negative) !== 0) {
          res = this.neg().divmod(num.neg(), mode);
          if (mode !== "div") {
            mod = res.mod.neg();
            if (positive && mod.negative !== 0) {
              mod.isub(num);
            }
          }
          return {
            div: res.div,
            mod
          };
        }
        if (num.length > this.length || this.cmp(num) < 0) {
          return {
            div: new BN(0),
            mod: this
          };
        }
        if (num.length === 1) {
          if (mode === "div") {
            return {
              div: this.divn(num.words[0]),
              mod: null
            };
          }
          if (mode === "mod") {
            return {
              div: null,
              mod: new BN(this.modn(num.words[0]))
            };
          }
          return {
            div: this.divn(num.words[0]),
            mod: new BN(this.modn(num.words[0]))
          };
        }
        return this._wordDiv(num, mode);
      }, "divmod");
      BN.prototype.div = /* @__PURE__ */ __name(function div(num) {
        return this.divmod(num, "div", false).div;
      }, "div");
      BN.prototype.mod = /* @__PURE__ */ __name(function mod(num) {
        return this.divmod(num, "mod", false).mod;
      }, "mod");
      BN.prototype.umod = /* @__PURE__ */ __name(function umod(num) {
        return this.divmod(num, "mod", true).mod;
      }, "umod");
      BN.prototype.divRound = /* @__PURE__ */ __name(function divRound(num) {
        var dm = this.divmod(num);
        if (dm.mod.isZero()) return dm.div;
        var mod = dm.div.negative !== 0 ? dm.mod.isub(num) : dm.mod;
        var half = num.ushrn(1);
        var r2 = num.andln(1);
        var cmp = mod.cmp(half);
        if (cmp < 0 || r2 === 1 && cmp === 0) return dm.div;
        return dm.div.negative !== 0 ? dm.div.isubn(1) : dm.div.iaddn(1);
      }, "divRound");
      BN.prototype.modn = /* @__PURE__ */ __name(function modn(num) {
        assert(num <= 67108863);
        var p = (1 << 26) % num;
        var acc = 0;
        for (var i = this.length - 1; i >= 0; i--) {
          acc = (p * acc + (this.words[i] | 0)) % num;
        }
        return acc;
      }, "modn");
      BN.prototype.idivn = /* @__PURE__ */ __name(function idivn(num) {
        assert(num <= 67108863);
        var carry = 0;
        for (var i = this.length - 1; i >= 0; i--) {
          var w = (this.words[i] | 0) + carry * 67108864;
          this.words[i] = w / num | 0;
          carry = w % num;
        }
        return this.strip();
      }, "idivn");
      BN.prototype.divn = /* @__PURE__ */ __name(function divn(num) {
        return this.clone().idivn(num);
      }, "divn");
      BN.prototype.egcd = /* @__PURE__ */ __name(function egcd(p) {
        assert(p.negative === 0);
        assert(!p.isZero());
        var x = this;
        var y = p.clone();
        if (x.negative !== 0) {
          x = x.umod(p);
        } else {
          x = x.clone();
        }
        var A = new BN(1);
        var B = new BN(0);
        var C = new BN(0);
        var D = new BN(1);
        var g = 0;
        while (x.isEven() && y.isEven()) {
          x.iushrn(1);
          y.iushrn(1);
          ++g;
        }
        var yp = y.clone();
        var xp = x.clone();
        while (!x.isZero()) {
          for (var i = 0, im = 1; (x.words[0] & im) === 0 && i < 26; ++i, im <<= 1) ;
          if (i > 0) {
            x.iushrn(i);
            while (i-- > 0) {
              if (A.isOdd() || B.isOdd()) {
                A.iadd(yp);
                B.isub(xp);
              }
              A.iushrn(1);
              B.iushrn(1);
            }
          }
          for (var j = 0, jm = 1; (y.words[0] & jm) === 0 && j < 26; ++j, jm <<= 1) ;
          if (j > 0) {
            y.iushrn(j);
            while (j-- > 0) {
              if (C.isOdd() || D.isOdd()) {
                C.iadd(yp);
                D.isub(xp);
              }
              C.iushrn(1);
              D.iushrn(1);
            }
          }
          if (x.cmp(y) >= 0) {
            x.isub(y);
            A.isub(C);
            B.isub(D);
          } else {
            y.isub(x);
            C.isub(A);
            D.isub(B);
          }
        }
        return {
          a: C,
          b: D,
          gcd: y.iushln(g)
        };
      }, "egcd");
      BN.prototype._invmp = /* @__PURE__ */ __name(function _invmp(p) {
        assert(p.negative === 0);
        assert(!p.isZero());
        var a = this;
        var b = p.clone();
        if (a.negative !== 0) {
          a = a.umod(p);
        } else {
          a = a.clone();
        }
        var x1 = new BN(1);
        var x2 = new BN(0);
        var delta = b.clone();
        while (a.cmpn(1) > 0 && b.cmpn(1) > 0) {
          for (var i = 0, im = 1; (a.words[0] & im) === 0 && i < 26; ++i, im <<= 1) ;
          if (i > 0) {
            a.iushrn(i);
            while (i-- > 0) {
              if (x1.isOdd()) {
                x1.iadd(delta);
              }
              x1.iushrn(1);
            }
          }
          for (var j = 0, jm = 1; (b.words[0] & jm) === 0 && j < 26; ++j, jm <<= 1) ;
          if (j > 0) {
            b.iushrn(j);
            while (j-- > 0) {
              if (x2.isOdd()) {
                x2.iadd(delta);
              }
              x2.iushrn(1);
            }
          }
          if (a.cmp(b) >= 0) {
            a.isub(b);
            x1.isub(x2);
          } else {
            b.isub(a);
            x2.isub(x1);
          }
        }
        var res;
        if (a.cmpn(1) === 0) {
          res = x1;
        } else {
          res = x2;
        }
        if (res.cmpn(0) < 0) {
          res.iadd(p);
        }
        return res;
      }, "_invmp");
      BN.prototype.gcd = /* @__PURE__ */ __name(function gcd(num) {
        if (this.isZero()) return num.abs();
        if (num.isZero()) return this.abs();
        var a = this.clone();
        var b = num.clone();
        a.negative = 0;
        b.negative = 0;
        for (var shift = 0; a.isEven() && b.isEven(); shift++) {
          a.iushrn(1);
          b.iushrn(1);
        }
        do {
          while (a.isEven()) {
            a.iushrn(1);
          }
          while (b.isEven()) {
            b.iushrn(1);
          }
          var r = a.cmp(b);
          if (r < 0) {
            var t = a;
            a = b;
            b = t;
          } else if (r === 0 || b.cmpn(1) === 0) {
            break;
          }
          a.isub(b);
        } while (true);
        return b.iushln(shift);
      }, "gcd");
      BN.prototype.invm = /* @__PURE__ */ __name(function invm(num) {
        return this.egcd(num).a.umod(num);
      }, "invm");
      BN.prototype.isEven = /* @__PURE__ */ __name(function isEven() {
        return (this.words[0] & 1) === 0;
      }, "isEven");
      BN.prototype.isOdd = /* @__PURE__ */ __name(function isOdd() {
        return (this.words[0] & 1) === 1;
      }, "isOdd");
      BN.prototype.andln = /* @__PURE__ */ __name(function andln(num) {
        return this.words[0] & num;
      }, "andln");
      BN.prototype.bincn = /* @__PURE__ */ __name(function bincn(bit) {
        assert(typeof bit === "number");
        var r = bit % 26;
        var s = (bit - r) / 26;
        var q = 1 << r;
        if (this.length <= s) {
          this._expand(s + 1);
          this.words[s] |= q;
          return this;
        }
        var carry = q;
        for (var i = s; carry !== 0 && i < this.length; i++) {
          var w = this.words[i] | 0;
          w += carry;
          carry = w >>> 26;
          w &= 67108863;
          this.words[i] = w;
        }
        if (carry !== 0) {
          this.words[i] = carry;
          this.length++;
        }
        return this;
      }, "bincn");
      BN.prototype.isZero = /* @__PURE__ */ __name(function isZero() {
        return this.length === 1 && this.words[0] === 0;
      }, "isZero");
      BN.prototype.cmpn = /* @__PURE__ */ __name(function cmpn(num) {
        var negative = num < 0;
        if (this.negative !== 0 && !negative) return -1;
        if (this.negative === 0 && negative) return 1;
        this.strip();
        var res;
        if (this.length > 1) {
          res = 1;
        } else {
          if (negative) {
            num = -num;
          }
          assert(num <= 67108863, "Number is too big");
          var w = this.words[0] | 0;
          res = w === num ? 0 : w < num ? -1 : 1;
        }
        if (this.negative !== 0) return -res | 0;
        return res;
      }, "cmpn");
      BN.prototype.cmp = /* @__PURE__ */ __name(function cmp(num) {
        if (this.negative !== 0 && num.negative === 0) return -1;
        if (this.negative === 0 && num.negative !== 0) return 1;
        var res = this.ucmp(num);
        if (this.negative !== 0) return -res | 0;
        return res;
      }, "cmp");
      BN.prototype.ucmp = /* @__PURE__ */ __name(function ucmp(num) {
        if (this.length > num.length) return 1;
        if (this.length < num.length) return -1;
        var res = 0;
        for (var i = this.length - 1; i >= 0; i--) {
          var a = this.words[i] | 0;
          var b = num.words[i] | 0;
          if (a === b) continue;
          if (a < b) {
            res = -1;
          } else if (a > b) {
            res = 1;
          }
          break;
        }
        return res;
      }, "ucmp");
      BN.prototype.gtn = /* @__PURE__ */ __name(function gtn(num) {
        return this.cmpn(num) === 1;
      }, "gtn");
      BN.prototype.gt = /* @__PURE__ */ __name(function gt(num) {
        return this.cmp(num) === 1;
      }, "gt");
      BN.prototype.gten = /* @__PURE__ */ __name(function gten(num) {
        return this.cmpn(num) >= 0;
      }, "gten");
      BN.prototype.gte = /* @__PURE__ */ __name(function gte(num) {
        return this.cmp(num) >= 0;
      }, "gte");
      BN.prototype.ltn = /* @__PURE__ */ __name(function ltn(num) {
        return this.cmpn(num) === -1;
      }, "ltn");
      BN.prototype.lt = /* @__PURE__ */ __name(function lt(num) {
        return this.cmp(num) === -1;
      }, "lt");
      BN.prototype.lten = /* @__PURE__ */ __name(function lten(num) {
        return this.cmpn(num) <= 0;
      }, "lten");
      BN.prototype.lte = /* @__PURE__ */ __name(function lte(num) {
        return this.cmp(num) <= 0;
      }, "lte");
      BN.prototype.eqn = /* @__PURE__ */ __name(function eqn(num) {
        return this.cmpn(num) === 0;
      }, "eqn");
      BN.prototype.eq = /* @__PURE__ */ __name(function eq(num) {
        return this.cmp(num) === 0;
      }, "eq");
      BN.red = /* @__PURE__ */ __name(function red(num) {
        return new Red(num);
      }, "red");
      BN.prototype.toRed = /* @__PURE__ */ __name(function toRed(ctx) {
        assert(!this.red, "Already a number in reduction context");
        assert(this.negative === 0, "red works only with positives");
        return ctx.convertTo(this)._forceRed(ctx);
      }, "toRed");
      BN.prototype.fromRed = /* @__PURE__ */ __name(function fromRed() {
        assert(this.red, "fromRed works only with numbers in reduction context");
        return this.red.convertFrom(this);
      }, "fromRed");
      BN.prototype._forceRed = /* @__PURE__ */ __name(function _forceRed(ctx) {
        this.red = ctx;
        return this;
      }, "_forceRed");
      BN.prototype.forceRed = /* @__PURE__ */ __name(function forceRed(ctx) {
        assert(!this.red, "Already a number in reduction context");
        return this._forceRed(ctx);
      }, "forceRed");
      BN.prototype.redAdd = /* @__PURE__ */ __name(function redAdd(num) {
        assert(this.red, "redAdd works only with red numbers");
        return this.red.add(this, num);
      }, "redAdd");
      BN.prototype.redIAdd = /* @__PURE__ */ __name(function redIAdd(num) {
        assert(this.red, "redIAdd works only with red numbers");
        return this.red.iadd(this, num);
      }, "redIAdd");
      BN.prototype.redSub = /* @__PURE__ */ __name(function redSub(num) {
        assert(this.red, "redSub works only with red numbers");
        return this.red.sub(this, num);
      }, "redSub");
      BN.prototype.redISub = /* @__PURE__ */ __name(function redISub(num) {
        assert(this.red, "redISub works only with red numbers");
        return this.red.isub(this, num);
      }, "redISub");
      BN.prototype.redShl = /* @__PURE__ */ __name(function redShl(num) {
        assert(this.red, "redShl works only with red numbers");
        return this.red.shl(this, num);
      }, "redShl");
      BN.prototype.redMul = /* @__PURE__ */ __name(function redMul(num) {
        assert(this.red, "redMul works only with red numbers");
        this.red._verify2(this, num);
        return this.red.mul(this, num);
      }, "redMul");
      BN.prototype.redIMul = /* @__PURE__ */ __name(function redIMul(num) {
        assert(this.red, "redMul works only with red numbers");
        this.red._verify2(this, num);
        return this.red.imul(this, num);
      }, "redIMul");
      BN.prototype.redSqr = /* @__PURE__ */ __name(function redSqr() {
        assert(this.red, "redSqr works only with red numbers");
        this.red._verify1(this);
        return this.red.sqr(this);
      }, "redSqr");
      BN.prototype.redISqr = /* @__PURE__ */ __name(function redISqr() {
        assert(this.red, "redISqr works only with red numbers");
        this.red._verify1(this);
        return this.red.isqr(this);
      }, "redISqr");
      BN.prototype.redSqrt = /* @__PURE__ */ __name(function redSqrt() {
        assert(this.red, "redSqrt works only with red numbers");
        this.red._verify1(this);
        return this.red.sqrt(this);
      }, "redSqrt");
      BN.prototype.redInvm = /* @__PURE__ */ __name(function redInvm() {
        assert(this.red, "redInvm works only with red numbers");
        this.red._verify1(this);
        return this.red.invm(this);
      }, "redInvm");
      BN.prototype.redNeg = /* @__PURE__ */ __name(function redNeg() {
        assert(this.red, "redNeg works only with red numbers");
        this.red._verify1(this);
        return this.red.neg(this);
      }, "redNeg");
      BN.prototype.redPow = /* @__PURE__ */ __name(function redPow(num) {
        assert(this.red && !num.red, "redPow(normalNum)");
        this.red._verify1(this);
        return this.red.pow(this, num);
      }, "redPow");
      var primes = {
        k256: null,
        p224: null,
        p192: null,
        p25519: null
      };
      function MPrime(name, p) {
        this.name = name;
        this.p = new BN(p, 16);
        this.n = this.p.bitLength();
        this.k = new BN(1).iushln(this.n).isub(this.p);
        this.tmp = this._tmp();
      }
      __name(MPrime, "MPrime");
      MPrime.prototype._tmp = /* @__PURE__ */ __name(function _tmp() {
        var tmp = new BN(null);
        tmp.words = new Array(Math.ceil(this.n / 13));
        return tmp;
      }, "_tmp");
      MPrime.prototype.ireduce = /* @__PURE__ */ __name(function ireduce(num) {
        var r = num;
        var rlen;
        do {
          this.split(r, this.tmp);
          r = this.imulK(r);
          r = r.iadd(this.tmp);
          rlen = r.bitLength();
        } while (rlen > this.n);
        var cmp = rlen < this.n ? -1 : r.ucmp(this.p);
        if (cmp === 0) {
          r.words[0] = 0;
          r.length = 1;
        } else if (cmp > 0) {
          r.isub(this.p);
        } else {
          if (r.strip !== void 0) {
            r.strip();
          } else {
            r._strip();
          }
        }
        return r;
      }, "ireduce");
      MPrime.prototype.split = /* @__PURE__ */ __name(function split(input, out) {
        input.iushrn(this.n, 0, out);
      }, "split");
      MPrime.prototype.imulK = /* @__PURE__ */ __name(function imulK(num) {
        return num.imul(this.k);
      }, "imulK");
      function K256() {
        MPrime.call(
          this,
          "k256",
          "ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f"
        );
      }
      __name(K256, "K256");
      inherits2(K256, MPrime);
      K256.prototype.split = /* @__PURE__ */ __name(function split(input, output) {
        var mask = 4194303;
        var outLen = Math.min(input.length, 9);
        for (var i = 0; i < outLen; i++) {
          output.words[i] = input.words[i];
        }
        output.length = outLen;
        if (input.length <= 9) {
          input.words[0] = 0;
          input.length = 1;
          return;
        }
        var prev = input.words[9];
        output.words[output.length++] = prev & mask;
        for (i = 10; i < input.length; i++) {
          var next = input.words[i] | 0;
          input.words[i - 10] = (next & mask) << 4 | prev >>> 22;
          prev = next;
        }
        prev >>>= 22;
        input.words[i - 10] = prev;
        if (prev === 0 && input.length > 10) {
          input.length -= 10;
        } else {
          input.length -= 9;
        }
      }, "split");
      K256.prototype.imulK = /* @__PURE__ */ __name(function imulK(num) {
        num.words[num.length] = 0;
        num.words[num.length + 1] = 0;
        num.length += 2;
        var lo = 0;
        for (var i = 0; i < num.length; i++) {
          var w = num.words[i] | 0;
          lo += w * 977;
          num.words[i] = lo & 67108863;
          lo = w * 64 + (lo / 67108864 | 0);
        }
        if (num.words[num.length - 1] === 0) {
          num.length--;
          if (num.words[num.length - 1] === 0) {
            num.length--;
          }
        }
        return num;
      }, "imulK");
      function P224() {
        MPrime.call(
          this,
          "p224",
          "ffffffff ffffffff ffffffff ffffffff 00000000 00000000 00000001"
        );
      }
      __name(P224, "P224");
      inherits2(P224, MPrime);
      function P192() {
        MPrime.call(
          this,
          "p192",
          "ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff"
        );
      }
      __name(P192, "P192");
      inherits2(P192, MPrime);
      function P25519() {
        MPrime.call(
          this,
          "25519",
          "7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed"
        );
      }
      __name(P25519, "P25519");
      inherits2(P25519, MPrime);
      P25519.prototype.imulK = /* @__PURE__ */ __name(function imulK(num) {
        var carry = 0;
        for (var i = 0; i < num.length; i++) {
          var hi = (num.words[i] | 0) * 19 + carry;
          var lo = hi & 67108863;
          hi >>>= 26;
          num.words[i] = lo;
          carry = hi;
        }
        if (carry !== 0) {
          num.words[num.length++] = carry;
        }
        return num;
      }, "imulK");
      BN._prime = /* @__PURE__ */ __name(function prime(name) {
        if (primes[name]) return primes[name];
        var prime2;
        if (name === "k256") {
          prime2 = new K256();
        } else if (name === "p224") {
          prime2 = new P224();
        } else if (name === "p192") {
          prime2 = new P192();
        } else if (name === "p25519") {
          prime2 = new P25519();
        } else {
          throw new Error("Unknown prime " + name);
        }
        primes[name] = prime2;
        return prime2;
      }, "prime");
      function Red(m) {
        if (typeof m === "string") {
          var prime = BN._prime(m);
          this.m = prime.p;
          this.prime = prime;
        } else {
          assert(m.gtn(1), "modulus must be greater than 1");
          this.m = m;
          this.prime = null;
        }
      }
      __name(Red, "Red");
      Red.prototype._verify1 = /* @__PURE__ */ __name(function _verify1(a) {
        assert(a.negative === 0, "red works only with positives");
        assert(a.red, "red works only with red numbers");
      }, "_verify1");
      Red.prototype._verify2 = /* @__PURE__ */ __name(function _verify2(a, b) {
        assert((a.negative | b.negative) === 0, "red works only with positives");
        assert(
          a.red && a.red === b.red,
          "red works only with red numbers"
        );
      }, "_verify2");
      Red.prototype.imod = /* @__PURE__ */ __name(function imod(a) {
        if (this.prime) return this.prime.ireduce(a)._forceRed(this);
        return a.umod(this.m)._forceRed(this);
      }, "imod");
      Red.prototype.neg = /* @__PURE__ */ __name(function neg(a) {
        if (a.isZero()) {
          return a.clone();
        }
        return this.m.sub(a)._forceRed(this);
      }, "neg");
      Red.prototype.add = /* @__PURE__ */ __name(function add(a, b) {
        this._verify2(a, b);
        var res = a.add(b);
        if (res.cmp(this.m) >= 0) {
          res.isub(this.m);
        }
        return res._forceRed(this);
      }, "add");
      Red.prototype.iadd = /* @__PURE__ */ __name(function iadd(a, b) {
        this._verify2(a, b);
        var res = a.iadd(b);
        if (res.cmp(this.m) >= 0) {
          res.isub(this.m);
        }
        return res;
      }, "iadd");
      Red.prototype.sub = /* @__PURE__ */ __name(function sub(a, b) {
        this._verify2(a, b);
        var res = a.sub(b);
        if (res.cmpn(0) < 0) {
          res.iadd(this.m);
        }
        return res._forceRed(this);
      }, "sub");
      Red.prototype.isub = /* @__PURE__ */ __name(function isub(a, b) {
        this._verify2(a, b);
        var res = a.isub(b);
        if (res.cmpn(0) < 0) {
          res.iadd(this.m);
        }
        return res;
      }, "isub");
      Red.prototype.shl = /* @__PURE__ */ __name(function shl(a, num) {
        this._verify1(a);
        return this.imod(a.ushln(num));
      }, "shl");
      Red.prototype.imul = /* @__PURE__ */ __name(function imul(a, b) {
        this._verify2(a, b);
        return this.imod(a.imul(b));
      }, "imul");
      Red.prototype.mul = /* @__PURE__ */ __name(function mul(a, b) {
        this._verify2(a, b);
        return this.imod(a.mul(b));
      }, "mul");
      Red.prototype.isqr = /* @__PURE__ */ __name(function isqr(a) {
        return this.imul(a, a.clone());
      }, "isqr");
      Red.prototype.sqr = /* @__PURE__ */ __name(function sqr(a) {
        return this.mul(a, a);
      }, "sqr");
      Red.prototype.sqrt = /* @__PURE__ */ __name(function sqrt(a) {
        if (a.isZero()) return a.clone();
        var mod3 = this.m.andln(3);
        assert(mod3 % 2 === 1);
        if (mod3 === 3) {
          var pow = this.m.add(new BN(1)).iushrn(2);
          return this.pow(a, pow);
        }
        var q = this.m.subn(1);
        var s = 0;
        while (!q.isZero() && q.andln(1) === 0) {
          s++;
          q.iushrn(1);
        }
        assert(!q.isZero());
        var one = new BN(1).toRed(this);
        var nOne = one.redNeg();
        var lpow = this.m.subn(1).iushrn(1);
        var z = this.m.bitLength();
        z = new BN(2 * z * z).toRed(this);
        while (this.pow(z, lpow).cmp(nOne) !== 0) {
          z.redIAdd(nOne);
        }
        var c = this.pow(z, q);
        var r = this.pow(a, q.addn(1).iushrn(1));
        var t = this.pow(a, q);
        var m = s;
        while (t.cmp(one) !== 0) {
          var tmp = t;
          for (var i = 0; tmp.cmp(one) !== 0; i++) {
            tmp = tmp.redSqr();
          }
          assert(i < m);
          var b = this.pow(c, new BN(1).iushln(m - i - 1));
          r = r.redMul(b);
          c = b.redSqr();
          t = t.redMul(c);
          m = i;
        }
        return r;
      }, "sqrt");
      Red.prototype.invm = /* @__PURE__ */ __name(function invm(a) {
        var inv = a._invmp(this.m);
        if (inv.negative !== 0) {
          inv.negative = 0;
          return this.imod(inv).redNeg();
        } else {
          return this.imod(inv);
        }
      }, "invm");
      Red.prototype.pow = /* @__PURE__ */ __name(function pow(a, num) {
        if (num.isZero()) return new BN(1).toRed(this);
        if (num.cmpn(1) === 0) return a.clone();
        var windowSize = 4;
        var wnd = new Array(1 << windowSize);
        wnd[0] = new BN(1).toRed(this);
        wnd[1] = a;
        for (var i = 2; i < wnd.length; i++) {
          wnd[i] = this.mul(wnd[i - 1], a);
        }
        var res = wnd[0];
        var current = 0;
        var currentLen = 0;
        var start = num.bitLength() % 26;
        if (start === 0) {
          start = 26;
        }
        for (i = num.length - 1; i >= 0; i--) {
          var word = num.words[i];
          for (var j = start - 1; j >= 0; j--) {
            var bit = word >> j & 1;
            if (res !== wnd[0]) {
              res = this.sqr(res);
            }
            if (bit === 0 && current === 0) {
              currentLen = 0;
              continue;
            }
            current <<= 1;
            current |= bit;
            currentLen++;
            if (currentLen !== windowSize && (i !== 0 || j !== 0)) continue;
            res = this.mul(res, wnd[current]);
            currentLen = 0;
            current = 0;
          }
          start = 26;
        }
        return res;
      }, "pow");
      Red.prototype.convertTo = /* @__PURE__ */ __name(function convertTo(num) {
        var r = num.umod(this.m);
        return r === num ? r.clone() : r;
      }, "convertTo");
      Red.prototype.convertFrom = /* @__PURE__ */ __name(function convertFrom(num) {
        var res = num.clone();
        res.red = null;
        return res;
      }, "convertFrom");
      BN.mont = /* @__PURE__ */ __name(function mont(num) {
        return new Mont(num);
      }, "mont");
      function Mont(m) {
        Red.call(this, m);
        this.shift = this.m.bitLength();
        if (this.shift % 26 !== 0) {
          this.shift += 26 - this.shift % 26;
        }
        this.r = new BN(1).iushln(this.shift);
        this.r2 = this.imod(this.r.sqr());
        this.rinv = this.r._invmp(this.m);
        this.minv = this.rinv.mul(this.r).isubn(1).div(this.m);
        this.minv = this.minv.umod(this.r);
        this.minv = this.r.sub(this.minv);
      }
      __name(Mont, "Mont");
      inherits2(Mont, Red);
      Mont.prototype.convertTo = /* @__PURE__ */ __name(function convertTo(num) {
        return this.imod(num.ushln(this.shift));
      }, "convertTo");
      Mont.prototype.convertFrom = /* @__PURE__ */ __name(function convertFrom(num) {
        var r = this.imod(num.mul(this.rinv));
        r.red = null;
        return r;
      }, "convertFrom");
      Mont.prototype.imul = /* @__PURE__ */ __name(function imul(a, b) {
        if (a.isZero() || b.isZero()) {
          a.words[0] = 0;
          a.length = 1;
          return a;
        }
        var t = a.imul(b);
        var c = t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m);
        var u = t.isub(c).iushrn(this.shift);
        var res = u;
        if (u.cmp(this.m) >= 0) {
          res = u.isub(this.m);
        } else if (u.cmpn(0) < 0) {
          res = u.iadd(this.m);
        }
        return res._forceRed(this);
      }, "imul");
      Mont.prototype.mul = /* @__PURE__ */ __name(function mul(a, b) {
        if (a.isZero() || b.isZero()) return new BN(0)._forceRed(this);
        var t = a.mul(b);
        var c = t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m);
        var u = t.isub(c).iushrn(this.shift);
        var res = u;
        if (u.cmp(this.m) >= 0) {
          res = u.isub(this.m);
        } else if (u.cmpn(0) < 0) {
          res = u.iadd(this.m);
        }
        return res._forceRed(this);
      }, "mul");
      Mont.prototype.invm = /* @__PURE__ */ __name(function invm(a) {
        var res = this.imod(a._invmp(this.m).mul(this.r2));
        return res._forceRed(this);
      }, "invm");
    })(typeof module === "undefined" || module, exports);
  }
});

// node_modules/unenv/dist/runtime/npm/inherits.mjs
var inherits_exports = {};
__export(inherits_exports, {
  default: () => inherits_default
});
import { inherits } from "node:util";
var inherits_default;
var init_inherits = __esm({
  "node_modules/unenv/dist/runtime/npm/inherits.mjs"() {
    init_modules_watch_stub();
    inherits_default = inherits;
  }
});

// required-unenv-alias:inherits
var require_inherits = __commonJS({
  "required-unenv-alias:inherits"(exports, module) {
    init_modules_watch_stub();
    init_inherits();
    module.exports = Object.entries(inherits_exports).filter(([k]) => k !== "default").reduce(
      (cjs, [k, value]) => Object.defineProperty(cjs, k, { value, enumerable: true }),
      "default" in inherits_exports ? inherits_default : {}
    );
  }
});

// node_modules/safer-buffer/safer.js
var require_safer = __commonJS({
  "node_modules/safer-buffer/safer.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    var buffer = require_buffer();
    var Buffer2 = buffer.Buffer;
    var safer = {};
    var key;
    for (key in buffer) {
      if (!buffer.hasOwnProperty(key)) continue;
      if (key === "SlowBuffer" || key === "Buffer") continue;
      safer[key] = buffer[key];
    }
    var Safer = safer.Buffer = {};
    for (key in Buffer2) {
      if (!Buffer2.hasOwnProperty(key)) continue;
      if (key === "allocUnsafe" || key === "allocUnsafeSlow") continue;
      Safer[key] = Buffer2[key];
    }
    safer.Buffer.prototype = Buffer2.prototype;
    if (!Safer.from || Safer.from === Uint8Array.from) {
      Safer.from = function(value, encodingOrOffset, length) {
        if (typeof value === "number") {
          throw new TypeError('The "value" argument must not be of type number. Received type ' + typeof value);
        }
        if (value && typeof value.length === "undefined") {
          throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof value);
        }
        return Buffer2(value, encodingOrOffset, length);
      };
    }
    if (!Safer.alloc) {
      Safer.alloc = function(size, fill, encoding) {
        if (typeof size !== "number") {
          throw new TypeError('The "size" argument must be of type number. Received type ' + typeof size);
        }
        if (size < 0 || size >= 2 * (1 << 30)) {
          throw new RangeError('The value "' + size + '" is invalid for option "size"');
        }
        var buf = Buffer2(size);
        if (!fill || fill.length === 0) {
          buf.fill(0);
        } else if (typeof encoding === "string") {
          buf.fill(fill, encoding);
        } else {
          buf.fill(fill);
        }
        return buf;
      };
    }
    if (!safer.kStringMaxLength) {
      try {
        safer.kStringMaxLength = process.binding("buffer").kStringMaxLength;
      } catch (e) {
      }
    }
    if (!safer.constants) {
      safer.constants = {
        MAX_LENGTH: safer.kMaxLength
      };
      if (safer.kStringMaxLength) {
        safer.constants.MAX_STRING_LENGTH = safer.kStringMaxLength;
      }
    }
    module.exports = safer;
  }
});

// node_modules/asn1.js/lib/asn1/base/reporter.js
var require_reporter = __commonJS({
  "node_modules/asn1.js/lib/asn1/base/reporter.js"(exports) {
    "use strict";
    init_modules_watch_stub();
    var inherits2 = require_inherits();
    function Reporter(options) {
      this._reporterState = {
        obj: null,
        path: [],
        options: options || {},
        errors: []
      };
    }
    __name(Reporter, "Reporter");
    exports.Reporter = Reporter;
    Reporter.prototype.isError = /* @__PURE__ */ __name(function isError(obj) {
      return obj instanceof ReporterError;
    }, "isError");
    Reporter.prototype.save = /* @__PURE__ */ __name(function save() {
      const state = this._reporterState;
      return { obj: state.obj, pathLen: state.path.length };
    }, "save");
    Reporter.prototype.restore = /* @__PURE__ */ __name(function restore(data) {
      const state = this._reporterState;
      state.obj = data.obj;
      state.path = state.path.slice(0, data.pathLen);
    }, "restore");
    Reporter.prototype.enterKey = /* @__PURE__ */ __name(function enterKey(key) {
      return this._reporterState.path.push(key);
    }, "enterKey");
    Reporter.prototype.exitKey = /* @__PURE__ */ __name(function exitKey(index) {
      const state = this._reporterState;
      state.path = state.path.slice(0, index - 1);
    }, "exitKey");
    Reporter.prototype.leaveKey = /* @__PURE__ */ __name(function leaveKey(index, key, value) {
      const state = this._reporterState;
      this.exitKey(index);
      if (state.obj !== null)
        state.obj[key] = value;
    }, "leaveKey");
    Reporter.prototype.path = /* @__PURE__ */ __name(function path() {
      return this._reporterState.path.join("/");
    }, "path");
    Reporter.prototype.enterObject = /* @__PURE__ */ __name(function enterObject() {
      const state = this._reporterState;
      const prev = state.obj;
      state.obj = {};
      return prev;
    }, "enterObject");
    Reporter.prototype.leaveObject = /* @__PURE__ */ __name(function leaveObject(prev) {
      const state = this._reporterState;
      const now = state.obj;
      state.obj = prev;
      return now;
    }, "leaveObject");
    Reporter.prototype.error = /* @__PURE__ */ __name(function error(msg) {
      let err;
      const state = this._reporterState;
      const inherited = msg instanceof ReporterError;
      if (inherited) {
        err = msg;
      } else {
        err = new ReporterError(state.path.map(function(elem) {
          return "[" + JSON.stringify(elem) + "]";
        }).join(""), msg.message || msg, msg.stack);
      }
      if (!state.options.partial)
        throw err;
      if (!inherited)
        state.errors.push(err);
      return err;
    }, "error");
    Reporter.prototype.wrapResult = /* @__PURE__ */ __name(function wrapResult(result) {
      const state = this._reporterState;
      if (!state.options.partial)
        return result;
      return {
        result: this.isError(result) ? null : result,
        errors: state.errors
      };
    }, "wrapResult");
    function ReporterError(path, msg) {
      this.path = path;
      this.rethrow(msg);
    }
    __name(ReporterError, "ReporterError");
    inherits2(ReporterError, Error);
    ReporterError.prototype.rethrow = /* @__PURE__ */ __name(function rethrow(msg) {
      this.message = msg + " at: " + (this.path || "(shallow)");
      if (Error.captureStackTrace)
        Error.captureStackTrace(this, ReporterError);
      if (!this.stack) {
        try {
          throw new Error(this.message);
        } catch (e) {
          this.stack = e.stack;
        }
      }
      return this;
    }, "rethrow");
  }
});

// node_modules/asn1.js/lib/asn1/base/buffer.js
var require_buffer2 = __commonJS({
  "node_modules/asn1.js/lib/asn1/base/buffer.js"(exports) {
    "use strict";
    init_modules_watch_stub();
    var inherits2 = require_inherits();
    var Reporter = require_reporter().Reporter;
    var Buffer2 = require_safer().Buffer;
    function DecoderBuffer(base, options) {
      Reporter.call(this, options);
      if (!Buffer2.isBuffer(base)) {
        this.error("Input not Buffer");
        return;
      }
      this.base = base;
      this.offset = 0;
      this.length = base.length;
    }
    __name(DecoderBuffer, "DecoderBuffer");
    inherits2(DecoderBuffer, Reporter);
    exports.DecoderBuffer = DecoderBuffer;
    DecoderBuffer.isDecoderBuffer = /* @__PURE__ */ __name(function isDecoderBuffer(data) {
      if (data instanceof DecoderBuffer) {
        return true;
      }
      const isCompatible = typeof data === "object" && Buffer2.isBuffer(data.base) && data.constructor.name === "DecoderBuffer" && typeof data.offset === "number" && typeof data.length === "number" && typeof data.save === "function" && typeof data.restore === "function" && typeof data.isEmpty === "function" && typeof data.readUInt8 === "function" && typeof data.skip === "function" && typeof data.raw === "function";
      return isCompatible;
    }, "isDecoderBuffer");
    DecoderBuffer.prototype.save = /* @__PURE__ */ __name(function save() {
      return { offset: this.offset, reporter: Reporter.prototype.save.call(this) };
    }, "save");
    DecoderBuffer.prototype.restore = /* @__PURE__ */ __name(function restore(save) {
      const res = new DecoderBuffer(this.base);
      res.offset = save.offset;
      res.length = this.offset;
      this.offset = save.offset;
      Reporter.prototype.restore.call(this, save.reporter);
      return res;
    }, "restore");
    DecoderBuffer.prototype.isEmpty = /* @__PURE__ */ __name(function isEmpty() {
      return this.offset === this.length;
    }, "isEmpty");
    DecoderBuffer.prototype.readUInt8 = /* @__PURE__ */ __name(function readUInt8(fail) {
      if (this.offset + 1 <= this.length)
        return this.base.readUInt8(this.offset++, true);
      else
        return this.error(fail || "DecoderBuffer overrun");
    }, "readUInt8");
    DecoderBuffer.prototype.skip = /* @__PURE__ */ __name(function skip(bytes, fail) {
      if (!(this.offset + bytes <= this.length))
        return this.error(fail || "DecoderBuffer overrun");
      const res = new DecoderBuffer(this.base);
      res._reporterState = this._reporterState;
      res.offset = this.offset;
      res.length = this.offset + bytes;
      this.offset += bytes;
      return res;
    }, "skip");
    DecoderBuffer.prototype.raw = /* @__PURE__ */ __name(function raw(save) {
      return this.base.slice(save ? save.offset : this.offset, this.length);
    }, "raw");
    function EncoderBuffer(value, reporter) {
      if (Array.isArray(value)) {
        this.length = 0;
        this.value = value.map(function(item) {
          if (!EncoderBuffer.isEncoderBuffer(item))
            item = new EncoderBuffer(item, reporter);
          this.length += item.length;
          return item;
        }, this);
      } else if (typeof value === "number") {
        if (!(0 <= value && value <= 255))
          return reporter.error("non-byte EncoderBuffer value");
        this.value = value;
        this.length = 1;
      } else if (typeof value === "string") {
        this.value = value;
        this.length = Buffer2.byteLength(value);
      } else if (Buffer2.isBuffer(value)) {
        this.value = value;
        this.length = value.length;
      } else {
        return reporter.error("Unsupported type: " + typeof value);
      }
    }
    __name(EncoderBuffer, "EncoderBuffer");
    exports.EncoderBuffer = EncoderBuffer;
    EncoderBuffer.isEncoderBuffer = /* @__PURE__ */ __name(function isEncoderBuffer(data) {
      if (data instanceof EncoderBuffer) {
        return true;
      }
      const isCompatible = typeof data === "object" && data.constructor.name === "EncoderBuffer" && typeof data.length === "number" && typeof data.join === "function";
      return isCompatible;
    }, "isEncoderBuffer");
    EncoderBuffer.prototype.join = /* @__PURE__ */ __name(function join(out, offset) {
      if (!out)
        out = Buffer2.alloc(this.length);
      if (!offset)
        offset = 0;
      if (this.length === 0)
        return out;
      if (Array.isArray(this.value)) {
        this.value.forEach(function(item) {
          item.join(out, offset);
          offset += item.length;
        });
      } else {
        if (typeof this.value === "number")
          out[offset] = this.value;
        else if (typeof this.value === "string")
          out.write(this.value, offset);
        else if (Buffer2.isBuffer(this.value))
          this.value.copy(out, offset);
        offset += this.length;
      }
      return out;
    }, "join");
  }
});

// node_modules/minimalistic-assert/index.js
var require_minimalistic_assert = __commonJS({
  "node_modules/minimalistic-assert/index.js"(exports, module) {
    init_modules_watch_stub();
    module.exports = assert;
    function assert(val, msg) {
      if (!val)
        throw new Error(msg || "Assertion failed");
    }
    __name(assert, "assert");
    assert.equal = /* @__PURE__ */ __name(function assertEqual(l, r, msg) {
      if (l != r)
        throw new Error(msg || "Assertion failed: " + l + " != " + r);
    }, "assertEqual");
  }
});

// node_modules/asn1.js/lib/asn1/base/node.js
var require_node = __commonJS({
  "node_modules/asn1.js/lib/asn1/base/node.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    var Reporter = require_reporter().Reporter;
    var EncoderBuffer = require_buffer2().EncoderBuffer;
    var DecoderBuffer = require_buffer2().DecoderBuffer;
    var assert = require_minimalistic_assert();
    var tags = [
      "seq",
      "seqof",
      "set",
      "setof",
      "objid",
      "bool",
      "gentime",
      "utctime",
      "null_",
      "enum",
      "int",
      "objDesc",
      "bitstr",
      "bmpstr",
      "charstr",
      "genstr",
      "graphstr",
      "ia5str",
      "iso646str",
      "numstr",
      "octstr",
      "printstr",
      "t61str",
      "unistr",
      "utf8str",
      "videostr"
    ];
    var methods = [
      "key",
      "obj",
      "use",
      "optional",
      "explicit",
      "implicit",
      "def",
      "choice",
      "any",
      "contains"
    ].concat(tags);
    var overrided = [
      "_peekTag",
      "_decodeTag",
      "_use",
      "_decodeStr",
      "_decodeObjid",
      "_decodeTime",
      "_decodeNull",
      "_decodeInt",
      "_decodeBool",
      "_decodeList",
      "_encodeComposite",
      "_encodeStr",
      "_encodeObjid",
      "_encodeTime",
      "_encodeNull",
      "_encodeInt",
      "_encodeBool"
    ];
    function Node(enc, parent, name) {
      const state = {};
      this._baseState = state;
      state.name = name;
      state.enc = enc;
      state.parent = parent || null;
      state.children = null;
      state.tag = null;
      state.args = null;
      state.reverseArgs = null;
      state.choice = null;
      state.optional = false;
      state.any = false;
      state.obj = false;
      state.use = null;
      state.useDecoder = null;
      state.key = null;
      state["default"] = null;
      state.explicit = null;
      state.implicit = null;
      state.contains = null;
      if (!state.parent) {
        state.children = [];
        this._wrap();
      }
    }
    __name(Node, "Node");
    module.exports = Node;
    var stateProps = [
      "enc",
      "parent",
      "children",
      "tag",
      "args",
      "reverseArgs",
      "choice",
      "optional",
      "any",
      "obj",
      "use",
      "alteredUse",
      "key",
      "default",
      "explicit",
      "implicit",
      "contains"
    ];
    Node.prototype.clone = /* @__PURE__ */ __name(function clone() {
      const state = this._baseState;
      const cstate = {};
      stateProps.forEach(function(prop) {
        cstate[prop] = state[prop];
      });
      const res = new this.constructor(cstate.parent);
      res._baseState = cstate;
      return res;
    }, "clone");
    Node.prototype._wrap = /* @__PURE__ */ __name(function wrap() {
      const state = this._baseState;
      methods.forEach(function(method) {
        this[method] = /* @__PURE__ */ __name(function _wrappedMethod() {
          const clone = new this.constructor(this);
          state.children.push(clone);
          return clone[method].apply(clone, arguments);
        }, "_wrappedMethod");
      }, this);
    }, "wrap");
    Node.prototype._init = /* @__PURE__ */ __name(function init(body) {
      const state = this._baseState;
      assert(state.parent === null);
      body.call(this);
      state.children = state.children.filter(function(child) {
        return child._baseState.parent === this;
      }, this);
      assert.equal(state.children.length, 1, "Root node can have only one child");
    }, "init");
    Node.prototype._useArgs = /* @__PURE__ */ __name(function useArgs(args) {
      const state = this._baseState;
      const children = args.filter(function(arg) {
        return arg instanceof this.constructor;
      }, this);
      args = args.filter(function(arg) {
        return !(arg instanceof this.constructor);
      }, this);
      if (children.length !== 0) {
        assert(state.children === null);
        state.children = children;
        children.forEach(function(child) {
          child._baseState.parent = this;
        }, this);
      }
      if (args.length !== 0) {
        assert(state.args === null);
        state.args = args;
        state.reverseArgs = args.map(function(arg) {
          if (typeof arg !== "object" || arg.constructor !== Object)
            return arg;
          const res = {};
          Object.keys(arg).forEach(function(key) {
            if (key == (key | 0))
              key |= 0;
            const value = arg[key];
            res[value] = key;
          });
          return res;
        });
      }
    }, "useArgs");
    overrided.forEach(function(method) {
      Node.prototype[method] = /* @__PURE__ */ __name(function _overrided() {
        const state = this._baseState;
        throw new Error(method + " not implemented for encoding: " + state.enc);
      }, "_overrided");
    });
    tags.forEach(function(tag) {
      Node.prototype[tag] = /* @__PURE__ */ __name(function _tagMethod() {
        const state = this._baseState;
        const args = Array.prototype.slice.call(arguments);
        assert(state.tag === null);
        state.tag = tag;
        this._useArgs(args);
        return this;
      }, "_tagMethod");
    });
    Node.prototype.use = /* @__PURE__ */ __name(function use(item) {
      assert(item);
      const state = this._baseState;
      assert(state.use === null);
      state.use = item;
      return this;
    }, "use");
    Node.prototype.optional = /* @__PURE__ */ __name(function optional() {
      const state = this._baseState;
      state.optional = true;
      return this;
    }, "optional");
    Node.prototype.def = /* @__PURE__ */ __name(function def(val) {
      const state = this._baseState;
      assert(state["default"] === null);
      state["default"] = val;
      state.optional = true;
      return this;
    }, "def");
    Node.prototype.explicit = /* @__PURE__ */ __name(function explicit(num) {
      const state = this._baseState;
      assert(state.explicit === null && state.implicit === null);
      state.explicit = num;
      return this;
    }, "explicit");
    Node.prototype.implicit = /* @__PURE__ */ __name(function implicit(num) {
      const state = this._baseState;
      assert(state.explicit === null && state.implicit === null);
      state.implicit = num;
      return this;
    }, "implicit");
    Node.prototype.obj = /* @__PURE__ */ __name(function obj() {
      const state = this._baseState;
      const args = Array.prototype.slice.call(arguments);
      state.obj = true;
      if (args.length !== 0)
        this._useArgs(args);
      return this;
    }, "obj");
    Node.prototype.key = /* @__PURE__ */ __name(function key(newKey) {
      const state = this._baseState;
      assert(state.key === null);
      state.key = newKey;
      return this;
    }, "key");
    Node.prototype.any = /* @__PURE__ */ __name(function any() {
      const state = this._baseState;
      state.any = true;
      return this;
    }, "any");
    Node.prototype.choice = /* @__PURE__ */ __name(function choice(obj) {
      const state = this._baseState;
      assert(state.choice === null);
      state.choice = obj;
      this._useArgs(Object.keys(obj).map(function(key) {
        return obj[key];
      }));
      return this;
    }, "choice");
    Node.prototype.contains = /* @__PURE__ */ __name(function contains(item) {
      const state = this._baseState;
      assert(state.use === null);
      state.contains = item;
      return this;
    }, "contains");
    Node.prototype._decode = /* @__PURE__ */ __name(function decode(input, options) {
      const state = this._baseState;
      if (state.parent === null)
        return input.wrapResult(state.children[0]._decode(input, options));
      let result = state["default"];
      let present = true;
      let prevKey = null;
      if (state.key !== null)
        prevKey = input.enterKey(state.key);
      if (state.optional) {
        let tag = null;
        if (state.explicit !== null)
          tag = state.explicit;
        else if (state.implicit !== null)
          tag = state.implicit;
        else if (state.tag !== null)
          tag = state.tag;
        if (tag === null && !state.any) {
          const save = input.save();
          try {
            if (state.choice === null)
              this._decodeGeneric(state.tag, input, options);
            else
              this._decodeChoice(input, options);
            present = true;
          } catch (e) {
            present = false;
          }
          input.restore(save);
        } else {
          present = this._peekTag(input, tag, state.any);
          if (input.isError(present))
            return present;
        }
      }
      let prevObj;
      if (state.obj && present)
        prevObj = input.enterObject();
      if (present) {
        if (state.explicit !== null) {
          const explicit = this._decodeTag(input, state.explicit);
          if (input.isError(explicit))
            return explicit;
          input = explicit;
        }
        const start = input.offset;
        if (state.use === null && state.choice === null) {
          let save;
          if (state.any)
            save = input.save();
          const body = this._decodeTag(
            input,
            state.implicit !== null ? state.implicit : state.tag,
            state.any
          );
          if (input.isError(body))
            return body;
          if (state.any)
            result = input.raw(save);
          else
            input = body;
        }
        if (options && options.track && state.tag !== null)
          options.track(input.path(), start, input.length, "tagged");
        if (options && options.track && state.tag !== null)
          options.track(input.path(), input.offset, input.length, "content");
        if (state.any) {
        } else if (state.choice === null) {
          result = this._decodeGeneric(state.tag, input, options);
        } else {
          result = this._decodeChoice(input, options);
        }
        if (input.isError(result))
          return result;
        if (!state.any && state.choice === null && state.children !== null) {
          state.children.forEach(/* @__PURE__ */ __name(function decodeChildren(child) {
            child._decode(input, options);
          }, "decodeChildren"));
        }
        if (state.contains && (state.tag === "octstr" || state.tag === "bitstr")) {
          const data = new DecoderBuffer(result);
          result = this._getUse(state.contains, input._reporterState.obj)._decode(data, options);
        }
      }
      if (state.obj && present)
        result = input.leaveObject(prevObj);
      if (state.key !== null && (result !== null || present === true))
        input.leaveKey(prevKey, state.key, result);
      else if (prevKey !== null)
        input.exitKey(prevKey);
      return result;
    }, "decode");
    Node.prototype._decodeGeneric = /* @__PURE__ */ __name(function decodeGeneric(tag, input, options) {
      const state = this._baseState;
      if (tag === "seq" || tag === "set")
        return null;
      if (tag === "seqof" || tag === "setof")
        return this._decodeList(input, tag, state.args[0], options);
      else if (/str$/.test(tag))
        return this._decodeStr(input, tag, options);
      else if (tag === "objid" && state.args)
        return this._decodeObjid(input, state.args[0], state.args[1], options);
      else if (tag === "objid")
        return this._decodeObjid(input, null, null, options);
      else if (tag === "gentime" || tag === "utctime")
        return this._decodeTime(input, tag, options);
      else if (tag === "null_")
        return this._decodeNull(input, options);
      else if (tag === "bool")
        return this._decodeBool(input, options);
      else if (tag === "objDesc")
        return this._decodeStr(input, tag, options);
      else if (tag === "int" || tag === "enum")
        return this._decodeInt(input, state.args && state.args[0], options);
      if (state.use !== null) {
        return this._getUse(state.use, input._reporterState.obj)._decode(input, options);
      } else {
        return input.error("unknown tag: " + tag);
      }
    }, "decodeGeneric");
    Node.prototype._getUse = /* @__PURE__ */ __name(function _getUse(entity, obj) {
      const state = this._baseState;
      state.useDecoder = this._use(entity, obj);
      assert(state.useDecoder._baseState.parent === null);
      state.useDecoder = state.useDecoder._baseState.children[0];
      if (state.implicit !== state.useDecoder._baseState.implicit) {
        state.useDecoder = state.useDecoder.clone();
        state.useDecoder._baseState.implicit = state.implicit;
      }
      return state.useDecoder;
    }, "_getUse");
    Node.prototype._decodeChoice = /* @__PURE__ */ __name(function decodeChoice(input, options) {
      const state = this._baseState;
      let result = null;
      let match = false;
      Object.keys(state.choice).some(function(key) {
        const save = input.save();
        const node = state.choice[key];
        try {
          const value = node._decode(input, options);
          if (input.isError(value))
            return false;
          result = { type: key, value };
          match = true;
        } catch (e) {
          input.restore(save);
          return false;
        }
        return true;
      }, this);
      if (!match)
        return input.error("Choice not matched");
      return result;
    }, "decodeChoice");
    Node.prototype._createEncoderBuffer = /* @__PURE__ */ __name(function createEncoderBuffer(data) {
      return new EncoderBuffer(data, this.reporter);
    }, "createEncoderBuffer");
    Node.prototype._encode = /* @__PURE__ */ __name(function encode(data, reporter, parent) {
      const state = this._baseState;
      if (state["default"] !== null && state["default"] === data)
        return;
      const result = this._encodeValue(data, reporter, parent);
      if (result === void 0)
        return;
      if (this._skipDefault(result, reporter, parent))
        return;
      return result;
    }, "encode");
    Node.prototype._encodeValue = /* @__PURE__ */ __name(function encode(data, reporter, parent) {
      const state = this._baseState;
      if (state.parent === null)
        return state.children[0]._encode(data, reporter || new Reporter());
      let result = null;
      this.reporter = reporter;
      if (state.optional && data === void 0) {
        if (state["default"] !== null)
          data = state["default"];
        else
          return;
      }
      let content = null;
      let primitive = false;
      if (state.any) {
        result = this._createEncoderBuffer(data);
      } else if (state.choice) {
        result = this._encodeChoice(data, reporter);
      } else if (state.contains) {
        content = this._getUse(state.contains, parent)._encode(data, reporter);
        primitive = true;
      } else if (state.children) {
        content = state.children.map(function(child) {
          if (child._baseState.tag === "null_")
            return child._encode(null, reporter, data);
          if (child._baseState.key === null)
            return reporter.error("Child should have a key");
          const prevKey = reporter.enterKey(child._baseState.key);
          if (typeof data !== "object")
            return reporter.error("Child expected, but input is not object");
          const res = child._encode(data[child._baseState.key], reporter, data);
          reporter.leaveKey(prevKey);
          return res;
        }, this).filter(function(child) {
          return child;
        });
        content = this._createEncoderBuffer(content);
      } else {
        if (state.tag === "seqof" || state.tag === "setof") {
          if (!(state.args && state.args.length === 1))
            return reporter.error("Too many args for : " + state.tag);
          if (!Array.isArray(data))
            return reporter.error("seqof/setof, but data is not Array");
          const child = this.clone();
          child._baseState.implicit = null;
          content = this._createEncoderBuffer(data.map(function(item) {
            const state2 = this._baseState;
            return this._getUse(state2.args[0], data)._encode(item, reporter);
          }, child));
        } else if (state.use !== null) {
          result = this._getUse(state.use, parent)._encode(data, reporter);
        } else {
          content = this._encodePrimitive(state.tag, data);
          primitive = true;
        }
      }
      if (!state.any && state.choice === null) {
        const tag = state.implicit !== null ? state.implicit : state.tag;
        const cls = state.implicit === null ? "universal" : "context";
        if (tag === null) {
          if (state.use === null)
            reporter.error("Tag could be omitted only for .use()");
        } else {
          if (state.use === null)
            result = this._encodeComposite(tag, primitive, cls, content);
        }
      }
      if (state.explicit !== null)
        result = this._encodeComposite(state.explicit, false, "context", result);
      return result;
    }, "encode");
    Node.prototype._encodeChoice = /* @__PURE__ */ __name(function encodeChoice(data, reporter) {
      const state = this._baseState;
      const node = state.choice[data.type];
      if (!node) {
        assert(
          false,
          data.type + " not found in " + JSON.stringify(Object.keys(state.choice))
        );
      }
      return node._encode(data.value, reporter);
    }, "encodeChoice");
    Node.prototype._encodePrimitive = /* @__PURE__ */ __name(function encodePrimitive(tag, data) {
      const state = this._baseState;
      if (/str$/.test(tag))
        return this._encodeStr(data, tag);
      else if (tag === "objid" && state.args)
        return this._encodeObjid(data, state.reverseArgs[0], state.args[1]);
      else if (tag === "objid")
        return this._encodeObjid(data, null, null);
      else if (tag === "gentime" || tag === "utctime")
        return this._encodeTime(data, tag);
      else if (tag === "null_")
        return this._encodeNull();
      else if (tag === "int" || tag === "enum")
        return this._encodeInt(data, state.args && state.reverseArgs[0]);
      else if (tag === "bool")
        return this._encodeBool(data);
      else if (tag === "objDesc")
        return this._encodeStr(data, tag);
      else
        throw new Error("Unsupported tag: " + tag);
    }, "encodePrimitive");
    Node.prototype._isNumstr = /* @__PURE__ */ __name(function isNumstr(str) {
      return /^[0-9 ]*$/.test(str);
    }, "isNumstr");
    Node.prototype._isPrintstr = /* @__PURE__ */ __name(function isPrintstr(str) {
      return /^[A-Za-z0-9 '()+,-./:=?]*$/.test(str);
    }, "isPrintstr");
  }
});

// node_modules/asn1.js/lib/asn1/constants/der.js
var require_der = __commonJS({
  "node_modules/asn1.js/lib/asn1/constants/der.js"(exports) {
    "use strict";
    init_modules_watch_stub();
    function reverse(map) {
      const res = {};
      Object.keys(map).forEach(function(key) {
        if ((key | 0) == key)
          key = key | 0;
        const value = map[key];
        res[value] = key;
      });
      return res;
    }
    __name(reverse, "reverse");
    exports.tagClass = {
      0: "universal",
      1: "application",
      2: "context",
      3: "private"
    };
    exports.tagClassByName = reverse(exports.tagClass);
    exports.tag = {
      0: "end",
      1: "bool",
      2: "int",
      3: "bitstr",
      4: "octstr",
      5: "null_",
      6: "objid",
      7: "objDesc",
      8: "external",
      9: "real",
      10: "enum",
      11: "embed",
      12: "utf8str",
      13: "relativeOid",
      16: "seq",
      17: "set",
      18: "numstr",
      19: "printstr",
      20: "t61str",
      21: "videostr",
      22: "ia5str",
      23: "utctime",
      24: "gentime",
      25: "graphstr",
      26: "iso646str",
      27: "genstr",
      28: "unistr",
      29: "charstr",
      30: "bmpstr"
    };
    exports.tagByName = reverse(exports.tag);
  }
});

// node_modules/asn1.js/lib/asn1/encoders/der.js
var require_der2 = __commonJS({
  "node_modules/asn1.js/lib/asn1/encoders/der.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    var inherits2 = require_inherits();
    var Buffer2 = require_safer().Buffer;
    var Node = require_node();
    var der = require_der();
    function DEREncoder(entity) {
      this.enc = "der";
      this.name = entity.name;
      this.entity = entity;
      this.tree = new DERNode();
      this.tree._init(entity.body);
    }
    __name(DEREncoder, "DEREncoder");
    module.exports = DEREncoder;
    DEREncoder.prototype.encode = /* @__PURE__ */ __name(function encode(data, reporter) {
      return this.tree._encode(data, reporter).join();
    }, "encode");
    function DERNode(parent) {
      Node.call(this, "der", parent);
    }
    __name(DERNode, "DERNode");
    inherits2(DERNode, Node);
    DERNode.prototype._encodeComposite = /* @__PURE__ */ __name(function encodeComposite(tag, primitive, cls, content) {
      const encodedTag = encodeTag(tag, primitive, cls, this.reporter);
      if (content.length < 128) {
        const header2 = Buffer2.alloc(2);
        header2[0] = encodedTag;
        header2[1] = content.length;
        return this._createEncoderBuffer([header2, content]);
      }
      let lenOctets = 1;
      for (let i = content.length; i >= 256; i >>= 8)
        lenOctets++;
      const header = Buffer2.alloc(1 + 1 + lenOctets);
      header[0] = encodedTag;
      header[1] = 128 | lenOctets;
      for (let i = 1 + lenOctets, j = content.length; j > 0; i--, j >>= 8)
        header[i] = j & 255;
      return this._createEncoderBuffer([header, content]);
    }, "encodeComposite");
    DERNode.prototype._encodeStr = /* @__PURE__ */ __name(function encodeStr(str, tag) {
      if (tag === "bitstr") {
        return this._createEncoderBuffer([str.unused | 0, str.data]);
      } else if (tag === "bmpstr") {
        const buf = Buffer2.alloc(str.length * 2);
        for (let i = 0; i < str.length; i++) {
          buf.writeUInt16BE(str.charCodeAt(i), i * 2);
        }
        return this._createEncoderBuffer(buf);
      } else if (tag === "numstr") {
        if (!this._isNumstr(str)) {
          return this.reporter.error("Encoding of string type: numstr supports only digits and space");
        }
        return this._createEncoderBuffer(str);
      } else if (tag === "printstr") {
        if (!this._isPrintstr(str)) {
          return this.reporter.error("Encoding of string type: printstr supports only latin upper and lower case letters, digits, space, apostrophe, left and rigth parenthesis, plus sign, comma, hyphen, dot, slash, colon, equal sign, question mark");
        }
        return this._createEncoderBuffer(str);
      } else if (/str$/.test(tag)) {
        return this._createEncoderBuffer(str);
      } else if (tag === "objDesc") {
        return this._createEncoderBuffer(str);
      } else {
        return this.reporter.error("Encoding of string type: " + tag + " unsupported");
      }
    }, "encodeStr");
    DERNode.prototype._encodeObjid = /* @__PURE__ */ __name(function encodeObjid(id, values, relative) {
      if (typeof id === "string") {
        if (!values)
          return this.reporter.error("string objid given, but no values map found");
        if (!values.hasOwnProperty(id))
          return this.reporter.error("objid not found in values map");
        id = values[id].split(/[\s.]+/g);
        for (let i = 0; i < id.length; i++)
          id[i] |= 0;
      } else if (Array.isArray(id)) {
        id = id.slice();
        for (let i = 0; i < id.length; i++)
          id[i] |= 0;
      }
      if (!Array.isArray(id)) {
        return this.reporter.error("objid() should be either array or string, got: " + JSON.stringify(id));
      }
      if (!relative) {
        if (id[1] >= 40)
          return this.reporter.error("Second objid identifier OOB");
        id.splice(0, 2, id[0] * 40 + id[1]);
      }
      let size = 0;
      for (let i = 0; i < id.length; i++) {
        let ident = id[i];
        for (size++; ident >= 128; ident >>= 7)
          size++;
      }
      const objid = Buffer2.alloc(size);
      let offset = objid.length - 1;
      for (let i = id.length - 1; i >= 0; i--) {
        let ident = id[i];
        objid[offset--] = ident & 127;
        while ((ident >>= 7) > 0)
          objid[offset--] = 128 | ident & 127;
      }
      return this._createEncoderBuffer(objid);
    }, "encodeObjid");
    function two(num) {
      if (num < 10)
        return "0" + num;
      else
        return num;
    }
    __name(two, "two");
    DERNode.prototype._encodeTime = /* @__PURE__ */ __name(function encodeTime(time, tag) {
      let str;
      const date = new Date(time);
      if (tag === "gentime") {
        str = [
          two(date.getUTCFullYear()),
          two(date.getUTCMonth() + 1),
          two(date.getUTCDate()),
          two(date.getUTCHours()),
          two(date.getUTCMinutes()),
          two(date.getUTCSeconds()),
          "Z"
        ].join("");
      } else if (tag === "utctime") {
        str = [
          two(date.getUTCFullYear() % 100),
          two(date.getUTCMonth() + 1),
          two(date.getUTCDate()),
          two(date.getUTCHours()),
          two(date.getUTCMinutes()),
          two(date.getUTCSeconds()),
          "Z"
        ].join("");
      } else {
        this.reporter.error("Encoding " + tag + " time is not supported yet");
      }
      return this._encodeStr(str, "octstr");
    }, "encodeTime");
    DERNode.prototype._encodeNull = /* @__PURE__ */ __name(function encodeNull() {
      return this._createEncoderBuffer("");
    }, "encodeNull");
    DERNode.prototype._encodeInt = /* @__PURE__ */ __name(function encodeInt(num, values) {
      if (typeof num === "string") {
        if (!values)
          return this.reporter.error("String int or enum given, but no values map");
        if (!values.hasOwnProperty(num)) {
          return this.reporter.error("Values map doesn't contain: " + JSON.stringify(num));
        }
        num = values[num];
      }
      if (typeof num !== "number" && !Buffer2.isBuffer(num)) {
        const numArray = num.toArray();
        if (!num.sign && numArray[0] & 128) {
          numArray.unshift(0);
        }
        num = Buffer2.from(numArray);
      }
      if (Buffer2.isBuffer(num)) {
        let size2 = num.length;
        if (num.length === 0)
          size2++;
        const out2 = Buffer2.alloc(size2);
        num.copy(out2);
        if (num.length === 0)
          out2[0] = 0;
        return this._createEncoderBuffer(out2);
      }
      if (num < 128)
        return this._createEncoderBuffer(num);
      if (num < 256)
        return this._createEncoderBuffer([0, num]);
      let size = 1;
      for (let i = num; i >= 256; i >>= 8)
        size++;
      const out = new Array(size);
      for (let i = out.length - 1; i >= 0; i--) {
        out[i] = num & 255;
        num >>= 8;
      }
      if (out[0] & 128) {
        out.unshift(0);
      }
      return this._createEncoderBuffer(Buffer2.from(out));
    }, "encodeInt");
    DERNode.prototype._encodeBool = /* @__PURE__ */ __name(function encodeBool(value) {
      return this._createEncoderBuffer(value ? 255 : 0);
    }, "encodeBool");
    DERNode.prototype._use = /* @__PURE__ */ __name(function use(entity, obj) {
      if (typeof entity === "function")
        entity = entity(obj);
      return entity._getEncoder("der").tree;
    }, "use");
    DERNode.prototype._skipDefault = /* @__PURE__ */ __name(function skipDefault(dataBuffer, reporter, parent) {
      const state = this._baseState;
      let i;
      if (state["default"] === null)
        return false;
      const data = dataBuffer.join();
      if (state.defaultBuffer === void 0)
        state.defaultBuffer = this._encodeValue(state["default"], reporter, parent).join();
      if (data.length !== state.defaultBuffer.length)
        return false;
      for (i = 0; i < data.length; i++)
        if (data[i] !== state.defaultBuffer[i])
          return false;
      return true;
    }, "skipDefault");
    function encodeTag(tag, primitive, cls, reporter) {
      let res;
      if (tag === "seqof")
        tag = "seq";
      else if (tag === "setof")
        tag = "set";
      if (der.tagByName.hasOwnProperty(tag))
        res = der.tagByName[tag];
      else if (typeof tag === "number" && (tag | 0) === tag)
        res = tag;
      else
        return reporter.error("Unknown tag: " + tag);
      if (res >= 31)
        return reporter.error("Multi-octet tag encoding unsupported");
      if (!primitive)
        res |= 32;
      res |= der.tagClassByName[cls || "universal"] << 6;
      return res;
    }
    __name(encodeTag, "encodeTag");
  }
});

// node_modules/asn1.js/lib/asn1/encoders/pem.js
var require_pem = __commonJS({
  "node_modules/asn1.js/lib/asn1/encoders/pem.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    var inherits2 = require_inherits();
    var DEREncoder = require_der2();
    function PEMEncoder(entity) {
      DEREncoder.call(this, entity);
      this.enc = "pem";
    }
    __name(PEMEncoder, "PEMEncoder");
    inherits2(PEMEncoder, DEREncoder);
    module.exports = PEMEncoder;
    PEMEncoder.prototype.encode = /* @__PURE__ */ __name(function encode(data, options) {
      const buf = DEREncoder.prototype.encode.call(this, data);
      const p = buf.toString("base64");
      const out = ["-----BEGIN " + options.label + "-----"];
      for (let i = 0; i < p.length; i += 64)
        out.push(p.slice(i, i + 64));
      out.push("-----END " + options.label + "-----");
      return out.join("\n");
    }, "encode");
  }
});

// node_modules/asn1.js/lib/asn1/encoders/index.js
var require_encoders = __commonJS({
  "node_modules/asn1.js/lib/asn1/encoders/index.js"(exports) {
    "use strict";
    init_modules_watch_stub();
    var encoders = exports;
    encoders.der = require_der2();
    encoders.pem = require_pem();
  }
});

// node_modules/asn1.js/lib/asn1/decoders/der.js
var require_der3 = __commonJS({
  "node_modules/asn1.js/lib/asn1/decoders/der.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    var inherits2 = require_inherits();
    var bignum = require_bn();
    var DecoderBuffer = require_buffer2().DecoderBuffer;
    var Node = require_node();
    var der = require_der();
    function DERDecoder(entity) {
      this.enc = "der";
      this.name = entity.name;
      this.entity = entity;
      this.tree = new DERNode();
      this.tree._init(entity.body);
    }
    __name(DERDecoder, "DERDecoder");
    module.exports = DERDecoder;
    DERDecoder.prototype.decode = /* @__PURE__ */ __name(function decode(data, options) {
      if (!DecoderBuffer.isDecoderBuffer(data)) {
        data = new DecoderBuffer(data, options);
      }
      return this.tree._decode(data, options);
    }, "decode");
    function DERNode(parent) {
      Node.call(this, "der", parent);
    }
    __name(DERNode, "DERNode");
    inherits2(DERNode, Node);
    DERNode.prototype._peekTag = /* @__PURE__ */ __name(function peekTag(buffer, tag, any) {
      if (buffer.isEmpty())
        return false;
      const state = buffer.save();
      const decodedTag = derDecodeTag(buffer, 'Failed to peek tag: "' + tag + '"');
      if (buffer.isError(decodedTag))
        return decodedTag;
      buffer.restore(state);
      return decodedTag.tag === tag || decodedTag.tagStr === tag || decodedTag.tagStr + "of" === tag || any;
    }, "peekTag");
    DERNode.prototype._decodeTag = /* @__PURE__ */ __name(function decodeTag(buffer, tag, any) {
      const decodedTag = derDecodeTag(
        buffer,
        'Failed to decode tag of "' + tag + '"'
      );
      if (buffer.isError(decodedTag))
        return decodedTag;
      let len = derDecodeLen(
        buffer,
        decodedTag.primitive,
        'Failed to get length of "' + tag + '"'
      );
      if (buffer.isError(len))
        return len;
      if (!any && decodedTag.tag !== tag && decodedTag.tagStr !== tag && decodedTag.tagStr + "of" !== tag) {
        return buffer.error('Failed to match tag: "' + tag + '"');
      }
      if (decodedTag.primitive || len !== null)
        return buffer.skip(len, 'Failed to match body of: "' + tag + '"');
      const state = buffer.save();
      const res = this._skipUntilEnd(
        buffer,
        'Failed to skip indefinite length body: "' + this.tag + '"'
      );
      if (buffer.isError(res))
        return res;
      len = buffer.offset - state.offset;
      buffer.restore(state);
      return buffer.skip(len, 'Failed to match body of: "' + tag + '"');
    }, "decodeTag");
    DERNode.prototype._skipUntilEnd = /* @__PURE__ */ __name(function skipUntilEnd(buffer, fail) {
      for (; ; ) {
        const tag = derDecodeTag(buffer, fail);
        if (buffer.isError(tag))
          return tag;
        const len = derDecodeLen(buffer, tag.primitive, fail);
        if (buffer.isError(len))
          return len;
        let res;
        if (tag.primitive || len !== null)
          res = buffer.skip(len);
        else
          res = this._skipUntilEnd(buffer, fail);
        if (buffer.isError(res))
          return res;
        if (tag.tagStr === "end")
          break;
      }
    }, "skipUntilEnd");
    DERNode.prototype._decodeList = /* @__PURE__ */ __name(function decodeList(buffer, tag, decoder, options) {
      const result = [];
      while (!buffer.isEmpty()) {
        const possibleEnd = this._peekTag(buffer, "end");
        if (buffer.isError(possibleEnd))
          return possibleEnd;
        const res = decoder.decode(buffer, "der", options);
        if (buffer.isError(res) && possibleEnd)
          break;
        result.push(res);
      }
      return result;
    }, "decodeList");
    DERNode.prototype._decodeStr = /* @__PURE__ */ __name(function decodeStr(buffer, tag) {
      if (tag === "bitstr") {
        const unused = buffer.readUInt8();
        if (buffer.isError(unused))
          return unused;
        return { unused, data: buffer.raw() };
      } else if (tag === "bmpstr") {
        const raw = buffer.raw();
        if (raw.length % 2 === 1)
          return buffer.error("Decoding of string type: bmpstr length mismatch");
        let str = "";
        for (let i = 0; i < raw.length / 2; i++) {
          str += String.fromCharCode(raw.readUInt16BE(i * 2));
        }
        return str;
      } else if (tag === "numstr") {
        const numstr = buffer.raw().toString("ascii");
        if (!this._isNumstr(numstr)) {
          return buffer.error("Decoding of string type: numstr unsupported characters");
        }
        return numstr;
      } else if (tag === "octstr") {
        return buffer.raw();
      } else if (tag === "objDesc") {
        return buffer.raw();
      } else if (tag === "printstr") {
        const printstr = buffer.raw().toString("ascii");
        if (!this._isPrintstr(printstr)) {
          return buffer.error("Decoding of string type: printstr unsupported characters");
        }
        return printstr;
      } else if (/str$/.test(tag)) {
        return buffer.raw().toString();
      } else {
        return buffer.error("Decoding of string type: " + tag + " unsupported");
      }
    }, "decodeStr");
    DERNode.prototype._decodeObjid = /* @__PURE__ */ __name(function decodeObjid(buffer, values, relative) {
      let result;
      const identifiers = [];
      let ident = 0;
      let subident = 0;
      while (!buffer.isEmpty()) {
        subident = buffer.readUInt8();
        ident <<= 7;
        ident |= subident & 127;
        if ((subident & 128) === 0) {
          identifiers.push(ident);
          ident = 0;
        }
      }
      if (subident & 128)
        identifiers.push(ident);
      const first = identifiers[0] / 40 | 0;
      const second = identifiers[0] % 40;
      if (relative)
        result = identifiers;
      else
        result = [first, second].concat(identifiers.slice(1));
      if (values) {
        let tmp = values[result.join(" ")];
        if (tmp === void 0)
          tmp = values[result.join(".")];
        if (tmp !== void 0)
          result = tmp;
      }
      return result;
    }, "decodeObjid");
    DERNode.prototype._decodeTime = /* @__PURE__ */ __name(function decodeTime(buffer, tag) {
      const str = buffer.raw().toString();
      let year;
      let mon;
      let day;
      let hour;
      let min;
      let sec;
      if (tag === "gentime") {
        year = str.slice(0, 4) | 0;
        mon = str.slice(4, 6) | 0;
        day = str.slice(6, 8) | 0;
        hour = str.slice(8, 10) | 0;
        min = str.slice(10, 12) | 0;
        sec = str.slice(12, 14) | 0;
      } else if (tag === "utctime") {
        year = str.slice(0, 2) | 0;
        mon = str.slice(2, 4) | 0;
        day = str.slice(4, 6) | 0;
        hour = str.slice(6, 8) | 0;
        min = str.slice(8, 10) | 0;
        sec = str.slice(10, 12) | 0;
        if (year < 70)
          year = 2e3 + year;
        else
          year = 1900 + year;
      } else {
        return buffer.error("Decoding " + tag + " time is not supported yet");
      }
      return Date.UTC(year, mon - 1, day, hour, min, sec, 0);
    }, "decodeTime");
    DERNode.prototype._decodeNull = /* @__PURE__ */ __name(function decodeNull() {
      return null;
    }, "decodeNull");
    DERNode.prototype._decodeBool = /* @__PURE__ */ __name(function decodeBool(buffer) {
      const res = buffer.readUInt8();
      if (buffer.isError(res))
        return res;
      else
        return res !== 0;
    }, "decodeBool");
    DERNode.prototype._decodeInt = /* @__PURE__ */ __name(function decodeInt(buffer, values) {
      const raw = buffer.raw();
      let res = new bignum(raw);
      if (values)
        res = values[res.toString(10)] || res;
      return res;
    }, "decodeInt");
    DERNode.prototype._use = /* @__PURE__ */ __name(function use(entity, obj) {
      if (typeof entity === "function")
        entity = entity(obj);
      return entity._getDecoder("der").tree;
    }, "use");
    function derDecodeTag(buf, fail) {
      let tag = buf.readUInt8(fail);
      if (buf.isError(tag))
        return tag;
      const cls = der.tagClass[tag >> 6];
      const primitive = (tag & 32) === 0;
      if ((tag & 31) === 31) {
        let oct = tag;
        tag = 0;
        while ((oct & 128) === 128) {
          oct = buf.readUInt8(fail);
          if (buf.isError(oct))
            return oct;
          tag <<= 7;
          tag |= oct & 127;
        }
      } else {
        tag &= 31;
      }
      const tagStr = der.tag[tag];
      return {
        cls,
        primitive,
        tag,
        tagStr
      };
    }
    __name(derDecodeTag, "derDecodeTag");
    function derDecodeLen(buf, primitive, fail) {
      let len = buf.readUInt8(fail);
      if (buf.isError(len))
        return len;
      if (!primitive && len === 128)
        return null;
      if ((len & 128) === 0) {
        return len;
      }
      const num = len & 127;
      if (num > 4)
        return buf.error("length octect is too long");
      len = 0;
      for (let i = 0; i < num; i++) {
        len <<= 8;
        const j = buf.readUInt8(fail);
        if (buf.isError(j))
          return j;
        len |= j;
      }
      return len;
    }
    __name(derDecodeLen, "derDecodeLen");
  }
});

// node_modules/asn1.js/lib/asn1/decoders/pem.js
var require_pem2 = __commonJS({
  "node_modules/asn1.js/lib/asn1/decoders/pem.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    var inherits2 = require_inherits();
    var Buffer2 = require_safer().Buffer;
    var DERDecoder = require_der3();
    function PEMDecoder(entity) {
      DERDecoder.call(this, entity);
      this.enc = "pem";
    }
    __name(PEMDecoder, "PEMDecoder");
    inherits2(PEMDecoder, DERDecoder);
    module.exports = PEMDecoder;
    PEMDecoder.prototype.decode = /* @__PURE__ */ __name(function decode(data, options) {
      const lines = data.toString().split(/[\r\n]+/g);
      const label = options.label.toUpperCase();
      const re = /^-----(BEGIN|END) ([^-]+)-----$/;
      let start = -1;
      let end = -1;
      for (let i = 0; i < lines.length; i++) {
        const match = lines[i].match(re);
        if (match === null)
          continue;
        if (match[2] !== label)
          continue;
        if (start === -1) {
          if (match[1] !== "BEGIN")
            break;
          start = i;
        } else {
          if (match[1] !== "END")
            break;
          end = i;
          break;
        }
      }
      if (start === -1 || end === -1)
        throw new Error("PEM section not found for: " + label);
      const base64 = lines.slice(start + 1, end).join("");
      base64.replace(/[^a-z0-9+/=]+/gi, "");
      const input = Buffer2.from(base64, "base64");
      return DERDecoder.prototype.decode.call(this, input, options);
    }, "decode");
  }
});

// node_modules/asn1.js/lib/asn1/decoders/index.js
var require_decoders = __commonJS({
  "node_modules/asn1.js/lib/asn1/decoders/index.js"(exports) {
    "use strict";
    init_modules_watch_stub();
    var decoders = exports;
    decoders.der = require_der3();
    decoders.pem = require_pem2();
  }
});

// node_modules/asn1.js/lib/asn1/api.js
var require_api = __commonJS({
  "node_modules/asn1.js/lib/asn1/api.js"(exports) {
    "use strict";
    init_modules_watch_stub();
    var encoders = require_encoders();
    var decoders = require_decoders();
    var inherits2 = require_inherits();
    var api = exports;
    api.define = /* @__PURE__ */ __name(function define(name, body) {
      return new Entity(name, body);
    }, "define");
    function Entity(name, body) {
      this.name = name;
      this.body = body;
      this.decoders = {};
      this.encoders = {};
    }
    __name(Entity, "Entity");
    Entity.prototype._createNamed = /* @__PURE__ */ __name(function createNamed(Base) {
      const name = this.name;
      function Generated(entity) {
        this._initNamed(entity, name);
      }
      __name(Generated, "Generated");
      inherits2(Generated, Base);
      Generated.prototype._initNamed = /* @__PURE__ */ __name(function _initNamed(entity, name2) {
        Base.call(this, entity, name2);
      }, "_initNamed");
      return new Generated(this);
    }, "createNamed");
    Entity.prototype._getDecoder = /* @__PURE__ */ __name(function _getDecoder(enc) {
      enc = enc || "der";
      if (!this.decoders.hasOwnProperty(enc))
        this.decoders[enc] = this._createNamed(decoders[enc]);
      return this.decoders[enc];
    }, "_getDecoder");
    Entity.prototype.decode = /* @__PURE__ */ __name(function decode(data, enc, options) {
      return this._getDecoder(enc).decode(data, options);
    }, "decode");
    Entity.prototype._getEncoder = /* @__PURE__ */ __name(function _getEncoder(enc) {
      enc = enc || "der";
      if (!this.encoders.hasOwnProperty(enc))
        this.encoders[enc] = this._createNamed(encoders[enc]);
      return this.encoders[enc];
    }, "_getEncoder");
    Entity.prototype.encode = /* @__PURE__ */ __name(function encode(data, enc, reporter) {
      return this._getEncoder(enc).encode(data, reporter);
    }, "encode");
  }
});

// node_modules/asn1.js/lib/asn1/base/index.js
var require_base = __commonJS({
  "node_modules/asn1.js/lib/asn1/base/index.js"(exports) {
    "use strict";
    init_modules_watch_stub();
    var base = exports;
    base.Reporter = require_reporter().Reporter;
    base.DecoderBuffer = require_buffer2().DecoderBuffer;
    base.EncoderBuffer = require_buffer2().EncoderBuffer;
    base.Node = require_node();
  }
});

// node_modules/asn1.js/lib/asn1/constants/index.js
var require_constants = __commonJS({
  "node_modules/asn1.js/lib/asn1/constants/index.js"(exports) {
    "use strict";
    init_modules_watch_stub();
    var constants = exports;
    constants._reverse = /* @__PURE__ */ __name(function reverse(map) {
      const res = {};
      Object.keys(map).forEach(function(key) {
        if ((key | 0) == key)
          key = key | 0;
        const value = map[key];
        res[value] = key;
      });
      return res;
    }, "reverse");
    constants.der = require_der();
  }
});

// node_modules/asn1.js/lib/asn1.js
var require_asn1 = __commonJS({
  "node_modules/asn1.js/lib/asn1.js"(exports) {
    "use strict";
    init_modules_watch_stub();
    var asn1 = exports;
    asn1.bignum = require_bn();
    asn1.define = require_api().define;
    asn1.base = require_base();
    asn1.constants = require_constants();
    asn1.decoders = require_decoders();
    asn1.encoders = require_encoders();
  }
});

// node_modules/safe-buffer/index.js
var require_safe_buffer = __commonJS({
  "node_modules/safe-buffer/index.js"(exports, module) {
    init_modules_watch_stub();
    var buffer = require_buffer();
    var Buffer2 = buffer.Buffer;
    function copyProps(src, dst) {
      for (var key in src) {
        dst[key] = src[key];
      }
    }
    __name(copyProps, "copyProps");
    if (Buffer2.from && Buffer2.alloc && Buffer2.allocUnsafe && Buffer2.allocUnsafeSlow) {
      module.exports = buffer;
    } else {
      copyProps(buffer, exports);
      exports.Buffer = SafeBuffer;
    }
    function SafeBuffer(arg, encodingOrOffset, length) {
      return Buffer2(arg, encodingOrOffset, length);
    }
    __name(SafeBuffer, "SafeBuffer");
    SafeBuffer.prototype = Object.create(Buffer2.prototype);
    copyProps(Buffer2, SafeBuffer);
    SafeBuffer.from = function(arg, encodingOrOffset, length) {
      if (typeof arg === "number") {
        throw new TypeError("Argument must not be a number");
      }
      return Buffer2(arg, encodingOrOffset, length);
    };
    SafeBuffer.alloc = function(size, fill, encoding) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      var buf = Buffer2(size);
      if (fill !== void 0) {
        if (typeof encoding === "string") {
          buf.fill(fill, encoding);
        } else {
          buf.fill(fill);
        }
      } else {
        buf.fill(0);
      }
      return buf;
    };
    SafeBuffer.allocUnsafe = function(size) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      return Buffer2(size);
    };
    SafeBuffer.allocUnsafeSlow = function(size) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      return buffer.SlowBuffer(size);
    };
  }
});

// node-built-in-modules:stream
import libDefault3 from "stream";
var require_stream = __commonJS({
  "node-built-in-modules:stream"(exports, module) {
    init_modules_watch_stub();
    module.exports = libDefault3;
  }
});

// node-built-in-modules:util
import libDefault4 from "util";
var require_util = __commonJS({
  "node-built-in-modules:util"(exports, module) {
    init_modules_watch_stub();
    module.exports = libDefault4;
  }
});

// node_modules/jws/lib/data-stream.js
var require_data_stream = __commonJS({
  "node_modules/jws/lib/data-stream.js"(exports, module) {
    init_modules_watch_stub();
    var Buffer2 = require_safe_buffer().Buffer;
    var Stream = require_stream();
    var util = require_util();
    function DataStream(data) {
      this.buffer = null;
      this.writable = true;
      this.readable = true;
      if (!data) {
        this.buffer = Buffer2.alloc(0);
        return this;
      }
      if (typeof data.pipe === "function") {
        this.buffer = Buffer2.alloc(0);
        data.pipe(this);
        return this;
      }
      if (data.length || typeof data === "object") {
        this.buffer = data;
        this.writable = false;
        process.nextTick(function() {
          this.emit("end", data);
          this.readable = false;
          this.emit("close");
        }.bind(this));
        return this;
      }
      throw new TypeError("Unexpected data type (" + typeof data + ")");
    }
    __name(DataStream, "DataStream");
    util.inherits(DataStream, Stream);
    DataStream.prototype.write = /* @__PURE__ */ __name(function write(data) {
      this.buffer = Buffer2.concat([this.buffer, Buffer2.from(data)]);
      this.emit("data", data);
    }, "write");
    DataStream.prototype.end = /* @__PURE__ */ __name(function end(data) {
      if (data)
        this.write(data);
      this.emit("end", data);
      this.emit("close");
      this.writable = false;
      this.readable = false;
    }, "end");
    module.exports = DataStream;
  }
});

// node_modules/ecdsa-sig-formatter/src/param-bytes-for-alg.js
var require_param_bytes_for_alg = __commonJS({
  "node_modules/ecdsa-sig-formatter/src/param-bytes-for-alg.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    function getParamSize(keySize) {
      var result = (keySize / 8 | 0) + (keySize % 8 === 0 ? 0 : 1);
      return result;
    }
    __name(getParamSize, "getParamSize");
    var paramBytesForAlg = {
      ES256: getParamSize(256),
      ES384: getParamSize(384),
      ES512: getParamSize(521)
    };
    function getParamBytesForAlg(alg) {
      var paramBytes = paramBytesForAlg[alg];
      if (paramBytes) {
        return paramBytes;
      }
      throw new Error('Unknown algorithm "' + alg + '"');
    }
    __name(getParamBytesForAlg, "getParamBytesForAlg");
    module.exports = getParamBytesForAlg;
  }
});

// node_modules/ecdsa-sig-formatter/src/ecdsa-sig-formatter.js
var require_ecdsa_sig_formatter = __commonJS({
  "node_modules/ecdsa-sig-formatter/src/ecdsa-sig-formatter.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    var Buffer2 = require_safe_buffer().Buffer;
    var getParamBytesForAlg = require_param_bytes_for_alg();
    var MAX_OCTET = 128;
    var CLASS_UNIVERSAL = 0;
    var PRIMITIVE_BIT = 32;
    var TAG_SEQ = 16;
    var TAG_INT = 2;
    var ENCODED_TAG_SEQ = TAG_SEQ | PRIMITIVE_BIT | CLASS_UNIVERSAL << 6;
    var ENCODED_TAG_INT = TAG_INT | CLASS_UNIVERSAL << 6;
    function base64Url(base64) {
      return base64.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
    }
    __name(base64Url, "base64Url");
    function signatureAsBuffer(signature) {
      if (Buffer2.isBuffer(signature)) {
        return signature;
      } else if ("string" === typeof signature) {
        return Buffer2.from(signature, "base64");
      }
      throw new TypeError("ECDSA signature must be a Base64 string or a Buffer");
    }
    __name(signatureAsBuffer, "signatureAsBuffer");
    function derToJose(signature, alg) {
      signature = signatureAsBuffer(signature);
      var paramBytes = getParamBytesForAlg(alg);
      var maxEncodedParamLength = paramBytes + 1;
      var inputLength = signature.length;
      var offset = 0;
      if (signature[offset++] !== ENCODED_TAG_SEQ) {
        throw new Error('Could not find expected "seq"');
      }
      var seqLength = signature[offset++];
      if (seqLength === (MAX_OCTET | 1)) {
        seqLength = signature[offset++];
      }
      if (inputLength - offset < seqLength) {
        throw new Error('"seq" specified length of "' + seqLength + '", only "' + (inputLength - offset) + '" remaining');
      }
      if (signature[offset++] !== ENCODED_TAG_INT) {
        throw new Error('Could not find expected "int" for "r"');
      }
      var rLength = signature[offset++];
      if (inputLength - offset - 2 < rLength) {
        throw new Error('"r" specified length of "' + rLength + '", only "' + (inputLength - offset - 2) + '" available');
      }
      if (maxEncodedParamLength < rLength) {
        throw new Error('"r" specified length of "' + rLength + '", max of "' + maxEncodedParamLength + '" is acceptable');
      }
      var rOffset = offset;
      offset += rLength;
      if (signature[offset++] !== ENCODED_TAG_INT) {
        throw new Error('Could not find expected "int" for "s"');
      }
      var sLength = signature[offset++];
      if (inputLength - offset !== sLength) {
        throw new Error('"s" specified length of "' + sLength + '", expected "' + (inputLength - offset) + '"');
      }
      if (maxEncodedParamLength < sLength) {
        throw new Error('"s" specified length of "' + sLength + '", max of "' + maxEncodedParamLength + '" is acceptable');
      }
      var sOffset = offset;
      offset += sLength;
      if (offset !== inputLength) {
        throw new Error('Expected to consume entire buffer, but "' + (inputLength - offset) + '" bytes remain');
      }
      var rPadding = paramBytes - rLength, sPadding = paramBytes - sLength;
      var dst = Buffer2.allocUnsafe(rPadding + rLength + sPadding + sLength);
      for (offset = 0; offset < rPadding; ++offset) {
        dst[offset] = 0;
      }
      signature.copy(dst, offset, rOffset + Math.max(-rPadding, 0), rOffset + rLength);
      offset = paramBytes;
      for (var o = offset; offset < o + sPadding; ++offset) {
        dst[offset] = 0;
      }
      signature.copy(dst, offset, sOffset + Math.max(-sPadding, 0), sOffset + sLength);
      dst = dst.toString("base64");
      dst = base64Url(dst);
      return dst;
    }
    __name(derToJose, "derToJose");
    function countPadding(buf, start, stop) {
      var padding = 0;
      while (start + padding < stop && buf[start + padding] === 0) {
        ++padding;
      }
      var needsSign = buf[start + padding] >= MAX_OCTET;
      if (needsSign) {
        --padding;
      }
      return padding;
    }
    __name(countPadding, "countPadding");
    function joseToDer(signature, alg) {
      signature = signatureAsBuffer(signature);
      var paramBytes = getParamBytesForAlg(alg);
      var signatureBytes = signature.length;
      if (signatureBytes !== paramBytes * 2) {
        throw new TypeError('"' + alg + '" signatures must be "' + paramBytes * 2 + '" bytes, saw "' + signatureBytes + '"');
      }
      var rPadding = countPadding(signature, 0, paramBytes);
      var sPadding = countPadding(signature, paramBytes, signature.length);
      var rLength = paramBytes - rPadding;
      var sLength = paramBytes - sPadding;
      var rsBytes = 1 + 1 + rLength + 1 + 1 + sLength;
      var shortLength = rsBytes < MAX_OCTET;
      var dst = Buffer2.allocUnsafe((shortLength ? 2 : 3) + rsBytes);
      var offset = 0;
      dst[offset++] = ENCODED_TAG_SEQ;
      if (shortLength) {
        dst[offset++] = rsBytes;
      } else {
        dst[offset++] = MAX_OCTET | 1;
        dst[offset++] = rsBytes & 255;
      }
      dst[offset++] = ENCODED_TAG_INT;
      dst[offset++] = rLength;
      if (rPadding < 0) {
        dst[offset++] = 0;
        offset += signature.copy(dst, offset, 0, paramBytes);
      } else {
        offset += signature.copy(dst, offset, rPadding, paramBytes);
      }
      dst[offset++] = ENCODED_TAG_INT;
      dst[offset++] = sLength;
      if (sPadding < 0) {
        dst[offset++] = 0;
        signature.copy(dst, offset, paramBytes);
      } else {
        signature.copy(dst, offset, paramBytes + sPadding);
      }
      return dst;
    }
    __name(joseToDer, "joseToDer");
    module.exports = {
      derToJose,
      joseToDer
    };
  }
});

// node_modules/buffer-equal-constant-time/index.js
var require_buffer_equal_constant_time = __commonJS({
  "node_modules/buffer-equal-constant-time/index.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    var Buffer2 = require_buffer().Buffer;
    var SlowBuffer = require_buffer().SlowBuffer;
    module.exports = bufferEq;
    function bufferEq(a, b) {
      if (!Buffer2.isBuffer(a) || !Buffer2.isBuffer(b)) {
        return false;
      }
      if (a.length !== b.length) {
        return false;
      }
      var c = 0;
      for (var i = 0; i < a.length; i++) {
        c |= a[i] ^ b[i];
      }
      return c === 0;
    }
    __name(bufferEq, "bufferEq");
    bufferEq.install = function() {
      Buffer2.prototype.equal = SlowBuffer.prototype.equal = /* @__PURE__ */ __name(function equal(that) {
        return bufferEq(this, that);
      }, "equal");
    };
    var origBufEqual = Buffer2.prototype.equal;
    var origSlowBufEqual = SlowBuffer.prototype.equal;
    bufferEq.restore = function() {
      Buffer2.prototype.equal = origBufEqual;
      SlowBuffer.prototype.equal = origSlowBufEqual;
    };
  }
});

// node_modules/jwa/index.js
var require_jwa = __commonJS({
  "node_modules/jwa/index.js"(exports, module) {
    init_modules_watch_stub();
    var Buffer2 = require_safe_buffer().Buffer;
    var crypto2 = require_crypto();
    var formatEcdsa = require_ecdsa_sig_formatter();
    var util = require_util();
    var MSG_INVALID_ALGORITHM = '"%s" is not a valid algorithm.\n  Supported algorithms are:\n  "HS256", "HS384", "HS512", "RS256", "RS384", "RS512", "PS256", "PS384", "PS512", "ES256", "ES384", "ES512" and "none".';
    var MSG_INVALID_SECRET = "secret must be a string or buffer";
    var MSG_INVALID_VERIFIER_KEY = "key must be a string or a buffer";
    var MSG_INVALID_SIGNER_KEY = "key must be a string, a buffer or an object";
    var supportsKeyObjects = typeof crypto2.createPublicKey === "function";
    if (supportsKeyObjects) {
      MSG_INVALID_VERIFIER_KEY += " or a KeyObject";
      MSG_INVALID_SECRET += "or a KeyObject";
    }
    function checkIsPublicKey(key) {
      if (Buffer2.isBuffer(key)) {
        return;
      }
      if (typeof key === "string") {
        return;
      }
      if (!supportsKeyObjects) {
        throw typeError(MSG_INVALID_VERIFIER_KEY);
      }
      if (typeof key !== "object") {
        throw typeError(MSG_INVALID_VERIFIER_KEY);
      }
      if (typeof key.type !== "string") {
        throw typeError(MSG_INVALID_VERIFIER_KEY);
      }
      if (typeof key.asymmetricKeyType !== "string") {
        throw typeError(MSG_INVALID_VERIFIER_KEY);
      }
      if (typeof key.export !== "function") {
        throw typeError(MSG_INVALID_VERIFIER_KEY);
      }
    }
    __name(checkIsPublicKey, "checkIsPublicKey");
    function checkIsPrivateKey(key) {
      if (Buffer2.isBuffer(key)) {
        return;
      }
      if (typeof key === "string") {
        return;
      }
      if (typeof key === "object") {
        return;
      }
      throw typeError(MSG_INVALID_SIGNER_KEY);
    }
    __name(checkIsPrivateKey, "checkIsPrivateKey");
    function checkIsSecretKey(key) {
      if (Buffer2.isBuffer(key)) {
        return;
      }
      if (typeof key === "string") {
        return key;
      }
      if (!supportsKeyObjects) {
        throw typeError(MSG_INVALID_SECRET);
      }
      if (typeof key !== "object") {
        throw typeError(MSG_INVALID_SECRET);
      }
      if (key.type !== "secret") {
        throw typeError(MSG_INVALID_SECRET);
      }
      if (typeof key.export !== "function") {
        throw typeError(MSG_INVALID_SECRET);
      }
    }
    __name(checkIsSecretKey, "checkIsSecretKey");
    function fromBase64(base64) {
      return base64.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
    }
    __name(fromBase64, "fromBase64");
    function toBase64(base64url) {
      base64url = base64url.toString();
      var padding = 4 - base64url.length % 4;
      if (padding !== 4) {
        for (var i = 0; i < padding; ++i) {
          base64url += "=";
        }
      }
      return base64url.replace(/\-/g, "+").replace(/_/g, "/");
    }
    __name(toBase64, "toBase64");
    function typeError(template) {
      var args = [].slice.call(arguments, 1);
      var errMsg = util.format.bind(util, template).apply(null, args);
      return new TypeError(errMsg);
    }
    __name(typeError, "typeError");
    function bufferOrString(obj) {
      return Buffer2.isBuffer(obj) || typeof obj === "string";
    }
    __name(bufferOrString, "bufferOrString");
    function normalizeInput(thing) {
      if (!bufferOrString(thing))
        thing = JSON.stringify(thing);
      return thing;
    }
    __name(normalizeInput, "normalizeInput");
    function createHmacSigner(bits) {
      return /* @__PURE__ */ __name(function sign(thing, secret) {
        checkIsSecretKey(secret);
        thing = normalizeInput(thing);
        var hmac = crypto2.createHmac("sha" + bits, secret);
        var sig = (hmac.update(thing), hmac.digest("base64"));
        return fromBase64(sig);
      }, "sign");
    }
    __name(createHmacSigner, "createHmacSigner");
    var bufferEqual;
    var timingSafeEqual = "timingSafeEqual" in crypto2 ? /* @__PURE__ */ __name(function timingSafeEqual2(a, b) {
      if (a.byteLength !== b.byteLength) {
        return false;
      }
      return crypto2.timingSafeEqual(a, b);
    }, "timingSafeEqual") : /* @__PURE__ */ __name(function timingSafeEqual2(a, b) {
      if (!bufferEqual) {
        bufferEqual = require_buffer_equal_constant_time();
      }
      return bufferEqual(a, b);
    }, "timingSafeEqual");
    function createHmacVerifier(bits) {
      return /* @__PURE__ */ __name(function verify(thing, signature, secret) {
        var computedSig = createHmacSigner(bits)(thing, secret);
        return timingSafeEqual(Buffer2.from(signature), Buffer2.from(computedSig));
      }, "verify");
    }
    __name(createHmacVerifier, "createHmacVerifier");
    function createKeySigner(bits) {
      return /* @__PURE__ */ __name(function sign(thing, privateKey) {
        checkIsPrivateKey(privateKey);
        thing = normalizeInput(thing);
        var signer = crypto2.createSign("RSA-SHA" + bits);
        var sig = (signer.update(thing), signer.sign(privateKey, "base64"));
        return fromBase64(sig);
      }, "sign");
    }
    __name(createKeySigner, "createKeySigner");
    function createKeyVerifier(bits) {
      return /* @__PURE__ */ __name(function verify(thing, signature, publicKey) {
        checkIsPublicKey(publicKey);
        thing = normalizeInput(thing);
        signature = toBase64(signature);
        var verifier = crypto2.createVerify("RSA-SHA" + bits);
        verifier.update(thing);
        return verifier.verify(publicKey, signature, "base64");
      }, "verify");
    }
    __name(createKeyVerifier, "createKeyVerifier");
    function createPSSKeySigner(bits) {
      return /* @__PURE__ */ __name(function sign(thing, privateKey) {
        checkIsPrivateKey(privateKey);
        thing = normalizeInput(thing);
        var signer = crypto2.createSign("RSA-SHA" + bits);
        var sig = (signer.update(thing), signer.sign({
          key: privateKey,
          padding: crypto2.constants.RSA_PKCS1_PSS_PADDING,
          saltLength: crypto2.constants.RSA_PSS_SALTLEN_DIGEST
        }, "base64"));
        return fromBase64(sig);
      }, "sign");
    }
    __name(createPSSKeySigner, "createPSSKeySigner");
    function createPSSKeyVerifier(bits) {
      return /* @__PURE__ */ __name(function verify(thing, signature, publicKey) {
        checkIsPublicKey(publicKey);
        thing = normalizeInput(thing);
        signature = toBase64(signature);
        var verifier = crypto2.createVerify("RSA-SHA" + bits);
        verifier.update(thing);
        return verifier.verify({
          key: publicKey,
          padding: crypto2.constants.RSA_PKCS1_PSS_PADDING,
          saltLength: crypto2.constants.RSA_PSS_SALTLEN_DIGEST
        }, signature, "base64");
      }, "verify");
    }
    __name(createPSSKeyVerifier, "createPSSKeyVerifier");
    function createECDSASigner(bits) {
      var inner = createKeySigner(bits);
      return /* @__PURE__ */ __name(function sign() {
        var signature = inner.apply(null, arguments);
        signature = formatEcdsa.derToJose(signature, "ES" + bits);
        return signature;
      }, "sign");
    }
    __name(createECDSASigner, "createECDSASigner");
    function createECDSAVerifer(bits) {
      var inner = createKeyVerifier(bits);
      return /* @__PURE__ */ __name(function verify(thing, signature, publicKey) {
        signature = formatEcdsa.joseToDer(signature, "ES" + bits).toString("base64");
        var result = inner(thing, signature, publicKey);
        return result;
      }, "verify");
    }
    __name(createECDSAVerifer, "createECDSAVerifer");
    function createNoneSigner() {
      return /* @__PURE__ */ __name(function sign() {
        return "";
      }, "sign");
    }
    __name(createNoneSigner, "createNoneSigner");
    function createNoneVerifier() {
      return /* @__PURE__ */ __name(function verify(thing, signature) {
        return signature === "";
      }, "verify");
    }
    __name(createNoneVerifier, "createNoneVerifier");
    module.exports = /* @__PURE__ */ __name(function jwa(algorithm) {
      var signerFactories = {
        hs: createHmacSigner,
        rs: createKeySigner,
        ps: createPSSKeySigner,
        es: createECDSASigner,
        none: createNoneSigner
      };
      var verifierFactories = {
        hs: createHmacVerifier,
        rs: createKeyVerifier,
        ps: createPSSKeyVerifier,
        es: createECDSAVerifer,
        none: createNoneVerifier
      };
      var match = algorithm.match(/^(RS|PS|ES|HS)(256|384|512)$|^(none)$/);
      if (!match)
        throw typeError(MSG_INVALID_ALGORITHM, algorithm);
      var algo = (match[1] || match[3]).toLowerCase();
      var bits = match[2];
      return {
        sign: signerFactories[algo](bits),
        verify: verifierFactories[algo](bits)
      };
    }, "jwa");
  }
});

// node_modules/jws/lib/tostring.js
var require_tostring = __commonJS({
  "node_modules/jws/lib/tostring.js"(exports, module) {
    init_modules_watch_stub();
    var Buffer2 = require_buffer().Buffer;
    module.exports = /* @__PURE__ */ __name(function toString(obj) {
      if (typeof obj === "string")
        return obj;
      if (typeof obj === "number" || Buffer2.isBuffer(obj))
        return obj.toString();
      return JSON.stringify(obj);
    }, "toString");
  }
});

// node_modules/jws/lib/sign-stream.js
var require_sign_stream = __commonJS({
  "node_modules/jws/lib/sign-stream.js"(exports, module) {
    init_modules_watch_stub();
    var Buffer2 = require_safe_buffer().Buffer;
    var DataStream = require_data_stream();
    var jwa = require_jwa();
    var Stream = require_stream();
    var toString = require_tostring();
    var util = require_util();
    function base64url(string, encoding) {
      return Buffer2.from(string, encoding).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
    }
    __name(base64url, "base64url");
    function jwsSecuredInput(header, payload, encoding) {
      encoding = encoding || "utf8";
      var encodedHeader = base64url(toString(header), "binary");
      var encodedPayload = base64url(toString(payload), encoding);
      return util.format("%s.%s", encodedHeader, encodedPayload);
    }
    __name(jwsSecuredInput, "jwsSecuredInput");
    function jwsSign(opts) {
      var header = opts.header;
      var payload = opts.payload;
      var secretOrKey = opts.secret || opts.privateKey;
      var encoding = opts.encoding;
      var algo = jwa(header.alg);
      var securedInput = jwsSecuredInput(header, payload, encoding);
      var signature = algo.sign(securedInput, secretOrKey);
      return util.format("%s.%s", securedInput, signature);
    }
    __name(jwsSign, "jwsSign");
    function SignStream(opts) {
      var secret = opts.secret;
      secret = secret == null ? opts.privateKey : secret;
      secret = secret == null ? opts.key : secret;
      if (/^hs/i.test(opts.header.alg) === true && secret == null) {
        throw new TypeError("secret must be a string or buffer or a KeyObject");
      }
      var secretStream = new DataStream(secret);
      this.readable = true;
      this.header = opts.header;
      this.encoding = opts.encoding;
      this.secret = this.privateKey = this.key = secretStream;
      this.payload = new DataStream(opts.payload);
      this.secret.once("close", function() {
        if (!this.payload.writable && this.readable)
          this.sign();
      }.bind(this));
      this.payload.once("close", function() {
        if (!this.secret.writable && this.readable)
          this.sign();
      }.bind(this));
    }
    __name(SignStream, "SignStream");
    util.inherits(SignStream, Stream);
    SignStream.prototype.sign = /* @__PURE__ */ __name(function sign() {
      try {
        var signature = jwsSign({
          header: this.header,
          payload: this.payload.buffer,
          secret: this.secret.buffer,
          encoding: this.encoding
        });
        this.emit("done", signature);
        this.emit("data", signature);
        this.emit("end");
        this.readable = false;
        return signature;
      } catch (e) {
        this.readable = false;
        this.emit("error", e);
        this.emit("close");
      }
    }, "sign");
    SignStream.sign = jwsSign;
    module.exports = SignStream;
  }
});

// node_modules/jws/lib/verify-stream.js
var require_verify_stream = __commonJS({
  "node_modules/jws/lib/verify-stream.js"(exports, module) {
    init_modules_watch_stub();
    var Buffer2 = require_safe_buffer().Buffer;
    var DataStream = require_data_stream();
    var jwa = require_jwa();
    var Stream = require_stream();
    var toString = require_tostring();
    var util = require_util();
    var JWS_REGEX = /^[a-zA-Z0-9\-_]+?\.[a-zA-Z0-9\-_]+?\.([a-zA-Z0-9\-_]+)?$/;
    function isObject(thing) {
      return Object.prototype.toString.call(thing) === "[object Object]";
    }
    __name(isObject, "isObject");
    function safeJsonParse(thing) {
      if (isObject(thing))
        return thing;
      try {
        return JSON.parse(thing);
      } catch (e) {
        return void 0;
      }
    }
    __name(safeJsonParse, "safeJsonParse");
    function headerFromJWS(jwsSig) {
      var encodedHeader = jwsSig.split(".", 1)[0];
      return safeJsonParse(Buffer2.from(encodedHeader, "base64").toString("binary"));
    }
    __name(headerFromJWS, "headerFromJWS");
    function securedInputFromJWS(jwsSig) {
      return jwsSig.split(".", 2).join(".");
    }
    __name(securedInputFromJWS, "securedInputFromJWS");
    function signatureFromJWS(jwsSig) {
      return jwsSig.split(".")[2];
    }
    __name(signatureFromJWS, "signatureFromJWS");
    function payloadFromJWS(jwsSig, encoding) {
      encoding = encoding || "utf8";
      var payload = jwsSig.split(".")[1];
      return Buffer2.from(payload, "base64").toString(encoding);
    }
    __name(payloadFromJWS, "payloadFromJWS");
    function isValidJws(string) {
      return JWS_REGEX.test(string) && !!headerFromJWS(string);
    }
    __name(isValidJws, "isValidJws");
    function jwsVerify(jwsSig, algorithm, secretOrKey) {
      if (!algorithm) {
        var err = new Error("Missing algorithm parameter for jws.verify");
        err.code = "MISSING_ALGORITHM";
        throw err;
      }
      jwsSig = toString(jwsSig);
      var signature = signatureFromJWS(jwsSig);
      var securedInput = securedInputFromJWS(jwsSig);
      var algo = jwa(algorithm);
      return algo.verify(securedInput, signature, secretOrKey);
    }
    __name(jwsVerify, "jwsVerify");
    function jwsDecode(jwsSig, opts) {
      opts = opts || {};
      jwsSig = toString(jwsSig);
      if (!isValidJws(jwsSig))
        return null;
      var header = headerFromJWS(jwsSig);
      if (!header)
        return null;
      var payload = payloadFromJWS(jwsSig);
      if (header.typ === "JWT" || opts.json)
        payload = JSON.parse(payload, opts.encoding);
      return {
        header,
        payload,
        signature: signatureFromJWS(jwsSig)
      };
    }
    __name(jwsDecode, "jwsDecode");
    function VerifyStream(opts) {
      opts = opts || {};
      var secretOrKey = opts.secret;
      secretOrKey = secretOrKey == null ? opts.publicKey : secretOrKey;
      secretOrKey = secretOrKey == null ? opts.key : secretOrKey;
      if (/^hs/i.test(opts.algorithm) === true && secretOrKey == null) {
        throw new TypeError("secret must be a string or buffer or a KeyObject");
      }
      var secretStream = new DataStream(secretOrKey);
      this.readable = true;
      this.algorithm = opts.algorithm;
      this.encoding = opts.encoding;
      this.secret = this.publicKey = this.key = secretStream;
      this.signature = new DataStream(opts.signature);
      this.secret.once("close", function() {
        if (!this.signature.writable && this.readable)
          this.verify();
      }.bind(this));
      this.signature.once("close", function() {
        if (!this.secret.writable && this.readable)
          this.verify();
      }.bind(this));
    }
    __name(VerifyStream, "VerifyStream");
    util.inherits(VerifyStream, Stream);
    VerifyStream.prototype.verify = /* @__PURE__ */ __name(function verify() {
      try {
        var valid = jwsVerify(this.signature.buffer, this.algorithm, this.key.buffer);
        var obj = jwsDecode(this.signature.buffer, this.encoding);
        this.emit("done", valid, obj);
        this.emit("data", valid);
        this.emit("end");
        this.readable = false;
        return valid;
      } catch (e) {
        this.readable = false;
        this.emit("error", e);
        this.emit("close");
      }
    }, "verify");
    VerifyStream.decode = jwsDecode;
    VerifyStream.isValid = isValidJws;
    VerifyStream.verify = jwsVerify;
    module.exports = VerifyStream;
  }
});

// node_modules/jws/index.js
var require_jws = __commonJS({
  "node_modules/jws/index.js"(exports) {
    init_modules_watch_stub();
    var SignStream = require_sign_stream();
    var VerifyStream = require_verify_stream();
    var ALGORITHMS = [
      "HS256",
      "HS384",
      "HS512",
      "RS256",
      "RS384",
      "RS512",
      "PS256",
      "PS384",
      "PS512",
      "ES256",
      "ES384",
      "ES512"
    ];
    exports.ALGORITHMS = ALGORITHMS;
    exports.sign = SignStream.sign;
    exports.verify = VerifyStream.verify;
    exports.decode = VerifyStream.decode;
    exports.isValid = VerifyStream.isValid;
    exports.createSign = /* @__PURE__ */ __name(function createSign(opts) {
      return new SignStream(opts);
    }, "createSign");
    exports.createVerify = /* @__PURE__ */ __name(function createVerify(opts) {
      return new VerifyStream(opts);
    }, "createVerify");
  }
});

// node-built-in-modules:url
import libDefault5 from "url";
var require_url = __commonJS({
  "node-built-in-modules:url"(exports, module) {
    init_modules_watch_stub();
    module.exports = libDefault5;
  }
});

// node_modules/web-push/src/web-push-constants.js
var require_web_push_constants = __commonJS({
  "node_modules/web-push/src/web-push-constants.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    var WebPushConstants = {};
    WebPushConstants.supportedContentEncodings = {
      AES_GCM: "aesgcm",
      AES_128_GCM: "aes128gcm"
    };
    WebPushConstants.supportedUrgency = {
      VERY_LOW: "very-low",
      LOW: "low",
      NORMAL: "normal",
      HIGH: "high"
    };
    module.exports = WebPushConstants;
  }
});

// node_modules/web-push/src/urlsafe-base64-helper.js
var require_urlsafe_base64_helper = __commonJS({
  "node_modules/web-push/src/urlsafe-base64-helper.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    function validate(base64) {
      return /^[A-Za-z0-9\-_]+$/.test(base64);
    }
    __name(validate, "validate");
    module.exports = {
      validate
    };
  }
});

// node_modules/web-push/src/vapid-helper.js
var require_vapid_helper = __commonJS({
  "node_modules/web-push/src/vapid-helper.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    var crypto2 = require_crypto();
    var asn1 = require_asn1();
    var jws = require_jws();
    var { URL: URL2 } = require_url();
    var WebPushConstants = require_web_push_constants();
    var urlBase64Helper = require_urlsafe_base64_helper();
    var DEFAULT_EXPIRATION_SECONDS = 12 * 60 * 60;
    var MAX_EXPIRATION_SECONDS = 24 * 60 * 60;
    var ECPrivateKeyASN = asn1.define("ECPrivateKey", function() {
      this.seq().obj(
        this.key("version").int(),
        this.key("privateKey").octstr(),
        this.key("parameters").explicit(0).objid().optional(),
        this.key("publicKey").explicit(1).bitstr().optional()
      );
    });
    function toPEM(key) {
      return ECPrivateKeyASN.encode({
        version: 1,
        privateKey: key,
        parameters: [1, 2, 840, 10045, 3, 1, 7]
        // prime256v1
      }, "pem", {
        label: "EC PRIVATE KEY"
      });
    }
    __name(toPEM, "toPEM");
    function generateVAPIDKeys() {
      const curve = crypto2.createECDH("prime256v1");
      curve.generateKeys();
      let publicKeyBuffer = curve.getPublicKey();
      let privateKeyBuffer = curve.getPrivateKey();
      if (privateKeyBuffer.length < 32) {
        const padding = Buffer.alloc(32 - privateKeyBuffer.length);
        padding.fill(0);
        privateKeyBuffer = Buffer.concat([padding, privateKeyBuffer]);
      }
      if (publicKeyBuffer.length < 65) {
        const padding = Buffer.alloc(65 - publicKeyBuffer.length);
        padding.fill(0);
        publicKeyBuffer = Buffer.concat([padding, publicKeyBuffer]);
      }
      return {
        publicKey: publicKeyBuffer.toString("base64url"),
        privateKey: privateKeyBuffer.toString("base64url")
      };
    }
    __name(generateVAPIDKeys, "generateVAPIDKeys");
    function validateSubject(subject) {
      if (!subject) {
        throw new Error("No subject set in vapidDetails.subject.");
      }
      if (typeof subject !== "string" || subject.length === 0) {
        throw new Error("The subject value must be a string containing an https: URL or mailto: address. " + subject);
      }
      let subjectParseResult = null;
      try {
        subjectParseResult = new URL2(subject);
      } catch (err) {
        throw new Error("Vapid subject is not a valid URL. " + subject);
      }
      if (!["https:", "mailto:"].includes(subjectParseResult.protocol)) {
        throw new Error("Vapid subject is not an https: or mailto: URL. " + subject);
      }
      if (subjectParseResult.hostname === "localhost") {
        console.warn("Vapid subject points to a localhost web URI, which is unsupported by Apple's push notification server and will result in a BadJwtToken error when sending notifications.");
      }
    }
    __name(validateSubject, "validateSubject");
    function validatePublicKey(publicKey) {
      if (!publicKey) {
        throw new Error("No key set vapidDetails.publicKey");
      }
      if (typeof publicKey !== "string") {
        throw new Error("Vapid public key is must be a URL safe Base 64 encoded string.");
      }
      if (!urlBase64Helper.validate(publicKey)) {
        throw new Error('Vapid public key must be a URL safe Base 64 (without "=")');
      }
      publicKey = Buffer.from(publicKey, "base64url");
      if (publicKey.length !== 65) {
        throw new Error("Vapid public key should be 65 bytes long when decoded.");
      }
    }
    __name(validatePublicKey, "validatePublicKey");
    function validatePrivateKey(privateKey) {
      if (!privateKey) {
        throw new Error("No key set in vapidDetails.privateKey");
      }
      if (typeof privateKey !== "string") {
        throw new Error("Vapid private key must be a URL safe Base 64 encoded string.");
      }
      if (!urlBase64Helper.validate(privateKey)) {
        throw new Error('Vapid private key must be a URL safe Base 64 (without "=")');
      }
      privateKey = Buffer.from(privateKey, "base64url");
      if (privateKey.length !== 32) {
        throw new Error("Vapid private key should be 32 bytes long when decoded.");
      }
    }
    __name(validatePrivateKey, "validatePrivateKey");
    function getFutureExpirationTimestamp(numSeconds) {
      const futureExp = /* @__PURE__ */ new Date();
      futureExp.setSeconds(futureExp.getSeconds() + numSeconds);
      return Math.floor(futureExp.getTime() / 1e3);
    }
    __name(getFutureExpirationTimestamp, "getFutureExpirationTimestamp");
    function validateExpiration(expiration) {
      if (!Number.isInteger(expiration)) {
        throw new Error("`expiration` value must be a number");
      }
      if (expiration < 0) {
        throw new Error("`expiration` must be a positive integer");
      }
      const maxExpirationTimestamp = getFutureExpirationTimestamp(MAX_EXPIRATION_SECONDS);
      if (expiration >= maxExpirationTimestamp) {
        throw new Error("`expiration` value is greater than maximum of 24 hours");
      }
    }
    __name(validateExpiration, "validateExpiration");
    function getVapidHeaders(audience, subject, publicKey, privateKey, contentEncoding, expiration) {
      if (!audience) {
        throw new Error("No audience could be generated for VAPID.");
      }
      if (typeof audience !== "string" || audience.length === 0) {
        throw new Error("The audience value must be a string containing the origin of a push service. " + audience);
      }
      try {
        new URL2(audience);
      } catch (err) {
        throw new Error("VAPID audience is not a url. " + audience);
      }
      validateSubject(subject);
      validatePublicKey(publicKey);
      validatePrivateKey(privateKey);
      privateKey = Buffer.from(privateKey, "base64url");
      if (expiration) {
        validateExpiration(expiration);
      } else {
        expiration = getFutureExpirationTimestamp(DEFAULT_EXPIRATION_SECONDS);
      }
      const header = {
        typ: "JWT",
        alg: "ES256"
      };
      const jwtPayload = {
        aud: audience,
        exp: expiration,
        sub: subject
      };
      const jwt = jws.sign({
        header,
        payload: jwtPayload,
        privateKey: toPEM(privateKey)
      });
      if (contentEncoding === WebPushConstants.supportedContentEncodings.AES_128_GCM) {
        return {
          Authorization: "vapid t=" + jwt + ", k=" + publicKey
        };
      }
      if (contentEncoding === WebPushConstants.supportedContentEncodings.AES_GCM) {
        return {
          Authorization: "WebPush " + jwt,
          "Crypto-Key": "p256ecdsa=" + publicKey
        };
      }
      throw new Error("Unsupported encoding type specified.");
    }
    __name(getVapidHeaders, "getVapidHeaders");
    module.exports = {
      generateVAPIDKeys,
      getFutureExpirationTimestamp,
      getVapidHeaders,
      validateSubject,
      validatePublicKey,
      validatePrivateKey,
      validateExpiration
    };
  }
});

// node_modules/http_ece/ece.js
var require_ece = __commonJS({
  "node_modules/http_ece/ece.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    var crypto2 = require_crypto();
    var AES_GCM = "aes-128-gcm";
    var PAD_SIZE = { "aes128gcm": 1, "aesgcm": 2 };
    var TAG_LENGTH = 16;
    var KEY_LENGTH = 16;
    var NONCE_LENGTH = 12;
    var SHA_256_LENGTH = 32;
    var MODE_ENCRYPT = "encrypt";
    var MODE_DECRYPT = "decrypt";
    var keylog;
    if (process.env.ECE_KEYLOG === "1") {
      keylog = /* @__PURE__ */ __name(function(m, k) {
        console.warn(m + " [" + k.length + "]: " + k.toString("base64url"));
        return k;
      }, "keylog");
    } else {
      keylog = /* @__PURE__ */ __name(function(m, k) {
        return k;
      }, "keylog");
    }
    function decode(b) {
      if (typeof b === "string") {
        return Buffer.from(b, "base64url");
      }
      return b;
    }
    __name(decode, "decode");
    function HMAC_hash(key, input) {
      var hmac = crypto2.createHmac("sha256", key);
      hmac.update(input);
      return hmac.digest();
    }
    __name(HMAC_hash, "HMAC_hash");
    function HKDF_extract(salt, ikm) {
      keylog("salt", salt);
      keylog("ikm", ikm);
      return keylog("extract", HMAC_hash(salt, ikm));
    }
    __name(HKDF_extract, "HKDF_extract");
    function HKDF_expand(prk, info2, l) {
      keylog("prk", prk);
      keylog("info", info2);
      var output = Buffer.alloc(0);
      var T = Buffer.alloc(0);
      info2 = Buffer.from(info2, "ascii");
      var counter = 0;
      var cbuf = Buffer.alloc(1);
      while (output.length < l) {
        cbuf.writeUIntBE(++counter, 0, 1);
        T = HMAC_hash(prk, Buffer.concat([T, info2, cbuf]));
        output = Buffer.concat([output, T]);
      }
      return keylog("expand", output.slice(0, l));
    }
    __name(HKDF_expand, "HKDF_expand");
    function HKDF(salt, ikm, info2, len) {
      return HKDF_expand(HKDF_extract(salt, ikm), info2, len);
    }
    __name(HKDF, "HKDF");
    function info(base, context) {
      var result = Buffer.concat([
        Buffer.from("Content-Encoding: " + base + "\0", "ascii"),
        context
      ]);
      keylog("info " + base, result);
      return result;
    }
    __name(info, "info");
    function lengthPrefix(buffer) {
      var b = Buffer.concat([Buffer.alloc(2), buffer]);
      b.writeUIntBE(buffer.length, 0, 2);
      return b;
    }
    __name(lengthPrefix, "lengthPrefix");
    function extractDH(header, mode) {
      var key = header.privateKey;
      var senderPubKey, receiverPubKey;
      if (mode === MODE_ENCRYPT) {
        senderPubKey = key.getPublicKey();
        receiverPubKey = header.dh;
      } else if (mode === MODE_DECRYPT) {
        senderPubKey = header.dh;
        receiverPubKey = key.getPublicKey();
      } else {
        throw new Error("Unknown mode only " + MODE_ENCRYPT + " and " + MODE_DECRYPT + " supported");
      }
      return {
        secret: key.computeSecret(header.dh),
        context: Buffer.concat([
          Buffer.from(header.keylabel, "ascii"),
          Buffer.from([0]),
          lengthPrefix(receiverPubKey),
          // user agent
          lengthPrefix(senderPubKey)
          // application server
        ])
      };
    }
    __name(extractDH, "extractDH");
    function extractSecretAndContext(header, mode) {
      var result = { secret: null, context: Buffer.alloc(0) };
      if (header.key) {
        result.secret = header.key;
        if (result.secret.length !== KEY_LENGTH) {
          throw new Error("An explicit key must be " + KEY_LENGTH + " bytes");
        }
      } else if (header.dh) {
        result = extractDH(header, mode);
      } else if (typeof header.keyid !== void 0) {
        result.secret = header.keymap[header.keyid];
      }
      if (!result.secret) {
        throw new Error("Unable to determine key");
      }
      keylog("secret", result.secret);
      keylog("context", result.context);
      if (header.authSecret) {
        result.secret = HKDF(
          header.authSecret,
          result.secret,
          info("auth", Buffer.alloc(0)),
          SHA_256_LENGTH
        );
        keylog("authsecret", result.secret);
      }
      return result;
    }
    __name(extractSecretAndContext, "extractSecretAndContext");
    function webpushSecret(header, mode) {
      if (!header.authSecret) {
        throw new Error("No authentication secret for webpush");
      }
      keylog("authsecret", header.authSecret);
      var remotePubKey, senderPubKey, receiverPubKey;
      if (mode === MODE_ENCRYPT) {
        senderPubKey = header.privateKey.getPublicKey();
        remotePubKey = receiverPubKey = header.dh;
      } else if (mode === MODE_DECRYPT) {
        remotePubKey = senderPubKey = header.keyid;
        receiverPubKey = header.privateKey.getPublicKey();
      } else {
        throw new Error("Unknown mode only " + MODE_ENCRYPT + " and " + MODE_DECRYPT + " supported");
      }
      keylog("remote pubkey", remotePubKey);
      keylog("sender pubkey", senderPubKey);
      keylog("receiver pubkey", receiverPubKey);
      return keylog(
        "secret dh",
        HKDF(
          header.authSecret,
          header.privateKey.computeSecret(remotePubKey),
          Buffer.concat([
            Buffer.from("WebPush: info\0"),
            receiverPubKey,
            senderPubKey
          ]),
          SHA_256_LENGTH
        )
      );
    }
    __name(webpushSecret, "webpushSecret");
    function extractSecret(header, mode, keyLookupCallback) {
      if (keyLookupCallback) {
        if (!isFunction(keyLookupCallback)) {
          throw new Error("Callback is not a function");
        }
      }
      if (header.key) {
        if (header.key.length !== KEY_LENGTH) {
          throw new Error("An explicit key must be " + KEY_LENGTH + " bytes");
        }
        return keylog("secret key", header.key);
      }
      if (!header.privateKey) {
        if (!keyLookupCallback) {
          var key = header.keymap && header.keymap[header.keyid];
        } else {
          var key = keyLookupCallback(header.keyid);
        }
        if (!key) {
          throw new Error('No saved key (keyid: "' + header.keyid + '")');
        }
        return key;
      }
      return webpushSecret(header, mode);
    }
    __name(extractSecret, "extractSecret");
    function deriveKeyAndNonce(header, mode, lookupKeyCallback) {
      if (!header.salt) {
        throw new Error("must include a salt parameter for " + header.version);
      }
      var keyInfo;
      var nonceInfo;
      var secret;
      if (header.version === "aesgcm") {
        var s = extractSecretAndContext(header, mode, lookupKeyCallback);
        keyInfo = info("aesgcm", s.context);
        nonceInfo = info("nonce", s.context);
        secret = s.secret;
      } else if (header.version === "aes128gcm") {
        keyInfo = Buffer.from("Content-Encoding: aes128gcm\0");
        nonceInfo = Buffer.from("Content-Encoding: nonce\0");
        secret = extractSecret(header, mode, lookupKeyCallback);
      } else {
        throw new Error("Unable to set context for mode " + header.version);
      }
      var prk = HKDF_extract(header.salt, secret);
      var result = {
        key: HKDF_expand(prk, keyInfo, KEY_LENGTH),
        nonce: HKDF_expand(prk, nonceInfo, NONCE_LENGTH)
      };
      keylog("key", result.key);
      keylog("nonce base", result.nonce);
      return result;
    }
    __name(deriveKeyAndNonce, "deriveKeyAndNonce");
    function parseParams(params) {
      var header = {};
      header.version = params.version || "aes128gcm";
      header.rs = parseInt(params.rs, 10);
      if (isNaN(header.rs)) {
        header.rs = 4096;
      }
      var overhead = PAD_SIZE[header.version];
      if (header.version === "aes128gcm") {
        overhead += TAG_LENGTH;
      }
      if (header.rs <= overhead) {
        throw new Error("The rs parameter has to be greater than " + overhead);
      }
      if (params.salt) {
        header.salt = decode(params.salt);
        if (header.salt.length !== KEY_LENGTH) {
          throw new Error("The salt parameter must be " + KEY_LENGTH + " bytes");
        }
      }
      header.keyid = params.keyid;
      if (params.key) {
        header.key = decode(params.key);
      } else {
        header.privateKey = params.privateKey;
        if (!header.privateKey) {
          header.keymap = params.keymap;
        }
        if (header.version !== "aes128gcm") {
          header.keylabel = params.keylabel || "P-256";
        }
        if (params.dh) {
          header.dh = decode(params.dh);
        }
      }
      if (params.authSecret) {
        header.authSecret = decode(params.authSecret);
      }
      return header;
    }
    __name(parseParams, "parseParams");
    function generateNonce(base, counter) {
      var nonce = Buffer.from(base);
      var m = nonce.readUIntBE(nonce.length - 6, 6);
      var x = ((m ^ counter) & 16777215) + ((m / 16777216 ^ counter / 16777216) & 16777215) * 16777216;
      nonce.writeUIntBE(x, nonce.length - 6, 6);
      keylog("nonce" + counter, nonce);
      return nonce;
    }
    __name(generateNonce, "generateNonce");
    function readHeader(buffer, header) {
      var idsz = buffer.readUIntBE(20, 1);
      header.salt = buffer.slice(0, KEY_LENGTH);
      header.rs = buffer.readUIntBE(KEY_LENGTH, 4);
      header.keyid = buffer.slice(21, 21 + idsz);
      return 21 + idsz;
    }
    __name(readHeader, "readHeader");
    function unpadLegacy(data, version) {
      var padSize = PAD_SIZE[version];
      var pad = data.readUIntBE(0, padSize);
      if (pad + padSize > data.length) {
        throw new Error("padding exceeds block size");
      }
      keylog("padding", data.slice(0, padSize + pad));
      var padCheck = Buffer.alloc(pad);
      padCheck.fill(0);
      if (padCheck.compare(data.slice(padSize, padSize + pad)) !== 0) {
        throw new Error("invalid padding");
      }
      return data.slice(padSize + pad);
    }
    __name(unpadLegacy, "unpadLegacy");
    function unpad(data, last) {
      var i = data.length - 1;
      while (i >= 0) {
        if (data[i]) {
          if (last) {
            if (data[i] !== 2) {
              throw new Error("last record needs to start padding with a 2");
            }
          } else {
            if (data[i] !== 1) {
              throw new Error("last record needs to start padding with a 2");
            }
          }
          return data.slice(0, i);
        }
        --i;
      }
      throw new Error("all zero plaintext");
    }
    __name(unpad, "unpad");
    function decryptRecord(key, counter, buffer, header, last) {
      keylog("decrypt", buffer);
      var nonce = generateNonce(key.nonce, counter);
      var gcm = crypto2.createDecipheriv(AES_GCM, key.key, nonce);
      gcm.setAuthTag(buffer.slice(buffer.length - TAG_LENGTH));
      var data = gcm.update(buffer.slice(0, buffer.length - TAG_LENGTH));
      data = Buffer.concat([data, gcm.final()]);
      keylog("decrypted", data);
      if (header.version !== "aes128gcm") {
        return unpadLegacy(data, header.version);
      }
      return unpad(data, last);
    }
    __name(decryptRecord, "decryptRecord");
    function decrypt(buffer, params, keyLookupCallback) {
      var header = parseParams(params);
      if (header.version === "aes128gcm") {
        var headerLength = readHeader(buffer, header);
        buffer = buffer.slice(headerLength);
      }
      var key = deriveKeyAndNonce(header, MODE_DECRYPT, keyLookupCallback);
      var start = 0;
      var result = Buffer.alloc(0);
      var chunkSize = header.rs;
      if (header.version !== "aes128gcm") {
        chunkSize += TAG_LENGTH;
      }
      for (var i = 0; start < buffer.length; ++i) {
        var end = start + chunkSize;
        if (header.version !== "aes128gcm" && end === buffer.length) {
          throw new Error("Truncated payload");
        }
        end = Math.min(end, buffer.length);
        if (end - start <= TAG_LENGTH) {
          throw new Error("Invalid block: too small at " + i);
        }
        var block = decryptRecord(
          key,
          i,
          buffer.slice(start, end),
          header,
          end >= buffer.length
        );
        result = Buffer.concat([result, block]);
        start = end;
      }
      return result;
    }
    __name(decrypt, "decrypt");
    function encryptRecord(key, counter, buffer, pad, header, last) {
      keylog("encrypt", buffer);
      pad = pad || 0;
      var nonce = generateNonce(key.nonce, counter);
      var gcm = crypto2.createCipheriv(AES_GCM, key.key, nonce);
      var ciphertext = [];
      var padSize = PAD_SIZE[header.version];
      var padding = Buffer.alloc(pad + padSize);
      padding.fill(0);
      if (header.version !== "aes128gcm") {
        padding.writeUIntBE(pad, 0, padSize);
        keylog("padding", padding);
        ciphertext.push(gcm.update(padding));
        ciphertext.push(gcm.update(buffer));
        if (!last && padding.length + buffer.length < header.rs) {
          throw new Error("Unable to pad to record size");
        }
      } else {
        ciphertext.push(gcm.update(buffer));
        padding.writeUIntBE(last ? 2 : 1, 0, 1);
        keylog("padding", padding);
        ciphertext.push(gcm.update(padding));
      }
      gcm.final();
      var tag = gcm.getAuthTag();
      if (tag.length !== TAG_LENGTH) {
        throw new Error("invalid tag generated");
      }
      ciphertext.push(tag);
      return keylog("encrypted", Buffer.concat(ciphertext));
    }
    __name(encryptRecord, "encryptRecord");
    function writeHeader(header) {
      var ints = Buffer.alloc(5);
      var keyid = Buffer.from(header.keyid || []);
      if (keyid.length > 255) {
        throw new Error("keyid is too large");
      }
      ints.writeUIntBE(header.rs, 0, 4);
      ints.writeUIntBE(keyid.length, 4, 1);
      return Buffer.concat([header.salt, ints, keyid]);
    }
    __name(writeHeader, "writeHeader");
    function encrypt(buffer, params, keyLookupCallback) {
      if (!Buffer.isBuffer(buffer)) {
        throw new Error("buffer argument must be a Buffer");
      }
      var header = parseParams(params);
      if (!header.salt) {
        header.salt = crypto2.randomBytes(KEY_LENGTH);
      }
      var result;
      if (header.version === "aes128gcm") {
        if (header.privateKey && !header.keyid) {
          header.keyid = header.privateKey.getPublicKey();
        }
        result = writeHeader(header);
      } else {
        result = Buffer.alloc(0);
      }
      var key = deriveKeyAndNonce(header, MODE_ENCRYPT, keyLookupCallback);
      var start = 0;
      var padSize = PAD_SIZE[header.version];
      var overhead = padSize;
      if (header.version === "aes128gcm") {
        overhead += TAG_LENGTH;
      }
      var pad = isNaN(parseInt(params.pad, 10)) ? 0 : parseInt(params.pad, 10);
      var counter = 0;
      var last = false;
      while (!last) {
        var recordPad = Math.min(header.rs - overhead - 1, pad);
        if (header.version !== "aes128gcm") {
          recordPad = Math.min((1 << padSize * 8) - 1, recordPad);
        }
        if (pad > 0 && recordPad === 0) {
          ++recordPad;
        }
        pad -= recordPad;
        var end = start + header.rs - overhead - recordPad;
        if (header.version !== "aes128gcm") {
          last = end > buffer.length;
        } else {
          last = end >= buffer.length;
        }
        last = last && pad <= 0;
        var block = encryptRecord(
          key,
          counter,
          buffer.slice(start, end),
          recordPad,
          header,
          last
        );
        result = Buffer.concat([result, block]);
        start = end;
        ++counter;
      }
      return result;
    }
    __name(encrypt, "encrypt");
    function isFunction(object) {
      return typeof object === "function";
    }
    __name(isFunction, "isFunction");
    module.exports = {
      decrypt,
      encrypt
    };
  }
});

// node_modules/web-push/src/encryption-helper.js
var require_encryption_helper = __commonJS({
  "node_modules/web-push/src/encryption-helper.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    var crypto2 = require_crypto();
    var ece = require_ece();
    var encrypt = /* @__PURE__ */ __name(function(userPublicKey, userAuth, payload, contentEncoding) {
      if (!userPublicKey) {
        throw new Error("No user public key provided for encryption.");
      }
      if (typeof userPublicKey !== "string") {
        throw new Error("The subscription p256dh value must be a string.");
      }
      if (Buffer.from(userPublicKey, "base64url").length !== 65) {
        throw new Error("The subscription p256dh value should be 65 bytes long.");
      }
      if (!userAuth) {
        throw new Error("No user auth provided for encryption.");
      }
      if (typeof userAuth !== "string") {
        throw new Error("The subscription auth key must be a string.");
      }
      if (Buffer.from(userAuth, "base64url").length < 16) {
        throw new Error("The subscription auth key should be at least 16 bytes long");
      }
      if (typeof payload !== "string" && !Buffer.isBuffer(payload)) {
        throw new Error("Payload must be either a string or a Node Buffer.");
      }
      if (typeof payload === "string" || payload instanceof String) {
        payload = Buffer.from(payload);
      }
      const localCurve = crypto2.createECDH("prime256v1");
      const localPublicKey = localCurve.generateKeys();
      const salt = crypto2.randomBytes(16).toString("base64url");
      const cipherText = ece.encrypt(payload, {
        version: contentEncoding,
        dh: userPublicKey,
        privateKey: localCurve,
        salt,
        authSecret: userAuth
      });
      return {
        localPublicKey,
        salt,
        cipherText
      };
    }, "encrypt");
    module.exports = {
      encrypt
    };
  }
});

// node-built-in-modules:https
import libDefault6 from "https";
var require_https = __commonJS({
  "node-built-in-modules:https"(exports, module) {
    init_modules_watch_stub();
    module.exports = libDefault6;
  }
});

// node_modules/web-push/src/web-push-error.js
var require_web_push_error = __commonJS({
  "node_modules/web-push/src/web-push-error.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    function WebPushError(message, statusCode, headers, body, endpoint) {
      Error.captureStackTrace(this, this.constructor);
      this.name = this.constructor.name;
      this.message = message;
      this.statusCode = statusCode;
      this.headers = headers;
      this.body = body;
      this.endpoint = endpoint;
    }
    __name(WebPushError, "WebPushError");
    require_util().inherits(WebPushError, Error);
    module.exports = WebPushError;
  }
});

// node-built-in-modules:net
import libDefault7 from "net";
var require_net = __commonJS({
  "node-built-in-modules:net"(exports, module) {
    init_modules_watch_stub();
    module.exports = libDefault7;
  }
});

// node-built-in-modules:tls
import libDefault8 from "tls";
var require_tls = __commonJS({
  "node-built-in-modules:tls"(exports, module) {
    init_modules_watch_stub();
    module.exports = libDefault8;
  }
});

// node-built-in-modules:assert
import libDefault9 from "assert";
var require_assert = __commonJS({
  "node-built-in-modules:assert"(exports, module) {
    init_modules_watch_stub();
    module.exports = libDefault9;
  }
});

// node_modules/ms/index.js
var require_ms = __commonJS({
  "node_modules/ms/index.js"(exports, module) {
    init_modules_watch_stub();
    var s = 1e3;
    var m = s * 60;
    var h = m * 60;
    var d = h * 24;
    var w = d * 7;
    var y = d * 365.25;
    module.exports = function(val, options) {
      options = options || {};
      var type = typeof val;
      if (type === "string" && val.length > 0) {
        return parse(val);
      } else if (type === "number" && isFinite(val)) {
        return options.long ? fmtLong(val) : fmtShort(val);
      }
      throw new Error(
        "val is not a non-empty string or a valid number. val=" + JSON.stringify(val)
      );
    };
    function parse(str) {
      str = String(str);
      if (str.length > 100) {
        return;
      }
      var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
        str
      );
      if (!match) {
        return;
      }
      var n = parseFloat(match[1]);
      var type = (match[2] || "ms").toLowerCase();
      switch (type) {
        case "years":
        case "year":
        case "yrs":
        case "yr":
        case "y":
          return n * y;
        case "weeks":
        case "week":
        case "w":
          return n * w;
        case "days":
        case "day":
        case "d":
          return n * d;
        case "hours":
        case "hour":
        case "hrs":
        case "hr":
        case "h":
          return n * h;
        case "minutes":
        case "minute":
        case "mins":
        case "min":
        case "m":
          return n * m;
        case "seconds":
        case "second":
        case "secs":
        case "sec":
        case "s":
          return n * s;
        case "milliseconds":
        case "millisecond":
        case "msecs":
        case "msec":
        case "ms":
          return n;
        default:
          return void 0;
      }
    }
    __name(parse, "parse");
    function fmtShort(ms) {
      var msAbs = Math.abs(ms);
      if (msAbs >= d) {
        return Math.round(ms / d) + "d";
      }
      if (msAbs >= h) {
        return Math.round(ms / h) + "h";
      }
      if (msAbs >= m) {
        return Math.round(ms / m) + "m";
      }
      if (msAbs >= s) {
        return Math.round(ms / s) + "s";
      }
      return ms + "ms";
    }
    __name(fmtShort, "fmtShort");
    function fmtLong(ms) {
      var msAbs = Math.abs(ms);
      if (msAbs >= d) {
        return plural(ms, msAbs, d, "day");
      }
      if (msAbs >= h) {
        return plural(ms, msAbs, h, "hour");
      }
      if (msAbs >= m) {
        return plural(ms, msAbs, m, "minute");
      }
      if (msAbs >= s) {
        return plural(ms, msAbs, s, "second");
      }
      return ms + " ms";
    }
    __name(fmtLong, "fmtLong");
    function plural(ms, msAbs, n, name) {
      var isPlural = msAbs >= n * 1.5;
      return Math.round(ms / n) + " " + name + (isPlural ? "s" : "");
    }
    __name(plural, "plural");
  }
});

// node_modules/debug/src/common.js
var require_common = __commonJS({
  "node_modules/debug/src/common.js"(exports, module) {
    init_modules_watch_stub();
    function setup(env) {
      createDebug.debug = createDebug;
      createDebug.default = createDebug;
      createDebug.coerce = coerce;
      createDebug.disable = disable;
      createDebug.enable = enable;
      createDebug.enabled = enabled;
      createDebug.humanize = require_ms();
      createDebug.destroy = destroy;
      Object.keys(env).forEach((key) => {
        createDebug[key] = env[key];
      });
      createDebug.names = [];
      createDebug.skips = [];
      createDebug.formatters = {};
      function selectColor(namespace) {
        let hash = 0;
        for (let i = 0; i < namespace.length; i++) {
          hash = (hash << 5) - hash + namespace.charCodeAt(i);
          hash |= 0;
        }
        return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
      }
      __name(selectColor, "selectColor");
      createDebug.selectColor = selectColor;
      function createDebug(namespace) {
        let prevTime;
        let enableOverride = null;
        let namespacesCache;
        let enabledCache;
        function debug(...args) {
          if (!debug.enabled) {
            return;
          }
          const self = debug;
          const curr = Number(/* @__PURE__ */ new Date());
          const ms = curr - (prevTime || curr);
          self.diff = ms;
          self.prev = prevTime;
          self.curr = curr;
          prevTime = curr;
          args[0] = createDebug.coerce(args[0]);
          if (typeof args[0] !== "string") {
            args.unshift("%O");
          }
          let index = 0;
          args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
            if (match === "%%") {
              return "%";
            }
            index++;
            const formatter = createDebug.formatters[format];
            if (typeof formatter === "function") {
              const val = args[index];
              match = formatter.call(self, val);
              args.splice(index, 1);
              index--;
            }
            return match;
          });
          createDebug.formatArgs.call(self, args);
          const logFn = self.log || createDebug.log;
          logFn.apply(self, args);
        }
        __name(debug, "debug");
        debug.namespace = namespace;
        debug.useColors = createDebug.useColors();
        debug.color = createDebug.selectColor(namespace);
        debug.extend = extend;
        debug.destroy = createDebug.destroy;
        Object.defineProperty(debug, "enabled", {
          enumerable: true,
          configurable: false,
          get: /* @__PURE__ */ __name(() => {
            if (enableOverride !== null) {
              return enableOverride;
            }
            if (namespacesCache !== createDebug.namespaces) {
              namespacesCache = createDebug.namespaces;
              enabledCache = createDebug.enabled(namespace);
            }
            return enabledCache;
          }, "get"),
          set: /* @__PURE__ */ __name((v) => {
            enableOverride = v;
          }, "set")
        });
        if (typeof createDebug.init === "function") {
          createDebug.init(debug);
        }
        return debug;
      }
      __name(createDebug, "createDebug");
      function extend(namespace, delimiter) {
        const newDebug = createDebug(this.namespace + (typeof delimiter === "undefined" ? ":" : delimiter) + namespace);
        newDebug.log = this.log;
        return newDebug;
      }
      __name(extend, "extend");
      function enable(namespaces) {
        createDebug.save(namespaces);
        createDebug.namespaces = namespaces;
        createDebug.names = [];
        createDebug.skips = [];
        const split = (typeof namespaces === "string" ? namespaces : "").trim().replace(/\s+/g, ",").split(",").filter(Boolean);
        for (const ns of split) {
          if (ns[0] === "-") {
            createDebug.skips.push(ns.slice(1));
          } else {
            createDebug.names.push(ns);
          }
        }
      }
      __name(enable, "enable");
      function matchesTemplate(search, template) {
        let searchIndex = 0;
        let templateIndex = 0;
        let starIndex = -1;
        let matchIndex = 0;
        while (searchIndex < search.length) {
          if (templateIndex < template.length && (template[templateIndex] === search[searchIndex] || template[templateIndex] === "*")) {
            if (template[templateIndex] === "*") {
              starIndex = templateIndex;
              matchIndex = searchIndex;
              templateIndex++;
            } else {
              searchIndex++;
              templateIndex++;
            }
          } else if (starIndex !== -1) {
            templateIndex = starIndex + 1;
            matchIndex++;
            searchIndex = matchIndex;
          } else {
            return false;
          }
        }
        while (templateIndex < template.length && template[templateIndex] === "*") {
          templateIndex++;
        }
        return templateIndex === template.length;
      }
      __name(matchesTemplate, "matchesTemplate");
      function disable() {
        const namespaces = [
          ...createDebug.names,
          ...createDebug.skips.map((namespace) => "-" + namespace)
        ].join(",");
        createDebug.enable("");
        return namespaces;
      }
      __name(disable, "disable");
      function enabled(name) {
        for (const skip of createDebug.skips) {
          if (matchesTemplate(name, skip)) {
            return false;
          }
        }
        for (const ns of createDebug.names) {
          if (matchesTemplate(name, ns)) {
            return true;
          }
        }
        return false;
      }
      __name(enabled, "enabled");
      function coerce(val) {
        if (val instanceof Error) {
          return val.stack || val.message;
        }
        return val;
      }
      __name(coerce, "coerce");
      function destroy() {
        console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
      }
      __name(destroy, "destroy");
      createDebug.enable(createDebug.load());
      return createDebug;
    }
    __name(setup, "setup");
    module.exports = setup;
  }
});

// node_modules/debug/src/browser.js
var require_browser = __commonJS({
  "node_modules/debug/src/browser.js"(exports, module) {
    init_modules_watch_stub();
    exports.formatArgs = formatArgs;
    exports.save = save;
    exports.load = load;
    exports.useColors = useColors;
    exports.storage = localstorage();
    exports.destroy = /* @__PURE__ */ (() => {
      let warned = false;
      return () => {
        if (!warned) {
          warned = true;
          console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
        }
      };
    })();
    exports.colors = [
      "#0000CC",
      "#0000FF",
      "#0033CC",
      "#0033FF",
      "#0066CC",
      "#0066FF",
      "#0099CC",
      "#0099FF",
      "#00CC00",
      "#00CC33",
      "#00CC66",
      "#00CC99",
      "#00CCCC",
      "#00CCFF",
      "#3300CC",
      "#3300FF",
      "#3333CC",
      "#3333FF",
      "#3366CC",
      "#3366FF",
      "#3399CC",
      "#3399FF",
      "#33CC00",
      "#33CC33",
      "#33CC66",
      "#33CC99",
      "#33CCCC",
      "#33CCFF",
      "#6600CC",
      "#6600FF",
      "#6633CC",
      "#6633FF",
      "#66CC00",
      "#66CC33",
      "#9900CC",
      "#9900FF",
      "#9933CC",
      "#9933FF",
      "#99CC00",
      "#99CC33",
      "#CC0000",
      "#CC0033",
      "#CC0066",
      "#CC0099",
      "#CC00CC",
      "#CC00FF",
      "#CC3300",
      "#CC3333",
      "#CC3366",
      "#CC3399",
      "#CC33CC",
      "#CC33FF",
      "#CC6600",
      "#CC6633",
      "#CC9900",
      "#CC9933",
      "#CCCC00",
      "#CCCC33",
      "#FF0000",
      "#FF0033",
      "#FF0066",
      "#FF0099",
      "#FF00CC",
      "#FF00FF",
      "#FF3300",
      "#FF3333",
      "#FF3366",
      "#FF3399",
      "#FF33CC",
      "#FF33FF",
      "#FF6600",
      "#FF6633",
      "#FF9900",
      "#FF9933",
      "#FFCC00",
      "#FFCC33"
    ];
    function useColors() {
      if (typeof window !== "undefined" && window.process && (window.process.type === "renderer" || window.process.__nwjs)) {
        return true;
      }
      if (typeof navigator !== "undefined" && "Cloudflare-Workers" && "Cloudflare-Workers".toLowerCase().match(/(edge|trident)\/(\d+)/)) {
        return false;
      }
      let m;
      return typeof document !== "undefined" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // Is firebug? http://stackoverflow.com/a/398120/376773
      typeof window !== "undefined" && window.console && (window.console.firebug || window.console.exception && window.console.table) || // Is firefox >= v31?
      // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
      typeof navigator !== "undefined" && "Cloudflare-Workers" && (m = "Cloudflare-Workers".toLowerCase().match(/firefox\/(\d+)/)) && parseInt(m[1], 10) >= 31 || // Double check webkit in userAgent just in case we are in a worker
      typeof navigator !== "undefined" && "Cloudflare-Workers" && "Cloudflare-Workers".toLowerCase().match(/applewebkit\/(\d+)/);
    }
    __name(useColors, "useColors");
    function formatArgs(args) {
      args[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + args[0] + (this.useColors ? "%c " : " ") + "+" + module.exports.humanize(this.diff);
      if (!this.useColors) {
        return;
      }
      const c = "color: " + this.color;
      args.splice(1, 0, c, "color: inherit");
      let index = 0;
      let lastC = 0;
      args[0].replace(/%[a-zA-Z%]/g, (match) => {
        if (match === "%%") {
          return;
        }
        index++;
        if (match === "%c") {
          lastC = index;
        }
      });
      args.splice(lastC, 0, c);
    }
    __name(formatArgs, "formatArgs");
    exports.log = console.debug || console.log || (() => {
    });
    function save(namespaces) {
      try {
        if (namespaces) {
          exports.storage.setItem("debug", namespaces);
        } else {
          exports.storage.removeItem("debug");
        }
      } catch (error) {
      }
    }
    __name(save, "save");
    function load() {
      let r;
      try {
        r = exports.storage.getItem("debug") || exports.storage.getItem("DEBUG");
      } catch (error) {
      }
      if (!r && typeof process !== "undefined" && "env" in process) {
        r = process.env.DEBUG;
      }
      return r;
    }
    __name(load, "load");
    function localstorage() {
      try {
        return localStorage;
      } catch (error) {
      }
    }
    __name(localstorage, "localstorage");
    module.exports = require_common()(exports);
    var { formatters } = module.exports;
    formatters.j = function(v) {
      try {
        return JSON.stringify(v);
      } catch (error) {
        return "[UnexpectedJSONParseError]: " + error.message;
      }
    };
  }
});

// node-built-in-modules:tty
import libDefault10 from "tty";
var require_tty = __commonJS({
  "node-built-in-modules:tty"(exports, module) {
    init_modules_watch_stub();
    module.exports = libDefault10;
  }
});

// node_modules/supports-color/browser.js
var browser_exports = {};
__export(browser_exports, {
  default: () => browser_default
});
var level, colorSupport, supportsColor, browser_default;
var init_browser = __esm({
  "node_modules/supports-color/browser.js"() {
    init_modules_watch_stub();
    level = (() => {
      if (!("navigator" in globalThis)) {
        return 0;
      }
      if (globalThis.navigator.userAgentData) {
        const brand = navigator.userAgentData.brands.find(({ brand: brand2 }) => brand2 === "Chromium");
        if (brand?.version > 93) {
          return 3;
        }
      }
      if (/\b(Chrome|Chromium)\//.test(globalThis.navigator.userAgent)) {
        return 1;
      }
      return 0;
    })();
    colorSupport = level !== 0 && {
      level,
      hasBasic: true,
      has256: level >= 2,
      has16m: level >= 3
    };
    supportsColor = {
      stdout: colorSupport,
      stderr: colorSupport
    };
    browser_default = supportsColor;
  }
});

// node_modules/debug/src/node.js
var require_node2 = __commonJS({
  "node_modules/debug/src/node.js"(exports, module) {
    init_modules_watch_stub();
    var tty = require_tty();
    var util = require_util();
    exports.init = init;
    exports.log = log;
    exports.formatArgs = formatArgs;
    exports.save = save;
    exports.load = load;
    exports.useColors = useColors;
    exports.destroy = util.deprecate(
      () => {
      },
      "Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."
    );
    exports.colors = [6, 2, 3, 4, 5, 1];
    try {
      const supportsColor2 = (init_browser(), __toCommonJS(browser_exports));
      if (supportsColor2 && (supportsColor2.stderr || supportsColor2).level >= 2) {
        exports.colors = [
          20,
          21,
          26,
          27,
          32,
          33,
          38,
          39,
          40,
          41,
          42,
          43,
          44,
          45,
          56,
          57,
          62,
          63,
          68,
          69,
          74,
          75,
          76,
          77,
          78,
          79,
          80,
          81,
          92,
          93,
          98,
          99,
          112,
          113,
          128,
          129,
          134,
          135,
          148,
          149,
          160,
          161,
          162,
          163,
          164,
          165,
          166,
          167,
          168,
          169,
          170,
          171,
          172,
          173,
          178,
          179,
          184,
          185,
          196,
          197,
          198,
          199,
          200,
          201,
          202,
          203,
          204,
          205,
          206,
          207,
          208,
          209,
          214,
          215,
          220,
          221
        ];
      }
    } catch (error) {
    }
    exports.inspectOpts = Object.keys(process.env).filter((key) => {
      return /^debug_/i.test(key);
    }).reduce((obj, key) => {
      const prop = key.substring(6).toLowerCase().replace(/_([a-z])/g, (_, k) => {
        return k.toUpperCase();
      });
      let val = process.env[key];
      if (/^(yes|on|true|enabled)$/i.test(val)) {
        val = true;
      } else if (/^(no|off|false|disabled)$/i.test(val)) {
        val = false;
      } else if (val === "null") {
        val = null;
      } else {
        val = Number(val);
      }
      obj[prop] = val;
      return obj;
    }, {});
    function useColors() {
      return "colors" in exports.inspectOpts ? Boolean(exports.inspectOpts.colors) : tty.isatty(process.stderr.fd);
    }
    __name(useColors, "useColors");
    function formatArgs(args) {
      const { namespace: name, useColors: useColors2 } = this;
      if (useColors2) {
        const c = this.color;
        const colorCode = "\x1B[3" + (c < 8 ? c : "8;5;" + c);
        const prefix = `  ${colorCode};1m${name} \x1B[0m`;
        args[0] = prefix + args[0].split("\n").join("\n" + prefix);
        args.push(colorCode + "m+" + module.exports.humanize(this.diff) + "\x1B[0m");
      } else {
        args[0] = getDate() + name + " " + args[0];
      }
    }
    __name(formatArgs, "formatArgs");
    function getDate() {
      if (exports.inspectOpts.hideDate) {
        return "";
      }
      return (/* @__PURE__ */ new Date()).toISOString() + " ";
    }
    __name(getDate, "getDate");
    function log(...args) {
      return process.stderr.write(util.formatWithOptions(exports.inspectOpts, ...args) + "\n");
    }
    __name(log, "log");
    function save(namespaces) {
      if (namespaces) {
        process.env.DEBUG = namespaces;
      } else {
        delete process.env.DEBUG;
      }
    }
    __name(save, "save");
    function load() {
      return process.env.DEBUG;
    }
    __name(load, "load");
    function init(debug) {
      debug.inspectOpts = {};
      const keys = Object.keys(exports.inspectOpts);
      for (let i = 0; i < keys.length; i++) {
        debug.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
      }
    }
    __name(init, "init");
    module.exports = require_common()(exports);
    var { formatters } = module.exports;
    formatters.o = function(v) {
      this.inspectOpts.colors = this.useColors;
      return util.inspect(v, this.inspectOpts).split("\n").map((str) => str.trim()).join(" ");
    };
    formatters.O = function(v) {
      this.inspectOpts.colors = this.useColors;
      return util.inspect(v, this.inspectOpts);
    };
  }
});

// node_modules/debug/src/index.js
var require_src = __commonJS({
  "node_modules/debug/src/index.js"(exports, module) {
    init_modules_watch_stub();
    if (typeof process === "undefined" || process.type === "renderer" || process.browser === true || process.__nwjs) {
      module.exports = require_browser();
    } else {
      module.exports = require_node2();
    }
  }
});

// node-built-in-modules:http
import libDefault11 from "http";
var require_http = __commonJS({
  "node-built-in-modules:http"(exports, module) {
    init_modules_watch_stub();
    module.exports = libDefault11;
  }
});

// node_modules/agent-base/dist/helpers.js
var require_helpers = __commonJS({
  "node_modules/agent-base/dist/helpers.js"(exports) {
    "use strict";
    init_modules_watch_stub();
    var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: /* @__PURE__ */ __name(function() {
          return m[k];
        }, "get") };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.req = exports.json = exports.toBuffer = void 0;
    var http = __importStar(require_http());
    var https = __importStar(require_https());
    async function toBuffer(stream) {
      let length = 0;
      const chunks = [];
      for await (const chunk of stream) {
        length += chunk.length;
        chunks.push(chunk);
      }
      return Buffer.concat(chunks, length);
    }
    __name(toBuffer, "toBuffer");
    exports.toBuffer = toBuffer;
    async function json2(stream) {
      const buf = await toBuffer(stream);
      const str = buf.toString("utf8");
      try {
        return JSON.parse(str);
      } catch (_err) {
        const err = _err;
        err.message += ` (input: ${str})`;
        throw err;
      }
    }
    __name(json2, "json");
    exports.json = json2;
    function req(url, opts = {}) {
      const href = typeof url === "string" ? url : url.href;
      const req2 = (href.startsWith("https:") ? https : http).request(url, opts);
      const promise = new Promise((resolve, reject) => {
        req2.once("response", resolve).once("error", reject).end();
      });
      req2.then = promise.then.bind(promise);
      return req2;
    }
    __name(req, "req");
    exports.req = req;
  }
});

// node_modules/agent-base/dist/index.js
var require_dist = __commonJS({
  "node_modules/agent-base/dist/index.js"(exports) {
    "use strict";
    init_modules_watch_stub();
    var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: /* @__PURE__ */ __name(function() {
          return m[k];
        }, "get") };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p)) __createBinding(exports2, m, p);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Agent = void 0;
    var net = __importStar(require_net());
    var http = __importStar(require_http());
    var https_1 = require_https();
    __exportStar(require_helpers(), exports);
    var INTERNAL = /* @__PURE__ */ Symbol("AgentBaseInternalState");
    var Agent = class extends http.Agent {
      static {
        __name(this, "Agent");
      }
      constructor(opts) {
        super(opts);
        this[INTERNAL] = {};
      }
      /**
       * Determine whether this is an `http` or `https` request.
       */
      isSecureEndpoint(options) {
        if (options) {
          if (typeof options.secureEndpoint === "boolean") {
            return options.secureEndpoint;
          }
          if (typeof options.protocol === "string") {
            return options.protocol === "https:";
          }
        }
        const { stack } = new Error();
        if (typeof stack !== "string")
          return false;
        return stack.split("\n").some((l) => l.indexOf("(https.js:") !== -1 || l.indexOf("node:https:") !== -1);
      }
      // In order to support async signatures in `connect()` and Node's native
      // connection pooling in `http.Agent`, the array of sockets for each origin
      // has to be updated synchronously. This is so the length of the array is
      // accurate when `addRequest()` is next called. We achieve this by creating a
      // fake socket and adding it to `sockets[origin]` and incrementing
      // `totalSocketCount`.
      incrementSockets(name) {
        if (this.maxSockets === Infinity && this.maxTotalSockets === Infinity) {
          return null;
        }
        if (!this.sockets[name]) {
          this.sockets[name] = [];
        }
        const fakeSocket = new net.Socket({ writable: false });
        this.sockets[name].push(fakeSocket);
        this.totalSocketCount++;
        return fakeSocket;
      }
      decrementSockets(name, socket) {
        if (!this.sockets[name] || socket === null) {
          return;
        }
        const sockets = this.sockets[name];
        const index = sockets.indexOf(socket);
        if (index !== -1) {
          sockets.splice(index, 1);
          this.totalSocketCount--;
          if (sockets.length === 0) {
            delete this.sockets[name];
          }
        }
      }
      // In order to properly update the socket pool, we need to call `getName()` on
      // the core `https.Agent` if it is a secureEndpoint.
      getName(options) {
        const secureEndpoint = this.isSecureEndpoint(options);
        if (secureEndpoint) {
          return https_1.Agent.prototype.getName.call(this, options);
        }
        return super.getName(options);
      }
      createSocket(req, options, cb) {
        const connectOpts = {
          ...options,
          secureEndpoint: this.isSecureEndpoint(options)
        };
        const name = this.getName(connectOpts);
        const fakeSocket = this.incrementSockets(name);
        Promise.resolve().then(() => this.connect(req, connectOpts)).then((socket) => {
          this.decrementSockets(name, fakeSocket);
          if (socket instanceof http.Agent) {
            try {
              return socket.addRequest(req, connectOpts);
            } catch (err) {
              return cb(err);
            }
          }
          this[INTERNAL].currentSocket = socket;
          super.createSocket(req, options, cb);
        }, (err) => {
          this.decrementSockets(name, fakeSocket);
          cb(err);
        });
      }
      createConnection() {
        const socket = this[INTERNAL].currentSocket;
        this[INTERNAL].currentSocket = void 0;
        if (!socket) {
          throw new Error("No socket was returned in the `connect()` function");
        }
        return socket;
      }
      get defaultPort() {
        return this[INTERNAL].defaultPort ?? (this.protocol === "https:" ? 443 : 80);
      }
      set defaultPort(v) {
        if (this[INTERNAL]) {
          this[INTERNAL].defaultPort = v;
        }
      }
      get protocol() {
        return this[INTERNAL].protocol ?? (this.isSecureEndpoint() ? "https:" : "http:");
      }
      set protocol(v) {
        if (this[INTERNAL]) {
          this[INTERNAL].protocol = v;
        }
      }
    };
    exports.Agent = Agent;
  }
});

// node_modules/https-proxy-agent/dist/parse-proxy-response.js
var require_parse_proxy_response = __commonJS({
  "node_modules/https-proxy-agent/dist/parse-proxy-response.js"(exports) {
    "use strict";
    init_modules_watch_stub();
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.parseProxyResponse = void 0;
    var debug_1 = __importDefault(require_src());
    var debug = (0, debug_1.default)("https-proxy-agent:parse-proxy-response");
    function parseProxyResponse(socket) {
      return new Promise((resolve, reject) => {
        let buffersLength = 0;
        const buffers = [];
        function read() {
          const b = socket.read();
          if (b)
            ondata(b);
          else
            socket.once("readable", read);
        }
        __name(read, "read");
        function cleanup() {
          socket.removeListener("end", onend);
          socket.removeListener("error", onerror);
          socket.removeListener("readable", read);
        }
        __name(cleanup, "cleanup");
        function onend() {
          cleanup();
          debug("onend");
          reject(new Error("Proxy connection ended before receiving CONNECT response"));
        }
        __name(onend, "onend");
        function onerror(err) {
          cleanup();
          debug("onerror %o", err);
          reject(err);
        }
        __name(onerror, "onerror");
        function ondata(b) {
          buffers.push(b);
          buffersLength += b.length;
          const buffered = Buffer.concat(buffers, buffersLength);
          const endOfHeaders = buffered.indexOf("\r\n\r\n");
          if (endOfHeaders === -1) {
            debug("have not received end of HTTP headers yet...");
            read();
            return;
          }
          const headerParts = buffered.slice(0, endOfHeaders).toString("ascii").split("\r\n");
          const firstLine = headerParts.shift();
          if (!firstLine) {
            socket.destroy();
            return reject(new Error("No header received from proxy CONNECT response"));
          }
          const firstLineParts = firstLine.split(" ");
          const statusCode = +firstLineParts[1];
          const statusText = firstLineParts.slice(2).join(" ");
          const headers = {};
          for (const header of headerParts) {
            if (!header)
              continue;
            const firstColon = header.indexOf(":");
            if (firstColon === -1) {
              socket.destroy();
              return reject(new Error(`Invalid header from proxy CONNECT response: "${header}"`));
            }
            const key = header.slice(0, firstColon).toLowerCase();
            const value = header.slice(firstColon + 1).trimStart();
            const current = headers[key];
            if (typeof current === "string") {
              headers[key] = [current, value];
            } else if (Array.isArray(current)) {
              current.push(value);
            } else {
              headers[key] = value;
            }
          }
          debug("got proxy server response: %o %o", firstLine, headers);
          cleanup();
          resolve({
            connect: {
              statusCode,
              statusText,
              headers
            },
            buffered
          });
        }
        __name(ondata, "ondata");
        socket.on("error", onerror);
        socket.on("end", onend);
        read();
      });
    }
    __name(parseProxyResponse, "parseProxyResponse");
    exports.parseProxyResponse = parseProxyResponse;
  }
});

// node_modules/https-proxy-agent/dist/index.js
var require_dist2 = __commonJS({
  "node_modules/https-proxy-agent/dist/index.js"(exports) {
    "use strict";
    init_modules_watch_stub();
    var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: /* @__PURE__ */ __name(function() {
          return m[k];
        }, "get") };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HttpsProxyAgent = void 0;
    var net = __importStar(require_net());
    var tls = __importStar(require_tls());
    var assert_1 = __importDefault(require_assert());
    var debug_1 = __importDefault(require_src());
    var agent_base_1 = require_dist();
    var url_1 = require_url();
    var parse_proxy_response_1 = require_parse_proxy_response();
    var debug = (0, debug_1.default)("https-proxy-agent");
    var setServernameFromNonIpHost = /* @__PURE__ */ __name((options) => {
      if (options.servername === void 0 && options.host && !net.isIP(options.host)) {
        return {
          ...options,
          servername: options.host
        };
      }
      return options;
    }, "setServernameFromNonIpHost");
    var HttpsProxyAgent = class extends agent_base_1.Agent {
      static {
        __name(this, "HttpsProxyAgent");
      }
      constructor(proxy, opts) {
        super(opts);
        this.options = { path: void 0 };
        this.proxy = typeof proxy === "string" ? new url_1.URL(proxy) : proxy;
        this.proxyHeaders = opts?.headers ?? {};
        debug("Creating new HttpsProxyAgent instance: %o", this.proxy.href);
        const host = (this.proxy.hostname || this.proxy.host).replace(/^\[|\]$/g, "");
        const port = this.proxy.port ? parseInt(this.proxy.port, 10) : this.proxy.protocol === "https:" ? 443 : 80;
        this.connectOpts = {
          // Attempt to negotiate http/1.1 for proxy servers that support http/2
          ALPNProtocols: ["http/1.1"],
          ...opts ? omit(opts, "headers") : null,
          host,
          port
        };
      }
      /**
       * Called when the node-core HTTP client library is creating a
       * new HTTP request.
       */
      async connect(req, opts) {
        const { proxy } = this;
        if (!opts.host) {
          throw new TypeError('No "host" provided');
        }
        let socket;
        if (proxy.protocol === "https:") {
          debug("Creating `tls.Socket`: %o", this.connectOpts);
          socket = tls.connect(setServernameFromNonIpHost(this.connectOpts));
        } else {
          debug("Creating `net.Socket`: %o", this.connectOpts);
          socket = net.connect(this.connectOpts);
        }
        const headers = typeof this.proxyHeaders === "function" ? this.proxyHeaders() : { ...this.proxyHeaders };
        const host = net.isIPv6(opts.host) ? `[${opts.host}]` : opts.host;
        let payload = `CONNECT ${host}:${opts.port} HTTP/1.1\r
`;
        if (proxy.username || proxy.password) {
          const auth = `${decodeURIComponent(proxy.username)}:${decodeURIComponent(proxy.password)}`;
          headers["Proxy-Authorization"] = `Basic ${Buffer.from(auth).toString("base64")}`;
        }
        headers.Host = `${host}:${opts.port}`;
        if (!headers["Proxy-Connection"]) {
          headers["Proxy-Connection"] = this.keepAlive ? "Keep-Alive" : "close";
        }
        for (const name of Object.keys(headers)) {
          payload += `${name}: ${headers[name]}\r
`;
        }
        const proxyResponsePromise = (0, parse_proxy_response_1.parseProxyResponse)(socket);
        socket.write(`${payload}\r
`);
        const { connect, buffered } = await proxyResponsePromise;
        req.emit("proxyConnect", connect);
        this.emit("proxyConnect", connect, req);
        if (connect.statusCode === 200) {
          req.once("socket", resume);
          if (opts.secureEndpoint) {
            debug("Upgrading socket connection to TLS");
            return tls.connect({
              ...omit(setServernameFromNonIpHost(opts), "host", "path", "port"),
              socket
            });
          }
          return socket;
        }
        socket.destroy();
        const fakeSocket = new net.Socket({ writable: false });
        fakeSocket.readable = true;
        req.once("socket", (s) => {
          debug("Replaying proxy buffer for failed request");
          (0, assert_1.default)(s.listenerCount("data") > 0);
          s.push(buffered);
          s.push(null);
        });
        return fakeSocket;
      }
    };
    HttpsProxyAgent.protocols = ["http", "https"];
    exports.HttpsProxyAgent = HttpsProxyAgent;
    function resume(socket) {
      socket.resume();
    }
    __name(resume, "resume");
    function omit(obj, ...keys) {
      const ret = {};
      let key;
      for (key in obj) {
        if (!keys.includes(key)) {
          ret[key] = obj[key];
        }
      }
      return ret;
    }
    __name(omit, "omit");
  }
});

// node_modules/web-push/src/web-push-lib.js
var require_web_push_lib = __commonJS({
  "node_modules/web-push/src/web-push-lib.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    var url = require_url();
    var https = require_https();
    var WebPushError = require_web_push_error();
    var vapidHelper = require_vapid_helper();
    var encryptionHelper = require_encryption_helper();
    var webPushConstants = require_web_push_constants();
    var urlBase64Helper = require_urlsafe_base64_helper();
    var DEFAULT_TTL = 2419200;
    var gcmAPIKey = "";
    var vapidDetails;
    function WebPushLib() {
    }
    __name(WebPushLib, "WebPushLib");
    WebPushLib.prototype.setGCMAPIKey = function(apiKey) {
      if (apiKey === null) {
        gcmAPIKey = null;
        return;
      }
      if (typeof apiKey === "undefined" || typeof apiKey !== "string" || apiKey.length === 0) {
        throw new Error("The GCM API Key should be a non-empty string or null.");
      }
      gcmAPIKey = apiKey;
    };
    WebPushLib.prototype.setVapidDetails = function(subject, publicKey, privateKey) {
      if (arguments.length === 1 && arguments[0] === null) {
        vapidDetails = null;
        return;
      }
      vapidHelper.validateSubject(subject);
      vapidHelper.validatePublicKey(publicKey);
      vapidHelper.validatePrivateKey(privateKey);
      vapidDetails = {
        subject,
        publicKey,
        privateKey
      };
    };
    WebPushLib.prototype.generateRequestDetails = function(subscription, payload, options) {
      if (!subscription || !subscription.endpoint) {
        throw new Error("You must pass in a subscription with at least an endpoint.");
      }
      if (typeof subscription.endpoint !== "string" || subscription.endpoint.length === 0) {
        throw new Error("The subscription endpoint must be a string with a valid URL.");
      }
      if (payload) {
        if (typeof subscription !== "object" || !subscription.keys || !subscription.keys.p256dh || !subscription.keys.auth) {
          throw new Error("To send a message with a payload, the subscription must have 'auth' and 'p256dh' keys.");
        }
      }
      let currentGCMAPIKey = gcmAPIKey;
      let currentVapidDetails = vapidDetails;
      let timeToLive = DEFAULT_TTL;
      let extraHeaders = {};
      let contentEncoding = webPushConstants.supportedContentEncodings.AES_128_GCM;
      let urgency = webPushConstants.supportedUrgency.NORMAL;
      let topic;
      let proxy;
      let agent;
      let timeout;
      if (options) {
        const validOptionKeys = [
          "headers",
          "gcmAPIKey",
          "vapidDetails",
          "TTL",
          "contentEncoding",
          "urgency",
          "topic",
          "proxy",
          "agent",
          "timeout"
        ];
        const optionKeys = Object.keys(options);
        for (let i = 0; i < optionKeys.length; i += 1) {
          const optionKey = optionKeys[i];
          if (!validOptionKeys.includes(optionKey)) {
            throw new Error("'" + optionKey + "' is an invalid option. The valid options are ['" + validOptionKeys.join("', '") + "'].");
          }
        }
        if (options.headers) {
          extraHeaders = options.headers;
          let duplicates = Object.keys(extraHeaders).filter(function(header) {
            return typeof options[header] !== "undefined";
          });
          if (duplicates.length > 0) {
            throw new Error("Duplicated headers defined [" + duplicates.join(",") + "]. Please either define the header in thetop level options OR in the 'headers' key.");
          }
        }
        if (options.gcmAPIKey) {
          currentGCMAPIKey = options.gcmAPIKey;
        }
        if (options.vapidDetails !== void 0) {
          currentVapidDetails = options.vapidDetails;
        }
        if (options.TTL !== void 0) {
          timeToLive = Number(options.TTL);
          if (timeToLive < 0) {
            throw new Error("TTL should be a number and should be at least 0");
          }
        }
        if (options.contentEncoding) {
          if (options.contentEncoding === webPushConstants.supportedContentEncodings.AES_128_GCM || options.contentEncoding === webPushConstants.supportedContentEncodings.AES_GCM) {
            contentEncoding = options.contentEncoding;
          } else {
            throw new Error("Unsupported content encoding specified.");
          }
        }
        if (options.urgency) {
          if (options.urgency === webPushConstants.supportedUrgency.VERY_LOW || options.urgency === webPushConstants.supportedUrgency.LOW || options.urgency === webPushConstants.supportedUrgency.NORMAL || options.urgency === webPushConstants.supportedUrgency.HIGH) {
            urgency = options.urgency;
          } else {
            throw new Error("Unsupported urgency specified.");
          }
        }
        if (options.topic) {
          if (!urlBase64Helper.validate(options.topic)) {
            throw new Error("Unsupported characters set use the URL or filename-safe Base64 characters set");
          }
          if (options.topic.length > 32) {
            throw new Error("use maximum of 32 characters from the URL or filename-safe Base64 characters set");
          }
          topic = options.topic;
        }
        if (options.proxy) {
          if (typeof options.proxy === "string" || typeof options.proxy.host === "string") {
            proxy = options.proxy;
          } else {
            console.warn("Attempt to use proxy option, but invalid type it should be a string or proxy options object.");
          }
        }
        if (options.agent) {
          if (options.agent instanceof https.Agent) {
            if (proxy) {
              console.warn("Agent option will be ignored because proxy option is defined.");
            }
            agent = options.agent;
          } else {
            console.warn("Wrong type for the agent option, it should be an instance of https.Agent.");
          }
        }
        if (typeof options.timeout === "number") {
          timeout = options.timeout;
        }
      }
      if (typeof timeToLive === "undefined") {
        timeToLive = DEFAULT_TTL;
      }
      const requestDetails = {
        method: "POST",
        headers: {
          TTL: timeToLive
        }
      };
      Object.keys(extraHeaders).forEach(function(header) {
        requestDetails.headers[header] = extraHeaders[header];
      });
      let requestPayload = null;
      if (payload) {
        const encrypted = encryptionHelper.encrypt(subscription.keys.p256dh, subscription.keys.auth, payload, contentEncoding);
        requestDetails.headers["Content-Length"] = encrypted.cipherText.length;
        requestDetails.headers["Content-Type"] = "application/octet-stream";
        if (contentEncoding === webPushConstants.supportedContentEncodings.AES_128_GCM) {
          requestDetails.headers["Content-Encoding"] = webPushConstants.supportedContentEncodings.AES_128_GCM;
        } else if (contentEncoding === webPushConstants.supportedContentEncodings.AES_GCM) {
          requestDetails.headers["Content-Encoding"] = webPushConstants.supportedContentEncodings.AES_GCM;
          requestDetails.headers.Encryption = "salt=" + encrypted.salt;
          requestDetails.headers["Crypto-Key"] = "dh=" + encrypted.localPublicKey.toString("base64url");
        }
        requestPayload = encrypted.cipherText;
      } else {
        requestDetails.headers["Content-Length"] = 0;
      }
      const isGCM = subscription.endpoint.startsWith("https://android.googleapis.com/gcm/send");
      const isFCM = subscription.endpoint.startsWith("https://fcm.googleapis.com/fcm/send");
      if (isGCM) {
        if (!currentGCMAPIKey) {
          console.warn("Attempt to send push notification to GCM endpoint, but no GCM key is defined. Please use setGCMApiKey() or add 'gcmAPIKey' as an option.");
        } else {
          requestDetails.headers.Authorization = "key=" + currentGCMAPIKey;
        }
      } else if (currentVapidDetails) {
        const parsedUrl = url.parse(subscription.endpoint);
        const audience = parsedUrl.protocol + "//" + parsedUrl.host;
        const vapidHeaders = vapidHelper.getVapidHeaders(
          audience,
          currentVapidDetails.subject,
          currentVapidDetails.publicKey,
          currentVapidDetails.privateKey,
          contentEncoding
        );
        requestDetails.headers.Authorization = vapidHeaders.Authorization;
        if (contentEncoding === webPushConstants.supportedContentEncodings.AES_GCM) {
          if (requestDetails.headers["Crypto-Key"]) {
            requestDetails.headers["Crypto-Key"] += ";" + vapidHeaders["Crypto-Key"];
          } else {
            requestDetails.headers["Crypto-Key"] = vapidHeaders["Crypto-Key"];
          }
        }
      } else if (isFCM && currentGCMAPIKey) {
        requestDetails.headers.Authorization = "key=" + currentGCMAPIKey;
      }
      requestDetails.headers.Urgency = urgency;
      if (topic) {
        requestDetails.headers.Topic = topic;
      }
      requestDetails.body = requestPayload;
      requestDetails.endpoint = subscription.endpoint;
      if (proxy) {
        requestDetails.proxy = proxy;
      }
      if (agent) {
        requestDetails.agent = agent;
      }
      if (timeout) {
        requestDetails.timeout = timeout;
      }
      return requestDetails;
    };
    WebPushLib.prototype.sendNotification = function(subscription, payload, options) {
      let requestDetails;
      try {
        requestDetails = this.generateRequestDetails(subscription, payload, options);
      } catch (err) {
        return Promise.reject(err);
      }
      return new Promise(function(resolve, reject) {
        const httpsOptions = {};
        const urlParts = url.parse(requestDetails.endpoint);
        httpsOptions.hostname = urlParts.hostname;
        httpsOptions.port = urlParts.port;
        httpsOptions.path = urlParts.path;
        httpsOptions.headers = requestDetails.headers;
        httpsOptions.method = requestDetails.method;
        if (requestDetails.timeout) {
          httpsOptions.timeout = requestDetails.timeout;
        }
        if (requestDetails.agent) {
          httpsOptions.agent = requestDetails.agent;
        }
        if (requestDetails.proxy) {
          const { HttpsProxyAgent } = require_dist2();
          httpsOptions.agent = new HttpsProxyAgent(requestDetails.proxy);
        }
        const pushRequest = https.request(httpsOptions, function(pushResponse) {
          let responseText = "";
          pushResponse.on("data", function(chunk) {
            responseText += chunk;
          });
          pushResponse.on("end", function() {
            if (pushResponse.statusCode < 200 || pushResponse.statusCode > 299) {
              reject(new WebPushError(
                "Received unexpected response code",
                pushResponse.statusCode,
                pushResponse.headers,
                responseText,
                requestDetails.endpoint
              ));
            } else {
              resolve({
                statusCode: pushResponse.statusCode,
                body: responseText,
                headers: pushResponse.headers
              });
            }
          });
        });
        if (requestDetails.timeout) {
          pushRequest.on("timeout", function() {
            pushRequest.destroy(new Error("Socket timeout"));
          });
        }
        pushRequest.on("error", function(e) {
          reject(e);
        });
        if (requestDetails.body) {
          pushRequest.write(requestDetails.body);
        }
        pushRequest.end();
      });
    };
    module.exports = WebPushLib;
  }
});

// node_modules/web-push/src/index.js
var require_src2 = __commonJS({
  "node_modules/web-push/src/index.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    var vapidHelper = require_vapid_helper();
    var encryptionHelper = require_encryption_helper();
    var WebPushLib = require_web_push_lib();
    var WebPushError = require_web_push_error();
    var WebPushConstants = require_web_push_constants();
    var webPush = new WebPushLib();
    module.exports = {
      WebPushError,
      supportedContentEncodings: WebPushConstants.supportedContentEncodings,
      encrypt: encryptionHelper.encrypt,
      getVapidHeaders: vapidHelper.getVapidHeaders,
      generateVAPIDKeys: vapidHelper.generateVAPIDKeys,
      setGCMAPIKey: webPush.setGCMAPIKey,
      setVapidDetails: webPush.setVapidDetails,
      generateRequestDetails: webPush.generateRequestDetails,
      sendNotification: webPush.sendNotification.bind(webPush)
    };
  }
});

// .wrangler/tmp/bundle-2lgNVc/middleware-loader.entry.ts
init_modules_watch_stub();

// .wrangler/tmp/bundle-2lgNVc/middleware-insertion-facade.js
init_modules_watch_stub();

// src/index.js
init_modules_watch_stub();
var import_web_push = __toESM(require_src2(), 1);
var DEFAULT_ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost",
  "http://127.0.0.1",
  "https://localhost",
  "https://127.0.0.1",
  "capacitor://localhost"
];
var INTERNAL_PROXY_HEADER = "X-Tarkeeb-Pro-Internal";
var DEFAULT_ACCESS_AUD = "282d6bbb5c79e6fa216dc031838ec36e641595f0c62f5ee0732e6d2f264eefa6";
var DEFAULT_ACCESS_JWKS_URL = "https://bobkumeel.cloudflareaccess.com/cdn-cgi/access/certs";
var jwksCache = /* @__PURE__ */ new Map();
var DEFAULT_PRODUCT_IMAGE = "https://images.unsplash.com/photo-1581093458791-9d15482442f0?auto=format&fit=crop&w=900&q=80";
var src_default = {
  async fetch(request, env) {
    const corsHeaders = buildCorsHeaders(request, env);
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }
    try {
      const url = new URL(request.url);
      const path = url.pathname;
      if (!isInternalProxyRequest(request)) {
        const accessResponse = await validateCloudflareAccess(request, env);
        if (accessResponse) {
          return accessResponse;
        }
      }
      if (path === "/api/health" && request.method === "GET") {
        return json(
          {
            message: "ok",
            service: "tarkeeb-pro-edge-api",
            date: (/* @__PURE__ */ new Date()).toISOString()
          },
          200,
          request,
          env
        );
      }
      if (path === "/api/auth/register" && request.method === "POST") {
        return register(request, env);
      }
      if (path === "/api/auth/login" && request.method === "POST") {
        return login(request, env);
      }
      if (path === "/api/operations/dashboard" && request.method === "GET") {
        return getOperationsDashboard(request, env);
      }
      if (path === "/api/operations/summary" && request.method === "GET") {
        return getOperationsSummary(request, env);
      }
      if (path === "/api/operations/time-standards" && request.method === "GET") {
        return getServiceTimeStandards(request, env);
      }
      if (path === "/api/operations/time-standards" && request.method === "PUT") {
        return updateServiceTimeStandards(request, env);
      }
      if (path === "/api/operations/area-clusters" && request.method === "GET") {
        return getInternalAreaClusters(request, env);
      }
      if (path === "/api/operations/area-clusters" && request.method === "PUT") {
        return updateInternalAreaClusters(request, env);
      }
      if (path === "/api/operations/orders/import" && request.method === "POST") {
        return importServiceOrders(request, env);
      }
      if (path === "/api/operations/orders" && request.method === "POST") {
        return createServiceOrder(request, env);
      }
      if (path === "/api/operations/technicians" && request.method === "POST") {
        return createTechnician(request, env);
      }
      if (path.startsWith("/api/operations/technicians/") && request.method === "PUT" && !path.endsWith("/status")) {
        const id = path.split("/").pop();
        return updateTechnician(request, id, env);
      }
      if (path.startsWith("/api/operations/technicians/") && request.method === "DELETE") {
        const id = path.split("/").pop();
        return deleteTechnician(request, id, env);
      }
      if (path === "/api/operations/technician/orders" && request.method === "GET") {
        return getTechnicianOrders(request, env);
      }
      if (path === "/api/notifications" && request.method === "GET") {
        return listNotifications(request, env);
      }
      if (path === "/api/notifications/config" && request.method === "GET") {
        return getPushNotificationConfig(request, env);
      }
      if (path === "/api/notifications/read-all" && request.method === "PUT") {
        return markAllNotificationsRead(request, env);
      }
      if (path.startsWith("/api/notifications/") && path.endsWith("/read") && request.method === "PUT") {
        const id = path.split("/").slice(-2, -1)[0];
        return markNotificationRead(request, id, env);
      }
      if (path.startsWith("/api/operations/orders/") && path.endsWith("/status") && request.method === "PUT") {
        const id = path.split("/").slice(-2, -1)[0];
        return updateServiceOrderStatus(request, id, env);
      }
      if (path.startsWith("/api/operations/orders/") && path.endsWith("/close-request") && request.method === "POST") {
        const id = path.split("/").slice(-2, -1)[0];
        return requestServiceOrderClosure(request, id, env);
      }
      if (path.startsWith("/api/operations/orders/") && path.endsWith("/close-otp") && request.method === "POST") {
        const id = path.split("/").slice(-2, -1)[0];
        return submitServiceOrderClosureOtp(request, id, env);
      }
      if (path.startsWith("/api/operations/orders/") && path.endsWith("/close-approve") && request.method === "POST") {
        const id = path.split("/").slice(-2, -1)[0];
        return approveServiceOrderClosure(request, id, env);
      }
      if (path.startsWith("/api/operations/orders/") && path.endsWith("/cancel") && request.method === "POST") {
        const id = path.split("/").slice(-2, -1)[0];
        return cancelServiceOrder(request, id, env);
      }
      if (path.startsWith("/api/operations/technicians/") && path.endsWith("/status") && request.method === "PUT") {
        const id = path.split("/").slice(-2, -1)[0];
        return updateTechnicianAvailability(request, id, env);
      }
      if (path.startsWith("/api/operations/orders/") && path.endsWith("/extras") && request.method === "PUT") {
        const id = path.split("/").slice(-2, -1)[0];
        return updateServiceOrderExtras(request, id, env);
      }
      if (path.startsWith("/api/operations/orders/") && path.endsWith("/photos") && request.method === "POST") {
        const id = path.split("/").slice(-2, -1)[0];
        return uploadServiceOrderPhoto(request, id, env);
      }
      if (path === "/api/notifications/push" && request.method === "POST") {
        return pushNotification(request, env);
      }
      if (path === "/api/notifications/subscribe" && request.method === "POST") {
        return subscribe(request, env);
      }
      if (path.startsWith("/api/operations/orders/") && request.method === "PUT") {
        const id = path.split("/").pop();
        return updateServiceOrder(request, id, env);
      }
      if (path.startsWith("/api/orders/") && request.method === "PATCH") {
        const id = path.split("/").pop();
        return quickUpdateCompactOrderStatus(request, id, env);
      }
      if (path === "/api/products" && request.method === "GET") {
        return listProducts(request, url, env);
      }
      if (path === "/api/footer" && request.method === "GET") {
        return getFooterSettings(request, env);
      }
      if (path === "/api/home-settings" && request.method === "GET") {
        return getHomeSettings(request, env);
      }
      if (path === "/api/products" && request.method === "POST") {
        return createProduct(request, env);
      }
      if (path.startsWith("/api/products/") && request.method === "GET") {
        const id = path.split("/").pop();
        return getProductById(request, id, env);
      }
      if (path.startsWith("/api/products/") && request.method === "PUT") {
        const id = path.split("/").pop();
        return updateProduct(request, id, env);
      }
      if (path.startsWith("/api/products/") && request.method === "DELETE") {
        const id = path.split("/").pop();
        return deleteProduct(request, id, env);
      }
      if (path === "/api/admin/products" && request.method === "GET") {
        return listAdminProducts(request, env);
      }
      if (path === "/api/admin/footer" && request.method === "GET") {
        return getAdminFooterSettings(request, env);
      }
      if (path === "/api/admin/footer" && request.method === "PUT") {
        return updateAdminFooterSettings(request, env);
      }
      if (path === "/api/admin/home-settings" && request.method === "GET") {
        return getAdminHomeSettings(request, env);
      }
      if (path === "/api/admin/home-settings" && request.method === "PUT") {
        return updateAdminHomeSettings(request, env);
      }
      if (path === "/api/admin/users" && request.method === "GET") {
        return listAdminUsers(request, env);
      }
      if (path.startsWith("/api/admin/users/") && request.method === "PUT") {
        const id = path.split("/").pop();
        return updateAdminUser(request, id, env);
      }
      if (path === "/api/bookings" && request.method === "POST") {
        return createBooking(request, env);
      }
      if ((path === "/api/bookings" || path === "/api/orders") && request.method === "GET") {
        return listUserOrders(request, env);
      }
      if ((path.startsWith("/api/bookings/") || path.startsWith("/api/orders/")) && request.method === "GET") {
        const id = path.split("/").pop();
        return getUserOrderById(request, id, env);
      }
      if (path.startsWith("/api/bookings/") && path.endsWith("/cancel") && request.method === "PUT") {
        const id = path.split("/").slice(-2, -1)[0];
        return cancelUserOrder(request, id, env);
      }
      if (path === "/api/cart/checkout" && request.method === "POST") {
        return checkoutCart(request, env);
      }
      if (path === "/api/admin/bookings" && request.method === "GET") {
        return listAdminBookings(request, env);
      }
      if (path.startsWith("/api/admin/bookings/") && request.method === "PUT") {
        const id = path.split("/").pop();
        return updateBookingStatus(request, id, env);
      }
      return json({ message: "Route not found" }, 404, request, env);
    } catch (error) {
      return json(
        {
          message: "Internal error",
          error: error?.message || "Unknown error"
        },
        500,
        request,
        env
      );
    }
  }
};
var DEFAULT_VAPID_PUBLIC_KEY = "BJDe1im_oVNRMdPrjtBjE7qwlb-CJUDIxxc_Dp-mhPwuiuSgTHcFxWgS3MX-gyVyy3YPMS8nGQ6YaJIb1rrGgyo";
var DEFAULT_VAPID_CONTACT_EMAIL = "ops@tarkeebpro.sa";
var webPushConfigCacheKey = "";
function getWebPushConfig(env = {}) {
  const publicKey = String(env.WEB_PUSH_PUBLIC_KEY || DEFAULT_VAPID_PUBLIC_KEY || "").trim();
  const privateKey = String(env.WEB_PUSH_PRIVATE_KEY || "").trim();
  const rawContact = String(env.WEB_PUSH_CONTACT_EMAIL || DEFAULT_VAPID_CONTACT_EMAIL || "").trim();
  const contactEmail = rawContact ? rawContact.startsWith("mailto:") ? rawContact : `mailto:${rawContact}` : "";
  return {
    enabled: Boolean(publicKey && privateKey && contactEmail),
    publicKey,
    privateKey,
    contactEmail
  };
}
__name(getWebPushConfig, "getWebPushConfig");
function ensureWebPushConfigured(env = {}) {
  const config = getWebPushConfig(env);
  if (!config.enabled) {
    return null;
  }
  const cacheKey = `${config.publicKey}:${config.privateKey}:${config.contactEmail}`;
  if (webPushConfigCacheKey !== cacheKey) {
    import_web_push.default.setVapidDetails(config.contactEmail, config.publicKey, config.privateKey);
    webPushConfigCacheKey = cacheKey;
  }
  return config;
}
__name(ensureWebPushConfigured, "ensureWebPushConfigured");
function getWorkspacePathForRole(role) {
  return {
    customer_service: "/customer-service",
    operations_manager: "/operations-manager",
    regional_dispatcher: "/regions"
  }[String(role || "").trim()] || "/login";
}
__name(getWorkspacePathForRole, "getWorkspacePathForRole");
async function getPushNotificationConfig(request, env) {
  const config = getWebPushConfig(env);
  return json(
    {
      enabled: config.enabled,
      publicKey: config.publicKey || null
    },
    200,
    request,
    env
  );
}
__name(getPushNotificationConfig, "getPushNotificationConfig");
async function subscribe(request, env) {
  const body = await readJson(request);
  const { endpoint, keys } = body;
  const user = await readActiveUser(request, env);
  if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
    return json({ message: "Invalid subscription" }, 400, request, env);
  }
  await env.DB.prepare(
    `INSERT INTO push_subscriptions (endpoint, p256dh, auth, user_id)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(endpoint) DO UPDATE SET
       p256dh = excluded.p256dh,
       auth = excluded.auth,
       user_id = excluded.user_id`
  ).bind(endpoint, keys.p256dh, keys.auth, user ? user.sub : null).run();
  return json({ message: "Subscription saved" }, 201, request, env);
}
__name(subscribe, "subscribe");
async function pushNotification(request, env) {
  if (!ensureWebPushConfigured(env)) {
    return json({ message: "Push notifications are not configured" }, 503, request, env);
  }
  const body = await readJson(request);
  const { message, title = "Tarkeeb Pro", url = "/login", tag = "broadcast" } = body;
  if (!message) {
    return json({ message: "Message is required" }, 400, request, env);
  }
  const { results } = await env.DB.prepare("SELECT * FROM push_subscriptions").all();
  const payload = typeof message === "string" ? JSON.stringify({ title, body: message, url, tag, silent: false }) : JSON.stringify({ title, url, tag, silent: false, ...message });
  const notificationPromises = results.map(async (subscription) => {
    const pushConfig = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.p256dh,
        auth: subscription.auth
      }
    };
    try {
      return await import_web_push.default.sendNotification(pushConfig, payload);
    } catch (error) {
      if ([404, 410].includes(Number(error?.statusCode))) {
        await env.DB.prepare("DELETE FROM push_subscriptions WHERE id = ?").bind(subscription.id).run();
      }
      return null;
    }
  });
  await Promise.allSettled(notificationPromises);
  return json({ message: "Push notifications sent" }, 200, request, env);
}
__name(pushNotification, "pushNotification");
async function sendPushToUser(env, userId, payload = {}) {
  if (!userId || !ensureWebPushConfigured(env)) {
    return;
  }
  const { results } = await env.DB.prepare(
    `SELECT s.id, s.endpoint, s.p256dh, s.auth, u.role
     FROM push_subscriptions s
     LEFT JOIN users u ON u.id = s.user_id
     WHERE s.user_id = ?`
  ).bind(Number(userId)).all();
  if (!results?.length) {
    return;
  }
  const targetUrl = payload.url || getWorkspacePathForRole(results[0]?.role);
  const message = JSON.stringify({
    title: payload.title || "Tarkeeb Pro",
    body: payload.body || "",
    url: targetUrl,
    tag: payload.tag || (payload.relatedOrderId ? `order-${payload.relatedOrderId}` : `user-${userId}`),
    relatedOrderId: payload.relatedOrderId || null,
    silent: false
  });
  await Promise.allSettled(
    results.map(async (subscription) => {
      try {
        await import_web_push.default.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth
            }
          },
          message
        );
      } catch (error) {
        if ([404, 410].includes(Number(error?.statusCode))) {
          await env.DB.prepare("DELETE FROM push_subscriptions WHERE id = ?").bind(subscription.id).run();
        }
      }
    })
  );
}
__name(sendPushToUser, "sendPushToUser");
async function register(request, env) {
  const body = await readJson(request);
  const name = (body.name || "").trim();
  const email = (body.email || "").toLowerCase().trim();
  const password = body.password || "";
  if (!name || !email || password.length < 6) {
    return json({ message: "Invalid name, email, or password" }, 400, request, env);
  }
  const existing = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
  if (existing) {
    return json({ message: "Email already exists" }, 409, request, env);
  }
  const passwordHash = await hashPassword(password, email);
  const created = await env.DB.prepare(
    "INSERT INTO users (name, email, password_hash, role, status) VALUES (?, ?, ?, ?, ?)"
  ).bind(name, email, passwordHash, "member", "active").run();
  const userId = created.meta.last_row_id;
  const user = { id: userId, name, email, role: "member", status: "active" };
  const token = await signJwt(
    { sub: String(userId), email, name, role: user.role, status: user.status },
    env.JWT_SECRET || "dev-secret"
  );
  return json({ token, user }, 201, request, env);
}
__name(register, "register");
async function login(request, env) {
  const body = await readJson(request);
  const email = (body.email || "").toLowerCase().trim();
  const password = body.password || "";
  if (!email || !password) {
    return json({ message: "Email and password are required" }, 400, request, env);
  }
  const user = await env.DB.prepare(
    "SELECT id, name, email, password_hash, role, status FROM users WHERE email = ?"
  ).bind(email).first();
  if (!user) {
    return json({ message: "Invalid credentials" }, 401, request, env);
  }
  if ((user.status || "active") !== "active") {
    return json({ message: "This account is inactive" }, 403, request, env);
  }
  const passwordHash = await hashPassword(password, email);
  if (passwordHash !== user.password_hash) {
    return json({ message: "Invalid credentials" }, 401, request, env);
  }
  const technician = ["technician", "regional_dispatcher"].includes(normalizeServerRole(user.role)) ? await env.DB.prepare(
    "SELECT id, user_id, name, phone, zone, status, COALESCE(notes, '') AS notes FROM technicians WHERE user_id = ?"
  ).bind(Number(user.id)).first() : null;
  const token = await signJwt(
    {
      sub: String(user.id),
      email: user.email,
      name: user.name,
      role: normalizeServerRole(user.role),
      status: user.status || "active"
    },
    env.JWT_SECRET || "dev-secret"
  );
  return json(
    {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: normalizeServerRole(user.role),
        status: user.status || "active",
        technicianId: technician ? String(technician.id) : null,
        region: technician ? mapTechnician(technician).region : null,
        zone: technician ? mapTechnician(technician).zone : null,
        technicianName: technician?.name || null,
        technician: technician ? mapTechnician({ ...technician, email: user.email }) : null
      }
    },
    200,
    request,
    env
  );
}
__name(login, "login");
async function listProducts(request, url, env) {
  const category = (url.searchParams.get("category") || "").trim();
  const city = (url.searchParams.get("city") || "").trim();
  const limit = Math.min(Number(url.searchParams.get("limit") || 12), 50);
  const page = Math.max(Number(url.searchParams.get("page") || 1), 1);
  const offset = (page - 1) * limit;
  let query = "SELECT id, owner_user_id, name, description, category, city, price_per_day, rating, image_url, quantity FROM products WHERE 1=1";
  const binds = [];
  if (category) {
    query += " AND category = ?";
    binds.push(category);
  }
  if (city) {
    query += " AND city LIKE ?";
    binds.push(`%${city}%`);
  }
  query += " ORDER BY id DESC LIMIT ? OFFSET ?";
  binds.push(limit, offset);
  const { results } = await env.DB.prepare(query).bind(...binds).all();
  return json(
    {
      products: (results || []).map(mapProduct),
      page,
      limit
    },
    200,
    request,
    env
  );
}
__name(listProducts, "listProducts");
async function getProductById(request, id, env) {
  if (!/^\d+$/.test(String(id))) {
    return json({ message: "Invalid product id" }, 400, request, env);
  }
  const product = await env.DB.prepare(
    "SELECT id, owner_user_id, name, description, category, city, price_per_day, rating, image_url, quantity FROM products WHERE id = ?"
  ).bind(Number(id)).first();
  if (!product) {
    return json({ message: "Product not found" }, 404, request, env);
  }
  return json({ product: mapProduct(product) }, 200, request, env);
}
__name(getProductById, "getProductById");
async function createProduct(request, env) {
  const admin = await requireAdmin(request, env);
  if (!admin) {
    return json({ message: "Admin access required" }, 403, request, env);
  }
  const body = await readJson(request);
  const product = normalizeProductInput(body);
  if (product.error) {
    return json({ message: product.error }, 400, request, env);
  }
  const created = await env.DB.prepare(
    "INSERT INTO products (owner_user_id, name, description, category, city, price_per_day, rating, image_url, quantity) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
  ).bind(
    Number(admin.sub),
    product.name,
    product.description,
    product.category,
    product.city,
    product.pricePerDay,
    product.rating,
    product.imageUrl,
    product.quantity
  ).run();
  return json({ id: created.meta.last_row_id, message: "Product created" }, 201, request, env);
}
__name(createProduct, "createProduct");
async function updateProduct(request, id, env) {
  const admin = await requireAdmin(request, env);
  if (!admin) {
    return json({ message: "Admin access required" }, 403, request, env);
  }
  if (!/^\d+$/.test(String(id))) {
    return json({ message: "Invalid product id" }, 400, request, env);
  }
  const existing = await env.DB.prepare("SELECT id FROM products WHERE id = ?").bind(Number(id)).first();
  if (!existing) {
    return json({ message: "Product not found" }, 404, request, env);
  }
  const body = await readJson(request);
  const product = normalizeProductInput(body);
  if (product.error) {
    return json({ message: product.error }, 400, request, env);
  }
  await env.DB.prepare(
    "UPDATE products SET name = ?, description = ?, category = ?, city = ?, price_per_day = ?, rating = ?, image_url = ?, quantity = ? WHERE id = ?"
  ).bind(
    product.name,
    product.description,
    product.category,
    product.city,
    product.pricePerDay,
    product.rating,
    product.imageUrl,
    product.quantity,
    Number(id)
  ).run();
  return json({ message: "Product updated" }, 200, request, env);
}
__name(updateProduct, "updateProduct");
async function deleteProduct(request, id, env) {
  const admin = await requireAdmin(request, env);
  if (!admin) {
    return json({ message: "Admin access required" }, 403, request, env);
  }
  if (!/^\d+$/.test(String(id))) {
    return json({ message: "Invalid product id" }, 400, request, env);
  }
  const deleted = await env.DB.prepare("DELETE FROM products WHERE id = ?").bind(Number(id)).run();
  if (!deleted.meta.changes) {
    return json({ message: "Product not found" }, 404, request, env);
  }
  return json({ message: "Product deleted" }, 200, request, env);
}
__name(deleteProduct, "deleteProduct");
async function listAdminProducts(request, env) {
  const admin = await requireAdmin(request, env);
  if (!admin) {
    return json({ message: "Admin access required" }, 403, request, env);
  }
  const { results } = await env.DB.prepare(
    `SELECT p.id, p.owner_user_id, p.name, p.description, p.category, p.city, p.price_per_day, p.rating, p.image_url, p.quantity,
            u.name AS owner_name, u.email AS owner_email
     FROM products p
     LEFT JOIN users u ON u.id = p.owner_user_id
     ORDER BY p.id DESC`
  ).all();
  return json(
    {
      products: (results || []).map((row) => ({
        ...mapProduct(row),
        ownerName: row.owner_name || null,
        ownerEmail: row.owner_email || null
      }))
    },
    200,
    request,
    env
  );
}
__name(listAdminProducts, "listAdminProducts");
async function getFooterSettings(request, env) {
  const settings = await readFooterSettings(env);
  return json({ footer: settings }, 200, request, env);
}
__name(getFooterSettings, "getFooterSettings");
async function getHomeSettings(request, env) {
  const settings = await readHomeSettings(env);
  return json({ homeSettings: settings }, 200, request, env);
}
__name(getHomeSettings, "getHomeSettings");
async function getAdminFooterSettings(request, env) {
  const admin = await requireAdmin(request, env);
  if (!admin) {
    return json({ message: "Admin access required" }, 403, request, env);
  }
  const settings = await readFooterSettings(env);
  return json({ footer: settings }, 200, request, env);
}
__name(getAdminFooterSettings, "getAdminFooterSettings");
async function updateAdminFooterSettings(request, env) {
  const admin = await requireAdmin(request, env);
  if (!admin) {
    return json({ message: "Admin access required" }, 403, request, env);
  }
  const body = await readJson(request);
  const normalized = normalizeFooterSettingsInput(body);
  if (normalized.error) {
    return json({ message: normalized.error }, 400, request, env);
  }
  await env.DB.prepare(
    `INSERT INTO footer_settings (
      id,
      about_text,
      useful_links_json,
      customer_service_links_json,
      social_links_json,
      copyright_text,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET
      about_text = excluded.about_text,
      useful_links_json = excluded.useful_links_json,
      customer_service_links_json = excluded.customer_service_links_json,
      social_links_json = excluded.social_links_json,
      copyright_text = excluded.copyright_text,
      updated_at = CURRENT_TIMESTAMP`
  ).bind(
    1,
    normalized.aboutText,
    JSON.stringify(normalized.usefulLinks),
    JSON.stringify(normalized.customerServiceLinks),
    JSON.stringify(normalized.socialLinks),
    normalized.copyrightText
  ).run();
  const settings = await readFooterSettings(env);
  return json({ message: "Footer updated", footer: settings }, 200, request, env);
}
__name(updateAdminFooterSettings, "updateAdminFooterSettings");
async function getAdminHomeSettings(request, env) {
  const admin = await requireAdmin(request, env);
  if (!admin) {
    return json({ message: "Admin access required" }, 403, request, env);
  }
  const settings = await readHomeSettings(env);
  return json({ homeSettings: settings }, 200, request, env);
}
__name(getAdminHomeSettings, "getAdminHomeSettings");
async function updateAdminHomeSettings(request, env) {
  const admin = await requireAdmin(request, env);
  if (!admin) {
    return json({ message: "Admin access required" }, 403, request, env);
  }
  const body = await readJson(request);
  const normalized = normalizeHomeSettingsInput(body);
  if (normalized.error) {
    return json({ message: normalized.error }, 400, request, env);
  }
  await env.DB.prepare(
    `INSERT INTO home_settings (
      id,
      hero_kicker,
      hero_title,
      hero_subtitle,
      primary_button_text,
      primary_button_url,
      secondary_button_text,
      secondary_button_url,
      stats_json,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET
      hero_kicker = excluded.hero_kicker,
      hero_title = excluded.hero_title,
      hero_subtitle = excluded.hero_subtitle,
      primary_button_text = excluded.primary_button_text,
      primary_button_url = excluded.primary_button_url,
      secondary_button_text = excluded.secondary_button_text,
      secondary_button_url = excluded.secondary_button_url,
      stats_json = excluded.stats_json,
      updated_at = CURRENT_TIMESTAMP`
  ).bind(
    1,
    normalized.heroKicker,
    normalized.heroTitle,
    normalized.heroSubtitle,
    normalized.primaryButtonText,
    normalized.primaryButtonUrl,
    normalized.secondaryButtonText,
    normalized.secondaryButtonUrl,
    JSON.stringify(normalized.stats)
  ).run();
  const settings = await readHomeSettings(env);
  return json({ message: "Home settings updated", homeSettings: settings }, 200, request, env);
}
__name(updateAdminHomeSettings, "updateAdminHomeSettings");
async function listAdminUsers(request, env) {
  const admin = await requireAdmin(request, env);
  if (!admin) {
    return json({ message: "Admin access required" }, 403, request, env);
  }
  const { results } = await env.DB.prepare(
    "SELECT id, name, email, role, status, created_at FROM users ORDER BY id DESC"
  ).all();
  return json({ users: results || [] }, 200, request, env);
}
__name(listAdminUsers, "listAdminUsers");
async function updateAdminUser(request, id, env) {
  const admin = await requireAdmin(request, env);
  if (!admin) {
    return json({ message: "Admin access required" }, 403, request, env);
  }
  if (!/^\d+$/.test(String(id))) {
    return json({ message: "Invalid user id" }, 400, request, env);
  }
  const body = await readJson(request);
  const role = (body.role || "member").trim();
  const status = (body.status || "active").trim();
  if (!["admin", "member"].includes(role)) {
    return json({ message: "Invalid role" }, 400, request, env);
  }
  if (!["active", "inactive"].includes(status)) {
    return json({ message: "Invalid status" }, 400, request, env);
  }
  const existing = await env.DB.prepare("SELECT id FROM users WHERE id = ?").bind(Number(id)).first();
  if (!existing) {
    return json({ message: "User not found" }, 404, request, env);
  }
  await env.DB.prepare("UPDATE users SET role = ?, status = ? WHERE id = ?").bind(role, status, Number(id)).run();
  return json({ message: "User updated" }, 200, request, env);
}
__name(updateAdminUser, "updateAdminUser");
async function createBooking(request, env) {
  const user = await readAuthUser(request, env);
  if (!user) {
    return json({ message: "Unauthorized" }, 401, request, env);
  }
  if ((user.status || "active") !== "active") {
    return json({ message: "This account is inactive" }, 403, request, env);
  }
  const body = await readJson(request);
  const productId = Number(body.productId);
  const quantity = Number(body.quantity || 1);
  const startDate = (body.startDate || "").trim();
  const endDate = (body.endDate || "").trim();
  if (!Number.isInteger(productId) || productId <= 0) {
    return json({ message: "Invalid product id" }, 400, request, env);
  }
  if (!Number.isInteger(quantity) || quantity <= 0) {
    return json({ message: "Quantity must be at least 1" }, 400, request, env);
  }
  if (!startDate || !endDate) {
    return json({ message: "Start date and end date are required" }, 400, request, env);
  }
  const product = await env.DB.prepare(
    "SELECT id, price_per_day, quantity FROM products WHERE id = ?"
  ).bind(productId).first();
  if (!product) {
    return json({ message: "Product not found" }, 404, request, env);
  }
  if ((product.quantity ?? 0) < quantity) {
    return json({ message: "Requested quantity is not available" }, 400, request, env);
  }
  const days = Math.max(1, calculateRentalDays(startDate, endDate));
  const totalPrice = Number(product.price_per_day) * quantity * days;
  const created = await env.DB.prepare(
    "INSERT INTO bookings (user_id, product_id, start_date, end_date, quantity, total_price, status) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ).bind(Number(user.sub), productId, startDate, endDate, quantity, totalPrice, "pending").run();
  await env.DB.prepare("UPDATE products SET quantity = quantity - ? WHERE id = ?").bind(quantity, productId).run();
  return json(
    {
      id: created.meta.last_row_id,
      message: "Booking created"
    },
    201,
    request,
    env
  );
}
__name(createBooking, "createBooking");
async function listAdminBookings(request, env) {
  const admin = await requireAdmin(request, env);
  if (!admin) {
    return json({ message: "Admin access required" }, 403, request, env);
  }
  const { results } = await env.DB.prepare(
    `SELECT b.id, b.start_date, b.end_date, b.quantity, b.total_price, b.status, b.created_at,
            u.id AS user_id, u.name AS user_name, u.email AS user_email,
            p.id AS product_id, p.name AS product_name, p.city AS product_city
     FROM bookings b
     JOIN users u ON u.id = b.user_id
     JOIN products p ON p.id = b.product_id
     ORDER BY b.id DESC`
  ).all();
  return json(
    {
      bookings: (results || []).map((row) => ({
        id: row.id,
        startDate: row.start_date,
        endDate: row.end_date,
        quantity: row.quantity,
        totalPrice: row.total_price,
        status: row.status,
        createdAt: row.created_at,
        user: {
          id: row.user_id,
          name: row.user_name,
          email: row.user_email
        },
        product: {
          id: row.product_id,
          name: row.product_name,
          city: row.product_city
        }
      }))
    },
    200,
    request,
    env
  );
}
__name(listAdminBookings, "listAdminBookings");
async function updateBookingStatus(request, id, env) {
  const admin = await requireAdmin(request, env);
  if (!admin) {
    return json({ message: "Admin access required" }, 403, request, env);
  }
  if (!/^\d+$/.test(String(id))) {
    return json({ message: "Invalid booking id" }, 400, request, env);
  }
  const body = await readJson(request);
  const status = (body.status || "").trim();
  if (!["pending", "confirmed", "cancelled", "completed"].includes(status)) {
    return json({ message: "Invalid booking status" }, 400, request, env);
  }
  const existing = await env.DB.prepare(
    "SELECT id, product_id, quantity, status FROM bookings WHERE id = ?"
  ).bind(Number(id)).first();
  if (!existing) {
    return json({ message: "Booking not found" }, 404, request, env);
  }
  const stockAdjustment = getStockAdjustment(existing.status, status, existing.quantity);
  if (stockAdjustment < 0) {
    const product = await env.DB.prepare("SELECT quantity FROM products WHERE id = ?").bind(existing.product_id).first();
    if (!product || (product.quantity ?? 0) < Math.abs(stockAdjustment)) {
      return json({ message: "Not enough stock to reactivate this booking" }, 400, request, env);
    }
  }
  await env.DB.prepare("UPDATE bookings SET status = ? WHERE id = ?").bind(status, Number(id)).run();
  if (stockAdjustment !== 0) {
    await env.DB.prepare("UPDATE products SET quantity = quantity + ? WHERE id = ?").bind(stockAdjustment, existing.product_id).run();
  }
  return json({ message: "Booking updated" }, 200, request, env);
}
__name(updateBookingStatus, "updateBookingStatus");
async function listUserOrders(request, env) {
  const user = await readActiveUser(request, env);
  if (!user) {
    return json({ message: "Unauthorized" }, 401, request, env);
  }
  const { results } = await env.DB.prepare(
    `SELECT b.id, b.start_date, b.end_date, b.quantity, b.total_price, b.status, b.created_at,
            p.id AS product_id, p.name AS product_name, p.city AS product_city, p.image_url AS product_image_url
     FROM bookings b
     JOIN products p ON p.id = b.product_id
     WHERE b.user_id = ?
     ORDER BY b.id DESC`
  ).bind(Number(user.sub)).all();
  return json(
    {
      orders: (results || []).map(mapBookingRow)
    },
    200,
    request,
    env
  );
}
__name(listUserOrders, "listUserOrders");
async function getUserOrderById(request, id, env) {
  const user = await readActiveUser(request, env);
  if (!user) {
    return json({ message: "Unauthorized" }, 401, request, env);
  }
  if (!/^\d+$/.test(String(id))) {
    return json({ message: "Invalid order id" }, 400, request, env);
  }
  const order = await env.DB.prepare(
    `SELECT b.id, b.start_date, b.end_date, b.quantity, b.total_price, b.status, b.created_at,
            p.id AS product_id, p.name AS product_name, p.city AS product_city, p.image_url AS product_image_url
     FROM bookings b
     JOIN products p ON p.id = b.product_id
     WHERE b.id = ? AND b.user_id = ?`
  ).bind(Number(id), Number(user.sub)).first();
  if (!order) {
    return json({ message: "Order not found" }, 404, request, env);
  }
  return json({ order: mapBookingRow(order) }, 200, request, env);
}
__name(getUserOrderById, "getUserOrderById");
async function cancelUserOrder(request, id, env) {
  const user = await readActiveUser(request, env);
  if (!user) {
    return json({ message: "Unauthorized" }, 401, request, env);
  }
  if (!/^\d+$/.test(String(id))) {
    return json({ message: "Invalid booking id" }, 400, request, env);
  }
  const booking = await env.DB.prepare(
    "SELECT id, user_id, product_id, quantity, status FROM bookings WHERE id = ?"
  ).bind(Number(id)).first();
  if (!booking || Number(booking.user_id) !== Number(user.sub)) {
    return json({ message: "Booking not found" }, 404, request, env);
  }
  if (booking.status === "cancelled") {
    return json({ message: "Booking already cancelled" }, 400, request, env);
  }
  await env.DB.prepare("UPDATE bookings SET status = ? WHERE id = ?").bind("cancelled", Number(id)).run();
  await env.DB.prepare("UPDATE products SET quantity = quantity + ? WHERE id = ?").bind(Number(booking.quantity), Number(booking.product_id)).run();
  return json({ message: "Booking cancelled" }, 200, request, env);
}
__name(cancelUserOrder, "cancelUserOrder");
async function checkoutCart(request, env) {
  const user = await readActiveUser(request, env);
  if (!user) {
    return json({ message: "Unauthorized" }, 401, request, env);
  }
  const body = await readJson(request);
  const items = Array.isArray(body.items) ? body.items : [];
  if (!items.length) {
    return json({ message: "Cart is empty" }, 400, request, env);
  }
  const normalizedItems = [];
  const reservedByProduct = /* @__PURE__ */ new Map();
  let grandTotal = 0;
  for (const item of items) {
    const productId = Number(item.productId);
    const quantity = Number(item.quantity || 1);
    const startDate = (item.startDate || "").trim();
    const endDate = (item.endDate || "").trim();
    if (!Number.isInteger(productId) || productId <= 0) {
      return json({ message: "Invalid product in cart" }, 400, request, env);
    }
    if (!Number.isInteger(quantity) || quantity <= 0) {
      return json({ message: "Cart quantity must be at least 1" }, 400, request, env);
    }
    if (!startDate || !endDate) {
      return json({ message: "Each cart item must include start and end date" }, 400, request, env);
    }
    const product = await env.DB.prepare(
      "SELECT id, name, city, image_url, price_per_day, quantity FROM products WHERE id = ?"
    ).bind(productId).first();
    if (!product) {
      return json({ message: "One of the selected products no longer exists" }, 404, request, env);
    }
    const reservedQuantity = reservedByProduct.get(productId) || 0;
    if ((product.quantity ?? 0) < quantity + reservedQuantity) {
      return json({ message: `Not enough stock for ${product.name}` }, 400, request, env);
    }
    const days = Math.max(1, calculateRentalDays(startDate, endDate));
    const totalPrice = Number(product.price_per_day) * quantity * days;
    grandTotal += totalPrice;
    normalizedItems.push({
      productId,
      quantity,
      startDate,
      endDate,
      totalPrice,
      product
    });
    reservedByProduct.set(productId, reservedQuantity + quantity);
  }
  const createdOrders = [];
  for (const item of normalizedItems) {
    const created = await env.DB.prepare(
      "INSERT INTO bookings (user_id, product_id, start_date, end_date, quantity, total_price, status) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).bind(
      Number(user.sub),
      item.productId,
      item.startDate,
      item.endDate,
      item.quantity,
      item.totalPrice,
      "pending"
    ).run();
    await env.DB.prepare("UPDATE products SET quantity = quantity - ? WHERE id = ?").bind(item.quantity, item.productId).run();
    createdOrders.push({
      id: created.meta.last_row_id,
      productId: item.productId,
      productName: item.product.name,
      quantity: item.quantity,
      totalPrice: item.totalPrice,
      status: "pending"
    });
  }
  return json(
    {
      message: "Checkout completed",
      orders: createdOrders,
      total: grandTotal
    },
    201,
    request,
    env
  );
}
__name(checkoutCart, "checkoutCart");
var OPERATIONS_PRICING = {
  includedCopperMeters: 3,
  copperPricePerMeter: 85,
  basePrice: 180
};
var FAST_DELIVERY_CITIES = ["\u0627\u0644\u062F\u0645\u0627\u0645", "\u062C\u062F\u0629", "\u0627\u0644\u0631\u064A\u0627\u0636", "\u0627\u0644\u062E\u0628\u0631", "\u0627\u0644\u0638\u0647\u0631\u0627\u0646", "\u062C\u0627\u0632\u0627\u0646", "\u0631\u0623\u0633 \u062A\u0646\u0648\u0631\u0629"];
var OPERATIONS_REGIONS = [
  {
    key: "east",
    ar: "\u0627\u0644\u0645\u0646\u0637\u0642\u0629 \u0627\u0644\u0634\u0631\u0642\u064A\u0629",
    en: "Eastern region",
    cities: ["\u0627\u0644\u062F\u0645\u0627\u0645", "\u0627\u0644\u062E\u0628\u0631", "\u0627\u0644\u0638\u0647\u0631\u0627\u0646", "\u0627\u0644\u0642\u0637\u064A\u0641", "\u0631\u0623\u0633 \u062A\u0646\u0648\u0631\u0629", "\u0627\u0644\u062C\u0628\u064A\u0644", "\u0628\u0642\u064A\u0642", "\u0627\u0644\u0623\u062D\u0633\u0627\u0621"]
  },
  {
    key: "west",
    ar: "\u0627\u0644\u0645\u0646\u0637\u0642\u0629 \u0627\u0644\u063A\u0631\u0628\u064A\u0629",
    en: "Western region",
    cities: ["\u062C\u062F\u0629", "\u0645\u0643\u0629", "\u0627\u0644\u0645\u062F\u064A\u0646\u0629 \u0627\u0644\u0645\u0646\u0648\u0631\u0629", "\u0627\u0644\u0637\u0627\u0626\u0641", "\u064A\u0646\u0628\u0639"]
  },
  {
    key: "south",
    ar: "\u0627\u0644\u0645\u0646\u0637\u0642\u0629 \u0627\u0644\u062C\u0646\u0648\u0628\u064A\u0629",
    en: "Southern region",
    cities: ["\u062C\u0627\u0632\u0627\u0646", "\u0623\u0628\u0648 \u0639\u0631\u064A\u0634"]
  },
  {
    key: "central",
    ar: "\u0627\u0644\u0645\u0646\u0637\u0642\u0629 \u0627\u0644\u0648\u0633\u0637\u0649",
    en: "Central region",
    cities: ["\u0627\u0644\u0631\u064A\u0627\u0636", "\u0627\u0644\u0642\u0635\u064A\u0645"]
  }
];
function normalizeRegionKey(value) {
  return String(value || "").trim().toLowerCase();
}
__name(normalizeRegionKey, "normalizeRegionKey");
function getOperationsRegionByKey(value) {
  const normalized = normalizeRegionKey(value);
  if (!normalized) {
    return null;
  }
  return OPERATIONS_REGIONS.find((region) => region.key === normalized) || null;
}
__name(getOperationsRegionByKey, "getOperationsRegionByKey");
function getOperationsRegionByCity(city) {
  const normalizedCity = String(city || "").trim();
  if (!normalizedCity) {
    return null;
  }
  return OPERATIONS_REGIONS.find((region) => region.cities.includes(normalizedCity)) || null;
}
__name(getOperationsRegionByCity, "getOperationsRegionByCity");
function getOrderRegionKey(order = {}) {
  return getOperationsRegionByCity(order.city)?.key || "";
}
__name(getOrderRegionKey, "getOrderRegionKey");
async function getOperationsDashboard(request, env) {
  const user = await requireRoles(request, env, ["customer_service", "operations_manager"]);
  if (!user) {
    return json({ message: "Internal access required" }, 403, request, env);
  }
  const orders = await readServiceOrders(env);
  const summary = buildOperationsSummary(orders, []);
  return json(
    {
      orders,
      summary,
      currentUser: user
    },
    200,
    request,
    env
  );
}
__name(getOperationsDashboard, "getOperationsDashboard");
async function getOperationsSummary(request, env) {
  const orders = await readServiceOrders(env);
  const summary = buildOperationsSummary(orders, []);
  return json({ summary }, 200, request, env);
}
__name(getOperationsSummary, "getOperationsSummary");
async function getServiceTimeStandards(request, env) {
  const user = await requireRoles(request, env, ["customer_service", "operations_manager"]);
  if (!user) {
    return json({ message: "Unauthorized" }, 401, request, env);
  }
  const timeStandards = await readServiceTimeStandards(env);
  return json({ timeStandards }, 200, request, env);
}
__name(getServiceTimeStandards, "getServiceTimeStandards");
async function getInternalAreaClusters(request, env) {
  const user = await requireRoles(request, env, ["customer_service", "operations_manager"]);
  if (!user) {
    return json({ message: "Unauthorized" }, 401, request, env);
  }
  const areaClusters = await readInternalAreaClusters(env);
  return json({ areaClusters }, 200, request, env);
}
__name(getInternalAreaClusters, "getInternalAreaClusters");
async function updateServiceTimeStandards(request, env) {
  const admin = await requireRoles(request, env, ["operations_manager"]);
  if (!admin) {
    return json({ message: "Admin access required" }, 403, request, env);
  }
  const body = await readJson(request);
  const standards = normalizeServiceTimeStandards(body.standards);
  if (!standards.length) {
    return json({ message: "At least one time standard is required" }, 400, request, env);
  }
  for (const standard of standards) {
    await env.DB.prepare(
      `INSERT INTO service_time_standards (standard_key, label, ar_label, duration_minutes, sort_order)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(standard_key) DO UPDATE SET
         label = excluded.label,
         ar_label = excluded.ar_label,
         duration_minutes = excluded.duration_minutes,
         sort_order = excluded.sort_order`
    ).bind(
      standard.standardKey,
      standard.label,
      standard.arLabel,
      standard.durationMinutes,
      standard.sortOrder
    ).run();
  }
  const timeStandards = await readServiceTimeStandards(env);
  return json({ timeStandards }, 200, request, env);
}
__name(updateServiceTimeStandards, "updateServiceTimeStandards");
async function updateInternalAreaClusters(request, env) {
  const admin = await requireRoles(request, env, ["operations_manager"]);
  if (!admin) {
    return json({ message: "Admin access required" }, 403, request, env);
  }
  const body = await readJson(request);
  const clusters = normalizeInternalAreaClusters(body.clusters);
  if (!clusters.length) {
    return json({ message: "At least one internal area mapping is required" }, 400, request, env);
  }
  await env.DB.prepare("DELETE FROM internal_area_clusters").run();
  for (const cluster of clusters) {
    await env.DB.prepare(
      `INSERT INTO internal_area_clusters (city, district, area_key, label, ar_label, sort_order, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
    ).bind(cluster.city, cluster.district, cluster.areaKey, cluster.label, cluster.arLabel, cluster.sortOrder).run();
  }
  const areaClusters = await readInternalAreaClusters(env);
  return json({ areaClusters }, 200, request, env);
}
__name(updateInternalAreaClusters, "updateInternalAreaClusters");
async function createServiceOrder(request, env) {
  const csr = await requireRoles(request, env, ["customer_service"]);
  if (!csr) {
    return json({ message: "Customer service access required" }, 403, request, env);
  }
  const body = await readJson(request);
  const normalized = normalizeServiceOrderInput(body);
  if (normalized.error) {
    return json({ message: normalized.error }, 400, request, env);
  }
  const createdOrderId = await insertServiceOrderRecord(env, normalized, Number(csr.sub), {
    actor: "customer_service",
    message: `\u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0637\u0644\u0628 ${normalized.requestNumber} \u0648\u0625\u0631\u0633\u0627\u0644\u0647 \u0625\u0644\u0649 \u0645\u062F\u064A\u0631 \u0627\u0644\u0639\u0645\u0644\u064A\u0627\u062A${normalized.deliveryType !== "none" ? ` \u0645\u0639 ${normalized.deliveryType === "express_24h" ? "\u062A\u0648\u0635\u064A\u0644 \u0633\u0631\u064A\u0639" : "\u0637\u0644\u0628 \u062A\u0648\u0635\u064A\u0644"}` : ""}.`
  });
  await notifyUsersByRoles(
    env,
    ["operations_manager"],
    normalized.deliveryType === "none" ? "\u0637\u0644\u0628 \u062C\u062F\u064A\u062F \u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u0627\u0644\u0639\u0645\u0644\u064A\u0627\u062A" : "\u0637\u0644\u0628 \u062A\u0648\u0635\u064A\u0644 \u0628\u0623\u0648\u0644\u0648\u064A\u0629 \u0642\u0635\u0648\u0649",
    normalized.deliveryType === "none" ? `\u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0637\u0644\u0628 \u0631\u0642\u0645 ${normalized.requestNumber} \u0644\u0644\u0639\u0645\u064A\u0644 ${normalized.customerName} \u0648\u064A\u062D\u062A\u0627\u062C \u0625\u0644\u0649 \u0627\u0644\u0645\u062A\u0627\u0628\u0639\u0629.` : `\u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0637\u0644\u0628 \u0631\u0642\u0645 ${normalized.requestNumber} \u0644\u0644\u0639\u0645\u064A\u0644 ${normalized.customerName} \u0648\u064A\u062A\u0636\u0645\u0646 ${normalized.deliveryType === "express_24h" ? "\u062A\u0648\u0635\u064A\u0644\u0627\u064B \u0633\u0631\u064A\u0639\u0627\u064B \u062E\u0644\u0627\u0644 24 \u0633\u0627\u0639\u0629" : "\u062A\u0648\u0635\u064A\u0644\u0627\u064B"} \u0648\u064A\u062D\u062A\u0627\u062C \u0625\u0644\u0649 \u0645\u062A\u0627\u0628\u0639\u0629 \u0639\u0627\u062C\u0644\u0629.`,
    createdOrderId
  );
  await notifyRegionalDispatchersForOrder(
    env,
    normalized,
    "\u0637\u0644\u0628 \u062C\u062F\u064A\u062F \u0636\u0645\u0646 \u0645\u0646\u0637\u0642\u062A\u0643\u0645",
    `\u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0637\u0644\u0628 \u0631\u0642\u0645 ${normalized.requestNumber} \u0644\u0644\u0639\u0645\u064A\u0644 ${normalized.customerName} \u0648\u0625\u0631\u0633\u0627\u0644\u0647 \u0645\u0628\u0627\u0634\u0631\u0629 \u0625\u0644\u0649 \u0645\u0646\u0637\u0642\u062A\u0643\u0645.`,
    createdOrderId
  );
  const order = await readServiceOrderById(env, createdOrderId);
  return json({ order }, 201, request, env);
}
__name(createServiceOrder, "createServiceOrder");
async function importServiceOrders(request, env) {
  const csr = await requireRoles(request, env, ["customer_service"]);
  if (!csr) {
    return json({ message: "Customer service access required" }, 403, request, env);
  }
  const body = await readJson(request);
  const rawOrders = Array.isArray(body?.orders) ? body.orders : [];
  const sourceFileName = String(body?.fileName || "Excel").trim();
  if (!rawOrders.length) {
    return json({ message: "At least one Excel order is required" }, 400, request, env);
  }
  const seenRequestNumbers = /* @__PURE__ */ new Set();
  const validOrders = [];
  const skippedOrders = [];
  for (const item of rawOrders) {
    const normalized = normalizeServiceOrderInput(item);
    const requestNumber = String(item?.requestNumber || normalized.requestNumber || "").trim();
    if (normalized.error) {
      skippedOrders.push({
        requestNumber,
        reason: normalized.error
      });
      continue;
    }
    const dedupeKey = String(normalized.requestNumber || "").trim();
    if (!dedupeKey || seenRequestNumbers.has(dedupeKey)) {
      skippedOrders.push({
        requestNumber: dedupeKey || requestNumber,
        reason: "Duplicate request number inside the Excel import batch"
      });
      continue;
    }
    seenRequestNumbers.add(dedupeKey);
    validOrders.push(normalized);
  }
  if (!validOrders.length) {
    return json(
      {
        importedCount: 0,
        skippedCount: skippedOrders.length,
        skippedOrders,
        orders: []
      },
      200,
      request,
      env
    );
  }
  const existingRequestNumbers = await readExistingServiceOrderNumbers(
    env,
    validOrders.map((item) => item.requestNumber)
  );
  let importedCount = 0;
  for (const normalized of validOrders) {
    if (existingRequestNumbers.has(normalized.requestNumber)) {
      skippedOrders.push({
        requestNumber: normalized.requestNumber,
        reason: "This SO ID is already imported"
      });
      continue;
    }
    const orderId = await insertServiceOrderRecord(env, normalized, Number(csr.sub), {
      actor: "customer_service",
      message: `\u062A\u0645 \u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0627\u0644\u0637\u0644\u0628 ${normalized.requestNumber} \u0645\u0646 \u0645\u0644\u0641 Excel \u0648\u0625\u0631\u0633\u0627\u0644\u0647 \u0625\u0644\u0649 \u0645\u062F\u064A\u0631 \u0627\u0644\u0639\u0645\u0644\u064A\u0627\u062A.`
    });
    importedCount += orderId ? 1 : 0;
  }
  return json(
    {
      fileName: sourceFileName,
      importedCount,
      skippedCount: skippedOrders.length,
      skippedOrders
    },
    201,
    request,
    env
  );
}
__name(importServiceOrders, "importServiceOrders");
async function insertServiceOrderRecord(env, normalized, createdByUserId, auditEntry) {
  const initialStatus = normalizeImportedOrderStatus(normalized.importStatus);
  const scheduledTime = ["scheduled", "completed"].includes(initialStatus) ? normalized.preferredTime : "";
  const canceledAt = initialStatus === "canceled" && normalized.preferredDate ? `${normalized.preferredDate}T${normalized.preferredTime || "09:00"}:00` : null;
  const completedAt = initialStatus === "completed" && normalized.preferredDate ? `${normalized.preferredDate}T${normalized.preferredTime || "09:00"}:00` : null;
  const created = await env.DB.prepare(
    `INSERT INTO service_orders (
      customer_name, request_number, phone, secondary_phone, whatsapp_phone, district, city, address, address_text,
      landmark, map_link, ac_type, service_category, standard_duration_minutes, work_type, ac_count, status, priority, delivery_type,
      preferred_date, preferred_time, scheduled_date, scheduled_time, coordination_note, source, notes, customer_action,
      reschedule_reason, cancellation_reason, canceled_at, completed_at, technician_id, copper_meters, base_included,
      extras_total, service_items_json, audit_log_json, created_by_user_id, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
  ).bind(
    normalized.customerName,
    normalized.requestNumber,
    normalizeSaudiPhoneNumber(normalized.phone),
    normalizeSaudiPhoneNumber(normalized.secondaryPhone),
    normalizeSaudiPhoneNumber(normalized.whatsappPhone),
    normalized.district,
    normalized.city,
    normalized.mapLink,
    normalized.addressText,
    normalized.landmark,
    normalized.mapLink,
    normalized.primaryAcType,
    "internal_request",
    1,
    normalized.serviceSummary,
    normalized.totalQuantity,
    initialStatus,
    normalized.priority,
    normalized.deliveryType,
    normalized.preferredDate,
    normalized.preferredTime,
    normalized.preferredDate,
    scheduledTime,
    "",
    normalized.sourceChannel,
    normalized.notes,
    "none",
    "",
    "",
    canceledAt,
    completedAt,
    null,
    0,
    0,
    0,
    JSON.stringify(normalized.acDetails),
    JSON.stringify([
      {
        id: `audit-${Date.now()}`,
        type: "created",
        actor: String(auditEntry?.actor || "customer_service"),
        message: String(auditEntry?.message || `\u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0637\u0644\u0628 ${normalized.requestNumber}.`),
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    ]),
    Number(createdByUserId)
  ).run();
  return created.meta.last_row_id;
}
__name(insertServiceOrderRecord, "insertServiceOrderRecord");
async function createTechnician(request, env) {
  const admin = await requireAdmin(request, env);
  if (!admin) {
    return json({ message: "Admin access required" }, 403, request, env);
  }
  const body = await readJson(request);
  const firstName = String(body.firstName || "").trim();
  const lastName = String(body.lastName || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const phone = normalizeSaudiPhoneNumber(body.phone);
  const password = String(body.password || "").trim();
  const region = String(body.region || "").trim();
  const notes = String(body.notes || "").trim();
  const status = normalizeTechnicianStatus(body.status);
  if (!firstName || !lastName || !email || !phone || !password || !region) {
    return json({ message: "All technician fields are required" }, 400, request, env);
  }
  const existing = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
  if (existing) {
    return json({ message: "This email is already registered" }, 409, request, env);
  }
  const passwordHash = await hashPassword(password, email);
  const userName = `${firstName} ${lastName}`.trim();
  const createdUser = await env.DB.prepare(
    "INSERT INTO users (name, email, password_hash, role, status) VALUES (?, ?, ?, ?, ?)"
  ).bind(userName, email, passwordHash, "technician", "active").run();
  const userId = createdUser.meta.last_row_id;
  await env.DB.prepare(
    "INSERT INTO technicians (user_id, name, phone, zone, status, notes) VALUES (?, ?, ?, ?, ?, ?)"
  ).bind(Number(userId), userName, phone, region, status, notes).run();
  const technician = await env.DB.prepare(
    "SELECT id, user_id, name, phone, zone, status, COALESCE(notes, '') AS notes FROM technicians WHERE user_id = ?"
  ).bind(Number(userId)).first();
  return json(
    {
      user: {
        id: Number(userId),
        firstName,
        lastName,
        name: userName,
        email,
        phone,
        role: "technician",
        technicianId: technician ? String(technician.id) : String(userId),
        region,
        notes
      },
      technician: mapTechnician(technician || {
        id: Number(userId),
        user_id: Number(userId),
        name: userName,
        phone,
        zone: region,
        status
      })
    },
    201,
    request,
    env
  );
}
__name(createTechnician, "createTechnician");
async function updateTechnician(request, technicianId, env) {
  const admin = await requireAdmin(request, env);
  if (!admin) {
    return json({ message: "Admin access required" }, 403, request, env);
  }
  const id = Number(technicianId);
  if (!Number.isInteger(id) || id <= 0) {
    return json({ message: "Invalid technician id" }, 400, request, env);
  }
  const existing = await env.DB.prepare(
    `SELECT
      t.id,
      t.user_id,
      t.name,
      t.phone,
      t.zone,
      t.status,
      COALESCE(t.notes, '') AS notes,
      u.email
     FROM technicians t
     JOIN users u ON u.id = t.user_id
     WHERE t.id = ?`
  ).bind(id).first();
  if (!existing) {
    return json({ message: "Technician not found" }, 404, request, env);
  }
  const body = await readJson(request);
  const firstName = String(body.firstName || "").trim();
  const lastName = String(body.lastName || "").trim();
  const email = String(body.email || existing.email || "").trim().toLowerCase();
  const phone = normalizeSaudiPhoneNumber(body.phone ?? existing.phone);
  const region = String(body.region ?? existing.zone ?? "").trim();
  const notes = String(body.notes ?? existing.notes ?? "").trim();
  const status = normalizeTechnicianStatus(body.status ?? existing.status);
  const password = String(body.password || "").trim();
  const name = `${firstName || existing.name.split(" ").slice(0, -1).join(" ")} ${lastName || existing.name.split(" ").slice(-1).join(" ")}`.trim() || existing.name;
  if (!name || !email || !phone || !region) {
    return json({ message: "Name, email, phone, and region are required" }, 400, request, env);
  }
  const duplicate = await env.DB.prepare(
    "SELECT id FROM users WHERE email = ? AND id != ?"
  ).bind(email, Number(existing.user_id)).first();
  if (duplicate) {
    return json({ message: "This email is already registered" }, 409, request, env);
  }
  if (password) {
    const passwordHash = await hashPassword(password, email);
    await env.DB.prepare(
      "UPDATE users SET name = ?, email = ?, password_hash = ? WHERE id = ?"
    ).bind(name, email, passwordHash, Number(existing.user_id)).run();
  } else {
    await env.DB.prepare("UPDATE users SET name = ?, email = ? WHERE id = ?").bind(name, email, Number(existing.user_id)).run();
  }
  await env.DB.prepare(
    "UPDATE technicians SET name = ?, phone = ?, zone = ?, status = ?, notes = ? WHERE id = ?"
  ).bind(name, phone, region, status, notes, id).run();
  const technician = await env.DB.prepare(
    `SELECT
      t.id,
      t.user_id,
      t.name,
      t.phone,
      t.zone,
      t.status,
      COALESCE(t.notes, '') AS notes,
      u.email
     FROM technicians t
     LEFT JOIN users u ON u.id = t.user_id
     WHERE t.id = ?`
  ).bind(id).first();
  return json({ technician: mapTechnician(technician) }, 200, request, env);
}
__name(updateTechnician, "updateTechnician");
async function deleteTechnician(request, technicianId, env) {
  const admin = await requireAdmin(request, env);
  if (!admin) {
    return json({ message: "Admin access required" }, 403, request, env);
  }
  const id = Number(technicianId);
  if (!Number.isInteger(id) || id <= 0) {
    return json({ message: "Invalid technician id" }, 400, request, env);
  }
  const technician = await env.DB.prepare(
    "SELECT id, user_id, name FROM technicians WHERE id = ?"
  ).bind(id).first();
  if (!technician) {
    return json({ message: "Technician not found" }, 404, request, env);
  }
  const activeOrder = await env.DB.prepare(
    "SELECT id FROM service_orders WHERE technician_id = ? AND status IN ('pending', 'scheduled', 'in_transit') LIMIT 1"
  ).bind(id).first();
  if (activeOrder) {
    return json(
      { message: "Cannot delete a technician with active assigned orders" },
      409,
      request,
      env
    );
  }
  await env.DB.prepare("DELETE FROM technicians WHERE id = ?").bind(id).run();
  await env.DB.prepare("DELETE FROM users WHERE id = ?").bind(Number(technician.user_id)).run();
  return json({ message: "Technician deleted" }, 200, request, env);
}
__name(deleteTechnician, "deleteTechnician");
async function updateServiceOrder(request, id, env) {
  const actor = await requireRoles(request, env, ["customer_service", "operations_manager", "technician", "regional_dispatcher"]);
  if (!actor) {
    return json({ message: "Internal access required" }, 403, request, env);
  }
  const isOperationsManager = actor.role === "operations_manager";
  const isCustomerService = actor.role === "customer_service";
  const isTechnician = actor.role === "technician";
  const isRegionalDispatcher = actor.role === "regional_dispatcher";
  const orderId = Number(id);
  if (!Number.isInteger(orderId) || orderId <= 0) {
    return json({ message: "Invalid order id" }, 400, request, env);
  }
  const existing = await env.DB.prepare(
    `SELECT
      id, technician_id, status, customer_name, request_number, phone, secondary_phone, whatsapp_phone, notes, district, city, address,
      address_text, landmark, map_link, ac_type, service_category, standard_duration_minutes, work_started_at, completion_note, delay_reason,
      delay_note, work_type, ac_count, priority, delivery_type, preferred_date, preferred_time, scheduled_date, scheduled_time, coordination_note, source,
      customer_action, reschedule_reason, cancellation_reason, canceled_at, completed_at, approval_status, proof_status, approved_at,
      approved_by, client_signature, zamil_closure_status, zamil_close_requested_at, zamil_otp_code, zamil_otp_submitted_at,
      zamil_closed_at, suspension_reason, suspension_note, suspended_at, exception_status, audit_log_json, copper_meters, base_included,
      service_items_json
     FROM service_orders
     WHERE id = ?`
  ).bind(orderId).first();
  if (!existing) {
    return json({ message: "Order not found" }, 404, request, env);
  }
  const body = await readJson(request);
  const touchedKeys = Object.keys(body || {}).filter((key) => body[key] !== void 0);
  const technicianAllowedKeys = ["clientSignature"];
  const technicianTouchedKeys = touchedKeys;
  const regionalAllowedKeys = ["scheduledDate", "scheduledTime", "coordinationNote", "status", "completionNote", "contactCustomerNote"];
  const regionalTouchedKeys = touchedKeys;
  let regionalProfile = null;
  if (isTechnician) {
    if (technicianTouchedKeys.some((key) => !technicianAllowedKeys.includes(key))) {
      return json({ message: "Technicians can only update the client signature from this endpoint" }, 403, request, env);
    }
    const assignedTechnician = existing.technician_id === null ? null : await env.DB.prepare("SELECT id, user_id FROM technicians WHERE id = ?").bind(Number(existing.technician_id)).first();
    if (!assignedTechnician || Number(assignedTechnician.user_id || 0) !== Number(actor.sub || 0)) {
      return json({ message: "This order is not assigned to the active technician" }, 403, request, env);
    }
    if (body.clientSignature === void 0) {
      return json({ message: "Client signature is required" }, 400, request, env);
    }
  }
  if (isRegionalDispatcher) {
    if (regionalTouchedKeys.some((key) => !regionalAllowedKeys.includes(key))) {
      return json({ message: "Regional accounts can only reschedule with a note or mark the order as completed" }, 403, request, env);
    }
    regionalProfile = await env.DB.prepare(
      "SELECT id, user_id, name, zone FROM technicians WHERE user_id = ?"
    ).bind(Number(actor.sub)).first();
    if (!regionalProfile) {
      return json({ message: "Regional profile not found" }, 404, request, env);
    }
    if (getOrderRegionKey({ city: existing.city }) !== normalizeRegionKey(regionalProfile.zone)) {
      return json({ message: "This order does not belong to your assigned region" }, 403, request, env);
    }
  }
  const noteOnlyContactCustomer = !isCustomerService && touchedKeys.length === 1 && touchedKeys[0] === "contactCustomerNote" && String(body.contactCustomerNote || "").trim();
  if (noteOnlyContactCustomer) {
    const contactCustomerNote2 = String(body.contactCustomerNote || "").trim();
    const nextCoordinationNote2 = [String(existing.coordination_note || "").trim(), `\u0627\u062A\u0635\u0644 \u0628\u0627\u0644\u0639\u0645\u064A\u0644: ${contactCustomerNote2}`].filter(Boolean).join("\n");
    const nextAuditLog2 = normalizeAuditLogEntries([
      ...normalizeAuditLogEntries(parseJsonArray(existing.audit_log_json)),
      {
        type: isOperationsManager ? "coordination" : "regional_dispatch",
        actor: isOperationsManager ? "operations_manager" : "regional_dispatcher",
        message: isOperationsManager ? `\u0633\u062C\u0644 \u0645\u062F\u064A\u0631 \u0627\u0644\u0639\u0645\u0644\u064A\u0627\u062A \u062A\u0648\u0627\u0635\u0644\u0627\u064B \u0645\u0639 \u0627\u0644\u0639\u0645\u064A\u0644. \u0627\u0644\u0645\u0644\u0627\u062D\u0638\u0629: ${contactCustomerNote2}` : `\u0633\u062C\u0644\u062A \u062C\u0647\u0629 \u0627\u0644\u0645\u0646\u0637\u0642\u0629 \u062A\u0648\u0627\u0635\u0644\u0627\u064B \u0645\u0639 \u0627\u0644\u0639\u0645\u064A\u0644. \u0627\u0644\u0645\u0644\u0627\u062D\u0638\u0629: ${contactCustomerNote2}`,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    ]);
    await env.DB.prepare(
      `UPDATE service_orders
       SET coordination_note = ?, audit_log_json = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    ).bind(nextCoordinationNote2, JSON.stringify(nextAuditLog2), orderId).run();
    if (isRegionalDispatcher) {
      await notifyUsersByRoles(
        env,
        ["operations_manager"],
        "\u0627\u062A\u0635\u0627\u0644 \u0645\u0646 \u062D\u0633\u0627\u0628 \u0627\u0644\u0645\u0646\u0637\u0642\u0629",
        `\u0633\u062C\u0644\u062A ${regionalProfile?.name || "\u062C\u0647\u0629 \u0627\u0644\u0645\u0646\u0637\u0642\u0629"} \u062A\u0648\u0627\u0635\u0644\u0627\u064B \u0645\u0639 \u0627\u0644\u0639\u0645\u064A\u0644 \u0641\u064A \u0627\u0644\u0637\u0644\u0628 \u0631\u0642\u0645 ${existing.request_number}. \u0627\u0644\u0645\u0644\u0627\u062D\u0638\u0629: ${contactCustomerNote2}`,
        orderId
      );
    }
    const order2 = await readServiceOrderById(env, orderId);
    return json({ order: order2 }, 200, request, env);
  }
  const requestNumber = body.requestNumber !== void 0 ? String(body.requestNumber || "").trim() : String(existing.request_number || "").trim();
  const customerName = body.customerName !== void 0 ? String(body.customerName || "").trim() : String(existing.customer_name || "").trim();
  const phone = body.phone !== void 0 ? normalizeSaudiPhoneNumber(body.phone) : normalizeSaudiPhoneNumber(existing.phone);
  const secondaryPhone = body.secondaryPhone !== void 0 ? normalizeSaudiPhoneNumber(body.secondaryPhone) : normalizeSaudiPhoneNumber(existing.secondary_phone);
  const whatsappPhone = body.whatsappPhone !== void 0 ? normalizeSaudiPhoneNumber(body.whatsappPhone) : normalizeSaudiPhoneNumber(existing.whatsapp_phone || existing.phone);
  const status = body.status !== void 0 ? String(body.status || "").trim() : String(existing.status || "pending").trim();
  const notes = body.notes !== void 0 ? String(body.notes || "").trim() : String(existing.notes || "").trim();
  const district = body.district !== void 0 ? String(body.district || "").trim() : String(existing.district || "").trim();
  const city = body.city !== void 0 ? String(body.city || "").trim() : String(existing.city || "").trim();
  const addressText = body.addressText !== void 0 ? String(body.addressText || "").trim() : String(existing.address_text || "").trim();
  const landmark = body.landmark !== void 0 ? String(body.landmark || "").trim() : String(existing.landmark || "").trim();
  const mapLink = body.mapLink !== void 0 ? String(body.mapLink || "").trim() : String(existing.map_link || existing.address || "").trim();
  const address = mapLink;
  const acDetails = body.acDetails !== void 0 ? (Array.isArray(body.acDetails) ? body.acDetails : []).map((item, index) => ({
    id: String(item?.id || `ac-${Date.now()}-${index}`),
    type: String(item?.type || "").trim().toLowerCase(),
    quantity: Math.max(1, Number(item?.quantity) || 1)
  })).filter((item) => item.type) : (() => {
    try {
      return JSON.parse(existing.service_items_json || "[]");
    } catch {
      return [];
    }
  })();
  const acType = body.acType !== void 0 ? String(body.acType || "").trim() : String(existing.ac_type || acDetails[0]?.type || "").trim();
  const serviceCategory = body.serviceCategory !== void 0 ? String(body.serviceCategory || "split_installation").trim() : String(existing.service_category || "split_installation").trim();
  const standardDurationMinutes = body.standardDurationMinutes !== void 0 ? Math.max(1, Number(body.standardDurationMinutes) || 1) : Math.max(1, Number(existing.standard_duration_minutes) || 120);
  const workStartedAt = body.workStartedAt !== void 0 ? String(body.workStartedAt || "").trim() || null : existing.work_started_at || null;
  const completionNote = body.completionNote !== void 0 ? String(body.completionNote || "").trim() : String(existing.completion_note || "").trim();
  const delayReason = body.delayReason !== void 0 ? String(body.delayReason || "").trim() : String(existing.delay_reason || "").trim();
  const delayNote = body.delayNote !== void 0 ? String(body.delayNote || "").trim() : String(existing.delay_note || "").trim();
  const priority = body.priority !== void 0 ? String(body.priority || "normal").trim() : String(existing.priority || "normal").trim();
  const deliveryType = body.deliveryType !== void 0 ? normalizeDeliveryType(body.deliveryType) : normalizeDeliveryType(existing.delivery_type);
  const preferredDate = body.preferredDate !== void 0 ? String(body.preferredDate || "").trim() : String(existing.preferred_date || existing.scheduled_date || "").trim();
  const preferredTime = body.preferredTime !== void 0 ? String(body.preferredTime || "").trim() : String(existing.preferred_time || existing.scheduled_time || "").trim();
  const scheduledDate = body.scheduledDate !== void 0 ? String(body.scheduledDate || "").trim() : String(existing.scheduled_date || "").trim();
  const scheduledTime = body.scheduledTime !== void 0 ? String(body.scheduledTime || "").trim() : String(existing.scheduled_time || "").trim();
  const coordinationNote = body.coordinationNote !== void 0 ? String(body.coordinationNote || "").trim() : String(existing.coordination_note || "").trim();
  const contactCustomerNote = String(body.contactCustomerNote || "").trim();
  const nextCoordinationNote = contactCustomerNote ? [coordinationNote, `\u0627\u062A\u0635\u0644 \u0628\u0627\u0644\u0639\u0645\u064A\u0644: ${contactCustomerNote}`].filter(Boolean).join("\n") : coordinationNote;
  const workType = body.workType !== void 0 ? String(body.workType || "").trim() : body.serviceSummary !== void 0 ? String(body.serviceSummary || "").trim() : String(existing.work_type || "").trim();
  const acCount = body.acCount !== void 0 ? Math.max(1, Number(body.acCount) || 1) : acDetails.reduce((sum, item) => sum + (Number(item?.quantity) || 0), 0) || Number(existing.ac_count || 1);
  const source = body.source !== void 0 ? String(body.source || "manual").trim() : body.sourceChannel !== void 0 ? String(body.sourceChannel || "manual").trim() : String(existing.source || "manual").trim();
  const customerAction = body.customerAction !== void 0 ? String(body.customerAction || "none").trim() : String(existing.customer_action || "none").trim();
  const rescheduleReason = body.rescheduleReason !== void 0 ? String(body.rescheduleReason || "").trim() : String(existing.reschedule_reason || "").trim();
  const cancellationReason = body.cancellationReason !== void 0 ? String(body.cancellationReason || "").trim() : String(existing.cancellation_reason || "").trim();
  const approvalStatus = body.approvalStatus !== void 0 ? String(body.approvalStatus || "pending").trim() : String(existing.approval_status || "pending").trim();
  const proofStatus = body.proofStatus !== void 0 ? String(body.proofStatus || "pending_review").trim() : String(existing.proof_status || "pending_review").trim();
  const approvedAt = body.approvedAt !== void 0 ? String(body.approvedAt || "").trim() || null : existing.approved_at || null;
  const approvedBy = body.approvedBy !== void 0 ? String(body.approvedBy || "").trim() : String(existing.approved_by || "").trim();
  const clientSignature = body.clientSignature !== void 0 ? String(body.clientSignature || "").trim() : String(existing.client_signature || "").trim();
  const zamilClosureStatus = body.zamilClosureStatus !== void 0 ? String(body.zamilClosureStatus || "idle").trim() : String(existing.zamil_closure_status || "idle").trim();
  const zamilCloseRequestedAt = body.zamilCloseRequestedAt !== void 0 ? String(body.zamilCloseRequestedAt || "").trim() || null : existing.zamil_close_requested_at || null;
  const zamilOtpCode = body.zamilOtpCode !== void 0 ? String(body.zamilOtpCode || "").trim() : String(existing.zamil_otp_code || "").trim();
  const zamilOtpSubmittedAt = body.zamilOtpSubmittedAt !== void 0 ? String(body.zamilOtpSubmittedAt || "").trim() || null : existing.zamil_otp_submitted_at || null;
  const zamilClosedAt = body.zamilClosedAt !== void 0 ? String(body.zamilClosedAt || "").trim() || null : existing.zamil_closed_at || null;
  const suspensionReason = body.suspensionReason !== void 0 ? String(body.suspensionReason || "").trim() : String(existing.suspension_reason || "").trim();
  const suspensionNote = body.suspensionNote !== void 0 ? String(body.suspensionNote || "").trim() : String(existing.suspension_note || "").trim();
  const suspendedAt = body.suspendedAt !== void 0 ? String(body.suspendedAt || "").trim() || null : existing.suspended_at || null;
  const exceptionStatus = body.exceptionStatus !== void 0 ? String(body.exceptionStatus || "none").trim() : String(existing.exception_status || "none").trim();
  const technicianId = body.technicianId === void 0 ? existing.technician_id : body.technicianId === "" || body.technicianId === null ? null : Number(body.technicianId);
  const auditLog = body.auditLog !== void 0 ? normalizeAuditLogEntries(body.auditLog) : normalizeAuditLogEntries(parseJsonArray(existing.audit_log_json));
  if (!["pending", "scheduled", "in_transit", "completed", "canceled"].includes(status)) {
    return json({ message: "Invalid order status" }, 400, request, env);
  }
  if (!["idle", "requested", "otp_submitted", "closed"].includes(zamilClosureStatus)) {
    return json({ message: "Invalid Zamil closure status" }, 400, request, env);
  }
  if (!scheduledDate && status !== "canceled") {
    return json({ message: "Scheduled date is required" }, 400, request, env);
  }
  if (!requestNumber || !customerName || !phone || !mapLink) {
    return json({ message: "Request number, customer name, phone, and map link are required" }, 400, request, env);
  }
  if (deliveryType === "express_24h" && !isFastDeliveryCity(city)) {
    return json({ message: "Fast delivery is only available in the listed major cities" }, 400, request, env);
  }
  if (!acType) {
    return json({ message: "AC type is required" }, 400, request, env);
  }
  if (technicianId !== null && (!Number.isInteger(technicianId) || technicianId <= 0)) {
    return json({ message: "Technician not found" }, 404, request, env);
  }
  const technician = technicianId === null ? null : await env.DB.prepare("SELECT id, user_id, name FROM technicians WHERE id = ?").bind(Number(technicianId)).first();
  if (technicianId !== null && !technician) {
    return json({ message: "Technician not found" }, 404, request, env);
  }
  if (isCustomerService && body.status !== void 0 && status !== "canceled") {
    return json({ message: "Customer service can only request rescheduling or cancel the order" }, 403, request, env);
  }
  if (isCustomerService && body.customerAction === "reschedule_requested" && !rescheduleReason) {
    return json({ message: "Reschedule reason is required" }, 400, request, env);
  }
  if (isCustomerService && status === "canceled" && !cancellationReason) {
    return json({ message: "Cancellation reason is required" }, 400, request, env);
  }
  if (isRegionalDispatcher && body.status !== void 0 && !["scheduled", "completed"].includes(status)) {
    return json({ message: "Regional accounts can only keep the order scheduled or mark it as completed" }, 400, request, env);
  }
  if (isRegionalDispatcher && (body.scheduledDate !== void 0 || body.scheduledTime !== void 0) && !coordinationNote) {
    return json({ message: "A coordination note is required when rescheduling an order" }, 400, request, env);
  }
  const serviceItemsTotal = calculateServiceItemsTotal(body.serviceItems || []);
  const extrasTotal = calculateExtrasTotal(existing.copper_meters, Boolean(existing.base_included)) + serviceItemsTotal;
  const nextAuditLog = normalizeAuditLogEntries([
    ...auditLog,
    {
      type: isOperationsManager ? "coordination" : isTechnician ? "signature" : isRegionalDispatcher ? "regional_dispatch" : "customer_action",
      actor: isOperationsManager ? "operations_manager" : isTechnician ? "technician" : isRegionalDispatcher ? "regional_dispatcher" : "customer_service",
      message: isOperationsManager ? contactCustomerNote ? `\u0633\u062C\u0644 \u0645\u062F\u064A\u0631 \u0627\u0644\u0639\u0645\u0644\u064A\u0627\u062A \u062A\u0648\u0627\u0635\u0644\u0627\u064B \u0645\u0639 \u0627\u0644\u0639\u0645\u064A\u0644.${contactCustomerNote ? ` \u0627\u0644\u0645\u0644\u0627\u062D\u0638\u0629: ${contactCustomerNote}` : ""}` : "\u0642\u0627\u0645 \u0645\u062F\u064A\u0631 \u0627\u0644\u0639\u0645\u0644\u064A\u0627\u062A \u0628\u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0645\u0648\u0639\u062F \u0623\u0648 \u062D\u0627\u0644\u0629 \u0627\u0644\u0637\u0644\u0628." : isTechnician ? "\u0642\u0627\u0645 \u0627\u0644\u0641\u0646\u064A \u0628\u062A\u062D\u062F\u064A\u062B \u062A\u0648\u0642\u064A\u0639 \u0627\u0644\u0639\u0645\u064A\u0644." : isRegionalDispatcher ? contactCustomerNote ? `\u0633\u062C\u0644\u062A \u062C\u0647\u0629 \u0627\u0644\u0645\u0646\u0637\u0642\u0629 \u062A\u0648\u0627\u0635\u0644\u0627\u064B \u0645\u0639 \u0627\u0644\u0639\u0645\u064A\u0644.${contactCustomerNote ? ` \u0627\u0644\u0645\u0644\u0627\u062D\u0638\u0629: ${contactCustomerNote}` : ""}` : status === "completed" ? `\u0623\u0643\u0645\u0644\u062A \u062C\u0647\u0629 \u0627\u0644\u0645\u0646\u0637\u0642\u0629 \u0627\u0644\u0637\u0644\u0628.${completionNote ? ` \u0645\u0644\u0627\u062D\u0638\u0629 \u0627\u0644\u0625\u0643\u0645\u0627\u0644: ${completionNote}` : ""}` : `\u0623\u0639\u0627\u062F\u062A \u062C\u0647\u0629 \u0627\u0644\u0645\u0646\u0637\u0642\u0629 \u062C\u062F\u0648\u0644\u0629 \u0627\u0644\u0637\u0644\u0628.${coordinationNote ? ` \u0627\u0644\u0645\u0644\u0627\u062D\u0638\u0629: ${coordinationNote}` : ""}` : status === "canceled" ? `\u062A\u0645 \u0625\u0644\u063A\u0627\u0621 \u0627\u0644\u0637\u0644\u0628 \u0645\u0646 \u062E\u062F\u0645\u0629 \u0627\u0644\u0639\u0645\u0644\u0627\u0621.${cancellationReason ? ` \u0627\u0644\u0633\u0628\u0628: ${cancellationReason}` : ""}` : customerAction === "reschedule_requested" ? `\u062A\u0645 \u0637\u0644\u0628 \u0625\u0639\u0627\u062F\u0629 \u062C\u062F\u0648\u0644\u0629 \u0645\u0646 \u062E\u062F\u0645\u0629 \u0627\u0644\u0639\u0645\u0644\u0627\u0621.${rescheduleReason ? ` \u0627\u0644\u0633\u0628\u0628: ${rescheduleReason}` : ""}` : "\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0637\u0644\u0628 \u0645\u0646 \u062E\u062F\u0645\u0629 \u0627\u0644\u0639\u0645\u0644\u0627\u0621.",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    }
  ]);
  const effectivePriority = deliveryType === "none" ? priority : "urgent";
  const nextCustomerAction = isOperationsManager && (body.scheduledDate !== void 0 || body.scheduledTime !== void 0 || body.status !== void 0) ? String(body.customerAction || "none").trim() || "none" : customerAction;
  const nextCompletedAt = status === "completed" ? (/* @__PURE__ */ new Date()).toISOString() : existing.completed_at || null;
  const nextCanceledAt = status === "canceled" ? (/* @__PURE__ */ new Date()).toISOString() : existing.canceled_at || null;
  await env.DB.prepare(
    `UPDATE service_orders
     SET customer_name = ?, request_number = ?, phone = ?, secondary_phone = ?, whatsapp_phone = ?, status = ?, technician_id = ?, notes = ?,
         district = ?, city = ?, address = ?, address_text = ?, landmark = ?, map_link = ?, ac_type = ?, service_category = ?,
         standard_duration_minutes = ?, work_started_at = ?, completion_note = ?, delay_reason = ?, delay_note = ?,
         priority = ?, delivery_type = ?, preferred_date = ?, preferred_time = ?, scheduled_date = ?, scheduled_time = ?, coordination_note = ?,
         work_type = ?, ac_count = ?, source = ?, customer_action = ?, reschedule_reason = ?, cancellation_reason = ?, canceled_at = ?,
         completed_at = ?, approval_status = ?,
         proof_status = ?, approved_at = ?, approved_by = ?, client_signature = ?, zamil_closure_status = ?,
         zamil_close_requested_at = ?, zamil_otp_code = ?, zamil_otp_submitted_at = ?, zamil_closed_at = ?,
         suspension_reason = ?, suspension_note = ?, suspended_at = ?, exception_status = ?, audit_log_json = ?,
         service_items_json = ?, extras_total = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`
  ).bind(
    customerName,
    requestNumber,
    phone,
    secondaryPhone,
    whatsappPhone,
    status,
    technician ? technician.id : null,
    notes,
    district,
    city,
    address,
    addressText,
    landmark,
    mapLink,
    acType,
    serviceCategory,
    standardDurationMinutes,
    workStartedAt,
    completionNote,
    delayReason,
    delayNote,
    effectivePriority,
    deliveryType,
    preferredDate,
    preferredTime,
    scheduledDate,
    scheduledTime,
    nextCoordinationNote,
    workType,
    acCount,
    source,
    nextCustomerAction,
    rescheduleReason,
    cancellationReason,
    nextCanceledAt,
    nextCompletedAt,
    approvalStatus,
    proofStatus,
    approvedAt,
    approvedBy,
    clientSignature,
    zamilClosureStatus,
    zamilCloseRequestedAt,
    zamilOtpCode,
    zamilOtpSubmittedAt,
    zamilClosedAt,
    suspensionReason,
    suspensionNote,
    suspendedAt,
    exceptionStatus,
    JSON.stringify(nextAuditLog),
    JSON.stringify(acDetails),
    extrasTotal,
    orderId
  ).run();
  if (technician && Number(existing.technician_id || 0) !== technician.id) {
    await createNotification(
      env,
      technician.user_id,
      "\u062A\u0645 \u0625\u0633\u0646\u0627\u062F \u0627\u0644\u0637\u0644\u0628 \u0644\u0643",
      `\u0644\u062F\u064A\u0643 \u0627\u0644\u0622\u0646 \u0645\u0647\u0645\u0629 \u062C\u062F\u064A\u062F\u0629 \u0628\u0631\u0642\u0645 #${orderId}.`,
      "assignment",
      orderId
    );
  }
  if (isCustomerService && customerAction === "reschedule_requested") {
    await notifyUsersByRoles(
      env,
      ["operations_manager"],
      "\u0637\u0644\u0628 \u0625\u0639\u0627\u062F\u0629 \u062C\u062F\u0648\u0644\u0629",
      `\u0637\u0644\u0628\u062A \u062E\u062F\u0645\u0629 \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0625\u0639\u0627\u062F\u0629 \u062C\u062F\u0648\u0644\u0629 \u0627\u0644\u0637\u0644\u0628 \u0631\u0642\u0645 ${requestNumber}${rescheduleReason ? ` \u0628\u0633\u0628\u0628: ${rescheduleReason}` : ""}.`,
      orderId
    );
  }
  if (isCustomerService && status === "canceled") {
    await notifyUsersByRoles(
      env,
      ["operations_manager"],
      "\u062A\u0645 \u0625\u0644\u063A\u0627\u0621 \u0637\u0644\u0628",
      `\u062A\u0645 \u0625\u0644\u063A\u0627\u0621 \u0627\u0644\u0637\u0644\u0628 \u0631\u0642\u0645 ${requestNumber}${cancellationReason ? ` \u0628\u0633\u0628\u0628: ${cancellationReason}` : ""}.`,
      orderId
    );
  }
  if (isOperationsManager && (body.scheduledDate !== void 0 || body.scheduledTime !== void 0)) {
    await notifyUsersByRoles(
      env,
      ["customer_service"],
      "\u062A\u0645 \u062A\u0646\u0633\u064A\u0642 \u0645\u0648\u0639\u062F \u0627\u0644\u0637\u0644\u0628",
      `\u062A\u0645 \u062A\u062D\u062F\u064A\u062F \u0645\u0648\u0639\u062F \u0627\u0644\u0637\u0644\u0628 \u0631\u0642\u0645 ${requestNumber} \u0628\u062A\u0627\u0631\u064A\u062E ${scheduledDate || "-"} \u0627\u0644\u0633\u0627\u0639\u0629 ${scheduledTime || "-"}.`,
      orderId
    );
    await notifyRegionalDispatchersForOrder(
      env,
      { city },
      "\u062A\u0645 \u062A\u0633\u0644\u064A\u0645 \u0637\u0644\u0628 \u062C\u062F\u064A\u062F \u0644\u0644\u0645\u0646\u0637\u0642\u0629",
      `\u0642\u0627\u0645 \u0645\u062F\u064A\u0631 \u0627\u0644\u0639\u0645\u0644\u064A\u0627\u062A \u0628\u062A\u062D\u062F\u064A\u062F \u0645\u0648\u0639\u062F \u0627\u0644\u0637\u0644\u0628 \u0631\u0642\u0645 ${requestNumber} \u0644\u0645\u0646\u0637\u0642\u062A\u0643 \u0628\u062A\u0627\u0631\u064A\u062E ${scheduledDate || "-"} \u0627\u0644\u0633\u0627\u0639\u0629 ${scheduledTime || "-"}.`,
      orderId
    );
  }
  if (isOperationsManager && body.status !== void 0 && status !== String(existing.status || "").trim()) {
    await notifyUsersByRoles(
      env,
      ["customer_service"],
      "\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u062D\u0627\u0644\u0629 \u0627\u0644\u0637\u0644\u0628",
      `\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u062D\u0627\u0644\u0629 \u0627\u0644\u0637\u0644\u0628 \u0631\u0642\u0645 ${requestNumber} \u0625\u0644\u0649 ${mapOrderStatusLabel(status)}.`,
      orderId
    );
    await notifyRegionalDispatchersForOrder(
      env,
      { city },
      "\u062A\u062D\u062F\u064A\u062B \u0639\u0644\u0649 \u0637\u0644\u0628 \u0627\u0644\u0645\u0646\u0637\u0642\u0629",
      `\u0642\u0627\u0645 \u0645\u062F\u064A\u0631 \u0627\u0644\u0639\u0645\u0644\u064A\u0627\u062A \u0628\u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0637\u0644\u0628 \u0631\u0642\u0645 ${requestNumber} \u0625\u0644\u0649 ${mapOrderStatusLabel(status)} \u0636\u0645\u0646 \u0645\u0646\u0637\u0642\u062A\u0643.`,
      orderId
    );
  }
  if (isCustomerService && deliveryType !== "none") {
    await notifyUsersByRoles(
      env,
      ["operations_manager"],
      "\u0637\u0644\u0628 \u062A\u0648\u0635\u064A\u0644 \u0628\u0623\u0648\u0644\u0648\u064A\u0629 \u0642\u0635\u0648\u0649",
      `\u0627\u0644\u0637\u0644\u0628 \u0631\u0642\u0645 ${requestNumber} \u0645\u0633\u062C\u0644 \u0643\u0640 ${deliveryType === "express_24h" ? "\u062A\u0648\u0635\u064A\u0644 \u0633\u0631\u064A\u0639 \u062E\u0644\u0627\u0644 24 \u0633\u0627\u0639\u0629" : "\u0637\u0644\u0628 \u062A\u0648\u0635\u064A\u0644"} \u0648\u064A\u062D\u062A\u0627\u062C \u0625\u0644\u0649 \u0645\u062A\u0627\u0628\u0639\u0629 \u0639\u0627\u062C\u0644\u0629.`,
      orderId
    );
  }
  if (isRegionalDispatcher && (body.scheduledDate !== void 0 || body.scheduledTime !== void 0)) {
    await notifyUsersByRoles(
      env,
      ["operations_manager"],
      "\u0625\u0639\u0627\u062F\u0629 \u062C\u062F\u0648\u0644\u0629 \u0645\u0646 \u062D\u0633\u0627\u0628 \u0627\u0644\u0645\u0646\u0637\u0642\u0629",
      `\u0623\u0639\u0627\u062F\u062A ${regionalProfile?.name || "\u062C\u0647\u0629 \u0627\u0644\u0645\u0646\u0637\u0642\u0629"} \u062C\u062F\u0648\u0644\u0629 \u0627\u0644\u0637\u0644\u0628 \u0631\u0642\u0645 ${requestNumber}.${nextCoordinationNote ? ` \u0627\u0644\u0645\u0644\u0627\u062D\u0638\u0629: ${nextCoordinationNote}` : ""}`,
      orderId
    );
  }
  if (isRegionalDispatcher && contactCustomerNote) {
    await notifyUsersByRoles(
      env,
      ["operations_manager"],
      "\u0627\u062A\u0635\u0627\u0644 \u0645\u0646 \u062D\u0633\u0627\u0628 \u0627\u0644\u0645\u0646\u0637\u0642\u0629",
      `\u0633\u062C\u0644\u062A ${regionalProfile?.name || "\u062C\u0647\u0629 \u0627\u0644\u0645\u0646\u0637\u0642\u0629"} \u062A\u0648\u0627\u0635\u0644\u0627\u064B \u0645\u0639 \u0627\u0644\u0639\u0645\u064A\u0644 \u0641\u064A \u0627\u0644\u0637\u0644\u0628 \u0631\u0642\u0645 ${requestNumber}. \u0627\u0644\u0645\u0644\u0627\u062D\u0638\u0629: ${contactCustomerNote}`,
      orderId
    );
  }
  if (isRegionalDispatcher && status === "completed" && status !== String(existing.status || "").trim()) {
    await notifyUsersByRoles(
      env,
      ["operations_manager", "customer_service"],
      "\u062A\u0645 \u0625\u0643\u0645\u0627\u0644 \u0627\u0644\u0637\u0644\u0628 \u0645\u0646 \u062D\u0633\u0627\u0628 \u0627\u0644\u0645\u0646\u0637\u0642\u0629",
      `\u0623\u0643\u0645\u0644\u062A ${regionalProfile?.name || "\u062C\u0647\u0629 \u0627\u0644\u0645\u0646\u0637\u0642\u0629"} \u0627\u0644\u0637\u0644\u0628 \u0631\u0642\u0645 ${requestNumber}.${completionNote ? ` \u0627\u0644\u0645\u0644\u0627\u062D\u0638\u0629: ${completionNote}` : ""}`,
      orderId
    );
  }
  const order = await readServiceOrderById(env, orderId);
  return json({ order }, 200, request, env);
}
__name(updateServiceOrder, "updateServiceOrder");
async function updateTechnicianAvailability(request, technicianId, env) {
  const user = await requireRoles(request, env, ["admin", "technician"]);
  if (!user) {
    return json({ message: "Unauthorized" }, 401, request, env);
  }
  const id = Number(technicianId);
  if (!Number.isInteger(id) || id <= 0) {
    return json({ message: "Invalid technician id" }, 400, request, env);
  }
  const technician = await env.DB.prepare(
    "SELECT id, user_id, name, phone, zone, status, COALESCE(notes, '') AS notes FROM technicians WHERE id = ?"
  ).bind(id).first();
  if (!technician) {
    return json({ message: "Technician not found" }, 404, request, env);
  }
  if (user.role === "technician" && String(technician.user_id) !== String(user.sub)) {
    return json({ message: "Forbidden" }, 403, request, env);
  }
  const body = await readJson(request);
  const status = normalizeTechnicianStatus(body.status);
  await env.DB.prepare("UPDATE technicians SET status = ? WHERE id = ?").bind(status, id).run();
  const nextTechnician = await env.DB.prepare(
    "SELECT id, user_id, name, phone, zone, status, COALESCE(notes, '') AS notes FROM technicians WHERE id = ?"
  ).bind(id).first();
  return json({ technician: mapTechnician(nextTechnician) }, 200, request, env);
}
__name(updateTechnicianAvailability, "updateTechnicianAvailability");
async function getTechnicianOrders(request, env) {
  const user = await requireRoles(request, env, ["technician", "regional_dispatcher"]);
  if (!user) {
    return json({ message: "Field access required" }, 403, request, env);
  }
  const technician = await env.DB.prepare(
    `SELECT
      t.id,
      t.user_id,
      t.name,
      t.phone,
      t.zone,
      t.status,
      COALESCE(t.notes, '') AS notes,
      u.email
     FROM technicians t
     LEFT JOIN users u ON u.id = t.user_id
     WHERE t.user_id = ?`
  ).bind(Number(user.sub)).first();
  if (!technician) {
    return json({ message: "Profile not found" }, 404, request, env);
  }
  const isRegionalDispatcher = normalizeServerRole(user.role) === "regional_dispatcher";
  const statement = isRegionalDispatcher ? env.DB.prepare(
    `SELECT
          o.id, o.customer_name, o.request_number, o.phone, o.secondary_phone, o.whatsapp_phone, o.district, o.city, o.address,
          o.address_text, o.landmark, o.map_link, o.ac_type, o.service_category, o.standard_duration_minutes,
          o.work_started_at, o.completion_note, o.delay_reason, o.delay_note, o.work_type, o.ac_count, o.status, o.priority,
          o.delivery_type, o.preferred_date, o.preferred_time, o.scheduled_date, o.scheduled_time, o.coordination_note, o.source,
          o.notes, o.customer_action, o.reschedule_reason, o.cancellation_reason, o.canceled_at, o.completed_at, o.approval_status,
          o.proof_status, o.approved_at, o.approved_by, o.client_signature, o.zamil_closure_status, o.zamil_close_requested_at,
          o.zamil_otp_code, o.zamil_otp_submitted_at, o.zamil_closed_at, o.suspension_reason, o.suspension_note, o.suspended_at,
          o.exception_status, o.audit_log_json, o.copper_meters, o.base_included, o.extras_total, o.service_items_json,
          o.created_at, o.updated_at, t.id AS technician_id, t.name AS technician_name, t.user_id AS technician_user_id
         FROM service_orders o
         LEFT JOIN technicians t ON t.id = o.technician_id
         ORDER BY o.id DESC`
  ) : env.DB.prepare(
    `SELECT
          o.id, o.customer_name, o.request_number, o.phone, o.secondary_phone, o.whatsapp_phone, o.district, o.city, o.address,
          o.address_text, o.landmark, o.map_link, o.ac_type, o.service_category, o.standard_duration_minutes,
          o.work_started_at, o.completion_note, o.delay_reason, o.delay_note, o.work_type, o.ac_count, o.status, o.priority,
          o.delivery_type, o.preferred_date, o.preferred_time, o.scheduled_date, o.scheduled_time, o.coordination_note, o.source,
          o.notes, o.customer_action, o.reschedule_reason, o.cancellation_reason, o.canceled_at, o.completed_at, o.approval_status,
          o.proof_status, o.approved_at, o.approved_by, o.client_signature, o.zamil_closure_status, o.zamil_close_requested_at,
          o.zamil_otp_code, o.zamil_otp_submitted_at, o.zamil_closed_at, o.suspension_reason, o.suspension_note, o.suspended_at,
          o.exception_status, o.audit_log_json, o.copper_meters, o.base_included, o.extras_total, o.service_items_json,
          o.created_at, o.updated_at, t.id AS technician_id, t.name AS technician_name, t.user_id AS technician_user_id
         FROM service_orders o
         LEFT JOIN technicians t ON t.id = o.technician_id
         WHERE o.technician_id = ?
         ORDER BY o.id DESC`
  ).bind(Number(technician.id));
  const { results } = await statement.all();
  const scopedResults = isRegionalDispatcher ? (results || []).filter((row) => getOrderRegionKey({ city: row.city }) === normalizeRegionKey(technician.zone)) : results || [];
  const areaClusters = await readInternalAreaClusters(env);
  const orders = await Promise.all(scopedResults.map((row) => mapServiceOrderRow(env, row, areaClusters)));
  const timeStandards = await readServiceTimeStandards(env);
  return json(
    {
      technician: mapTechnician(technician),
      pricing: OPERATIONS_PRICING,
      timeStandards,
      areaClusters,
      orders
    },
    200,
    request,
    env
  );
}
__name(getTechnicianOrders, "getTechnicianOrders");
async function cancelServiceOrder(request, id, env) {
  const user = await requireRoles(request, env, ["admin", "technician"]);
  if (!user) {
    return json({ message: "Unauthorized" }, 401, request, env);
  }
  const orderId = Number(id);
  if (!Number.isInteger(orderId) || orderId <= 0) {
    return json({ message: "Invalid order id" }, 400, request, env);
  }
  const existing = await env.DB.prepare(
    `SELECT
      o.id,
      o.customer_name,
      o.notes,
      o.technician_id,
      t.user_id AS technician_user_id
     FROM service_orders o
     LEFT JOIN technicians t ON t.id = o.technician_id
     WHERE o.id = ?`
  ).bind(orderId).first();
  if (!existing) {
    return json({ message: "Order not found" }, 404, request, env);
  }
  if (user.role === "technician" && Number(existing.technician_user_id) !== Number(user.sub)) {
    return json({ message: "This order is not assigned to you" }, 403, request, env);
  }
  const body = await readJson(request);
  const reason = String(body.reason || "").trim();
  const nextNotes = [existing.notes, reason].filter(Boolean).join(" | ");
  await env.DB.prepare(
    "UPDATE service_orders SET status = 'canceled', notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
  ).bind(nextNotes, orderId).run();
  await notifyAdmins(
    env,
    "\u062A\u0645 \u0625\u0644\u063A\u0627\u0621 \u0627\u0644\u0637\u0644\u0628",
    `\u062A\u0645 \u0625\u0644\u063A\u0627\u0621 \u0627\u0644\u0637\u0644\u0628 #${orderId}${reason ? ` \u0628\u0633\u0628\u0628: ${reason}` : ""}.`,
    orderId
  );
  const updated = await readServiceOrderById(env, orderId);
  return json({ order: updated }, 200, request, env);
}
__name(cancelServiceOrder, "cancelServiceOrder");
async function updateServiceOrderStatus(request, id, env) {
  const user = await requireRoles(request, env, ["operations_manager", "technician"]);
  if (!user) {
    return json({ message: "Operations manager or technician access required" }, 401, request, env);
  }
  const isTechnician = user.role === "technician";
  const orderId = Number(id);
  if (!Number.isInteger(orderId) || orderId <= 0) {
    return json({ message: "Invalid order id" }, 400, request, env);
  }
  const body = await readJson(request);
  const requestedStatus = String(body.status || "").trim();
  const status = isTechnician && requestedStatus === "rescheduled" ? "suspended" : requestedStatus;
  const allowedStatuses = isTechnician ? ["pending", "scheduled", "in_transit", "completed", "rescheduled", "suspended"] : ["pending", "scheduled", "in_transit", "completed"];
  if (!allowedStatuses.includes(requestedStatus)) {
    return json({ message: "Invalid order status" }, 400, request, env);
  }
  const order = await env.DB.prepare(
    `SELECT
      o.id, o.customer_name, o.request_number, o.status, o.audit_log_json,
      o.suspension_reason, o.suspension_note, o.suspended_at, o.exception_status,
      t.user_id AS technician_user_id
     FROM service_orders o
     LEFT JOIN technicians t ON t.id = o.technician_id
     WHERE o.id = ?`
  ).bind(orderId).first();
  if (!order) {
    return json({ message: "Order not found" }, 404, request, env);
  }
  if (isTechnician && Number(order.technician_user_id) !== Number(user.sub)) {
    return json({ message: "This order is not assigned to you" }, 403, request, env);
  }
  const baseAuditLog = normalizeAuditLogEntries(parseJsonArray(order.audit_log_json));
  const nextAuditLog = normalizeAuditLogEntries([
    ...baseAuditLog,
    {
      type: "status",
      actor: isTechnician ? "technician" : "operations_manager",
      message: isTechnician ? requestedStatus === "rescheduled" ? "\u0642\u0627\u0645 \u0627\u0644\u0641\u0646\u064A \u0628\u0637\u0644\u0628 \u0625\u0639\u0627\u062F\u0629 \u062C\u062F\u0648\u0644\u0629 \u0627\u0644\u0645\u0647\u0645\u0629" : `\u0642\u0627\u0645 \u0627\u0644\u0641\u0646\u064A \u0628\u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0645\u0647\u0645\u0629 \u0625\u0644\u0649 \u062D\u0627\u0644\u0629 ${mapOrderStatusLabel(status)}` : `\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0637\u0644\u0628 \u0625\u0644\u0649 \u062D\u0627\u0644\u0629 ${mapOrderStatusLabel(status)}`,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    }
  ]);
  const suspendedAt = status === "suspended" ? (/* @__PURE__ */ new Date()).toISOString() : null;
  const suspensionReason = status === "suspended" ? String(body.suspensionReason || (requestedStatus === "rescheduled" ? "\u0637\u0644\u0628 \u0625\u0639\u0627\u062F\u0629 \u062C\u062F\u0648\u0644\u0629 \u0645\u0646 \u0627\u0644\u0641\u0646\u064A" : "")).trim() : "";
  const suspensionNote = status === "suspended" ? String(body.suspensionNote || "").trim() : "";
  const exceptionStatus = status === "suspended" ? String(body.exceptionStatus || (requestedStatus === "rescheduled" ? "rescheduled" : "open")).trim() || "open" : "none";
  const completedAt = status === "completed" ? (/* @__PURE__ */ new Date()).toISOString() : null;
  await env.DB.prepare(
    `UPDATE service_orders
     SET status = ?, suspension_reason = ?, suspension_note = ?, suspended_at = ?, exception_status = ?,
         completed_at = ?, audit_log_json = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`
  ).bind(status, suspensionReason, suspensionNote, suspendedAt, exceptionStatus, completedAt, JSON.stringify(nextAuditLog), orderId).run();
  if (status === "in_transit") {
    await notifyUsersByRoles(
      env,
      ["customer_service"],
      "\u0627\u0644\u0637\u0644\u0628 \u0641\u064A \u0627\u0644\u0637\u0631\u064A\u0642",
      `\u0627\u0644\u0637\u0644\u0628 \u0631\u0642\u0645 ${order.request_number || order.customer_name} \u0641\u064A \u0627\u0644\u0637\u0631\u064A\u0642 \u0644\u0644\u0639\u0645\u064A\u0644 \u0627\u0644\u0622\u0646.`,
      orderId
    );
  }
  if (status === "completed") {
    await notifyUsersByRoles(
      env,
      ["operations_manager", "customer_service"],
      "\u062A\u0645 \u0625\u0646\u0647\u0627\u0621 \u0627\u0644\u0637\u0644\u0628 \u0645\u0646 \u0627\u0644\u0641\u0646\u064A",
      `\u0642\u0627\u0645 \u0627\u0644\u0641\u0646\u064A \u0628\u0625\u0646\u0647\u0627\u0621 \u0627\u0644\u0637\u0644\u0628 \u0631\u0642\u0645 ${order.request_number || order.customer_name}.`,
      orderId
    );
  }
  if (requestedStatus === "rescheduled") {
    await notifyUsersByRoles(
      env,
      ["operations_manager", "customer_service"],
      "\u0637\u0644\u0628 \u0625\u0639\u0627\u062F\u0629 \u062C\u062F\u0648\u0644\u0629 \u0645\u0646 \u0627\u0644\u0641\u0646\u064A",
      `\u0637\u0644\u0628 \u0627\u0644\u0641\u0646\u064A \u0625\u0639\u0627\u062F\u0629 \u062C\u062F\u0648\u0644\u0629 \u0627\u0644\u0637\u0644\u0628 \u0631\u0642\u0645 ${order.request_number || order.customer_name}${suspensionReason ? ` \u0628\u0633\u0628\u0628: ${suspensionReason}` : ""}.`,
      orderId
    );
  }
  if (status === "suspended" && requestedStatus !== "rescheduled") {
    await notifyUsersByRoles(
      env,
      ["operations_manager"],
      "\u062A\u0645 \u062A\u0639\u0644\u064A\u0642 \u0645\u0647\u0645\u0629 \u0645\u064A\u062F\u0627\u0646\u064A\u0629",
      `\u0642\u0627\u0645 \u0627\u0644\u0641\u0646\u064A \u0628\u062A\u0639\u0644\u064A\u0642 \u0627\u0644\u0637\u0644\u0628 \u0631\u0642\u0645 ${order.request_number || order.customer_name}${suspensionReason ? ` \u0628\u0633\u0628\u0628: ${suspensionReason}` : ""}.`,
      orderId
    );
  }
  const updated = await readServiceOrderById(env, orderId);
  return json({ order: updated }, 200, request, env);
}
__name(updateServiceOrderStatus, "updateServiceOrderStatus");
async function quickUpdateCompactOrderStatus(request, id, env) {
  const user = await requireRoles(request, env, ["operations_manager"]);
  if (!user) {
    return json({ message: "Operations manager access required" }, 401, request, env);
  }
  const orderId = Number(id);
  if (!Number.isInteger(orderId) || orderId <= 0) {
    return json({ message: "Invalid order id" }, 400, request, env);
  }
  const body = await readJson(request);
  const requestedStatus = String(body.status || "").trim();
  const status = requestedStatus === "rescheduled" ? "scheduled" : requestedStatus;
  if (!["completed", "scheduled"].includes(status) || !["completed", "rescheduled"].includes(requestedStatus)) {
    return json({ message: "Invalid compact order status" }, 400, request, env);
  }
  const order = await env.DB.prepare(
    `SELECT
      o.id, o.customer_name, o.request_number, o.status, o.city, o.completed_at, o.audit_log_json
     FROM service_orders o
     WHERE o.id = ?`
  ).bind(orderId).first();
  if (!order) {
    return json({ message: "Order not found" }, 404, request, env);
  }
  if (String(order.status || "").trim() === "canceled") {
    return json({ message: "Canceled orders cannot be updated from the compact table" }, 409, request, env);
  }
  const nextAuditLog = normalizeAuditLogEntries([
    ...normalizeAuditLogEntries(parseJsonArray(order.audit_log_json)),
    {
      type: "status",
      actor: "operations_manager",
      message: requestedStatus === "rescheduled" ? "\u062A\u0645\u062A \u0625\u0639\u0627\u062F\u0629 \u062C\u062F\u0648\u0644\u0629 \u0627\u0644\u0637\u0644\u0628 \u0645\u0646 \u0627\u0644\u062C\u062F\u0648\u0644 \u0627\u0644\u0645\u062E\u062A\u0635\u0631." : `\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0637\u0644\u0628 \u0625\u0644\u0649 \u062D\u0627\u0644\u0629 ${mapOrderStatusLabel(status)} \u0645\u0646 \u0627\u0644\u062C\u062F\u0648\u0644 \u0627\u0644\u0645\u062E\u062A\u0635\u0631.`,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    }
  ]);
  const nextCompletedAt = status === "completed" ? (/* @__PURE__ */ new Date()).toISOString() : null;
  await env.DB.prepare(
    `UPDATE service_orders
     SET status = ?, completed_at = ?, audit_log_json = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`
  ).bind(status, nextCompletedAt, JSON.stringify(nextAuditLog), orderId).run();
  if (requestedStatus === "rescheduled") {
    await notifyUsersByRoles(
      env,
      ["customer_service"],
      "\u062A\u0645\u062A \u0625\u0639\u0627\u062F\u0629 \u062C\u062F\u0648\u0644\u0629 \u0627\u0644\u0637\u0644\u0628",
      `\u062A\u0645\u062A \u0625\u0639\u0627\u062F\u0629 \u062C\u062F\u0648\u0644\u0629 \u0627\u0644\u0637\u0644\u0628 \u0631\u0642\u0645 ${order.request_number || order.customer_name}.`,
      orderId
    );
    await notifyRegionalDispatchersForOrder(
      env,
      { city: order.city },
      "\u062A\u0645\u062A \u0625\u0639\u0627\u062F\u0629 \u062C\u062F\u0648\u0644\u0629 \u0637\u0644\u0628 \u0627\u0644\u0645\u0646\u0637\u0642\u0629",
      `\u0623\u0639\u0627\u062F \u0645\u062F\u064A\u0631 \u0627\u0644\u0639\u0645\u0644\u064A\u0627\u062A \u062C\u062F\u0648\u0644\u0629 \u0627\u0644\u0637\u0644\u0628 \u0631\u0642\u0645 ${order.request_number || order.customer_name}.`,
      orderId
    );
  }
  if (requestedStatus === "completed") {
    await notifyUsersByRoles(
      env,
      ["customer_service"],
      "\u062A\u0645 \u0625\u0646\u0647\u0627\u0621 \u0627\u0644\u0637\u0644\u0628",
      `\u062A\u0645 \u0627\u0644\u0627\u0646\u062A\u0647\u0627\u0621 \u0645\u0646 \u0627\u0644\u0637\u0644\u0628 \u0631\u0642\u0645 ${order.request_number || order.customer_name} \u0628\u0646\u062C\u0627\u062D.`,
      orderId
    );
    await notifyRegionalDispatchersForOrder(
      env,
      { city: order.city },
      "\u062A\u0645 \u0625\u0646\u0647\u0627\u0621 \u0637\u0644\u0628 \u0627\u0644\u0645\u0646\u0637\u0642\u0629",
      `\u0642\u0627\u0645 \u0645\u062F\u064A\u0631 \u0627\u0644\u0639\u0645\u0644\u064A\u0627\u062A \u0628\u0625\u0646\u0647\u0627\u0621 \u0627\u0644\u0637\u0644\u0628 \u0631\u0642\u0645 ${order.request_number || order.customer_name}.`,
      orderId
    );
  }
  const updated = await readServiceOrderById(env, orderId);
  return json({ order: updated }, 200, request, env);
}
__name(quickUpdateCompactOrderStatus, "quickUpdateCompactOrderStatus");
async function requestServiceOrderClosure(request, id, env) {
  const user = await requireRoles(request, env, ["technician"]);
  if (!user) {
    return json({ message: "Technician access required" }, 403, request, env);
  }
  const orderId = Number(id);
  if (!Number.isInteger(orderId) || orderId <= 0) {
    return json({ message: "Invalid order id" }, 400, request, env);
  }
  const order = await env.DB.prepare(
    `SELECT
      o.id, o.customer_name, o.status, o.audit_log_json, o.zamil_closure_status, o.standard_duration_minutes,
      o.work_started_at, o.completion_note, o.delay_reason, o.delay_note,
      t.user_id AS technician_user_id, t.name AS technician_name
     FROM service_orders o
     LEFT JOIN technicians t ON t.id = o.technician_id
     WHERE o.id = ?`
  ).bind(orderId).first();
  if (!order) {
    return json({ message: "Order not found" }, 404, request, env);
  }
  if (Number(order.technician_user_id) !== Number(user.sub)) {
    return json({ message: "This order is not assigned to you" }, 403, request, env);
  }
  if (["completed", "canceled", "suspended"].includes(String(order.status || ""))) {
    return json({ message: "This order cannot enter the closure flow" }, 409, request, env);
  }
  const photoCountRow = await env.DB.prepare(
    "SELECT COUNT(*) AS count FROM service_order_photos WHERE order_id = ?"
  ).bind(orderId).first();
  if (Number(photoCountRow?.count || 0) < 1) {
    return json({ message: "Upload at least one proof photo before requesting the OTP" }, 400, request, env);
  }
  const body = await readJson(request);
  const completionNote = String(body.completionNote || "").trim();
  const delayReason = String(body.delayReason || "").trim();
  const delayNote = String(body.delayNote || "").trim();
  const workStartedAt = order.work_started_at || (/* @__PURE__ */ new Date()).toISOString();
  const elapsedMinutes = calculateElapsedMinutes(workStartedAt, null);
  const standardDurationMinutes = Math.max(1, Number(order.standard_duration_minutes) || 120);
  if (elapsedMinutes > standardDurationMinutes && !delayReason) {
    return json({ message: "Delay reason is required before closing an overdue task" }, 400, request, env);
  }
  const requestedAt = (/* @__PURE__ */ new Date()).toISOString();
  const nextAuditLog = normalizeAuditLogEntries([
    ...parseJsonArray(order.audit_log_json),
    {
      type: "zamil_request",
      actor: "technician",
      message: "\u0637\u0644\u0628 \u0627\u0644\u0641\u0646\u064A \u0628\u062F\u0621 \u0625\u063A\u0644\u0627\u0642 \u0627\u0644\u0632\u0627\u0645\u0644",
      createdAt: requestedAt
    }
  ]);
  await env.DB.prepare(
    `UPDATE service_orders
     SET status = ?, work_started_at = ?, completion_note = ?, delay_reason = ?, delay_note = ?, zamil_closure_status = 'requested',
         zamil_close_requested_at = ?, zamil_otp_code = '', zamil_otp_submitted_at = NULL, zamil_closed_at = NULL,
         approval_status = 'pending', proof_status = 'pending_review', audit_log_json = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`
  ).bind(
    ["pending", "scheduled"].includes(String(order.status || "")) ? "in_transit" : String(order.status || "in_transit"),
    workStartedAt,
    completionNote,
    delayReason,
    delayNote,
    requestedAt,
    JSON.stringify(nextAuditLog),
    orderId
  ).run();
  await notifyAdmins(
    env,
    "\u062C\u0627\u0647\u0632 \u0644\u0625\u063A\u0644\u0627\u0642 \u0627\u0644\u0632\u0627\u0645\u0644",
    `\u0627\u0644\u0641\u0646\u064A ${order.technician_name || "\u0627\u0644\u0645\u064A\u062F\u0627\u0646\u064A"} \u062C\u0627\u0647\u0632 \u0644\u0625\u063A\u0644\u0627\u0642 \u0627\u0644\u0637\u0644\u0628 #${orderId} \u0644\u0644\u0639\u0645\u064A\u0644 ${order.customer_name}.`,
    orderId
  );
  const updated = await readServiceOrderById(env, orderId);
  return json({ order: updated }, 200, request, env);
}
__name(requestServiceOrderClosure, "requestServiceOrderClosure");
async function submitServiceOrderClosureOtp(request, id, env) {
  const user = await requireRoles(request, env, ["technician"]);
  if (!user) {
    return json({ message: "Technician access required" }, 403, request, env);
  }
  const orderId = Number(id);
  if (!Number.isInteger(orderId) || orderId <= 0) {
    return json({ message: "Invalid order id" }, 400, request, env);
  }
  const order = await env.DB.prepare(
    `SELECT
      o.id, o.customer_name, o.audit_log_json, o.zamil_closure_status,
      t.user_id AS technician_user_id, t.name AS technician_name
     FROM service_orders o
     LEFT JOIN technicians t ON t.id = o.technician_id
     WHERE o.id = ?`
  ).bind(orderId).first();
  if (!order) {
    return json({ message: "Order not found" }, 404, request, env);
  }
  if (Number(order.technician_user_id) !== Number(user.sub)) {
    return json({ message: "This order is not assigned to you" }, 403, request, env);
  }
  if (!["requested", "otp_submitted"].includes(String(order.zamil_closure_status || "idle"))) {
    return json({ message: "Request the Zamil OTP first" }, 409, request, env);
  }
  const body = await readJson(request);
  const otpCode = String(body.otpCode || "").replace(/\s+/g, "").trim();
  if (!otpCode) {
    return json({ message: "OTP code is required" }, 400, request, env);
  }
  const submittedAt = (/* @__PURE__ */ new Date()).toISOString();
  const nextAuditLog = normalizeAuditLogEntries([
    ...parseJsonArray(order.audit_log_json),
    {
      type: "zamil_otp",
      actor: "technician",
      message: "\u0623\u0631\u0633\u0644 \u0627\u0644\u0641\u0646\u064A \u0631\u0645\u0632 OTP \u0644\u0644\u0625\u062F\u0627\u0631\u0629",
      createdAt: submittedAt
    }
  ]);
  await env.DB.prepare(
    `UPDATE service_orders
     SET zamil_closure_status = 'otp_submitted', zamil_otp_code = ?, zamil_otp_submitted_at = ?,
         audit_log_json = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`
  ).bind(otpCode, submittedAt, JSON.stringify(nextAuditLog), orderId).run();
  await notifyAdmins(
    env,
    "\u062A\u0645 \u0627\u0633\u062A\u0644\u0627\u0645 OTP",
    `\u0648\u0635\u0644 \u0631\u0645\u0632 OTP \u0644\u0644\u0637\u0644\u0628 #${orderId} \u0645\u0646 \u0627\u0644\u0641\u0646\u064A ${order.technician_name || "\u0627\u0644\u0645\u064A\u062F\u0627\u0646\u064A"}.`,
    orderId
  );
  const updated = await readServiceOrderById(env, orderId);
  return json({ order: updated }, 200, request, env);
}
__name(submitServiceOrderClosureOtp, "submitServiceOrderClosureOtp");
async function approveServiceOrderClosure(request, id, env) {
  const admin = await requireAdmin(request, env);
  if (!admin) {
    return json({ message: "Admin access required" }, 403, request, env);
  }
  const orderId = Number(id);
  if (!Number.isInteger(orderId) || orderId <= 0) {
    return json({ message: "Invalid order id" }, 400, request, env);
  }
  const order = await env.DB.prepare(
    `SELECT
      o.id, o.customer_name, o.audit_log_json, o.zamil_closure_status, o.technician_id,
      t.user_id AS technician_user_id, t.name AS technician_name,
      u.name AS technician_user_name
     FROM service_orders o
     LEFT JOIN technicians t ON t.id = o.technician_id
     LEFT JOIN users u ON u.id = t.user_id
     WHERE o.id = ?`
  ).bind(orderId).first();
  if (!order) {
    return json({ message: "Order not found" }, 404, request, env);
  }
  if (String(order.zamil_closure_status || "idle") !== "otp_submitted") {
    return json({ message: "OTP has not been submitted yet" }, 409, request, env);
  }
  const approvedAt = (/* @__PURE__ */ new Date()).toISOString();
  const adminName = String(admin.name || admin.email || "admin").trim();
  const nextAuditLog = normalizeAuditLogEntries([
    ...parseJsonArray(order.audit_log_json),
    {
      type: "zamil_closed",
      actor: "admin",
      message: "\u0627\u0639\u062A\u0645\u062F\u062A \u0627\u0644\u0625\u062F\u0627\u0631\u0629 \u0625\u063A\u0644\u0627\u0642 \u0627\u0644\u0637\u0644\u0628 \u0628\u0639\u062F \u0642\u0628\u0648\u0644 OTP \u0641\u064A \u0628\u0648\u0627\u0628\u0629 \u0627\u0644\u0632\u0627\u0645\u0644",
      createdAt: approvedAt
    }
  ]);
  await env.DB.prepare(
    `UPDATE service_orders
     SET status = 'completed', approval_status = 'approved', proof_status = 'approved', approved_at = ?, approved_by = ?,
         exception_status = 'none', zamil_closure_status = 'closed', zamil_closed_at = ?, audit_log_json = ?,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`
  ).bind(approvedAt, adminName, approvedAt, JSON.stringify(nextAuditLog), orderId).run();
  if (order.technician_user_id) {
    await createNotification(
      env,
      order.technician_user_id,
      "\u062A\u0645 \u0625\u063A\u0644\u0627\u0642 \u0627\u0644\u0645\u0647\u0645\u0629",
      `\u062A\u0645 \u0627\u0639\u062A\u0645\u0627\u062F \u0627\u0644\u0637\u0644\u0628 #${orderId} \u0648\u064A\u0645\u0643\u0646\u0643 \u0645\u063A\u0627\u062F\u0631\u0629 \u0627\u0644\u0645\u0648\u0642\u0639 \u0627\u0644\u0622\u0646.`,
      "status_update",
      orderId
    );
  }
  const updated = await readServiceOrderById(env, orderId);
  return json({ order: updated }, 200, request, env);
}
__name(approveServiceOrderClosure, "approveServiceOrderClosure");
async function updateServiceOrderExtras(request, id, env) {
  const user = await requireRoles(request, env, ["admin", "technician"]);
  if (!user) {
    return json({ message: "Unauthorized" }, 401, request, env);
  }
  const orderId = Number(id);
  if (!Number.isInteger(orderId) || orderId <= 0) {
    return json({ message: "Invalid order id" }, 400, request, env);
  }
  const body = await readJson(request);
  const copperMeters = Math.max(0, Number(body.copperMeters) || 0);
  const baseIncluded = body.baseIncluded ? 1 : 0;
  const existing = await env.DB.prepare(
    `SELECT o.id, o.service_items_json, t.user_id AS technician_user_id
     FROM service_orders o
     LEFT JOIN technicians t ON t.id = o.technician_id
     WHERE o.id = ?`
  ).bind(orderId).first();
  if (!existing) {
    return json({ message: "Order not found" }, 404, request, env);
  }
  if (user.role === "technician" && Number(existing.technician_user_id) !== Number(user.sub)) {
    return json({ message: "This order is not assigned to you" }, 403, request, env);
  }
  const extrasTotal = calculateExtrasTotal(copperMeters, Boolean(baseIncluded)) + calculateServiceItemsTotal(parseStoredServiceItems(existing.service_items_json));
  await env.DB.prepare(
    `UPDATE service_orders
     SET copper_meters = ?, base_included = ?, extras_total = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`
  ).bind(copperMeters, baseIncluded, extrasTotal, orderId).run();
  await notifyAdmins(
    env,
    "\u062A\u062D\u062F\u064A\u062B \u062A\u0643\u0644\u0641\u0629 \u0625\u0636\u0627\u0641\u064A\u0629",
    `\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0625\u0636\u0627\u0641\u0627\u062A \u0627\u0644\u0637\u0644\u0628 #${orderId} \u0625\u0644\u0649 ${extrasTotal} \u0631.\u0633.`,
    orderId
  );
  const order = await readServiceOrderById(env, orderId);
  return json({ order }, 200, request, env);
}
__name(updateServiceOrderExtras, "updateServiceOrderExtras");
async function uploadServiceOrderPhoto(request, id, env) {
  const user = await requireRoles(request, env, ["admin", "technician"]);
  if (!user) {
    return json({ message: "Unauthorized" }, 401, request, env);
  }
  const orderId = Number(id);
  if (!Number.isInteger(orderId) || orderId <= 0) {
    return json({ message: "Invalid order id" }, 400, request, env);
  }
  const body = await readJson(request);
  const name = String(body.name || "").trim();
  const url = String(body.url || "").trim();
  if (!name || !url) {
    return json({ message: "Photo name and url are required" }, 400, request, env);
  }
  await env.DB.prepare(
    "INSERT INTO service_order_photos (order_id, image_name, image_url, uploaded_by_user_id) VALUES (?, ?, ?, ?)"
  ).bind(orderId, name, url, Number(user.sub)).run();
  await notifyAdmins(
    env,
    "\u062A\u0645 \u0631\u0641\u0639 \u0635\u0648\u0631\u0629 \u062A\u0648\u062B\u064A\u0642",
    `\u062A\u0645 \u0631\u0641\u0639 \u0635\u0648\u0631\u0629 \u062C\u062F\u064A\u062F\u0629 \u0644\u0644\u0637\u0644\u0628 #${orderId}.`,
    orderId
  );
  const order = await readServiceOrderById(env, orderId);
  return json({ order }, 201, request, env);
}
__name(uploadServiceOrderPhoto, "uploadServiceOrderPhoto");
async function listNotifications(request, env) {
  const user = await readActiveUser(request, env);
  if (!user) {
    return json({ message: "Unauthorized" }, 401, request, env);
  }
  const sinceId = Number(new URL(request.url).searchParams.get("sinceId") || 0);
  const statement = sinceId > 0 ? env.DB.prepare(
    `SELECT id, title, body, kind, related_order_id, is_read, created_at
           FROM notifications
           WHERE user_id = ? AND id > ?
           ORDER BY id DESC
           LIMIT 40`
  ).bind(Number(user.sub), sinceId) : env.DB.prepare(
    `SELECT id, title, body, kind, related_order_id, is_read, created_at
           FROM notifications
           WHERE user_id = ?
           ORDER BY id DESC
           LIMIT 40`
  ).bind(Number(user.sub));
  const { results } = await statement.all();
  const items = (results || []).map((row) => ({
    id: row.id,
    title: row.title,
    body: row.body,
    kind: row.kind,
    relatedOrderId: row.related_order_id,
    isRead: Boolean(row.is_read),
    createdAt: row.created_at
  }));
  return json(
    {
      notifications: items,
      unreadCount: items.filter((item) => !item.isRead).length
    },
    200,
    request,
    env
  );
}
__name(listNotifications, "listNotifications");
async function markNotificationRead(request, id, env) {
  const user = await readActiveUser(request, env);
  if (!user) {
    return json({ message: "Unauthorized" }, 401, request, env);
  }
  await env.DB.prepare(
    "UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?"
  ).bind(Number(id), Number(user.sub)).run();
  return json({ ok: true }, 200, request, env);
}
__name(markNotificationRead, "markNotificationRead");
async function markAllNotificationsRead(request, env) {
  const user = await readActiveUser(request, env);
  if (!user) {
    return json({ message: "Unauthorized" }, 401, request, env);
  }
  await env.DB.prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ?").bind(Number(user.sub)).run();
  return json({ ok: true }, 200, request, env);
}
__name(markAllNotificationsRead, "markAllNotificationsRead");
function mapTechnician(row) {
  const regionConfig = getOperationsRegionByKey(row.zone);
  return {
    id: String(row.id),
    userId: String(row.user_id),
    name: row.name,
    email: row.email || "",
    phone: row.phone,
    region: regionConfig ? regionConfig.ar : row.zone,
    zone: regionConfig ? regionConfig.key : row.zone,
    status: row.status,
    notes: row.notes || ""
  };
}
__name(mapTechnician, "mapTechnician");
function normalizeTechnicianStatus(status) {
  return ["available", "busy"].includes(String(status || "").trim()) ? String(status).trim() : "available";
}
__name(normalizeTechnicianStatus, "normalizeTechnicianStatus");
function normalizeServerRole(role) {
  if (role === "admin") {
    return "operations_manager";
  }
  return String(role || "").trim();
}
__name(normalizeServerRole, "normalizeServerRole");
function normalizeSaudiPhoneNumber(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) {
    return "";
  }
  if (digits.startsWith("966")) {
    return `0${digits.slice(3)}`;
  }
  if (digits.startsWith("5") && digits.length === 9) {
    return `0${digits}`;
  }
  if (digits.startsWith("0")) {
    return digits;
  }
  return digits.length === 9 ? `0${digits}` : digits;
}
__name(normalizeSaudiPhoneNumber, "normalizeSaudiPhoneNumber");
function normalizeDeliveryType(value) {
  const normalized = String(value || "none").trim().toLowerCase();
  return ["none", "standard", "express_24h"].includes(normalized) ? normalized : "none";
}
__name(normalizeDeliveryType, "normalizeDeliveryType");
function normalizeImportedOrderStatus(value) {
  const normalized = String(value || "pending").trim().toLowerCase();
  if (["canceled", "cancelled"].includes(normalized)) {
    return "canceled";
  }
  if (["completed", "done"].includes(normalized)) {
    return "completed";
  }
  if (["scheduled", "assigned", "in_progress", "in progress"].includes(normalized)) {
    return "scheduled";
  }
  return "pending";
}
__name(normalizeImportedOrderStatus, "normalizeImportedOrderStatus");
function isFastDeliveryCity(city) {
  return FAST_DELIVERY_CITIES.includes(String(city || "").trim());
}
__name(isFastDeliveryCity, "isFastDeliveryCity");
function normalizeServiceItems(items = []) {
  return (Array.isArray(items) ? items : []).map((item) => {
    const id = String(item?.id || "").trim();
    const description = String(item?.description || "").trim();
    const price = Number(item?.price ?? 0) || 0;
    const unit = String(item?.unit || "").trim();
    const quantity = Math.max(1, Number(item?.quantity) || 1);
    const totalPrice = Number(item?.totalPrice ?? price * quantity) || 0;
    if (!id || !description || price <= 0) {
      return null;
    }
    return {
      id,
      description,
      price,
      unit,
      quantity,
      totalPrice
    };
  }).filter(Boolean);
}
__name(normalizeServiceItems, "normalizeServiceItems");
function parseStoredServiceItems(rawValue) {
  try {
    return normalizeServiceItems(JSON.parse(rawValue || "[]"));
  } catch {
    return [];
  }
}
__name(parseStoredServiceItems, "parseStoredServiceItems");
function calculateServiceItemsTotal(items = []) {
  return normalizeServiceItems(items).reduce((sum, item) => sum + (Number(item.totalPrice) || 0), 0);
}
__name(calculateServiceItemsTotal, "calculateServiceItemsTotal");
function normalizeAuditLogEntries(entries) {
  return (Array.isArray(entries) ? entries : []).map((entry, index) => {
    const message = String(entry?.message || "").trim();
    if (!message) {
      return null;
    }
    return {
      id: String(entry?.id || "").trim() || `audit-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`,
      type: String(entry?.type || "note").trim() || "note",
      actor: String(entry?.actor || "system").trim() || "system",
      message,
      createdAt: String(entry?.createdAt || (/* @__PURE__ */ new Date()).toISOString()).trim() || (/* @__PURE__ */ new Date()).toISOString()
    };
  }).filter(Boolean);
}
__name(normalizeAuditLogEntries, "normalizeAuditLogEntries");
function extractExcelStatusFromNotes(notes) {
  const text = String(notes || "");
  const match = text.match(/(?:^|\n)Excel status:\s*(.+?)(?:\n|$)/i);
  return String(match?.[1] || "").trim();
}
__name(extractExcelStatusFromNotes, "extractExcelStatusFromNotes");
async function readServiceOrders(env) {
  const areaClusters = await readInternalAreaClusters(env);
  const { results } = await env.DB.prepare(
    `SELECT
      o.id, o.customer_name, o.request_number, o.phone, o.secondary_phone, o.whatsapp_phone, o.district, o.city, o.address,
      o.address_text, o.landmark, o.map_link, o.ac_type, o.service_category,
      o.standard_duration_minutes, o.work_started_at, o.completion_note, o.delay_reason, o.delay_note,
      o.work_type, o.ac_count, o.status, o.priority, o.delivery_type, o.preferred_date, o.preferred_time, o.scheduled_date, o.scheduled_time,
      o.coordination_note, o.source, o.notes, o.customer_action, o.reschedule_reason, o.cancellation_reason, o.canceled_at,
      o.completed_at, o.approval_status,
      o.proof_status, o.approved_at, o.approved_by, o.client_signature, o.zamil_closure_status, o.zamil_close_requested_at,
      o.zamil_otp_code, o.zamil_otp_submitted_at, o.zamil_closed_at, o.suspension_reason, o.suspension_note,
      o.suspended_at, o.exception_status, o.audit_log_json, o.copper_meters, o.base_included, o.extras_total,
      o.service_items_json, o.created_at, o.updated_at,
      t.id AS technician_id, t.name AS technician_name, t.user_id AS technician_user_id
     FROM service_orders o
     LEFT JOIN technicians t ON t.id = o.technician_id
     ORDER BY o.id DESC`
  ).all();
  return Promise.all((results || []).map((row) => mapServiceOrderRow(env, row, areaClusters)));
}
__name(readServiceOrders, "readServiceOrders");
async function readServiceOrderById(env, orderId) {
  const areaClusters = await readInternalAreaClusters(env);
  const row = await env.DB.prepare(
    `SELECT
      o.id, o.customer_name, o.request_number, o.phone, o.secondary_phone, o.whatsapp_phone, o.district, o.city, o.address,
      o.address_text, o.landmark, o.map_link, o.ac_type, o.service_category,
      o.standard_duration_minutes, o.work_started_at, o.completion_note, o.delay_reason, o.delay_note,
      o.work_type, o.ac_count, o.status, o.priority, o.delivery_type, o.preferred_date, o.preferred_time, o.scheduled_date, o.scheduled_time,
      o.coordination_note, o.source, o.notes, o.customer_action, o.reschedule_reason, o.cancellation_reason, o.canceled_at,
      o.completed_at, o.approval_status,
      o.proof_status, o.approved_at, o.approved_by, o.client_signature, o.zamil_closure_status, o.zamil_close_requested_at,
      o.zamil_otp_code, o.zamil_otp_submitted_at, o.zamil_closed_at, o.suspension_reason, o.suspension_note,
      o.suspended_at, o.exception_status, o.audit_log_json, o.copper_meters, o.base_included, o.extras_total,
      o.service_items_json, o.created_at, o.updated_at,
      t.id AS technician_id, t.name AS technician_name, t.user_id AS technician_user_id
     FROM service_orders o
     LEFT JOIN technicians t ON t.id = o.technician_id
     WHERE o.id = ?`
  ).bind(Number(orderId)).first();
  if (!row) {
    return null;
  }
  return mapServiceOrderRow(env, row, areaClusters);
}
__name(readServiceOrderById, "readServiceOrderById");
async function mapServiceOrderRow(env, row, areaClusters = []) {
  const { results } = await env.DB.prepare(
    `SELECT id, image_name, image_url, created_at
     FROM service_order_photos
     WHERE order_id = ?
     ORDER BY id DESC`
  ).bind(Number(row.id)).all();
  return {
    id: `ORD-${row.id}`,
    numericId: row.id,
    requestNumber: row.request_number || row.customer_name,
    customerName: row.customer_name,
    phone: row.phone,
    secondaryPhone: row.secondary_phone || "",
    whatsappPhone: row.whatsapp_phone || row.phone,
    district: row.district || "",
    city: row.city || "",
    ...resolveInternalAreaCluster({ city: row.city, district: row.district }, areaClusters),
    addressText: row.address_text || "",
    landmark: row.landmark || "",
    mapLink: row.map_link || row.address,
    address: row.address,
    acType: row.ac_type,
    serviceCategory: row.service_category || "split_installation",
    standardDurationMinutes: Math.max(1, Number(row.standard_duration_minutes) || 120),
    workStartedAt: row.work_started_at,
    completionNote: row.completion_note || "",
    delayReason: row.delay_reason || "",
    delayNote: row.delay_note || "",
    workType: row.work_type || "",
    acCount: Number(row.ac_count || 1),
    status: row.status,
    externalStatus: extractExcelStatusFromNotes(row.notes),
    priority: row.priority || "normal",
    deliveryType: normalizeDeliveryType(row.delivery_type),
    preferredDate: row.preferred_date || row.scheduled_date,
    preferredTime: row.preferred_time || row.scheduled_time || "",
    scheduledDate: row.scheduled_date,
    scheduledTime: row.scheduled_time || "",
    coordinationNote: row.coordination_note || "",
    source: row.source || "manual",
    sourceChannel: row.source || "manual",
    notes: row.notes,
    customerAction: row.customer_action || "none",
    rescheduleReason: row.reschedule_reason || "",
    cancellationReason: row.cancellation_reason || "",
    canceledAt: row.canceled_at,
    completedAt: row.completed_at || row.updated_at,
    approvalStatus: row.approval_status || "pending",
    proofStatus: row.proof_status || "pending_review",
    approvedAt: row.approved_at,
    approvedBy: row.approved_by || "",
    clientSignature: row.client_signature || "",
    zamilClosureStatus: row.zamil_closure_status || "idle",
    zamilCloseRequestedAt: row.zamil_close_requested_at,
    zamilOtpCode: row.zamil_otp_code || "",
    zamilOtpSubmittedAt: row.zamil_otp_submitted_at,
    zamilClosedAt: row.zamil_closed_at,
    suspensionReason: row.suspension_reason || "",
    suspensionNote: row.suspension_note || "",
    suspendedAt: row.suspended_at,
    exceptionStatus: row.exception_status || "none",
    auditLog: parseJsonArray(row.audit_log_json),
    technicianId: row.technician_id ? String(row.technician_id) : "",
    technicianName: row.technician_name || "\u063A\u064A\u0631 \u0645\u0639\u064A\u0646",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    acDetails: (() => {
      try {
        return JSON.parse(row.service_items_json || "[]").map((item, index) => ({
          id: String(item?.id || `ac-${row.id}-${index}`),
          type: String(item?.type || item?.description || "").trim().toLowerCase(),
          quantity: Math.max(1, Number(item?.quantity) || 1)
        })).filter((item) => item.type);
      } catch {
        return [];
      }
    })(),
    extras: {
      copperMeters: Number(row.copper_meters || 0),
      baseIncluded: Boolean(row.base_included),
      totalPrice: Number(row.extras_total || 0)
    },
    serviceItems: (() => {
      try {
        return normalizeServiceItems(JSON.parse(row.service_items_json || "[]"));
      } catch {
        return [];
      }
    })(),
    photos: (results || []).map((photo) => ({
      id: `photo-${photo.id}`,
      name: photo.image_name,
      url: photo.image_url,
      uploadedAt: photo.created_at
    }))
  };
}
__name(mapServiceOrderRow, "mapServiceOrderRow");
function buildOperationsSummary(orders, technicians) {
  return orders.reduce(
    (summary, order) => ({
      totalOrders: summary.totalOrders + (order.status === "canceled" ? 0 : 1),
      pendingOrders: summary.pendingOrders + (order.status === "pending" ? 1 : 0),
      activeOrders: summary.activeOrders + (["scheduled", "in_transit"].includes(order.status) ? 1 : 0),
      completedOrders: summary.completedOrders + (order.status === "completed" ? 1 : 0),
      inTransitOrders: summary.inTransitOrders + (order.status === "in_transit" ? 1 : 0),
      canceledOrders: summary.canceledOrders + (order.status === "canceled" ? 1 : 0)
    }),
    {
      totalOrders: 0,
      pendingOrders: 0,
      activeOrders: 0,
      completedOrders: 0,
      inTransitOrders: 0,
      canceledOrders: 0
    }
  );
}
__name(buildOperationsSummary, "buildOperationsSummary");
function normalizeServiceOrderInput(body) {
  const requestNumber = String(body.requestNumber || "").trim();
  const customerName = String(body.customerName || "").trim();
  const phone = String(body.phone || "").trim();
  const secondaryPhone = String(body.secondaryPhone || "").trim();
  const whatsappPhone = String(body.whatsappPhone || body.phone || "").trim();
  const city = String(body.city || "").trim();
  const district = String(body.district || "").trim();
  const addressText = String(body.addressText || body.address || "").trim();
  const landmark = String(body.landmark || "").trim();
  const mapLink = String(body.mapLink || "").trim();
  const sourceChannel = String(body.sourceChannel || body.source || "\u0627\u0644\u0632\u0627\u0645\u0644").trim();
  const serviceSummary = String(body.serviceSummary || body.workType || "").trim();
  const deliveryType = normalizeDeliveryType(body.deliveryType);
  const importStatus = normalizeImportedOrderStatus(body.importStatus || body.status);
  const priority = deliveryType === "none" ? String(body.priority || "normal").trim() : "urgent";
  const preferredDate = String(body.preferredDate || body.scheduledDate || "").trim();
  const preferredTime = String(body.preferredTime || body.scheduledTime || "").trim();
  const notes = String(body.notes || "").trim();
  const acDetails = (Array.isArray(body.acDetails) ? body.acDetails : []).map((item, index) => ({
    id: `ac-${Date.now()}-${index}`,
    type: String(item?.type || "").trim().toLowerCase(),
    quantity: Math.max(1, Number(item?.quantity) || 1)
  })).filter((item) => item.type);
  if (!requestNumber || !customerName || !phone || !city || !district || !addressText || !mapLink || !serviceSummary || !preferredDate || !preferredTime || !acDetails.length) {
    return {
      error: "Request number, customer name, phone, city, district, address, map link, service summary, preferred date/time, and AC details are required"
    };
  }
  if (deliveryType === "express_24h" && !isFastDeliveryCity(city)) {
    return {
      error: "Fast delivery is only available in the listed major cities"
    };
  }
  return {
    requestNumber,
    customerName,
    phone,
    secondaryPhone,
    whatsappPhone,
    city,
    district,
    addressText,
    landmark,
    mapLink,
    sourceChannel,
    serviceSummary,
    importStatus,
    priority,
    deliveryType,
    preferredDate,
    preferredTime,
    notes,
    acDetails,
    primaryAcType: acDetails[0]?.type || "split",
    totalQuantity: acDetails.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)
  };
}
__name(normalizeServiceOrderInput, "normalizeServiceOrderInput");
function calculateExtrasTotal(copperMeters, baseIncluded) {
  const copperTotal = Math.max(0, Number(copperMeters) || 0) * OPERATIONS_PRICING.copperPricePerMeter;
  return copperTotal + (baseIncluded ? OPERATIONS_PRICING.basePrice : 0);
}
__name(calculateExtrasTotal, "calculateExtrasTotal");
function normalizeServiceTimeStandards(items = []) {
  return (Array.isArray(items) ? items : []).map((item, index) => {
    const standardKey = String(item?.standardKey || "").trim();
    const label = String(item?.label || "").trim();
    const arLabel = String(item?.arLabel || "").trim();
    const durationMinutes = Math.max(1, Number(item?.durationMinutes) || 0);
    if (!standardKey || !label || !arLabel || !durationMinutes) {
      return null;
    }
    return {
      standardKey,
      label,
      arLabel,
      durationMinutes,
      sortOrder: Math.max(1, Number(item?.sortOrder) || index + 1)
    };
  }).filter(Boolean).sort((left, right) => left.sortOrder - right.sortOrder || left.label.localeCompare(right.label));
}
__name(normalizeServiceTimeStandards, "normalizeServiceTimeStandards");
function normalizeAreaText(value) {
  return String(value || "").trim().toLowerCase();
}
__name(normalizeAreaText, "normalizeAreaText");
function normalizeInternalAreaClusters(items = []) {
  const seen = /* @__PURE__ */ new Set();
  return (Array.isArray(items) ? items : []).map((item, index) => {
    const city = String(item?.city || "").trim();
    const district = String(item?.district || "").trim();
    const dedupeKey = `${normalizeAreaText(city)}::${normalizeAreaText(district)}`;
    if (!city || !district || seen.has(dedupeKey)) {
      return null;
    }
    seen.add(dedupeKey);
    const areaKey = String(item?.areaKey || item?.label || dedupeKey).trim() || dedupeKey;
    const label = String(item?.label || areaKey).trim() || areaKey;
    const arLabel = String(item?.arLabel || label).trim() || label;
    return {
      city,
      district,
      areaKey,
      label,
      arLabel,
      sortOrder: Math.max(1, Number(item?.sortOrder) || index + 1)
    };
  }).filter(Boolean).sort(
    (left, right) => left.sortOrder - right.sortOrder || left.label.localeCompare(right.label) || left.city.localeCompare(right.city) || left.district.localeCompare(right.district)
  );
}
__name(normalizeInternalAreaClusters, "normalizeInternalAreaClusters");
function calculateElapsedMinutes(startedAt, endedAt = null) {
  const start = startedAt ? new Date(startedAt) : null;
  if (!start || Number.isNaN(start.getTime())) {
    return 0;
  }
  const end = endedAt ? new Date(endedAt) : /* @__PURE__ */ new Date();
  if (!end || Number.isNaN(end.getTime())) {
    return 0;
  }
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 6e4));
}
__name(calculateElapsedMinutes, "calculateElapsedMinutes");
function mapOrderStatusLabel(status) {
  return {
    pending: "\u0642\u064A\u062F \u0627\u0644\u0627\u0646\u062A\u0638\u0627\u0631",
    scheduled: "\u062A\u0645\u062A \u0627\u0644\u062C\u062F\u0648\u0644\u0629",
    in_transit: "\u0641\u064A \u0627\u0644\u0637\u0631\u064A\u0642",
    completed: "\u0645\u0643\u062A\u0645\u0644",
    suspended: "\u0645\u0639\u0644\u0642\u0629",
    canceled: "\u0645\u0644\u063A\u064A"
  }[status] || status;
}
__name(mapOrderStatusLabel, "mapOrderStatusLabel");
async function createNotification(env, userId, title, body, kind = "info", relatedOrderId = null) {
  await env.DB.prepare(
    `INSERT INTO notifications (user_id, title, body, kind, related_order_id, is_read)
     VALUES (?, ?, ?, ?, ?, 0)`
  ).bind(Number(userId), title, body, kind, relatedOrderId ? Number(relatedOrderId) : null).run();
  try {
    await sendPushToUser(env, userId, {
      title,
      body,
      kind,
      relatedOrderId
    });
  } catch (error) {
    console.error("Push delivery failed", error);
  }
}
__name(createNotification, "createNotification");
async function notifyAdmins(env, title, body, relatedOrderId = null) {
  return notifyUsersByRoles(env, ["operations_manager"], title, body, relatedOrderId);
}
__name(notifyAdmins, "notifyAdmins");
async function notifyUsersByRoles(env, roles = [], title, body, relatedOrderId = null) {
  const roleList = (roles || []).map((role) => `'${String(role).replace(/'/g, "''")}'`).join(", ");
  if (!roleList) {
    return;
  }
  const { results } = await env.DB.prepare(
    `SELECT id FROM users WHERE role IN (${roleList}) AND status = 'active'`
  ).all();
  for (const user of results || []) {
    await createNotification(env, user.id, title, body, "status_update", relatedOrderId);
  }
}
__name(notifyUsersByRoles, "notifyUsersByRoles");
async function notifyRegionalDispatchersForOrder(env, order = {}, title, body, relatedOrderId = null) {
  const regionKey = getOrderRegionKey(order);
  if (!regionKey) {
    return;
  }
  await notifyRegionalDispatchersByRegion(env, regionKey, title, body, relatedOrderId);
}
__name(notifyRegionalDispatchersForOrder, "notifyRegionalDispatchersForOrder");
async function notifyRegionalDispatchersByRegion(env, regionKey, title, body, relatedOrderId = null) {
  if (!regionKey) {
    return;
  }
  const { results } = await env.DB.prepare(
    `SELECT u.id
     FROM users u
     JOIN technicians t ON t.user_id = u.id
     WHERE u.role = 'regional_dispatcher' AND u.status = 'active' AND LOWER(TRIM(t.zone)) = ?`
  ).bind(regionKey).all();
  for (const user of results || []) {
    await createNotification(env, user.id, title, body, "assignment", relatedOrderId);
  }
}
__name(notifyRegionalDispatchersByRegion, "notifyRegionalDispatchersByRegion");
async function readExistingServiceOrderNumbers(env, requestNumbers = []) {
  const normalized = Array.from(
    new Set(
      (requestNumbers || []).map((value) => String(value || "").trim()).filter(Boolean)
    )
  );
  const existing = /* @__PURE__ */ new Set();
  for (let index = 0; index < normalized.length; index += 50) {
    const chunk = normalized.slice(index, index + 50);
    if (!chunk.length) {
      continue;
    }
    const placeholders = chunk.map(() => "?").join(", ");
    const { results } = await env.DB.prepare(
      `SELECT request_number FROM service_orders WHERE request_number IN (${placeholders})`
    ).bind(...chunk).all();
    for (const row of results || []) {
      const requestNumber = String(row?.request_number || "").trim();
      if (requestNumber) {
        existing.add(requestNumber);
      }
    }
  }
  return existing;
}
__name(readExistingServiceOrderNumbers, "readExistingServiceOrderNumbers");
async function readServiceTimeStandards(env) {
  const { results } = await env.DB.prepare(
    `SELECT standard_key, label, ar_label, duration_minutes, sort_order
     FROM service_time_standards
     ORDER BY sort_order ASC, standard_key ASC`
  ).all();
  return normalizeServiceTimeStandards(
    (results || []).map((row) => ({
      standardKey: row.standard_key,
      label: row.label,
      arLabel: row.ar_label,
      durationMinutes: row.duration_minutes,
      sortOrder: row.sort_order
    }))
  );
}
__name(readServiceTimeStandards, "readServiceTimeStandards");
async function readInternalAreaClusters(env) {
  const { results } = await env.DB.prepare(
    `SELECT city, district, area_key, label, ar_label, sort_order
     FROM internal_area_clusters
     ORDER BY sort_order ASC, label ASC, city ASC, district ASC`
  ).all();
  return normalizeInternalAreaClusters(
    (results || []).map((row) => ({
      city: row.city,
      district: row.district,
      areaKey: row.area_key,
      label: row.label,
      arLabel: row.ar_label,
      sortOrder: row.sort_order
    }))
  );
}
__name(readInternalAreaClusters, "readInternalAreaClusters");
function resolveInternalAreaCluster(location, areaClusters = []) {
  const city = String(location?.city || "").trim();
  const district = String(location?.district || "").trim();
  const matched = (areaClusters || []).find(
    (entry) => normalizeAreaText(entry?.city) === normalizeAreaText(city) && normalizeAreaText(entry?.district) === normalizeAreaText(district)
  ) || null;
  const fallbackLabel = [district, city].filter(Boolean).join(" - ") || "General pool";
  const fallbackArLabel = [district, city].filter(Boolean).join(" - ") || "\u0645\u0646\u0637\u0642\u0629 \u0639\u0627\u0645\u0629";
  return {
    internalAreaKey: String(
      matched?.areaKey || `${normalizeAreaText(city || "general") || "general"}-${normalizeAreaText(district || "general") || "general"}`
    ).trim() || "general",
    internalAreaLabel: String(matched?.label || fallbackLabel).trim() || fallbackLabel,
    internalAreaArLabel: String(matched?.arLabel || fallbackArLabel).trim() || fallbackArLabel,
    internalAreaSortOrder: Math.max(1, Number(matched?.sortOrder) || 999),
    internalAreaMatched: Boolean(matched)
  };
}
__name(resolveInternalAreaCluster, "resolveInternalAreaCluster");
function normalizeProductInput(body) {
  const name = (body.name || "").trim();
  const description = (body.description || "").trim();
  const category = (body.category || "device").trim();
  const city = (body.city || "Riyadh").trim();
  const pricePerDay = Number(body.pricePerDay);
  const rating = Number.isFinite(Number(body.rating)) ? Number(body.rating) : 0;
  const quantity = Number(body.quantity);
  const imageUrl = (body.imageUrl || "").trim() || null;
  if (!name || !description) {
    return { error: "Name and description are required" };
  }
  if (!Number.isFinite(pricePerDay) || pricePerDay < 0) {
    return { error: "Invalid price per day" };
  }
  if (!Number.isInteger(quantity) || quantity < 0) {
    return { error: "Quantity must be a non-negative integer" };
  }
  if (!Number.isFinite(rating) || rating < 0 || rating > 5) {
    return { error: "Rating must be between 0 and 5" };
  }
  return {
    name,
    description,
    category,
    city,
    pricePerDay,
    rating,
    quantity,
    imageUrl
  };
}
__name(normalizeProductInput, "normalizeProductInput");
function normalizeFooterSettingsInput(body) {
  const aboutText = String(body.aboutText || "").trim();
  const copyrightText = String(body.copyrightText || "").trim();
  const usefulLinks = normalizeFooterLinkList(body.usefulLinks, "label");
  const customerServiceLinks = normalizeFooterLinkList(body.customerServiceLinks, "label");
  const socialLinks = normalizeFooterLinkList(body.socialLinks, "platform");
  if (!aboutText) {
    return { error: "About text is required" };
  }
  if (!copyrightText) {
    return { error: "Copyright text is required" };
  }
  if (usefulLinks.error || customerServiceLinks.error || socialLinks.error) {
    return { error: usefulLinks.error || customerServiceLinks.error || socialLinks.error };
  }
  return {
    aboutText,
    copyrightText,
    usefulLinks: usefulLinks.items,
    customerServiceLinks: customerServiceLinks.items,
    socialLinks: socialLinks.items
  };
}
__name(normalizeFooterSettingsInput, "normalizeFooterSettingsInput");
function normalizeHomeSettingsInput(body) {
  const heroKicker = String(body.heroKicker || "").trim();
  const heroTitle = String(body.heroTitle || "").trim();
  const heroSubtitle = String(body.heroSubtitle || "").trim();
  const primaryButtonText = String(body.primaryButtonText || "").trim();
  const primaryButtonUrl = String(body.primaryButtonUrl || "").trim();
  const secondaryButtonText = String(body.secondaryButtonText || "").trim();
  const secondaryButtonUrl = String(body.secondaryButtonUrl || "").trim();
  const stats = normalizeHomeStats(body.stats);
  if (!heroKicker || !heroTitle || !heroSubtitle) {
    return { error: "Hero content is required" };
  }
  if (!primaryButtonText || !primaryButtonUrl || !secondaryButtonText || !secondaryButtonUrl) {
    return { error: "Hero buttons are required" };
  }
  if (stats.error) {
    return { error: stats.error };
  }
  return {
    heroKicker,
    heroTitle,
    heroSubtitle,
    primaryButtonText,
    primaryButtonUrl,
    secondaryButtonText,
    secondaryButtonUrl,
    stats: stats.items
  };
}
__name(normalizeHomeSettingsInput, "normalizeHomeSettingsInput");
function normalizeHomeStats(value) {
  if (!Array.isArray(value)) {
    return { error: "Invalid home stats payload" };
  }
  const items = value.map((entry) => ({
    value: String(entry?.value || "").trim(),
    label: String(entry?.label || "").trim()
  })).filter((entry) => entry.value || entry.label);
  for (const entry of items) {
    if (!entry.value || !entry.label) {
      return { error: "Each stat requires value and label" };
    }
  }
  return { items };
}
__name(normalizeHomeStats, "normalizeHomeStats");
function normalizeFooterLinkList(value, titleKey) {
  if (!Array.isArray(value)) {
    return { error: "Invalid footer links payload" };
  }
  const items = value.map((entry) => ({
    [titleKey]: String(entry?.[titleKey] || "").trim(),
    url: String(entry?.url || "").trim()
  })).filter((entry) => entry[titleKey] || entry.url);
  for (const entry of items) {
    if (!entry[titleKey] || !entry.url) {
      return { error: "Each footer link requires text and URL" };
    }
  }
  return { items };
}
__name(normalizeFooterLinkList, "normalizeFooterLinkList");
function mapProduct(row) {
  const quantity = Number(row.quantity ?? 0);
  const availableQuantity = Number.isFinite(quantity) ? Math.max(0, quantity) : 0;
  return {
    _id: String(row.id),
    ownerUserId: row.owner_user_id ? String(row.owner_user_id) : null,
    name: row.name,
    description: row.description,
    category: row.category,
    city: row.city,
    pricePerDay: row.price_per_day,
    rating: row.rating,
    quantity: availableQuantity,
    availableQuantity,
    isAvailable: availableQuantity > 0,
    availabilityLabel: availableQuantity > 0 ? "\u0645\u062A\u0648\u0641\u0631" : "\u063A\u064A\u0631 \u0645\u062A\u0648\u0641\u0631",
    images: [
      {
        url: row.image_url || DEFAULT_PRODUCT_IMAGE
      }
    ]
  };
}
__name(mapProduct, "mapProduct");
function mapBookingRow(row) {
  return {
    id: row.id,
    startDate: row.start_date,
    endDate: row.end_date,
    quantity: row.quantity,
    totalPrice: row.total_price,
    status: row.status,
    createdAt: row.created_at,
    product: {
      id: row.product_id,
      name: row.product_name,
      city: row.product_city,
      imageUrl: row.product_image_url || "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=80"
    }
  };
}
__name(mapBookingRow, "mapBookingRow");
async function readFooterSettings(env) {
  const row = await env.DB.prepare(
    `SELECT id, about_text, useful_links_json, customer_service_links_json, social_links_json, copyright_text
     FROM footer_settings
     WHERE id = 1`
  ).first();
  if (!row) {
    return getDefaultFooterSettings();
  }
  return mapFooterSettings(row);
}
__name(readFooterSettings, "readFooterSettings");
function mapFooterSettings(row) {
  return {
    aboutText: row.about_text,
    usefulLinks: parseJsonArray(row.useful_links_json),
    customerServiceLinks: parseJsonArray(row.customer_service_links_json),
    socialLinks: parseJsonArray(row.social_links_json),
    copyrightText: row.copyright_text
  };
}
__name(mapFooterSettings, "mapFooterSettings");
function getDefaultFooterSettings() {
  return {
    aboutText: "\u0645\u0633\u0627\u062D\u0629 \u062F\u0627\u062E\u0644\u064A\u0629 \u0645\u0628\u0633\u0637\u0629 \u0644\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0637\u0644\u0628\u0627\u062A \u0628\u064A\u0646 \u062E\u062F\u0645\u0629 \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0648\u0645\u062F\u064A\u0631 \u0627\u0644\u0639\u0645\u0644\u064A\u0627\u062A \u0641\u0642\u0637.",
    usefulLinks: [
      { label: "\u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629", url: "/" },
      { label: "\u0627\u0644\u0644\u0648\u062D\u0629 \u0627\u0644\u062F\u0627\u062E\u0644\u064A\u0629", url: "/dashboard" },
      { label: "\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644", url: "/login" }
    ],
    customerServiceLinks: [
      { label: "\u0627\u0644\u062F\u0639\u0645", url: "tel:+966558232644" },
      { label: "\u0648\u0627\u062A\u0633\u0627\u0628", url: "https://wa.me/966558232644" },
      { label: "\u0627\u062A\u0635\u0644 \u0628\u0646\u0627", url: "tel:+966558232644" }
    ],
    socialLinks: [
      { platform: "instagram", url: "https://instagram.com/tarkeebpro" },
      { platform: "x", url: "https://x.com/tarkeebpro" },
      { platform: "linkedin", url: "https://linkedin.com/company/tarkeebpro" }
    ],
    copyrightText: "\u062C\u0645\u064A\u0639 \u0627\u0644\u062D\u0642\u0648\u0642 \u0645\u062D\u0641\u0648\u0638\u0629 \u0644\u0643\u0645\u064A\u0644"
  };
}
__name(getDefaultFooterSettings, "getDefaultFooterSettings");
async function readHomeSettings(env) {
  const row = await env.DB.prepare(
    `SELECT
      hero_kicker,
      hero_title,
      hero_subtitle,
      primary_button_text,
      primary_button_url,
      secondary_button_text,
      secondary_button_url,
      stats_json
     FROM home_settings
     WHERE id = 1`
  ).first();
  if (!row) {
    return getDefaultHomeSettings();
  }
  return {
    heroKicker: row.hero_kicker,
    heroTitle: row.hero_title,
    heroSubtitle: row.hero_subtitle,
    primaryButtonText: row.primary_button_text,
    primaryButtonUrl: row.primary_button_url,
    secondaryButtonText: row.secondary_button_text,
    secondaryButtonUrl: row.secondary_button_url,
    stats: parseJsonArray(row.stats_json)
  };
}
__name(readHomeSettings, "readHomeSettings");
function getDefaultHomeSettings() {
  return {
    heroKicker: "Built for the team",
    heroTitle: "Made with care to simplify the journey of customer service and the operations manager.",
    heroSubtitle: "A private request workspace that keeps intake fast, statuses clear, and heavy daily order volumes easier to manage.",
    primaryButtonText: "Open Dashboard",
    primaryButtonUrl: "/dashboard",
    secondaryButtonText: "Login",
    secondaryButtonUrl: "/login",
    stats: [
      { value: "2", label: "Dedicated internal roles" },
      { value: "4", label: "Clear request stages" },
      { value: "1", label: "Shared operations board" },
      { value: "Instant", label: "Customer service alerts" }
    ]
  };
}
__name(getDefaultHomeSettings, "getDefaultHomeSettings");
function parseJsonArray(value) {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
__name(parseJsonArray, "parseJsonArray");
async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}
__name(readJson, "readJson");
function json(data, status = 200, request, env = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...buildCorsHeaders(request, env)
    }
  });
}
__name(json, "json");
function buildCorsHeaders(request, env) {
  const requestOrigin = request.headers.get("Origin");
  const allowedOrigins = getAllowedOrigins(env);
  const allowOrigin = requestOrigin && allowedOrigins.includes(requestOrigin) ? requestOrigin : allowedOrigins[0];
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    Vary: "Origin"
  };
}
__name(buildCorsHeaders, "buildCorsHeaders");
function getAllowedOrigins(env) {
  const configuredOrigins = (env.CORS_ALLOWED_ORIGINS || "").split(",").map((origin) => origin.trim()).filter(Boolean);
  return [.../* @__PURE__ */ new Set([...configuredOrigins, ...DEFAULT_ALLOWED_ORIGINS])];
}
__name(getAllowedOrigins, "getAllowedOrigins");
function isInternalProxyRequest(request) {
  return request.headers.get(INTERNAL_PROXY_HEADER) === "1";
}
__name(isInternalProxyRequest, "isInternalProxyRequest");
async function validateCloudflareAccess(request, env) {
  const requestUrl = new URL(request.url);
  if (["localhost", "127.0.0.1"].includes(requestUrl.hostname)) {
    return null;
  }
  const token = request.headers.get("CF-Access-Jwt-Assertion") || request.headers.get("Cf-Access-Jwt-Assertion") || request.headers.get("cf-access-jwt-assertion");
  if (!token) {
    return json({ message: "Cloudflare Access token required" }, 401, request, env);
  }
  const parts = token.split(".");
  if (parts.length !== 3) {
    return json({ message: "Invalid Cloudflare Access token" }, 401, request, env);
  }
  let header;
  let payload;
  try {
    header = JSON.parse(base64UrlDecode(parts[0]));
    payload = JSON.parse(base64UrlDecode(parts[1]));
  } catch {
    return json({ message: "Invalid Cloudflare Access token" }, 401, request, env);
  }
  const audience = env.ACCESS_AUD || DEFAULT_ACCESS_AUD;
  if (!hasAudience(payload.aud, audience)) {
    return json({ message: "Invalid Cloudflare Access audience" }, 403, request, env);
  }
  const jwksUrl = env.ACCESS_JWKS_URL || DEFAULT_ACCESS_JWKS_URL;
  const issuer = new URL(jwksUrl).origin;
  if (payload.iss && payload.iss !== issuer) {
    return json({ message: "Invalid Cloudflare Access issuer" }, 403, request, env);
  }
  if (payload.exp && Number(payload.exp) < Math.floor(Date.now() / 1e3)) {
    return json({ message: "Cloudflare Access token expired" }, 401, request, env);
  }
  const jwkSet = await getAccessJwks(jwksUrl);
  const jwk = jwkSet.find((entry) => entry.kid === header.kid);
  if (!jwk) {
    return json({ message: "Cloudflare Access signing key not found" }, 401, request, env);
  }
  const publicKey = await crypto.subtle.importKey(
    "jwk",
    jwk,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256"
    },
    false,
    ["verify"]
  );
  const verified = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    publicKey,
    base64UrlToBytes(parts[2]),
    new TextEncoder().encode(`${parts[0]}.${parts[1]}`)
  );
  if (!verified) {
    return json({ message: "Cloudflare Access token verification failed" }, 401, request, env);
  }
  return null;
}
__name(validateCloudflareAccess, "validateCloudflareAccess");
function hasAudience(audience, expectedAudience) {
  if (Array.isArray(audience)) {
    return audience.includes(expectedAudience);
  }
  return String(audience || "") === expectedAudience;
}
__name(hasAudience, "hasAudience");
async function getAccessJwks(jwksUrl) {
  const cacheKey = String(jwksUrl);
  const cached = jwksCache.get(cacheKey);
  const now = Date.now();
  if (cached && cached.expiresAt > now) {
    return cached.keys;
  }
  const response = await fetch(jwksUrl);
  if (!response.ok) {
    throw new Error(`Unable to load Cloudflare Access JWKs from ${jwksUrl}`);
  }
  const data = await response.json();
  const keys = Array.isArray(data?.keys) ? data.keys : [];
  jwksCache.set(cacheKey, { keys, expiresAt: now + 60 * 60 * 1e3 });
  return keys;
}
__name(getAccessJwks, "getAccessJwks");
async function hashPassword(password, salt) {
  const msg = new TextEncoder().encode(`${salt}:${password}`);
  const hash = await crypto.subtle.digest("SHA-256", msg);
  return toHex(hash);
}
__name(hashPassword, "hashPassword");
function toHex(buffer) {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(toHex, "toHex");
async function signJwt(payload, secret) {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1e3);
  const fullPayload = { ...payload, iat: now, exp: now + 60 * 60 * 24 * 7 };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const input = `${encodedHeader}.${encodedPayload}`;
  const signature = await hmacSign(input, secret);
  return `${input}.${signature}`;
}
__name(signJwt, "signJwt");
async function verifyJwt(token, secret) {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [headerB64, payloadB64, signature] = parts;
  const input = `${headerB64}.${payloadB64}`;
  const expected = await hmacSign(input, secret);
  if (expected !== signature) return null;
  const payload = JSON.parse(base64UrlDecode(payloadB64));
  const now = Math.floor(Date.now() / 1e3);
  if (!payload.exp || payload.exp < now) return null;
  return payload;
}
__name(verifyJwt, "verifyJwt");
async function hmacSign(text, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(text));
  return base64UrlFromBytes(new Uint8Array(sig));
}
__name(hmacSign, "hmacSign");
function base64UrlEncode(text) {
  return base64UrlFromBytes(new TextEncoder().encode(text));
}
__name(base64UrlEncode, "base64UrlEncode");
function base64UrlDecode(value) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "===".slice((base64.length + 3) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}
__name(base64UrlDecode, "base64UrlDecode");
function base64UrlToBytes(value) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "===".slice((base64.length + 3) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}
__name(base64UrlToBytes, "base64UrlToBytes");
function base64UrlFromBytes(bytes) {
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
__name(base64UrlFromBytes, "base64UrlFromBytes");
async function readAuthUser(request, env) {
  const auth = request.headers.get("Authorization") || "";
  if (!auth.startsWith("Bearer ")) return null;
  const token = auth.slice("Bearer ".length);
  return verifyJwt(token, env.JWT_SECRET || "dev-secret");
}
__name(readAuthUser, "readAuthUser");
async function readActiveUser(request, env) {
  const payload = await readAuthUser(request, env);
  if (!payload || (payload.status || "active") !== "active") {
    return null;
  }
  return payload;
}
__name(readActiveUser, "readActiveUser");
async function requireAdmin(request, env) {
  const payload = await readActiveUser(request, env);
  if (!payload || normalizeServerRole(payload.role) !== "operations_manager") {
    return null;
  }
  return { ...payload, role: normalizeServerRole(payload.role) };
}
__name(requireAdmin, "requireAdmin");
async function requireRoles(request, env, roles = []) {
  const payload = await readActiveUser(request, env);
  const normalizedRole = normalizeServerRole(payload?.role);
  if (!payload || !roles.includes(normalizedRole)) {
    return null;
  }
  return { ...payload, role: normalizedRole };
}
__name(requireRoles, "requireRoles");
function getStockAdjustment(previousStatus, nextStatus, quantity) {
  if (previousStatus !== "cancelled" && nextStatus === "cancelled") {
    return Number(quantity);
  }
  if (previousStatus === "cancelled" && nextStatus !== "cancelled") {
    return -Number(quantity);
  }
  return 0;
}
__name(getStockAdjustment, "getStockAdjustment");
function calculateRentalDays(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 1;
  }
  const diff = end.getTime() - start.getTime();
  return Math.ceil(diff / (1e3 * 60 * 60 * 24)) + 1;
}
__name(calculateRentalDays, "calculateRentalDays");

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
init_modules_watch_stub();
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
init_modules_watch_stub();
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-2lgNVc/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// node_modules/wrangler/templates/middleware/common.ts
init_modules_watch_stub();
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-2lgNVc/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
/*! Bundled license information:

safe-buffer/index.js:
  (*! safe-buffer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> *)
*/
//# sourceMappingURL=index.js.map

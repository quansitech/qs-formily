var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { Cascader, Input } from "antd";
import React from "react";
import { isEmpty } from '@formily/shared';
import './index.less';
var TextArea = Input.TextArea;
export var Area = function (props) {
    var placeholder = props.placeholder, allowClear = props.allowClear, needAddress = props.needAddress, url = props.url;
    var level = 3;
    var defaultValue = {
        value: '',
        address: ''
    };
    var onChange = props.onChange;
    var _a = __read(React.useState([]), 2), options = _a[0], setOptions = _a[1];
    var _b = __read(React.useState([]), 2), innerValue = _b[0], setInnerValue = _b[1];
    var _c = __read(React.useState(defaultValue.address), 2), innerAddress = _c[0], setInnerAddress = _c[1];
    React.useEffect(function () {
        var init = function () { return __awaiter(void 0, void 0, void 0, function () {
            var innerUrl, res, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        innerUrl = defaultValue.value ? "".concat(url, "?value=").concat(defaultValue.value, "&limit_level=").concat(level) : url;
                        return [4 /*yield*/, fetch(innerUrl)];
                    case 1:
                        res = _a.sent();
                        return [4 /*yield*/, res.json()];
                    case 2:
                        data = _a.sent();
                        setOptions(data.list);
                        setInnerValue(data.default_value || []);
                        return [2 /*return*/];
                }
            });
        }); };
        init();
    }, []);
    var loadData = function (selectedOptions) { return __awaiter(void 0, void 0, void 0, function () {
        var targetOption, res, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    targetOption = selectedOptions[selectedOptions.length - 1];
                    if (targetOption.level >= level || targetOption.children) {
                        return [2 /*return*/];
                    }
                    targetOption.loading = true;
                    return [4 /*yield*/, fetch("".concat(url, "?id=").concat(targetOption.value, "&limit_level=").concat(level))];
                case 1:
                    res = _a.sent();
                    return [4 /*yield*/, res.json()];
                case 2:
                    data = _a.sent();
                    targetOption.loading = false;
                    targetOption.children = data.list;
                    setOptions(__spreadArray([], __read(options), false));
                    return [2 /*return*/];
            }
        });
    }); };
    function getValue(value, address) {
        var lastVal;
        if (!Array.isArray(value)) {
            lastVal = '';
        }
        else {
            lastVal = value[value.length - 1];
        }
        return {
            value: lastVal,
            address: address,
            getCurrentContent: function () {
                return {
                    hasText: function () {
                        return needAddress ? !isEmpty(lastVal) && !isEmpty(address) : !isEmpty(lastVal);
                    }
                };
            }
        };
    }
    function handleCascaderChange(value) {
        setInnerValue(value);
        if (onChange) {
            onChange(getValue(value, innerAddress));
        }
    }
    function handleAddressChange(e) {
        setInnerAddress(e.target.value);
        if (onChange) {
            onChange(getValue(innerValue, e.target.value));
        }
    }
    return React.createElement(React.Fragment, null,
        React.createElement(Cascader, { allowClear: allowClear || false, value: innerValue, options: options, onChange: handleCascaderChange, loadData: loadData, changeOnSelect: true, placeholder: placeholder }),
        needAddress && React.createElement(TextArea, { className: 'customform-area-textarea', value: innerAddress, onChange: handleAddressChange, allowClear: allowClear }));
};
Area.defaultProps = {
    url: '/extends/area/getAreaById'
};

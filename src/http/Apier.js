const axios = require('axios');
const Objs = require('nightnya-common-utils/Objs');

const privateKey = Symbol();

/**
 *
 * @param {string} baseURL 基础url
 * @param {number} timeout 请求超时时间
 * @param {{}} headers 附加请求头
 * @param {function} headerFn 请求前处理请求头
 * @param {Function} dataFn 请求前处理参数
 * @param {{string:Array<{f:function,r:function}>}} interceptors 拦截器 reqBefore|reqAfter|resBefore|resAfter:[{f:onFulfilled,r:onRejected}]
 */
class Apier {
  static REQUEST_TYPE_CONFIG = {
    'delete': {post: false}, 'get': {post: false}, 'head': {post: false}, 'options': {post: false},
    'post': {post: true}, 'put': {post: true}, 'patch': {post: true}
  };

  static DEFAULT_CONFIG = JSON.stringify({
    headers: {
      'If-Modified-Since': 0,
      'Cache-Control': 'no-cache'
    }
  });

  constructor({
                baseURL = '/api',
                timeout = 30000,
                headers = {},
                headerFn,
                dataFn,
                interceptors = {},
              } = {}) {
    const config = Objs.merge(JSON.parse(Apier.DEFAULT_CONFIG), {
      baseURL, timeout, headers
    });
    const privates = this[privateKey];
    privates.instance = axios.create(config);
    if (typeof headerFn !== "function") headerFn = null;
    if (typeof dataFn !== "function") dataFn = null;
    privates.config = {
      headerFn,
      dataFn,
      interceptors,
    };
    privates.bindInterceptors();
  }


  send = (url, data, method = 'get') => this[privateKey].instance.request({
    url,
    method,
    [(Apier.REQUEST_TYPE_CONFIG[method.toString().toLowerCase()] || {post: false}).post ? 'data' : 'params']: data,
    responseType: 'json',
  });
  get = (url, data) => this.send(url, data);
  delete = (url, data) => this.send(url, data, 'delete');
  head = (url, data) => this.send(url, data, 'head');
  options = (url, data) => this.send(url, data, 'options');
  post = (url, data) => this.send(url, data, 'post');
  put = (url, data) => this.send(url, data, 'put');
  patch = (url, data) => this.send(url, data, 'patch');


  [privateKey] = {
    instance: null,
    config: null,
    reqHandleHeaderFn(req) {
      const config = this.config || {};
      if (!config.headerFn) return;
      config.headerFn(req.headers, req);
    },
    reqHandleDataFn(req) {
      const config = this.config || {};
      if (!config.dataFn) return;

      let data, dType, pType;
      if (req.params) {
        const paramsType = typeof req.params;
        if (paramsType === "string") {
          try {
            data = JSON.parse(req.params);
            pType = 'string';
          } catch (e) {
            console.error(e);
          }
        } else if (paramsType === "object" && req.params.constructor === Object) {
          data = req.params;
          pType = 'object';
        }
        if (data) {
          dType = 'params';
        }
      }
      if (!data && req.data) {
        const dataType = typeof req.data;
        if (dataType === "string") {
          try {
            data = JSON.parse(req.data);
            pType = 'string';
          } catch (e) {
            console.error(e);
          }
        } else if (dataType === "object" && req.data.constructor === Object) {
          pType = 'object';
          data = req.data;
        }
        if (data) {
          dType = 'data';
        }
      }
      if (data) {
        config.dataFn(data, req);
        if (pType === 'string') data = JSON.stringify(data);
        if (dType === 'params') req.params = data;
        else if (dType === 'data') req.data = data;
      }
    },
    bindInterceptors() {
      const config = this.config || {};
      const interceptors = config.interceptors || {};
      if (interceptors.reqAfter) interceptors.reqAfter.reverse().forEach(r => this.instance.interceptors.request.use(r.f, r.r));
      if (interceptors.resBefore) interceptors.resBefore.forEach(r => this.instance.interceptors.response.use(r.f, r.r));
      this.instance.interceptors.request.use((req) => {
        this.reqHandleHeaderFn(req);
        this.reqHandleDataFn(req);
        return req;
      }, (error) => Promise.reject(error));
      this.instance.interceptors.response.use(
        (res) => Objs.getPathVal(res, 'data'),
        (e) => Promise.reject({data: Objs.getPathVal(e, 'response?.data'), e}));
      if (interceptors.reqBefore) interceptors.reqBefore.reverse().forEach(r => this.instance.interceptors.request.use(r.f, r.r));
      if (interceptors.resAfter) interceptors.resAfter.forEach(r => this.instance.interceptors.response.use(r.f, r.r));
    }
  };
}

module.exports = Apier;
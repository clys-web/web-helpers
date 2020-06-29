export declare class Apier {
    /**
     * 基础url
     * @default '/api'
     * @type string
     */
    baseURL: string;

    /**
     * 请求超时时间
     * @default 30000
     * @type number
     */
    timeout: number;

    /**
     * 附加请求头
     * @type {}
     */
    headers: {};

    /**
     * 请求前处理请求头
     * @type Function
     */
    headerFn(Function): any;

    /**
     * 请求前处理参数
     * @type Function
     */
    dataFn(Function): any;

    /**
     * 拦截器 reqBefore|reqAfter|resBefore|resAfter:[{f:onFulfilled,r:onRejected}]
     */
    interceptors(onfulfilled?: (value: any) => any | Promise<any>, onrejected?: (error: any) => any): number;
}
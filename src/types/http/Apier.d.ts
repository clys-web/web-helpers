export declare class Apier {
    constructor(args: {
        /**
         * 基础url
         * @default '/api'
         * @type string
         */
        baseURL?: string,
        /**
         * 请求超时时间
         * @default 30000
         * @type number
         */
        timeout?: number,
        /**
         * 附加请求头
         * @type {}
         */
        headers?: {},
        /**
         * 请求前处理请求头
         * @type Function
         */
        headerFn?: Function,
        /**
         * 请求前处理参数
         * @type Function
         */
        dataFn?: Function,
        /**
         * 拦截器
         */
        interceptors?:
            {
                reqBefore?: Array<{ f: Function, r: Function }>,
                reqAfter?: Array<{ f: Function, r: Function }>,
                resBefore?: Array<{ f: Function, r: Function }>,
                resAfter?: Array<{ f: Function, r: Function }>,
            }
    })


    send<T = any>(url: string, data?: {},
                  method?: 'get' | 'delete' | 'head' | 'options' | 'post' | 'put' | 'patch'
    ): Promise<T>;

    get<T = any>(url: string, data?: {}): Promise<T>;

    delete<T = any>(url: string, data?: {}): Promise<T>;

    head<T = any>(url: string, data?: {}): Promise<T>;

    options<T = any>(url: string, data?: {}): Promise<T>;

    post<T = any>(url: string, data?: {}): Promise<T>;

    put<T = any>(url: string, data?: {}): Promise<T>;

    patch<T = any>(url: string, data?: {}): Promise<T>;
}
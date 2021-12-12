/**
 * @description The encapsulation for axios
 * @author Shihao Xiong
 */

const METHODS = ['get', 'post', 'put', 'delete'];

// Global config
const DEFAULT_CONFIG = {
	// timeout: 15 * 1000,
};

const instance = axios.create(DEFAULT_CONFIG);

/**
 * Response interecptors
 */
instance.interceptors.response.use(
	res => (res.status == 200 ? res.data : Promise.reject('Request error, please try again later!')),
	err => {
		const msg = err?.response?.data ?? err;
		console.log('error: ' + msg);
		ElementPlus.ElNotification({ type: 'error', message: msg, title: 'Error' });
		return Promise.reject(msg);
	}
);

const http = METHODS.reduce((pre, key) => {
	pre[key] = (url, data) => {
		const requestData = {
			method: key,
			url,
			[key === 'get' ? 'params' : 'data']: data
		};

		return instance
			.request(requestData)
			.then(res => Promise.resolve(res))
			.catch(err => Promise.reject(err));
	};

	return pre;
}, {});

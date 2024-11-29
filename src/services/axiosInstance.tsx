import axios from "axios";

const axiosInstance = axios.create({
    baseURL: 'http://http://142.93.248.91:3000/api',
    // timeout: 5000,
    headers: {
        'Accept': 'application/json, text/plain, */*',
        'X-Custom-Header': 'foobar'
    }
});

export default axiosInstance;
import axios from "axios";

const axiosInstance = axios.create({
    baseURL: 'https://selahvie.life/api',
    // timeout: 5000,
    headers: {
        'Accept': 'application/json, text/plain, */*',
        'X-Custom-Header': 'foobar'
    }
});

export default axiosInstance;
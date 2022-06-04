import axios from 'axios';

const api = axios.create({
    baseURL: 'https://aoliveira.page/',
});

export default api;
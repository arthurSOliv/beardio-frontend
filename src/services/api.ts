import axios from 'axios';

const api = axios.create({
    baseURL: 'http://159.223.97.92/sessions/',
});

export default api;
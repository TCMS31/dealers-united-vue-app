import axios from "axios";
import { API_BASE_URL } from "@/lib/env";
import session from "@/lib/session";
import { normaliseError } from "./ApiError";

/**
 * Build the axios instance backing the real transport.
 *
 * @param {object} [options]
 * @param {string} [options.baseURL]
 * @param {{ getToken: () => string|null }} [options.tokenProvider]
 * @param {Function} [options.adapter] custom axios adapter — the seam the unit
 *   tests use to exercise the interceptors without a network.
 * @returns {import('axios').AxiosInstance}
 */
export function createHttpClient({
  baseURL = API_BASE_URL,
  tokenProvider = session,
  adapter = undefined,
} = {}) {
  const client = axios.create({
    baseURL,
    headers: { Accept: "application/json" },
    timeout: 15000,
    ...(adapter ? { adapter } : {}),
  });

  client.interceptors.request.use((config) => {
    const token = tokenProvider.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(normaliseError(error))
  );

  return client;
}

/**
 * The production transport: HTTP against the Laravel API.
 *
 * @param {object} [options] see {@link createHttpClient}
 * @returns {{ get: Function, post: Function, put: Function }}
 */
export function createHttpTransport(options = {}) {
  const client = options.client ?? createHttpClient(options);

  return {
    async get(path, config) {
      return (await client.get(path, config)).data;
    },
    async post(path, body, config) {
      return (await client.post(path, body, config)).data;
    },
    async put(path, body, config) {
      return (await client.put(path, body, config)).data;
    },
  };
}

export default createHttpTransport;

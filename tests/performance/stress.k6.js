import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { BASE_URL } from './k6.config.js';

export const options = {
  stages: [
    { duration: '10s', target: 15 },
    { duration: '15s', target: 30 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'], // Em teste de estresse toleramos no máximo 5% de falha
    http_req_duration: ['p(95)<800'],
  },
};

export default function () {
  group('Stress Flow', () => {
    const resHome = http.get(`${BASE_URL}/`);
    check(resHome, { 'Home OK': (r) => r.status === 200 });

    const resAuth = http.get(`${BASE_URL}/api/auth/me`, {
      responseCallback: http.expectedStatuses(401),
    });
    check(resAuth, { 'Auth 401': (r) => r.status === 401 });
  });

  sleep(0.2);
}

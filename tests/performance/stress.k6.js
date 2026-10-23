import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { BASE_URL } from './k6.config.js';

export const options = {
  stages: [
    { duration: '10s', target: 20 }, // Rampa para 20 VUs
    { duration: '15s', target: 35 }, // Elevação para 35 VUs
    { duration: '15s', target: 50 }, // Estresse em 50 VUs
    { duration: '10s', target: 0 },  // Recuperação / Ramp-down
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'], // Em teste de estresse toleramos no máximo 5% de falha
    http_req_duration: ['p(95)<300'], // Latência controlada: 95% das requisições abaixo de 300ms
  },
};

export default function () {
  group('Stress Flow', () => {
    const resHome = http.get(`${BASE_URL}/`);
    check(resHome, { 'Home OK': (r) => r.status === 200 });

    const resCapitulos = http.get(`${BASE_URL}/capitulos`);
    check(resCapitulos, { 'Capítulos OK': (r) => r.status === 200 || r.status === 307 });

    const resExercicios = http.get(`${BASE_URL}/exercicios`);
    check(resExercicios, { 'Exercícios OK': (r) => r.status === 200 || r.status === 307 });

    const resAuth = http.get(`${BASE_URL}/api/auth/me`, {
      responseCallback: http.expectedStatuses(401),
    });
    check(resAuth, { 'Auth 401': (r) => r.status === 401 });
  });

  sleep(0.2);
}

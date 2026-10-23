import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { BASE_URL, standardThresholds } from './k6.config.js';

export const options = {
  stages: [
    { duration: '10s', target: 20 }, // 10s ramp-up para 20 VUs
    { duration: '20s', target: 30 }, // 20s sustentação em 30 VUs
    { duration: '10s', target: 50 }, // 10s pico em 50 VUs
    { duration: '5s', target: 0 },   // 5s ramp-down
  ],
  thresholds: standardThresholds,
};

export default function () {
  group('1. Navegação Pública & Landing', () => {
    const res = http.get(`${BASE_URL}/`);
    check(res, {
      'Home respondeu 200': (r) => r.status === 200,
    });
  });

  sleep(0.3);

  group('2. Catálogo de Capítulos', () => {
    const capitulosRes = http.get(`${BASE_URL}/capitulos`);
    check(capitulosRes, {
      'Catálogo de capítulos respondeu 200 ou 307': (r) => r.status === 200 || r.status === 307,
    });
  });

  sleep(0.3);

  group('3. Área de Exercícios', () => {
    const exerciciosRes = http.get(`${BASE_URL}/exercicios`);
    check(exerciciosRes, {
      'Exercícios respondeu 200 ou 307': (r) => r.status === 200 || r.status === 307,
    });
  });

  sleep(0.3);

  group('4. Verificação de Sessão da API', () => {
    const authRes = http.get(`${BASE_URL}/api/auth/me`, {
      responseCallback: http.expectedStatuses(401),
    });
    check(authRes, {
      'Auth API sem cookie retorna 401': (r) => r.status === 401,
    });
  });

  sleep(0.5);
}

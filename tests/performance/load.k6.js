import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { BASE_URL, standardThresholds } from './k6.config.js';

export const options = {
  stages: [
    { duration: '10s', target: 10 }, // Ramp-up para 10 VUs
    { duration: '20s', target: 10 }, // Sustentação a 10 VUs
    { duration: '5s', target: 0 },  // Ramp-down
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

  group('2. Acesso à Área de Autenticação', () => {
    const loginRes = http.get(`${BASE_URL}/login`);
    check(loginRes, {
      'Login respondeu 200': (r) => r.status === 200,
    });

    const cadastroRes = http.get(`${BASE_URL}/cadastro`);
    check(cadastroRes, {
      'Cadastro respondeu 200': (r) => r.status === 200,
    });
  });

  sleep(0.3);

  group('3. Verificação de Sessão da API', () => {
    const authRes = http.get(`${BASE_URL}/api/auth/me`, {
      responseCallback: http.expectedStatuses(401),
    });
    check(authRes, {
      'Auth API sem cookie retorna 401': (r) => r.status === 401,
    });
  });

  sleep(0.5);
}

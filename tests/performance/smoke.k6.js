import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL, smokeThresholds } from './k6.config.js';

export const options = {
  vus: 1,
  duration: '5s',
  thresholds: smokeThresholds,
};

export default function () {
  // 1. Landing Page
  const homeRes = http.get(`${BASE_URL}/`);
  check(homeRes, {
    'Home status 200': (r) => r.status === 200,
    'Home tem conteudo CTFL': (r) => r.body.includes('CTFL') || r.body.includes('ISTQB'),
  });

  // 2. Página de Login
  const loginRes = http.get(`${BASE_URL}/login`);
  check(loginRes, {
    'Login status 200': (r) => r.status === 200,
  });

  // 3. Página de Cadastro
  const cadastroRes = http.get(`${BASE_URL}/cadastro`);
  check(cadastroRes, {
    'Cadastro status 200': (r) => r.status === 200,
  });

  // 4. Endpoint de Sessão (indica se há sessão ativa; 401 esperado sem cookie)
  const authRes = http.get(`${BASE_URL}/api/auth/me`, {
    responseCallback: http.expectedStatuses(401),
  });
  check(authRes, {
    'Auth status 401 sem cookie': (r) => r.status === 401,
  });

  sleep(0.5);
}

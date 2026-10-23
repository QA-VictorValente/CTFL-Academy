export const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export const standardThresholds = {
  http_req_failed: ['rate<0.01'], // Erros devem ser menores que 1%
  http_req_duration: ['p(95)<200', 'p(99)<400'], // 95% das requisições abaixo de 200ms, 99% abaixo de 400ms
};

export const smokeThresholds = {
  http_req_failed: ['rate<0.01'],
  http_req_duration: ['p(95)<350'],
};

import http from 'k6/http';
import { check, sleep } from 'k6';

// ----------------------------------------------------
// Load Test Configuration
// ----------------------------------------------------
export const options = {
  stages: [
    { duration: '30s', target: 50 },  // Ramp-up to 50 users
    { duration: '1m', target: 50 },   // Stay at 50 users for 1 min
    { duration: '30s', target: 200 }, // Ramp-up to 200 users (Stress Test)
    { duration: '1m', target: 200 },  // Stay at 200 users
    { duration: '30s', target: 0 },   // Ramp-down to 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete within 500ms
    http_req_failed: ['rate<0.01'],   // Error rate must be less than 1%
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:3000/api/v1';

export default function () {
  // 1. Test Static Asset / Reader Loading (Mocking a page load)
  // Assuming a generic search term to test the Elasticsearch integration
  const searchQuery = 'test';
  
  const searchRes = http.get(`${BASE_URL}/search?q=${searchQuery}`);
  
  check(searchRes, {
    'Search API status is 200': (r) => r.status === 200,
    'Search returns in < 300ms': (r) => r.timings.duration < 300,
  });

  sleep(1); // Simulate user think time
}

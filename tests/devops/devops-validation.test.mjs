import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';

test('DevOps, Docker & Edge Configuration Validation', async (t) => {
  const ROOT_DIR = process.cwd();

  await t.test('docker-compose.prod.yml defines required microservices and volumes', async () => {
    const composePath = path.join(ROOT_DIR, 'docker-compose.prod.yml');
    assert.ok(fs.existsSync(composePath), 'docker-compose.prod.yml must exist');
    const content = fs.readFileSync(composePath, 'utf8');

    assert.ok(content.includes('backend:'), 'Backend service missing from prod compose');
    assert.ok(content.includes('frontend:'), 'Frontend service missing from prod compose');
    assert.ok(content.includes('mongo:'), 'Mongo service missing from prod compose');
    assert.ok(content.includes('redis:'), 'Redis service missing from prod compose');
    assert.ok(content.includes('elasticsearch:'), 'Elasticsearch service missing from prod compose');
    assert.ok(content.includes('prometheus:'), 'Prometheus service missing from prod compose');
  });

  await t.test('Nginx configuration files define proxy and cache headers', async () => {
    const nginxConf = path.join(ROOT_DIR, 'nginx', 'nginx.conf');
    const defaultConf = path.join(ROOT_DIR, 'nginx', 'conf.d', 'default.conf');

    assert.ok(fs.existsSync(nginxConf), 'nginx.conf must exist');
    assert.ok(fs.existsSync(defaultConf), 'default.conf must exist');

    const defaultContent = fs.readFileSync(defaultConf, 'utf8');
    assert.ok(defaultContent.includes('proxy_pass'), 'Proxy pass missing from default.conf');
    assert.ok(defaultContent.includes('Accept-Ranges bytes'), 'Byte range support missing from default.conf');
  });

  await t.test('Prometheus configuration targets active services', async () => {
    const promPath = path.join(ROOT_DIR, 'prometheus', 'prometheus.yml');
    assert.ok(fs.existsSync(promPath), 'prometheus.yml must exist');
    const content = fs.readFileSync(promPath, 'utf8');
    assert.ok(content.includes('backend:3000'), 'Backend scrape target missing');
  });
});

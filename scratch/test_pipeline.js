const fs = require('fs');

// Mock browser environment
global.window = global;
global.document = {
  addEventListener: () => {},
  querySelectorAll: () => [],
  createElement: () => ({ classList: { add: () => {}, remove: () => {} }, appendChild: () => {}, style: {} }),
  body: { appendChild: () => {} },
  getElementById: (id) => ({
    addEventListener: () => {},
    style: {},
    classList: { add: () => {}, remove: () => {}, contains: () => false },
    innerHTML: '',
    appendChild: () => {}
  })
};
global.location = { origin: 'http://127.0.0.1:8000', pathname: '/recommendations.html', search: '' };
global.URL = require('url').URL;
global.URLSearchParams = require('url').URLSearchParams;
global.fetch = async (url) => {
  const http = require('http');
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          ok: res.statusCode === 200,
          status: res.statusCode,
          statusText: res.statusMessage,
          json: async () => JSON.parse(data)
        });
      });
    }).on('error', reject);
  });
};
let storage = {};
global.localStorage = {
  getItem: (k) => storage[k] || null,
  setItem: (k, v) => storage[k] = v,
  removeItem: (k) => delete storage[k]
};
global.Event = class {};
global.dispatchEvent = () => {};

try {
  eval(fs.readFileSync('js/config.js', 'utf8'));
  eval(fs.readFileSync('js/api-service.js', 'utf8'));
  eval(fs.readFileSync('js/firestore-service.js', 'utf8'));
  eval(fs.readFileSync('js/cineplay-data-manager.js', 'utf8'));
  eval(fs.readFileSync('js/data.js', 'utf8'));
  eval(fs.readFileSync('js/app.js', 'utf8'));
  eval(fs.readFileSync('js/recommendation.js', 'utf8'));
  
  async function test() {
    console.log('Testing recommendation matches...');
    const matches = await CinePlayAPI.fetchRecommendations({
      contentType: 'movie',
      mood: 'Action-packed',
      runtimeMax: 130
    });
    console.log('Got matches:', matches.length);
    if (matches.length > 0) {
      const container = { innerHTML: '' };
      renderMatchResults(matches.slice(0, 2), container);
      console.log('Rendered HTML length:', container.innerHTML.length);
      console.log('Contains Learn More button with openDetailsModal:', container.innerHTML.includes('Learn More') && container.innerHTML.includes('openDetailsModal'));
      console.log('Contains Watch Trailer button:', container.innerHTML.includes('Watch Trailer'));
    }
  }
  test();
} catch (e) {
  console.error('Eval error:', e);
}

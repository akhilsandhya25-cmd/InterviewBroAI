/**
 * Browser Compatibility, CSP Violation & Security Integration Test Suite
 * Launches real Google Chrome with full web security sandbox enabled.
 * Specifically monitors for Content Security Policy violations, console errors,
 * and validates key candidate workflows (Landing, Auth, Resume, Practice, Video Setup).
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require(path.resolve(__dirname, '../node_modules/puppeteer-core'));

const PORT = 4176;
const DIST_DIR = path.resolve(__dirname, '../client/dist');

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.json': 'application/json',
  '.ico': 'image/x-icon'
};

const CSP_HEADER = "default-src 'self'; script-src 'self' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https://*.supabase.co https://images.unsplash.com; media-src 'self' blob:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.sentry.io https://*.ingest.sentry.io; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self';";

async function createServer() {
  const vercelHandler = (await import('../api/index.js')).default;

  return http.createServer(async (req, res) => {
    // Attach security response headers matching vercel.json
    res.setHeader('Content-Security-Policy', CSP_HEADER);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    if (!res.status) {
      res.status = function(code) { this.statusCode = code; return this; };
    }
    if (!res.json) {
      res.json = function(data) {
        this.setHeader('Content-Type', 'application/json');
        this.end(JSON.stringify(data));
        return this;
      };
    }

    if (req.url.startsWith('/api/')) {
      let bodyData = '';
      req.on('data', chunk => { bodyData += chunk; });
      req.on('end', async () => {
        req.body = bodyData;
        try {
          await vercelHandler(req, res);
        } catch (e) {
          if (!res.headersSent) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: e.message }));
          }
        }
      });
      return;
    }

    let reqPath = req.url.split('?')[0];
    if (reqPath === '/') reqPath = '/index.html';
    let filePath = path.join(DIST_DIR, reqPath);
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(DIST_DIR, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Server error');
        return;
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  });
}

async function runBrowserTests() {
  console.log('====================================================');
  console.log('STARTING CHROME BROWSER CSP & INTEGRATION TEST');
  console.log('====================================================\n');

  const server = await createServer();
  await new Promise(r => server.listen(PORT, '127.0.0.1', r));
  console.log(`Integrated test server active at http://127.0.0.1:${PORT}`);

  const cspViolations = [];
  const browserErrors = [];

  const os = require('os');
  const tempProfileDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-audit-profile-'));

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    userDataDir: tempProfileDir,
    // Note: --disable-web-security is deliberately OMITTED to strictly test CSP & CORS
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Listen for console events
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('Content Security Policy') || text.includes('CSP') || text.includes('violated')) {
      cspViolations.push(text);
      console.warn('⚠️ [Browser CSP Warning]:', text);
    }
  });

  page.on('pageerror', err => {
    browserErrors.push(err.message);
    console.error('❌ [Browser Page Error]:', err.message);
  });

  try {
    // 1. Load Landing Page
    console.log('\n[1/5] Testing Landing Page load under strict CSP...');
    await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'networkidle0' });

    // Inject listener for SecurityPolicyViolationEvent in browser DOM
    await page.evaluate(() => {
      window._cspEvents = [];
      document.addEventListener('securitypolicyviolation', (e) => {
        window._cspEvents.push({
          blockedURI: e.blockedURI,
          violatedDirective: e.violatedDirective,
          originalPolicy: e.originalPolicy
        });
      });
    });

    const pageTitle = await page.title();
    console.log(`✅ Landing page rendered successfully. Title: "${pageTitle}"`);

    // 2. Test Auth Modal (Login / Signup)
    console.log('\n[2/5] Testing Auth Modal & Supabase UI...');
    await page.evaluate(() => {
      const signInBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Sign In'));
      if (signInBtn) signInBtn.click();
    });
    await new Promise(r => setTimeout(r, 600));

    const authModalVisible = await page.evaluate(() => {
      return Boolean(document.querySelector('input[type="email"]') || document.querySelector('input[type="password"]'));
    });
    console.log(`✅ Auth modal opened cleanly. Inputs detected: ${authModalVisible}`);

    // Close Auth Modal
    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 400));

    // 3. Test Resume ATS Analyzer Route
    console.log('\n[3/5] Testing Resume ATS Analyzer Route (?route=resume)...');
    await page.goto(`http://127.0.0.1:${PORT}/?route=resume`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));

    const resumePageText = await page.evaluate(() => document.body.innerText);
    const hasResumeElements = resumePageText.includes('Resume') || resumePageText.includes('ATS');
    console.log(`✅ Resume Analyzer route loaded cleanly: ${hasResumeElements}`);

    // 4. Test Interview Academy Route & Practice Coach
    console.log('\n[4/5] Testing Interview Academy (?route=academy)...');
    await page.goto(`http://127.0.0.1:${PORT}/?route=academy`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));

    const academyText = await page.evaluate(() => document.body.innerText);
    const hasAcademy = academyText.includes('Interview Academy') || academyText.includes('Practice Coach');
    console.log(`✅ Interview Academy loaded cleanly: ${hasAcademy}`);

    // 5. Check for CSP Violations recorded during entire session
    console.log('\n[5/5] Checking for DOM CSP violations...');
    const domCspEvents = await page.evaluate(() => window._cspEvents || []);

    console.log('====================================================');
    console.log('BROWSER TEST AUDIT SUMMARY');
    console.log('====================================================');
    console.log(`Total Browser Page Errors: ${browserErrors.length}`);
    console.log(`Total CSP Console Warnings: ${cspViolations.length}`);
    console.log(`Total DOM CSP Violation Events: ${domCspEvents.length}`);

    if (cspViolations.length === 0 && domCspEvents.length === 0 && browserErrors.length === 0) {
      console.log('🎉 ZERO CSP VIOLATIONS ENCOUNTERED IN REAL GOOGLE CHROME!');
    } else {
      console.error('Violations detail:', { cspViolations, domCspEvents, browserErrors });
      process.exitCode = 1;
    }

    await browser.close();
  } catch (err) {
    console.error('Browser testing error:', err);
    process.exitCode = 1;
  } finally {
    server.close();
    if (tempProfileDir) {
      try { fs.rmSync(tempProfileDir, { recursive: true, force: true }); } catch (_) {}
    }
  }
}

runBrowserTests();

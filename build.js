#!/usr/bin/env node

/**
 * Build script for Netlify deployment
 * Replaces environment variable placeholders in index.template.html and outputs to index.html
 */

const fs = require('fs');
const path = require('path');

const templatePath = path.join(__dirname, 'index.template.html');
const outputPath = path.join(__dirname, 'index.html');

// Read template
let html = fs.readFileSync(templatePath, 'utf8');

// Replace environment variable placeholders
const PROXY_URL = process.env.PROXY_URL || 'https://cors-proxy-six-flame.vercel.app/proxy?url=';
let HOME_URL = process.env.HOME_URL || '#';

// Ensure absolute URL if it looks like a domain but lacks protocol
if (HOME_URL && !HOME_URL.startsWith('http') && !HOME_URL.startsWith('/') && !HOME_URL.startsWith('.') && HOME_URL !== '#') {
    HOME_URL = 'https://' + HOME_URL;
}

html = html.replace(/%%PROXY_URL%%/g, PROXY_URL);
html = html.replace(/%%HOME_URL%%/g, HOME_URL);

// Write output
fs.writeFileSync(outputPath, html);

console.log('✅ Environment variables injected successfully');
console.log(`   PROXY_URL: ${PROXY_URL}`);
console.log(`   HOME_URL: ${HOME_URL}`);

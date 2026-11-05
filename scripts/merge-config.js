#!/usr/bin/env node
/**
 * Merges default configs with album-specific overrides.
 * 
 * Usage: node merge-config.js <defaults-dir> <album-json> <output-dir>
 * 
 * Produces:
 *   <output-dir>/config.json   (merged thumbsup config)
 *   <output-dir>/settings.json (merged theme settings)
 */
const fs = require('fs');
const path = require('path');

const defaultsDir = process.argv[2] || '/defaults';
const albumJson = process.argv[3] || '/album/album.json';
const outputDir = process.argv[4] || '/config';

// Read defaults
const defaultConfig = JSON.parse(fs.readFileSync(path.join(defaultsDir, 'config.json'), 'utf8'));
const defaultSettings = JSON.parse(fs.readFileSync(path.join(defaultsDir, 'settings.json'), 'utf8'));

// Read album overrides (if exists)
let overrides = {};
if (fs.existsSync(albumJson)) {
    overrides = JSON.parse(fs.readFileSync(albumJson, 'utf8'));
}

// Split overrides: config keys go to config, settings keys go to settings
const configKeys = Object.keys(defaultConfig);
const configOverrides = {};
const settingsOverrides = {};

for (const [key, value] of Object.entries(overrides)) {
    if (configKeys.includes(key)) {
        configOverrides[key] = value;
    } else {
        settingsOverrides[key] = value;
    }
}

// Merge
const mergedConfig = Object.assign({}, defaultConfig, configOverrides);
const mergedSettings = Object.assign({}, defaultSettings, settingsOverrides);

// Write
fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(path.join(outputDir, 'config.json'), JSON.stringify(mergedConfig, null, 4));
fs.writeFileSync(path.join(outputDir, 'settings.json'), JSON.stringify(mergedSettings, null, 4));

console.log('✔ Configs gemerged:', path.join(outputDir, 'config.json'));

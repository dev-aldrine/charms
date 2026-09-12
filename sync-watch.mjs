import chokidar from 'chokidar';
import { spawn } from 'child_process';
import path from 'path';

const REMOTE_HOST = 'john@192.168.1.217';
const REMOTE_PATH = '/srv/projects/joysfairycharms';

console.log(`\x1b[36m[Sync Watcher]\x1b[0m Monitoring project files for changes...`);
console.log(`\x1b[36m[Sync Target]\x1b[0m ${REMOTE_HOST}:${REMOTE_PATH}`);

// Excluded directories and file patterns
const IGNORED = [
  '**/node_modules/**',
  '**/.git/**',
  '**/dist/**',
  '**/build/**',
  '**/.next/**',
  '**/.gemini/**',
  '**/*.log',
  '**/scratch/**',
  '**/.package-lock.json'
];

let syncTimeout = null;
const pendingFiles = new Set();
let isSyncing = false;

function doSync() {
  if (pendingFiles.size === 0 || isSyncing) return;

  isSyncing = true;
  const fileCount = pendingFiles.size;
  const sample = Array.from(pendingFiles).slice(0, 3).join(', ');
  const displaySample = fileCount > 3 ? `${sample} (+${fileCount - 3} more)` : sample;

  console.log(`\x1b[33m[Syncing]\x1b[0m ${fileCount} file(s) changed: ${displaySample}`);
  pendingFiles.clear();

  // 1. Create binary tar stream from local directory
  const tarCreate = spawn('tar', [
    '--exclude=node_modules',
    '--exclude=.git',
    '--exclude=dist',
    '--exclude=.gemini',
    '-czf',
    '-',
    '.'
  ]);

  // 2. Stream directly into SSH remote extraction
  const sshExtract = spawn('ssh', [
    REMOTE_HOST,
    `mkdir -p ${REMOTE_PATH} && tar -xzf - -C ${REMOTE_PATH}`
  ]);

  tarCreate.stdout.on('error', () => {});
  sshExtract.stdin.on('error', () => {});
  tarCreate.on('error', (err) => console.error(`[Tar Error] ${err.message}`));
  sshExtract.on('error', (err) => console.error(`[SSH Error] ${err.message}`));

  tarCreate.stdout.pipe(sshExtract.stdin);

  let errorMsg = '';
  sshExtract.stderr.on('data', (data) => {
    errorMsg += data.toString();
  });
  tarCreate.stderr.on('data', (data) => {
    errorMsg += data.toString();
  });

  sshExtract.on('close', (code) => {
    isSyncing = false;
    if (code === 0) {
      console.log(`\x1b[32m[Synced ✓]\x1b[0m All updates successfully transferred to server!`);
    } else {
      console.error(`\x1b[31m[Sync Error (Code ${code})]\x1b[0m ${errorMsg.trim()}`);
    }

    // Process any files that were queued while syncing
    if (pendingFiles.size > 0) {
      setTimeout(doSync, 200);
    }
  });
}

// Trigger initial sync on startup so everything is up to date immediately
console.log(`\x1b[35m[Initial Sync]\x1b[0m Synchronizing all recent files to server...`);
pendingFiles.add('startup-sync');
doSync();

// Initialize file watcher
const watcher = chokidar.watch('.', {
  ignored: IGNORED,
  persistent: true,
  ignoreInitial: true,
  awaitWriteFinish: {
    stabilityThreshold: 300,
    pollInterval: 100
  }
});

watcher.on('all', (event, filePath) => {
  const normalized = filePath.replace(/\\/g, '/');
  // Skip package-lock inside node_modules
  if (normalized.includes('node_modules')) return;

  pendingFiles.add(normalized);

  if (syncTimeout) clearTimeout(syncTimeout);
  syncTimeout = setTimeout(doSync, 400);
});

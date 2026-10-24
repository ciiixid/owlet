#!/usr/bin/env node

import { spawn } from 'child_process';
import minimist from 'minimist';

const argv = minimist(process.argv.slice(2));
const userCommand = argv.command || argv.c;

if (!userCommand) {
  console.error('❌ Error: Harap sertakan perintah yang ingin dijalankan.');
  console.error('💡 Contoh: owlet --command "npm run build"');
  process.exit(1);
}

const platform = process.platform;
let fullCommand = '';

if (platform === 'darwin') {
  fullCommand = `caffeinate -i -s ${userCommand}`;
} else if (platform === 'linux') {
  fullCommand = `systemd-inhibit --what=sleep:idle --who=Owlet --why="Running heavy development task" --mode=block ${userCommand}`;
} else if (platform === 'win32') {
  const escapedUserCommand = userCommand.replace(/"/g, '`"');
  fullCommand = `powershell -NoProfile -Command "
    Add-Type -TypeDefinition '
    using System;
    using System.Runtime.InteropServices;
    public class PowerState {
        [DllImport(\"kernel32.dll\", CharSet = CharSet.Auto, SetLastError = true)]
        public static extern EXECUTION_STATE SetThreadExecutionState(EXECUTION_STATE esFlags);
        [Flags]
        public enum EXECUTION_STATE : uint {
            ES_AWAYMODE_REQUIRED = 0x00000040,
            ES_CONTINUOUS = 0x80000000,
            ES_DISPLAY_REQUIRED = 0x00000002,
            ES_SYSTEM_REQUIRED = 0x00000001
        }
    }';
    [PowerState]::SetThreadExecutionState([PowerState+EXECUTION_STATE]::ES_SYSTEM_REQUIRED -bor [PowerState+EXECUTION_STATE]::ES_CONTINUOUS | Out-Null);
    Write-Host '☕ [owlet] Sistem dijaga agar tidak sleep...';
    try {
        & ${escapedUserCommand};
        $exitCode = $LASTEXITCODE;
        if (\$null -eq \$exitCode) { \$exitCode = 0; }
    } finally {
        [PowerState]::SetThreadExecutionState([PowerState+EXECUTION_STATE]::ES_CONTINUOUS | Out-Null);
        Write-Host '☕ [owlet] Sistem kembali normal.';
    }
    exit \$exitCode;
  "`;
} else {
  console.error(`❌ Platform tidak didukung: ${platform}`);
  process.exit(1);
}

console.log(`🚀 Menjalankan proteksi sleep untuk: "${userCommand}" (${platform})\n`);

const child = spawn(fullCommand, {
  shell: true,
  stdio: 'inherit'
});

child.on('close', (code) => {
  process.exit(code ?? 0);
});

child.on('error', (err) => {
  console.error('❌ Gagal menjalankan proses:', err);
  process.exit(1);
});
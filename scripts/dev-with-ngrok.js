const ngrok = require('ngrok');
const { spawn } = require('child_process');
const path = require('path');

async function start() {
  console.log('🚀 Iniciando SPH Timer com túnel automático...');

  try {
    // 1. Iniciar o ngrok
    // Nota: Certifique-se de ter o NGROK_AUTHTOKEN no seu .env ou configurado no sistema
    const url = await ngrok.connect({
      proto: 'http',
      addr: 3000,
    });

    console.log('\n=================================================');
    console.log('✅ NGROK ONLINE!');
    console.log(`🔗 URL Pública: ${url}`);
    console.log('👉 Use esta URL no Portal Zoom (Home, Redirect, etc.)');
    console.log('=================================================\n');

    // 2. Iniciar o processo do Next.js (dev)
    const nextDev = spawn('bun', ['run', 'dev'], {
      stdio: 'inherit',
      shell: true,
      env: {
        ...process.env,
        NEXT_PUBLIC_BASE_URL: url,
        ZOOM_APP_REDIRECT_URI: `${url}/api/auth/callback/zoom`
      }
    });

    nextDev.on('close', async (code) => {
      await ngrok.kill();
      process.exit(code);
    });

  } catch (err) {
    console.error('❌ Erro ao iniciar o túnel:', err);
    process.exit(1);
  }
}

start();

const fs = require('fs');
const path = require('path');
const { minify } = require('terser');

// Configuração para a minificação
const terserOptions = {
  compress: {
    dead_code: true,
    drop_console: process.env.NODE_ENV === 'production', // Remove console.log em produção
    drop_debugger: true,
    unused: true,
    ecma: 2020
  },
  mangle: true,
  output: {
    comments: false // Remove comentários do código
  }
};

// Estatísticas de minificação
let stats = {
  totalFiles: 0,
  minifiedFiles: 0,
  totalSizeBefore: 0,
  totalSizeAfter: 0,
};

// Função para exibir o tamanho do arquivo em formato legível
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Função para percorrer diretórios recursivamente
async function processDirectory(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    
    if (entry.isDirectory()) {
      await processDirectory(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      try {
        stats.totalFiles++;
        const content = fs.readFileSync(fullPath, 'utf8');
        const sizeBefore = Buffer.byteLength(content, 'utf8');
        stats.totalSizeBefore += sizeBefore;
        
        // Minifica o código
        const result = await minify(content, terserOptions);
        
        if (result.code) {
          stats.minifiedFiles++;
          const sizeAfter = Buffer.byteLength(result.code, 'utf8');
          stats.totalSizeAfter += sizeAfter;
          
          // Calcula a redução de tamanho
          const reduction = ((1 - sizeAfter / sizeBefore) * 100).toFixed(2);
          
          // Sobrescreve o arquivo com a versão minificada
          fs.writeFileSync(fullPath, result.code, 'utf8');
          
          console.log(`✅ Minificado: ${fullPath}`);
          console.log(`   ${formatBytes(sizeBefore)} → ${formatBytes(sizeAfter)} (${reduction}% redução)`);
        }
      } catch (error) {
        console.error(`❌ Erro ao minificar ${fullPath}:`, error);
      }
    }
  }
}

// Diretório principal com os arquivos JS compilados
const distDir = path.join(__dirname, '..', 'dist');

console.log('🔍 Iniciando processo de minificação...');
console.log(`📁 Diretório alvo: ${distDir}`);

// Verifica se o diretório dist existe
if (!fs.existsSync(distDir)) {
  console.error('❌ Diretório dist não encontrado. Execute tsc primeiro.');
  process.exit(1);
}

// Inicia o processamento
processDirectory(distDir)
  .then(() => {
    const reductionPercent = ((1 - stats.totalSizeAfter / stats.totalSizeBefore) * 100).toFixed(2);
    
    console.log('\n📊 Estatísticas de minificação:');
    console.log(`   Arquivos processados: ${stats.totalFiles}`);
    console.log(`   Arquivos minificados: ${stats.minifiedFiles}`);
    console.log(`   Tamanho antes: ${formatBytes(stats.totalSizeBefore)}`);
    console.log(`   Tamanho depois: ${formatBytes(stats.totalSizeAfter)}`);
    console.log(`   Redução total: ${reductionPercent}%`);
    console.log('\n✨ Minificação concluída com sucesso!');
  })
  .catch(error => {
    console.error('❌ Erro durante a minificação:', error);
    process.exit(1);
  });
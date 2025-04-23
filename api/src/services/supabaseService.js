"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
// Verifica se as variáveis de ambiente do Supabase estão definidas
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabaseBucket = process.env.SUPABASE_BUCKET;
// Verifica se todas as credenciais do Supabase estão configuradas
const isSupabaseConfigured = supabaseUrl && supabaseKey && supabaseBucket;
// Cria um cliente mock ou real, dependendo da configuração
let supabaseClient = null;
if (isSupabaseConfigured) {
    try {
        supabaseClient = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
        console.log('✅ Cliente Supabase inicializado com sucesso');
    }
    catch (error) {
        console.error('❌ Erro ao inicializar cliente Supabase:', error);
        supabaseClient = null;
    }
}
else {
    console.log('ℹ️ Supabase não configurado - serviços de armazenamento usarão sistema de arquivos local ou estarão indisponíveis');
}
exports.supabase = supabaseClient;

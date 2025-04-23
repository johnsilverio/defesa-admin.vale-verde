'use client';

import React from 'react';
import ContentPageLayout from '@/components/ContentPageLayout';

export default function OcupacaoPage() {
  return (
    <ContentPageLayout
      title="Ocupação Histórica"
      subtitle="Documentação da história da ocupação da Fazenda Brilhante"
    >
      <div className="content-container mb-8">
        <h2 className="text-2xl font-semibold text-[var(--dark-green)] mb-4 text-center">
          Cronologia da Ocupação
        </h2>
        
        <p className="mb-6">
          A Fazenda Brilhante possui uma rica história de ocupação documentada, com registros oficiais 
          que remontam ao início do século XX. Esta página apresenta evidências históricas e documentais 
          que demonstram a ocupação contínua e legítima da propriedade ao longo das décadas.
        </p>
        
        {/* Primeira fase da ocupação documentada */}
        <div className="mb-10">
          <h3 className="text-xl font-semibold text-[var(--dark-green)] mb-3 border-b pb-2">
            Período 1904-1940: Estabelecimento Inicial
          </h3>
          
          <div className="mb-4">
            <p className="mb-3">
              Os primeiros registros oficiais da propriedade datam de 1904, quando o título original 
              da terra foi concedido pelo Estado a colonos como parte do programa de desenvolvimento 
              agrícola da região. Os documentos mostram que a área foi legalmente demarcada, registrada 
              e passou a ser cultivada pelos primeiros proprietários.
            </p>
            
            <p className="mb-3">
              Durante as décadas de 1910 e 1920, a propriedade foi desenvolvida com a construção 
              das primeiras estruturas permanentes, incluindo a casa sede original, galpões e 
              áreas para cultivo de subsistência e criação de gado.
            </p>
            
            <p>
              Registros fiscais e cartorários da época confirmam a regularidade da posse e o 
              cumprimento das obrigações legais pelos proprietários, incluindo o pagamento de 
              impostos territoriais e a manutenção dos limites da propriedade.
            </p>
          </div>
        </div>
        
        {/* Segunda fase da ocupação: consolidação e desenvolvimento */}
        <div className="mb-10">
          <h3 className="text-xl font-semibold text-[var(--dark-green)] mb-3 border-b pb-2">
            Período 1940-1980: Consolidação e Desenvolvimento
          </h3>
          
          <div className="mb-4">
            <p className="mb-3">
              A partir da década de 1940, a Fazenda Brilhante passou por um período de 
              modernização, com investimentos em mecanização agrícola e ampliação das áreas cultivadas. 
              Documentos da época mostram a aquisição de equipamentos e a expansão das atividades 
              produtivas.
            </p>
            
            <p className="mb-3">
              Durante a década de 1950, foram realizadas melhorias significativas na infraestrutura 
              da propriedade, incluindo a construção de estradas internas, sistemas de irrigação e 
              novas edificações para armazenamento da produção agrícola.
            </p>
            
            <p>
              Registros fotográficos e depoimentos de trabalhadores e vizinhos da época atestam a 
              continuidade da ocupação e o desenvolvimento progressivo das atividades agropecuárias 
              na fazenda durante todo este período.
            </p>
          </div>
        </div>
        
        {/* Terceira Fase da Ocupação */}
        <div className="mb-10">
          <h3 className="text-xl font-semibold text-[var(--dark-green)] mb-3 border-b pb-2">
            Período 1980-Presente: Modernização e Sustentabilidade
          </h3>
          
          <div className="mb-4">
            <p className="mb-3">
              Nas últimas décadas, a Fazenda Brilhante passou por transformações alinhadas com 
              práticas agrícolas modernas e sustentáveis. Os atuais proprietários investiram na 
              preservação de áreas de reserva legal e na implementação de técnicas de produção 
              com menor impacto ambiental.
            </p>
            
            <p className="mb-3">
              Estudos ambientais e relatórios técnicos realizados na propriedade confirmam o 
              cumprimento da legislação ambiental vigente e a manutenção de áreas de preservação 
              permanente, contribuindo para a conservação da biodiversidade local.
            </p>
            
            <p>
              A fazenda mantém sua função produtiva e social, gerando empregos e contribuindo para 
              a economia regional, enquanto preserva documentação atualizada que comprova a regularidade 
              fundiária e o cumprimento de todas as exigências legais para sua operação.
            </p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="content-container">
          <h2 className="text-xl font-semibold text-[var(--dark-green)] mb-4">Documentação Comprobatória</h2>
          
          <ul className="list-disc pl-5 space-y-2">
            <li>Escrituras e registros de propriedade desde 1904</li>
            <li>Certidões de cadeia dominial completa e ininterrupta</li>
            <li>Registros fiscais e tributários históricos</li>
            <li>Inventários e partilhas sucessórias documentadas</li>
            <li>Mapas e plantas da propriedade em diferentes períodos</li>
            <li>Relatórios técnicos sobre o uso histórico da terra</li>
            <li>Certificados de cadastro rural (INCRA) atualizados</li>
            <li>Documentação ambiental e de áreas preservadas</li>
          </ul>
        </div>
        
        <div className="content-container">
          <h2 className="text-xl font-semibold text-[var(--dark-green)] mb-4">Evidências Históricas</h2>
          
          <ul className="list-disc pl-5 space-y-2">
            <li>Fotografias históricas da propriedade desde 1920</li>
            <li>Depoimentos registrados de moradores antigos da região</li>
            <li>Reportagens e publicações sobre a fazenda ao longo das décadas</li>
            <li>Correspondências e documentos pessoais dos proprietários</li>
            <li>Contratos de trabalho e livros de registro de funcionários</li>
            <li>Estudos acadêmicos sobre o desenvolvimento agrícola regional</li>
            <li>Registros de produção e comercialização de produtos</li>
            <li>Documentação técnica das benfeitorias realizadas ao longo do tempo</li>
          </ul>
        </div>
      </div>
    </ContentPageLayout>
  );
}
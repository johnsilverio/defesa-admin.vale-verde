'use client';

import ContentPageLayout from '@/components/ContentPageLayout';

export default function InconsistenciasPage() {
  return (
    <ContentPageLayout
      title="Inconsistências"
      subtitle="Análise das inconsistências do processo de reivindicação"
    >
      <div className="mb-12">
        <h2 className="text-center text-2xl font-bold text-[var(--dark-green)] mb-8">
          Inconsistências no Processo de Reivindicação
        </h2>
        
        <div className="grid gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-[var(--dark-green)] mb-3">
              Ausência de Ocupação Tradicional
            </h3>
            <p className="mb-4">
              A área da Fazenda Brilhante não apresenta histórico documentado de ocupação tradicional indígena. 
              Diversos estudos antropológicos realizados nas décadas de 1990 e 2000 não identificaram elementos 
              que sugerissem a presença de comunidades indígenas na região específica onde se localiza a propriedade.
            </p>
            <p>
              Os levantamentos históricos, incluindo mapas e registros do início do século XX, documentam a ocupação 
              da área por não-indígenas, com atividades produtivas estabelecidas e reconhecidas pelas autoridades da época.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-[var(--dark-green)] mb-3">
              Contradições em Estudos Recentes
            </h3>
            <p className="mb-4">
              Estudos antropológicos mais recentes apresentam contradições metodológicas significativas quando comparados 
              a levantamentos anteriores. Diversos especialistas independentes apontaram inconsistências na coleta de 
              dados e interpretação de evidências histórias.
            </p>
            <p>
              A metodologia utilizada em alguns relatórios recentes tem sido questionada pela comunidade científica por 
              não seguir padrões acadêmicos rigorosos e por apresentar conclusões que contrariam evidências documentais 
              estabelecidas.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-[var(--dark-green)] mb-3">
              Desrespeito ao Marco Temporal
            </h3>
            <p className="mb-4">
              O processo de reivindicação da área ignora o princípio do marco temporal estabelecido pela jurisprudência 
              do Supremo Tribunal Federal, que determina que as terras indígenas são aquelas ocupadas por comunidades 
              indígenas na data da promulgação da Constituição Federal de 1988.
            </p>
            <p>
              Documentações e registros oficiais comprovam que a área da Fazenda Brilhante não era ocupada por 
              comunidades indígenas em 5 de outubro de 1988, data da promulgação da Constituição Federal.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-[var(--dark-green)] mb-3">
              Falhas Procedimentais
            </h3>
            <p className="mb-4">
              O processo administrativo que incluiu a Fazenda Brilhante no perímetro reivindicado apresenta falhas 
              procedimentais significativas, incluindo a ausência de contraditório adequado e desrespeito a prazos 
              legais estabelecidos.
            </p>
            <p>
              A análise documental revela que importantes peças técnicas e jurídicas apresentadas pelos proprietários 
              não foram devidamente consideradas no processo decisório, comprometendo a imparcialidade e a tecnicidade 
              necessárias.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-[var(--dark-green)] mb-3">
              Evidências Documentais Contrárias
            </h3>
            <p className="mb-4">
              Registros cartorários, escrituras públicas, matrícula do imóvel e outros documentos oficiais demonstram 
              a cadeia dominial ininterrupta da propriedade, com transferências legítimas ao longo das décadas, sem 
              qualquer contestação quanto à sua validade jurídica.
            </p>
            <p>
              Estas evidências documentais, validadas por órgãos oficiais ao longo de décadas, contradizem frontalmente 
              as alegações de ocupação tradicional indígena na área.
            </p>
          </div>
        </div>
      </div>
      
      <div className="mb-12">
        <h2 className="text-center text-2xl font-bold text-[var(--dark-green)] mb-8">
          Impacto das Inconsistências no Processo
        </h2>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="mb-4">
            As inconsistências identificadas apontam para falhas significativas no processo que incluiu a Fazenda Brilhante 
            no perímetro reivindicado como terra indígena. Estas falhas não apenas comprometem a legitimidade técnica do 
            processo, mas também levantam questões importantes sobre a segurança jurídica e o respeito ao devido processo legal.
          </p>
          <p className="mb-4">
            A análise objetiva dos fatos e documentos evidencia a necessidade de uma revisão técnica aprofundada do processo, 
            garantindo que as decisões finais sejam baseadas em evidências concretas e metodologias científicas rigorosas, 
            respeitando tanto os direitos dos povos indígenas quanto os direitos de proprietários que adquiriram suas terras 
            de boa-fé e possuem documentação legítima.
          </p>
          <p>
            Este caso ilustra a complexidade das questões fundiárias no Brasil e a importância de processos administrativos 
            e judiciais tecnicamente rigorosos, imparciais e respeitosos dos direitos de todas as partes envolvidas.
          </p>
        </div>
      </div>
    </ContentPageLayout>
  );
} 
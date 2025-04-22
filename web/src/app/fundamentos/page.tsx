'use client';

import React from 'react';
import ContentPageLayout from '@/components/ContentPageLayout';

export default function FundamentosPage() {
  return (
    <ContentPageLayout
      title="Fundamentos Jurídicos"
      subtitle="Base legal da defesa administrativa"
    >
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-[var(--dark-green)] mb-4">Fundamentos Constitucionais</h2>
        
        <p className="mb-4">
          A Constituição Federal de 1988, em seu artigo 231, estabelece critérios específicos para a caracterização 
          de terras tradicionalmente ocupadas pelos índios. Conforme o texto constitucional, são terras tradicionalmente 
          ocupadas pelos índios: "as por eles habitadas em caráter permanente, as utilizadas para suas atividades 
          produtivas, as imprescindíveis à preservação dos recursos ambientais necessários a seu bem-estar e as 
          necessárias a sua reprodução física e cultural, segundo seus usos, costumes e tradições."
        </p>
        
        <p className="mb-4">
          A jurisprudência do Supremo Tribunal Federal (STF), especialmente no julgamento do caso Raposa Serra do Sol 
          (PET 3388), estabeleceu marcos temporais e diretrizes interpretativas importantes para a demarcação de terras 
          indígenas, incluindo a necessidade de ocupação tradicional na data da promulgação da Constituição (5 de outubro de 1988).
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-[var(--dark-green)] mb-4">Devido Processo Legal</h2>
          
          <p className="mb-4">
            O processo administrativo de demarcação de terras indígenas deve observar princípios 
            constitucionais e administrativos fundamentais, como o contraditório, a ampla defesa, a 
            imparcialidade e a motivação adequada dos atos administrativos.
          </p>
          
          <p>
            A Resolução CNJ 454/2022 estabelece diretrizes claras sobre a imparcialidade que deve nortear
            o trabalho de peritos e expertos em processos judiciais e administrativos. Quando o próprio
            antropólogo responsável pelo laudo admite conhecer previamente os indígenas a serem beneficiados
            pela demarcação, há uma clara violação deste princípio essencial.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-[var(--dark-green)] mb-4">Segurança Jurídica e Direito de Propriedade</h2>
          
          <p className="mb-4">
            A segurança jurídica e o direito de propriedade, como princípios constitucionais fundamentais, 
            devem ser considerados no processo de demarcação de terras indígenas. Propriedades com 
            regularidade dominial comprovada, exploração econômica contínua e que cumpram sua função 
            social merecem proteção jurídica adequada.
          </p>
          
          <p>
            A Fazenda Brilhante possui cadeia dominial completa e ininterrupta, registrada em cartório 
            competente, com recolhimento regular de impostos e taxas, e comprovação de exploração econômica 
            contínua há décadas, atendendo aos requisitos legais de proteção à propriedade rural produtiva.
          </p>
        </div>
      </div>
    </ContentPageLayout>
  );
} 
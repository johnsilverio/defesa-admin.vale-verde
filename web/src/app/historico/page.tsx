'use client';

import React from 'react';
import ContentPageLayout from '@/components/ContentPageLayout';

export default function HistoricoPage() {
  return (
    <ContentPageLayout 
      title="Histórico da Propriedade"
      subtitle="Fazenda Brilhante e o contexto regional da questão indígena"
    >
      <div className="content-container mb-8">
        <h2 className="text-xl font-semibold text-[var(--dark-green)] mb-4">Contexto Histórico</h2>
        
        <p className="mb-4">
          A Fazenda Brilhante está localizada nos municípios de Naviraí e Juti, Estado do Mato Grosso do Sul. 
          A propriedade foi adquirida pelos atuais proprietários, Srs. Edilberto Antonio Meneghetti e 
          José Wagner Meneghetti, em 2019, de proprietários anteriores que já ocupavam a área há mais 
          de 30 anos.
        </p>
        
        <p className="mb-4">
          A cadeia dominial da propriedade remonta ao início do século XX, quando as terras foram 
          incorporadas ao processo de ocupação e desenvolvimento econômico da região. A área tem sido 
          utilizada continuamente para atividades agropecuárias desde então, com registros documentados 
          e comprovados de sua exploração econômica regular.
        </p>
        
        <p className="mb-4">
          Em 2023, a Fazenda Brilhante foi notificada pela Fundação Nacional dos Povos Indígenas (FUNAI) 
          sobre a realização de estudos demarcatórios da Terra Indígena Dourados-Amambaipeguá II, que 
          potencialmente afetaria a propriedade.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="content-container">
          <h2 className="text-xl font-semibold text-[var(--dark-green)] mb-4">Ocupação Econômica</h2>
          
          <p className="mb-4">
            Desde o início do século XX, a região onde se situa a Fazenda Brilhante tem sido palco de 
            atividades econômicas relacionadas principalmente à pecuária e, posteriormente, à agricultura. 
            Com a expansão da fronteira agrícola no Centro-Oeste brasileiro, a área foi progressivamente 
            integrada ao sistema produtivo regional.
          </p>
          
          <p>
            Os registros históricos, documentos cartoriais e levantamentos agrários confirmam que a área 
            da Fazenda Brilhante tem estado continuamente sob exploração econômica por não-indígenas há 
            mais de um século, com a realização de atividades de pecuária extensiva inicialmente, e depois 
            com a introdução de culturas agrícolas.
          </p>
        </div>
        
        <div className="content-container">
          <h2 className="text-xl font-semibold text-[var(--dark-green)] mb-4">Regularidade Fundiária</h2>
          
          <p className="mb-4">
            A Fazenda Brilhante possui toda a documentação que comprova a regularidade de sua aquisição e 
            propriedade. A cadeia dominial é completa e ininterrupta, com todos os registros devidamente 
            lavrados nos cartórios competentes e com o recolhimento dos impostos e taxas pertinentes ao 
            longo de décadas.
          </p>
          
          <p>
            A propriedade atende a todos os requisitos legais estabelecidos na legislação brasileira, 
            incluindo o cumprimento da função social da propriedade rural, conforme estabelecido pela 
            Constituição Federal de 1988, com aproveitamento racional e adequado, utilização adequada dos 
            recursos naturais disponíveis e preservação do meio ambiente.
          </p>
        </div>
      </div>
    </ContentPageLayout>
  );
} 
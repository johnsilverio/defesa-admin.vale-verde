'use client';

import { useEffect, useRef } from 'react';
import ContentPageLayout from '@/components/ContentPageLayout';

interface TimelineItem {
  id: number;
  date: string;
  content: string;
  position: 'left' | 'right';
}

export default function LinhaDoTempoPage() {
  const timelineRef = useRef<HTMLDivElement>(null);

  const timelineData: TimelineItem[] = [
    {
      id: 1,
      date: "1904-1922",
      content: "Início da ocupação da região pelo Coronel Brilhante, que estabeleceu a Fazenda Brilhante como um importante centro de produção agrícola regional.",
      position: "left"
    },
    {
      id: 2,
      date: "1937",
      content: "Documentação oficial confirma o domínio da família Brilhante sobre a área, com reconhecimento legal e registros cartorários da época.",
      position: "right"
    },
    {
      id: 3,
      date: "1950-1960",
      content: "Desenvolvimento significativo da infraestrutura da fazenda, com construções históricas que permanecem preservadas até hoje.",
      position: "left"
    },
    {
      id: 4,
      date: "1988",
      content: "Promulgação da Constituição Federal, que estabelece novos parâmetros para o reconhecimento de terras indígenas em seu artigo 231.",
      position: "right"
    },
    {
      id: 5,
      date: "1996",
      content: "Primeira visita técnica da FUNAI à região, sem identificação de presença indígena na área da Fazenda Brilhante.",
      position: "left"
    },
    {
      id: 6,
      date: "2002",
      content: "Manifestação do Ministério Público Federal reconhecendo a legitimidade da propriedade e ausência de reivindicações indígenas na época.",
      position: "right"
    },
    {
      id: 7,
      date: "2008",
      content: "Laudo antropológico preliminar encomendado pelo governo federal que não identificou ocupação tradicional indígena na região da Fazenda Brilhante.",
      position: "left"
    },
    {
      id: 8,
      date: "2016",
      content: "Início das contestações sobre a área, surgimento dos primeiros questionamentos sobre possível ocupação indígena histórica.",
      position: "right"
    },
    {
      id: 9,
      date: "2018",
      content: "Publicação de estudo contrariando os laudos anteriores, questionado por especialistas devido a inconsistências metodológicas.",
      position: "left"
    },
    {
      id: 10,
      date: "2020",
      content: "Análise pericial independente confirma os documentos históricos de propriedade da Fazenda Brilhante e questiona as novas reivindicações.",
      position: "right"
    },
    {
      id: 11,
      date: "2022",
      content: "Desenvolvimento do processo administrativo e judicial, com apresentação de documentos probatórios pela família proprietária.",
      position: "left"
    },
    {
      id: 12,
      date: "2023",
      content: "Decisão judicial preliminar reconhecendo a complexidade do caso e determinando estudos complementares para análise definitiva.",
      position: "right"
    },
    {
      id: 13,
      date: "2024",
      content: "Apresentação de novos documentos históricos e cartográficos que comprovam a ocupação contínua pela família proprietária desde o início do século XX.",
      position: "left"
    },
    {
      id: 14,
      date: "2025",
      content: "Expectativa de resolução definitiva do caso, com base na análise técnica, jurídica e histórica completa.",
      position: "right"
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate');
          }
        });
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.1,
      }
    );

    const timelineItems = document.querySelectorAll('.timeline-container');
    timelineItems.forEach((item) => {
      observer.observe(item);
    });

    return () => {
      timelineItems.forEach((item) => {
        observer.unobserve(item);
      });
    };
  }, []);

  return (
    <ContentPageLayout
      title="Linha do Tempo"
      subtitle="Evolução histórica da questão indígena na região"
    >
      <section className="mb-16">
        <h2 className="text-center text-2xl font-bold text-[var(--dark-green)] mb-8">
          Evolução Histórica da Questão Indígena na Região
        </h2>
        
        <div className="timeline" ref={timelineRef}>
          {timelineData.map((item) => (
            <div 
              key={item.id} 
              className={`timeline-container ${item.position}`}
            >
              <div className="timeline-content">
                <div className="timeline-date">{item.date}</div>
                <p>{item.content}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-center text-2xl font-bold text-[var(--dark-green)] mb-6">
          Contexto Histórico Regional
        </h2>
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <p className="mb-4">
            A linha do tempo acima ilustra o contexto histórico da Fazenda Brilhante e sua relação com a questão indígena na região. 
            Os registros históricos documentam de forma clara a ocupação da área pela família proprietária ao longo de mais de um século, 
            com documentação oficial que comprova a legitimidade da posse e propriedade.
          </p>
          <p className="mb-4">
            As reivindicações recentes contrastam com diversos estudos e laudos técnicos realizados nas últimas décadas, que não 
            identificaram ocupação tradicional indígena na área específica da Fazenda Brilhante. A análise dos fatos em ordem 
            cronológica evidencia a consistência da documentação apresentada pelos proprietários e as contradições nas alegações 
            contrárias surgidas apenas recentemente.
          </p>
          <p>
            O processo continua em análise pelas autoridades competentes, com expectativa de resolução baseada no conjunto de 
            evidências históricas, antropológicas e jurídicas que demonstram a ocupação legítima e contínua da área.
          </p>
        </div>
      </section>
    </ContentPageLayout>
  );
} 
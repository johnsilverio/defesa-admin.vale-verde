'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Loading from '@/components/Loading';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProtectedRoute from '@/components/ProtectedRoute';
import ImportantDocumentsCarousel from '@/components/ImportantDocumentsCarousel';

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  
  // Definir o ID da propriedade padrão para a Fazenda Brilhante
  const propertyId = 'fazenda-brilhante';

  return (
    <ProtectedRoute propertyId={propertyId}>
      {/* O conteúdo só será renderizado se o usuário estiver autenticado e tiver acesso à propriedade */}

      <Header />
      <main>
        {/* Hero Section */}
        <section className="hero py-20 md:py-24 lg:py-28 relative">
          {/* Hero pattern background */}
          <div className="hero-pattern"></div>
          
          <div className="container relative z-10">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 animate-fadeIn text-balance">
              Fazenda Brilhante - Defesa Administrativa
            </h1>
            <p className="text-lg md:text-xl max-w-3xl mx-auto animate-slideUp text-white text-pretty">
              Contestação à notificação da FUNAI para estudos demarcatórios da Terra Indígena Dourados-Amambaipeguá II
            </p>
            <div className="mt-8">
              <a href="/documentos" className="btn btn-accent btn-lg mx-2 animate-fadeIn" style={{animationDelay: '0.3s'}}>
                Ver Documentos
              </a>
              <a href="/linha-do-tempo" className="btn btn-primary btn-lg mx-2 animate-fadeIn" style={{animationDelay: '0.5s'}}>
                Linha do Tempo
              </a>
            </div>
          </div>
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-black bg-opacity-40 z-[1]"></div>
          
          {/* Bottom gradient fade */}
          <div className="absolute bottom-0 w-full h-24 bg-gradient-to-t from-[var(--primary-dark)] to-transparent z-[2]"></div>
        </section>

        <section className="section py-16">
          <div className="container">
            <div className="section-title-container">
              <h2 className="section-title">Visão Geral do Caso</h2>
              <p className="section-subtitle">Contexto e fundamentos da defesa administrativa</p>
            </div>
            
            <div className="bg-[var(--card-bg)] rounded-lg shadow-[var(--shadow-md)] p-6 md:p-8 border border-[var(--border)] card-accent">
              <div className="prose">
                <p>
                  A Fazenda Brilhante, localizada nos municípios de Naviraí e Juti, Estado do Mato Grosso do Sul, foi notificada pela Fundação Nacional dos Povos Indígenas (FUNAI) sobre a realização de estudos demarcatórios da Terra Indígena Dourados-Amambaipeguá II.
                </p>
                <p>
                  Esta defesa administrativa apresenta argumentos técnicos, históricos e jurídicos que demonstram que a área da Fazenda Brilhante não atende aos requisitos constitucionais para ser caracterizada como terra tradicionalmente ocupada pelos índios.
                </p>
                <p>
                  A propriedade foi adquirida pelos atuais proprietários, Srs. Edilberto Antonio Meneghetti e José Wagner Meneghetti, em 2019, de proprietários anteriores que já ocupavam a área há mais de 30 anos, com exploração econômica datando do início do século XX.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="section section-alt py-16 md:py-20">
          <div className="container">
            <div className="section-title-container">
              <h2 className="section-title">Principais Argumentos da Defesa</h2>
              <p className="section-subtitle">Fundamentos técnicos, históricos e jurídicos</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="card card-hover">
                <span className="badge badge-primary inline-block mb-2">Análise Técnica</span>
                <h3 className="card-title">
                  Inconsistências Técnicas e Geográficas
                </h3>
                <p className="mb-6">
                  Os estudos antropológicos que fundamentam o processo demarcatório contêm inconsistências significativas, como a associação incorreta da Fazenda Brilhante com o Córrego Kurupi, que não existe nos limites da propriedade, e a caracterização incorreta das cabeceiras do Rio São Lucas.
                </p>
                <Link 
                  href="/inconsistencias" 
                  className="btn btn-primary w-full"
                >
                  Ver detalhes
                </Link>
              </div>

              <div className="card card-hover">
                <span className="badge badge-primary inline-block mb-2">Análise Antropológica</span>
                <h3 className="card-title">
                  Ausência de Tradicionalidade da Ocupação
                </h3>
                <p className="mb-6">
                  As características geográficas, ecológicas e pedológicas da Fazenda Brilhante são incompatíveis com os padrões tradicionais de ocupação indígena Guarani-Kaiowá. As áreas em questão apresentam solos de baixa fertilidade natural, impróprios para a agricultura tradicional indígena.
                </p>
                <Link 
                  href="/ocupacao" 
                  className="btn btn-primary w-full"
                >
                  Ver detalhes
                </Link>
              </div>

              <div className="card card-hover">
                <span className="badge badge-primary inline-block mb-2">Análise Jurídica</span>
                <h3 className="card-title">
                  Imparcialidade do Perito Antropólogo
                </h3>
                <p className="mb-6">
                  O próprio antropólogo responsável pelo laudo admite conhecer previamente os indígenas a serem beneficiados pela demarcação, o que configura uma grave violação do princípio da imparcialidade que deve nortear qualquer trabalho pericial, conforme estabelecido pela Resolução CNJ 454/2022.
                </p>
                <Link 
                  href="/fundamentos" 
                  className="btn btn-primary w-full"
                >
                  Ver detalhes
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="section py-16">
          <div className="container">
            <div className="section-title-container">
              <h2 className="section-title">Documentos Importantes</h2>
              <p className="section-subtitle">Acesse os principais documentos relacionados ao caso</p>
            </div>
            
            {/* Carrossel de documentos importantes */}
            <ImportantDocumentsCarousel />
            
            <div className="mt-8 text-center">
              <Link 
                href="/documentos" 
                className="btn btn-primary inline-flex items-center"
              >
                Ver todos os documentos
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        <section className="section py-16 bg-gradient-to-br from-[var(--primary-50)] to-[var(--neutral-50)] mb-0">
          <div className="container text-center">
            <div className="section-title-container">
              <h2 className="section-title">Linha do Tempo</h2>
              <p className="section-subtitle">Conheça a cronologia dos eventos relacionados à questão indígena na região e ao caso específico da Fazenda Brilhante</p>
            </div>
            
            <div className="mt-8 mb-4 flex justify-center">
              <div className="max-w-md bg-[var(--card-bg)] rounded-lg shadow-[var(--shadow-md)] p-6 md:p-8 border border-[var(--border)] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]"></div>
                <h3 className="text-xl font-semibold mb-4 text-[var(--primary-dark)]">Eventos Históricos Documentados</h3>
                <p className="mb-6">A linha do tempo apresenta uma visão cronológica de todos os eventos relevantes, desde a ocupação histórica da região até os procedimentos administrativos atuais.</p>
                <Link 
                  href="/linha-do-tempo" 
                  className="btn btn-primary btn-lg w-full"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Ver linha do tempo completa
                </Link>
              </div>
            </div>
          </div>
        </section>
        

      </main>
      <Footer />
    </ProtectedRoute>
  );
}

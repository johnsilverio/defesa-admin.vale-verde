'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Loading from '@/components/Loading';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // If not authenticated, redirect to login
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading while checking auth state
  if (isLoading || !isAuthenticated) {
    return <Loading />;
  }

  return (
    <>
      <Header />
      <main>
        {/* Hero Section */}
        <section className="hero">
          <div className="container">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 animate-fadeIn">
              Fazenda Brilhante - Defesa Administrativa
            </h1>
            <p className="text-lg md:text-xl max-w-3xl mx-auto animate-slideUp">
              Contestação à notificação da FUNAI para estudos demarcatórios da Terra Indígena Dourados-Amambaipeguá II
            </p>
          </div>
          <div className="absolute inset-0 bg-black bg-opacity-30 z-[-1]"></div>
          <div className="absolute bottom-0 w-full h-20 bg-gradient-to-t from-[var(--hero-bg)] to-transparent"></div>
        </section>

        <section className="section">
          <div className="container">
            <h2 className="section-title text-center">Visão Geral do Caso</h2>
            <div className="bg-white rounded-lg shadow-md p-6">
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
        </section>

        <section className="section bg-gray-50 py-16">
          <div className="container">
            <h2 className="section-title text-center">Principais Argumentos da Defesa</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="card hover:-translate-y-1 transition-transform duration-300">
                <h3 className="card-title">
                  Inconsistências Técnicas e Geográficas
                </h3>
                <p className="mb-6">
                  Os estudos antropológicos que fundamentam o processo demarcatório contêm inconsistências significativas, como a associação incorreta da Fazenda Brilhante com o Córrego Kurupi, que não existe nos limites da propriedade, e a caracterização incorreta das cabeceiras do Rio São Lucas.
                </p>
                <Link 
                  href="/inconsistencias" 
                  className="btn"
                >
                  Ver detalhes
                </Link>
              </div>

              <div className="card hover:-translate-y-1 transition-transform duration-300">
                <h3 className="card-title">
                  Ausência de Tradicionalidade da Ocupação
                </h3>
                <p className="mb-6">
                  As características geográficas, ecológicas e pedológicas da Fazenda Brilhante são incompatíveis com os padrões tradicionais de ocupação indígena Guarani-Kaiowá. As áreas em questão apresentam solos de baixa fertilidade natural, impróprios para a agricultura tradicional indígena.
                </p>
                <Link 
                  href="/ocupacao" 
                  className="btn"
                >
                  Ver detalhes
                </Link>
              </div>

              <div className="card hover:-translate-y-1 transition-transform duration-300">
                <h3 className="card-title">
                  Imparcialidade do Perito Antropólogo
                </h3>
                <p className="mb-6">
                  O próprio antropólogo responsável pelo laudo admite conhecer previamente os indígenas a serem beneficiados pela demarcação, o que configura uma grave violação do princípio da imparcialidade que deve nortear qualquer trabalho pericial, conforme estabelecido pela Resolução CNJ 454/2022.
                </p>
                <Link 
                  href="/fundamentos" 
                  className="btn"
                >
                  Ver detalhes
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <h2 className="section-title text-center">Documentos Importantes</h2>
            <div className="document-grid">
              <div className="document-card" data-category="defesa">
                <h3>Defesa Administrativa Completa</h3>
                <p>Documento completo da defesa administrativa apresentada à FUNAI.</p>
                <Link 
                  href="/documentos/defesa_administrativa_fazenda_brilhante.pdf" 
                  className="btn btn-secondary w-full"
                  download
                >
                  Download
                </Link>
              </div>

              <div className="document-card" data-category="matricula">
                <h3>Matrícula Originária</h3>
                <p>Matrícula originária da Fazenda Brilhante, comprovando a cadeia dominial.</p>
                <Link 
                  href="/documentos/matricula_originaria.pdf" 
                  className="btn btn-secondary w-full"
                  download
                >
                  Download
                </Link>
              </div>

              <div className="document-card" data-category="funai">
                <h3>Ofício FUNAI</h3>
                <p>Ofício da FUNAI notificando sobre os estudos demarcatórios.</p>
                <Link 
                  href="/documentos/oficio_funai.pdf" 
                  className="btn btn-secondary w-full"
                  download
                >
                  Download
                </Link>
              </div>

              <div className="document-card" data-category="processos">
                <h3>Processos Judiciais</h3>
                <p>Processos judiciais relacionados à questão indígena na região.</p>
                <Link 
                  href="/documentos" 
                  className="btn btn-secondary w-full"
                >
                  Ver todos
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="section bg-[var(--light-green)] py-12 mb-0">
          <div className="container text-center">
            <h2 className="section-title text-center">Linha do Tempo</h2>
            <p className="mb-8 max-w-2xl mx-auto">Conheça a cronologia dos eventos relacionados à questão indígena na região e ao caso específico da Fazenda Brilhante.</p>
            <Link 
              href="/linha-do-tempo" 
              className="btn text-lg px-8 py-3"
            >
              Ver linha do tempo completa
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

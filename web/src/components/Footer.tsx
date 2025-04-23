import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gradient-to-br from-[var(--primary-dark)] to-[var(--primary)] text-white py-12 md:py-16">
      <div className="container">
        <div className="footer-container grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          <div className="footer-section">
            <h3 className="text-xl font-semibold mb-4 relative inline-block">
              Vale Verde
              <span className="absolute bottom-0 left-0 w-1/2 h-0.5 bg-[var(--accent)] rounded"></span>
            </h3>
            <p className="text-sm md:text-base text-white leading-relaxed">
              Empresa especializada em regularização fundiária e ambiental de imóveis rurais, 
              regularização ambiental de empreendimentos industriais e comerciais, 
              e adequação à legislação hídrica brasileira.
            </p>
            <div className="mt-6 flex space-x-4">
              <a href="https://www.facebook.com/valeverdecpo/?locale=pt_BR" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[var(--accent)] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="white" viewBox="0 0 24 24">
                  <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/>
                </svg>
              </a>
              <a href="https://br.linkedin.com/company/vale-verde-agr%C3%ADcola-ambiental-georreferenciamento" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[var(--accent)] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="white" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>
          
          <div className="footer-section">
            <h3 className="text-xl font-semibold mb-4 relative inline-block">
              Navegação
              <span className="absolute bottom-0 left-0 w-1/2 h-0.5 bg-[var(--accent)] rounded"></span>
            </h3>
            <ul className="space-y-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-x-4 gap-y-2 text-white list-none p-0">
              <li>
                <Link 
                  href="/" 
                  className="text-white hover:text-[var(--accent)] transition-colors inline-flex items-center group footer-link"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-2 transform transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Início
                </Link>
              </li>
              <li>
                <Link 
                  href="/historico" 
                  className="text-white hover:text-[var(--accent)] transition-colors inline-flex items-center group footer-link"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-2 transform transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Histórico
                </Link>
              </li>
              <li>
                <Link 
                  href="/inconsistencias" 
                  className="text-white hover:text-[var(--accent)] transition-colors inline-flex items-center group footer-link"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-2 transform transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Inconsistências
                </Link>
              </li>
              <li>
                <Link 
                  href="/ocupacao" 
                  className="text-white hover:text-[var(--accent)] transition-colors inline-flex items-center group footer-link"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-2 transform transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Ocupação
                </Link>
              </li>
              <li>
                <Link 
                  href="/fundamentos" 
                  className="text-white hover:text-[var(--accent)] transition-colors inline-flex items-center group footer-link"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-2 transform transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Fundamentos Jurídicos
                </Link>
              </li>
              <li>
                <Link 
                  href="/documentos" 
                  className="text-white hover:text-[var(--accent)] transition-colors inline-flex items-center group footer-link"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-2 transform transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Documentos
                </Link>
              </li>
              <li>
                <Link 
                  href="/linha-do-tempo" 
                  className="text-white hover:text-[var(--accent)] transition-colors inline-flex items-center group footer-link"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-2 transform transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Linha do Tempo
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3 className="text-xl font-semibold mb-4 relative inline-block">
              Contato
              <span className="absolute bottom-0 left-0 w-1/2 h-0.5 bg-[var(--accent)] rounded"></span>
            </h3>
            <address className="not-italic text-sm md:text-base text-white">
              <p className="mb-4 flex items-start hover:text-[var(--accent)] transition-colors cursor-pointer footer-link">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                <span>Escritórios em Caarapó e Campo Grande, Mato Grosso do Sul, Brasil</span>
              </p>
              <p className="mb-4 flex items-start hover:text-[var(--accent)] transition-colors cursor-pointer footer-link">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>contato@valeverde.com.br</span>
              </p>
              <p className="flex items-start hover:text-[var(--accent)] transition-colors cursor-pointer footer-link">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>(67) 3456-7890</span>
              </p>
            </address>
          </div>
        </div>
        
        <div className="copyright mt-10 pt-6 border-t border-white border-opacity-20 text-center">
          <p className="text-sm text-white">&copy; {currentYear} Vale Verde. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
} 
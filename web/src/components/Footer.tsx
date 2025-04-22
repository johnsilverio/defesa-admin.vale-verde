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
              <a href="#" className="text-white hover:text-[var(--accent)] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/>
                </svg>
              </a>
              <a href="#" className="text-white hover:text-[var(--accent)] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm6.066 9.645c.183 4.04-2.83 8.544-8.164 8.544-1.622 0-3.131-.476-4.402-1.291 1.524.18 3.045-.244 4.252-1.189-1.256-.023-2.317-.854-2.684-1.995.451.086.895.061 1.298-.049-1.381-.278-2.335-1.522-2.304-2.853.388.215.83.344 1.301.359-1.279-.855-1.641-2.544-.889-3.835 1.416 1.738 3.533 2.881 5.92 3.001-.419-1.796.944-3.527 2.799-3.527.825 0 1.572.349 2.096.907.654-.128 1.27-.368 1.824-.697-.215.671-.67 1.233-1.263 1.589.581-.07 1.135-.224 1.649-.453-.384.578-.87 1.084-1.433 1.489z"/>
                </svg>
              </a>
              <a href="#" className="text-white hover:text-[var(--accent)] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
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
          <p className="text-xs text-white/80 mt-2">Defesa Administrativa - Sistema para Gestão de Defesas contra Notificações da FUNAI</p>
        </div>
      </div>
    </footer>
  );
} 
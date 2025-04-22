import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-[var(--footer-bg)] text-white py-10">
      <div className="container">
        <div className="footer-container grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="footer-section">
            <h3 className="text-xl font-semibold mb-4">Vale Verde</h3>
            <p className="text-sm md:text-base opacity-90">
              Empresa especializada em regularização fundiária e ambiental de imóveis rurais, 
              regularização ambiental de empreendimentos industriais e comerciais, 
              e adequação à legislação hídrica brasileira.
            </p>
          </div>
          
          <div className="footer-section">
            <h3 className="text-xl font-semibold mb-4">Navegação</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/" 
                  className="text-white opacity-90 hover:opacity-100 hover:text-[var(--primary-green)] transition-colors inline-flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Início
                </Link>
              </li>
              <li>
                <Link 
                  href="/historico" 
                  className="text-white opacity-90 hover:opacity-100 hover:text-[var(--primary-green)] transition-colors inline-flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Histórico
                </Link>
              </li>
              <li>
                <Link 
                  href="/inconsistencias" 
                  className="text-white opacity-90 hover:opacity-100 hover:text-[var(--primary-green)] transition-colors inline-flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Inconsistências
                </Link>
              </li>
              <li>
                <Link 
                  href="/ocupacao" 
                  className="text-white opacity-90 hover:opacity-100 hover:text-[var(--primary-green)] transition-colors inline-flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Ocupação
                </Link>
              </li>
              <li>
                <Link 
                  href="/fundamentos" 
                  className="text-white opacity-90 hover:opacity-100 hover:text-[var(--primary-green)] transition-colors inline-flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Fundamentos Jurídicos
                </Link>
              </li>
              <li>
                <Link 
                  href="/documentos" 
                  className="text-white opacity-90 hover:opacity-100 hover:text-[var(--primary-green)] transition-colors inline-flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Documentos
                </Link>
              </li>
              <li>
                <Link 
                  href="/linha-do-tempo" 
                  className="text-white opacity-90 hover:opacity-100 hover:text-[var(--primary-green)] transition-colors inline-flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Linha do Tempo
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3 className="text-xl font-semibold mb-4">Contato</h3>
            <address className="not-italic text-sm md:text-base opacity-90">
              <p className="mb-2 flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                Escritórios em Caarapó e Campo Grande, Mato Grosso do Sul, Brasil
              </p>
              <p className="mb-2 flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                contato@valeverde.com.br
              </p>
              <p className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                (67) 3456-7890
              </p>
            </address>
          </div>
        </div>
        
        <div className="copyright mt-8 pt-4 border-t border-white border-opacity-20 text-center">
          <p className="text-sm opacity-90">&copy; {currentYear} Vale Verde. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
} 
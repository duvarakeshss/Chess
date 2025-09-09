import { Link } from 'react-router-dom';

const PromotionPage = () => {
  return (
    <html>
      <head>
        <link crossorigin="" href="https://fonts.gstatic.com/" rel="preconnect" />
        <link
          as="style"
          href="https://fonts.googleapis.com/css2?display=swap&amp;family=Noto+Sans%3Awght%40400%3B500%3B700%3B900&amp;family=Space+Grotesk%3Awght%40400%3B500%3B700"
          onload="this.rel='stylesheet'"
          rel="stylesheet"
        />
        <title>ChessMaster</title>
        <link href="data:image/x-icon;base64," rel="icon" type="image/x-icon" />
        <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style type="text/tailwindcss">
          {`
      :root {
        --primary-color: #6366f1;
      }
      .btn-primary {
        @apply bg-[#6366f1] hover:bg-[#4f46e5] transition-all duration-300 shadow-lg shadow-indigo-500;
      }
      .btn-secondary {
        @apply bg-[#242447] hover:bg-[#343465] transition-all duration-300;
      }
      .nav-link {
        @apply relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-white after:transition-all after:duration-300 hover:after:w-full;
      }
      .fade-in {
        animation: fadeIn 1s ease-out forwards;
      }
      .slide-up {
        animation: slideUp 0.8s ease-out forwards;
      }
      .logo-pulse {
        animation: logoPulse 2s ease-in-out infinite;
      }
      .feature-card {
        animation: slideInUp 0.6s ease-out forwards;
        opacity: 0;
        transform: translateY(20px);
      }
      .feature-card:nth-child(1) { animation-delay: 0.2s; }
      .feature-card:nth-child(2) { animation-delay: 0.4s; }
      .feature-card:nth-child(3) { animation-delay: 0.6s; }
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes logoPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }
      @keyframes slideInUp {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
      }
      html {
        scroll-behavior: smooth;
      }
    `}
        </style>
      </head>
      <body className="bg-[#111122]">
        <video className="fixed inset-0 w-screen h-screen object-cover opacity-30 -z-10" autoPlay loop muted playsInline>
          <source src="https://cdn.pixabay.com/video/2018/11/21/19459-303877310_large.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="relative flex size-full min-h-screen flex-col text-white dark group/design-root overflow-x-hidden" style={{ fontFamily: '"Space Grotesk", "Noto Sans", sans-serif' }}>
          <div className="layout-container flex h-full grow flex-col">
            <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#242447]/30 bg-[#111122]/40 px-4 sm:px-6 lg:px-10 py-3 sm:py-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="size-6 sm:size-8 text-[var(--primary-color)] logo-pulse">
                  <svg className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-[#1717cf]" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM8 12l2.5-4h3L11 12l2.5 4h-3L8 12z"></path>
                  </svg>
                </div>
                <h2 className="text-white text-lg sm:text-xl font-bold leading-tight tracking-[-0.015em] fade-in">ChessMaster</h2>
              </div>
              <div className="flex flex-1 justify-end gap-4 sm:gap-6 lg:gap-8">
                <div className="hidden sm:flex items-center gap-6 lg:gap-9">
                  <Link to="/login" className="text-white text-sm font-medium leading-normal nav-link">Play</Link>
                </div>
                <div className="flex gap-2 sm:gap-3">
                  <Link to="/signup">
                    <button className="flex min-w-[80px] sm:min-w-[100px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-md h-10 sm:h-12 px-4 sm:px-6 btn-primary text-white text-xs sm:text-sm font-bold leading-normal tracking-[0.015em] transform hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500">
                      <span className="truncate">Sign Up</span>
                    </button>
                  </Link>
                  <Link to="/login">
                    <button className="flex min-w-[80px] sm:min-w-[100px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-md h-10 sm:h-12 px-4 sm:px-6 btn-primary text-white text-xs sm:text-sm font-bold leading-normal tracking-[0.015em] transform hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500">
                      <span className="truncate">Log In</span>
                    </button>
                  </Link>
                </div>
              </div>
            </header>
            <main className="flex flex-1 flex-col">
              <div className="flex flex-1 justify-center py-8 sm:py-12 lg:py-16 px-4 sm:px-6 relative">
                <div className="layout-content-container flex flex-col max-w-6xl flex-1 items-center justify-center text-center px-4 relative z-10">
                  <div className="flex flex-col gap-4 sm:gap-6 items-center max-w-4xl">
                    <h1 className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-tight tracking-tighter slide-up">Master the Game of Kings</h1>
                    <p className="text-gray-300 text-base sm:text-lg lg:text-xl max-w-3xl fade-in px-4" style={{ animationDelay: '0.3s' }}>Challenge your mind and strategy with ChessMaster. Play against friends, compete in tournaments, and learn from the best. Join our community of chess enthusiasts today!</p>
                    <Link to="/signup">
                      <button className="flex min-w-[200px] sm:min-w-[250px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-md h-12 sm:h-14 px-6 sm:px-8 btn-primary text-white text-base sm:text-lg font-bold leading-normal tracking-[0.015em] transform hover:scale-105 transition-transform duration-300 fade-in" style={{ animationDelay: '0.6s' }}>
                        <span className="truncate">Play Now for Free</span>
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
              <div id="features" className="bg-[#1a1a32]/60 py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-10">
                <div className="max-w-6xl mx-auto">
                  <div className="text-center mb-8 sm:mb-12">
                    <h2 className="text-white text-2xl sm:text-3xl lg:text-4xl font-black leading-tight tracking-[-0.033em] slide-up px-4">Why Choose ChessMaster?</h2>
                    <p className="text-[#9393c8] text-base sm:text-lg font-normal leading-normal max-w-3xl mx-auto mt-4 fade-in px-4" style={{ animationDelay: '0.2s' }}>Experience the ultimate chess platform with AI opponents, stunning 3D visuals, and comprehensive game analysis.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    <div className="flex flex-col gap-4 rounded-lg bg-[#111122] p-4 sm:p-6 text-center items-center ring-1 ring-[#343465] hover:ring-[var(--primary-color)] transition-all duration-300 transform hover:-translate-y-1 feature-card">
                      <div className="text-[var(--primary-color)] p-2 sm:p-3 bg-[#242447] rounded-full">
                        <svg fill="currentColor" height="24px" width="24px" className="sm:h-8 sm:w-8" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
                          <path d="M117.25,157.92a60,60,0,1,0-66.5,0A95.83,95.83,0,0,0,3.53,195.63a8,8,0,1,0,13.4,8.74,80,80,0,0,1,134.14,0,8,8,0,0,0,13.4-8.74A95.83,95.83,0,0,0,117.25,157.92ZM40,108a44,44,0,1,1,44,44A44.05,44.05,0,0,1,40,108Zm210.14,98.7a8,8,0,0,1-11.07-2.33A79.83,79.83,0,0,0,172,168a8,8,0,0,1,0-16,44,44,0,1,0-16.34-84.87,8,8,0,1,1-5.94-14.85,60,60,0,0,1,55.53,105.64,95.83,95.83,0,0,1,47.22,37.71A8,8,0,0,1,250.14,206.7Z"></path>
                        </svg>
                      </div>
                      <div className="flex flex-col gap-2">
                        <h3 className="text-white text-lg sm:text-xl font-bold leading-tight">Challenge AI Opponents</h3>
                        <p className="text-[#9393c8] text-sm font-normal leading-normal">Test your skills against intelligent AI with multiple difficulty levels from beginner to expert.</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-4 rounded-lg bg-[#111122] p-4 sm:p-6 text-center items-center ring-1 ring-[#343465] hover:ring-[var(--primary-color)] transition-all duration-300 transform hover:-translate-y-1 feature-card">
                      <div className="text-[var(--primary-color)] p-2 sm:p-3 bg-[#242447] rounded-full">
                        <svg fill="currentColor" height="24px" width="24px" className="sm:h-8 sm:w-8" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
                          <path d="M232,64H208V56a16,16,0,0,0-16-16H64A16,16,0,0,0,48,56v8H24A16,16,0,0,0,8,80V96a40,40,0,0,0,40,40h3.65A80.13,80.13,0,0,0,120,191.61V216H96a8,8,0,0,0,0,16h64a8,8,0,0,0,0-16H136V191.58c31.94-3.23,58.44-25.64,68.08-55.58H208a40,40,0,0,0,40-40V80A16,16,0,0,0,232,64ZM48,120A24,24,0,0,1,24,96V80H48v32q0,4,.39,8Zm144-8.9c0,35.52-28.49,64.64-63.51,64.9H128a64,64,0,0,1-64-64V56H192ZM232,96a24,24,0,0,1-24,24h-.5a81.81,81.81,0,0,0,.5-8.9V80h24Z"></path>
                        </svg>
                      </div>
                      <div className="flex flex-col gap-2">
                        <h3 className="text-white text-lg sm:text-xl font-bold leading-tight">Immersive 3D Experience</h3>
                        <p className="text-[#9393c8] text-sm font-normal leading-normal">Enjoy stunning 3D chess pieces and board with smooth animations and realistic gameplay.</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-4 rounded-lg bg-[#111122] p-4 sm:p-6 text-center items-center ring-1 ring-[#343465] hover:ring-[var(--primary-color)] transition-all duration-300 transform hover:-translate-y-1 feature-card sm:col-span-2 lg:col-span-1">
                      <div className="text-[var(--primary-color)] p-2 sm:p-3 bg-[#242447] rounded-full">
                        <svg fill="currentColor" height="24px" width="24px" className="sm:h-8 sm:w-8" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
                          <path d="M224,48H160a40,40,0,0,0-32,16A40,40,0,0,0,96,48H32A16,16,0,0,0,16,64V192a16,16,0,0,0,16,16H96a24,24,0,0,1,24,24,8,8,0,0,0,16,0,24,24,0,0,1,24-24h64a16,16,0,0,0,16-16V64A16,16,0,0,0,224,48ZM96,192H32V64H96a24,24,0,0,1,24,24V200A39.81,39.81,0,0,0,96,192Zm128,0H160a39.81,39.81,0,0,0-24,8V88a24,24,0,0,1,24-24h64Z"></path>
                        </svg>
                      </div>
                      <div className="flex flex-col gap-2">
                        <h3 className="text-white text-lg sm:text-xl font-bold leading-tight">Complete Game Analysis</h3>
                        <p className="text-[#9393c8] text-sm font-normal leading-normal">Track your moves, review game history, and analyze strategies with detailed move notation.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </main>
            <footer className="bg-[#111122]/40 border-t border-[#242447]/30">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
                <div className="flex justify-center">
                  <p className="text-[#9393c8] text-xs sm:text-sm font-normal leading-normal text-center px-4">© 2025 ChessMaster. All rights reserved.</p>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </body>
    </html>
  );
};

export default PromotionPage;

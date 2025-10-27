"use client";
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from "lucide-react";

interface ErrorPageProps {
  error?: Error & { digest?: string };
  reset?: () => void;
  title?: string;
  message?: string;
  showRetry?: boolean;
  showHome?: boolean;
}

export default function Error({
  error,
  reset,
  title = "Oups, quelque chose a mal tourné",
  message = "Nous sommes désolés, mais une erreur s'est produite. Notre équipe a été notifiée et travaille à résoudre le problème.",
  showRetry = true,
  showHome = false,
}: ErrorPageProps) {
  const handleGoHome = () => {
    window.location.href = "/";
  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-indigo-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-200/30 to-pink-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-200/20 to-blue-200/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-2xl w-full">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 md:p-12 text-center transform transition-all duration-500 hover:scale-[1.02]">
          {/* Icon with animation */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-orange-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
            <div className="relative bg-gradient-to-r from-red-500 to-orange-500 w-24 h-24 mx-auto rounded-full flex items-center justify-center shadow-2xl transform transition-all duration-300 hover:rotate-12">
              <AlertTriangle className="w-12 h-12 text-white animate-bounce" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-800 via-gray-900 to-black bg-clip-text text-transparent mb-4 leading-tight">
            {title}
          </h1>

          {/* Message */}
          <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed max-w-lg mx-auto">
            {message}
          </p>

          {/* Error details */}
          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-2xl text-left">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-red-800 mb-1">
                    Détails de l&apos;erreur
                  </h3>
                  <p className="text-sm text-red-700 break-words font-mono bg-red-100 p-2 rounded-lg">
                    {error.message || "Une erreur inconnue est survenue."}
                  </p>
                  {error.digest && (
                    <p className="text-xs text-red-600 mt-2">
                      ID d&apos;erreur: {error.digest}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {showRetry && reset && (
              <button
                onClick={reset}
                className="group flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-semibold shadow-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-300"
              >
                <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                <span>Réessayer</span>
              </button>
            )}

            <button
              onClick={handleGoBack}
              className="group flex items-center space-x-2 px-8 py-4 bg-white text-gray-700 rounded-2xl font-semibold shadow-lg border border-gray-200 transform transition-all duration-200 hover:scale-105 hover:shadow-xl active:scale-95 focus:outline-none focus:ring-4 focus:ring-gray-300 hover:bg-gray-50"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
              <span>Retour</span>
            </button>

            {showHome && (
              <button
                onClick={handleGoHome}
                className="group flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl font-semibold shadow-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl active:scale-95 focus:outline-none focus:ring-4 focus:ring-emerald-300"
              >
                <Home className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                <span>Accueil</span>
              </button>
            )}
          </div>

          {/* Help text */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Si le problème persiste, n&apos;hésitez pas à{" "}
              <a
                href="mailto:support@example.com"
                className="text-blue-600 hover:text-blue-800 underline underline-offset-2 font-medium transition-colors duration-200"
              >
                nous contacter
              </a>{" "}
              pour obtenir de l&apos;aide.
            </p>
          </div>
        </div>

        {/* Floating elements */}
        <div className="absolute -z-10 top-4 right-4 w-3 h-3 bg-blue-400 rounded-full animate-ping"></div>
        <div className="absolute -z-10 bottom-4 left-4 w-2 h-2 bg-purple-400 rounded-full animate-ping delay-1000"></div>
        <div className="absolute -z-10 top-1/2 right-8 w-1 h-1 bg-pink-400 rounded-full animate-ping delay-500"></div>
      </div>
    </div>
  );
}

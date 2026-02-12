import React from 'react';

export default function GenerateButtons({ onGenerate, disabled, loading }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* HLD Button */}
        <button
          onClick={() => onGenerate('hld')}
          disabled={disabled || loading}
          className={`group relative border-2 rounded-xl p-6 text-center transition-all ${
            disabled || loading
              ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
              : 'border-blue-200 bg-white hover:bg-blue-50 hover:border-blue-400 cursor-pointer'
          }`}
        >
          {loading === 'hld' ? (
            <div className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-blue-600 font-medium">Generating...</span>
            </div>
          ) : (
            <>
              <svg className="w-10 h-10 mx-auto text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <div className="text-lg font-semibold text-blue-700">Generate HLD</div>
              <div className="text-xs text-gray-500 mt-1">High-Level Design</div>
              <div className="text-xs text-gray-400 mt-0.5">Executive overview &middot; Architecture vision</div>
            </>
          )}
        </button>

        {/* LLD Button */}
        <button
          onClick={() => onGenerate('lld')}
          disabled={disabled || loading}
          className={`group relative border-2 rounded-xl p-6 text-center transition-all ${
            disabled || loading
              ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
              : 'border-green-200 bg-white hover:bg-green-50 hover:border-green-400 cursor-pointer'
          }`}
        >
          {loading === 'lld' ? (
            <div className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-green-600 font-medium">Generating...</span>
            </div>
          ) : (
            <>
              <svg className="w-10 h-10 mx-auto text-green-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l4.879-4.879m0 0a3 3 0 104.243-4.243 3 3 0 00-4.243 4.243z" />
              </svg>
              <div className="text-lg font-semibold text-green-700">Generate LLD</div>
              <div className="text-xs text-gray-500 mt-1">Low-Level Design</div>
              <div className="text-xs text-gray-400 mt-0.5">Technical details &middot; Configuration specs</div>
            </>
          )}
        </button>
      </div>

      {disabled && !loading && (
        <p className="text-xs text-center text-orange-500 mt-3">
          Please upload a SOW file, select a platform, and fill in required project details.
        </p>
      )}
    </div>
  );
}

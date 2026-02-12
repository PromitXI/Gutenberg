import React from 'react';

const platforms = [
  {
    id: 'aws',
    name: 'AWS',
    fullName: 'Amazon Web Services',
    color: 'orange',
    bgSelected: 'bg-orange-50 border-orange-400 ring-2 ring-orange-200',
    bgDefault: 'bg-white border-gray-200 hover:border-orange-300',
    textColor: 'text-orange-600'
  },
  {
    id: 'azure',
    name: 'Azure',
    fullName: 'Microsoft Azure',
    color: 'blue',
    bgSelected: 'bg-blue-50 border-blue-400 ring-2 ring-blue-200',
    bgDefault: 'bg-white border-gray-200 hover:border-blue-300',
    textColor: 'text-blue-600'
  }
];

export default function PlatformSelector({ selected, onSelect }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        </svg>
        Select Cloud Platform
      </h2>

      <div className="grid grid-cols-2 gap-4">
        {platforms.map(platform => (
          <button
            key={platform.id}
            onClick={() => onSelect(platform.id)}
            className={`border-2 rounded-lg p-5 text-center transition-all cursor-pointer ${
              selected === platform.id ? platform.bgSelected : platform.bgDefault
            }`}
          >
            <div className={`text-2xl font-bold ${platform.textColor} mb-1`}>
              {platform.name}
            </div>
            <div className="text-sm text-gray-500">{platform.fullName}</div>
            {selected === platform.id && (
              <svg className={`w-5 h-5 mx-auto mt-2 ${platform.textColor}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

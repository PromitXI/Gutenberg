import React from 'react';

const MAX_CHARS = 10000;

export default function AdditionalInfo({ value, onChange }) {
  const charCount = value.length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-1 flex items-center gap-2">
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        Additional Information
        <span className="text-xs font-normal text-gray-400 ml-1">(Optional)</span>
      </h2>

      <p className="text-xs text-gray-500 mb-3">
        Add any extra context, network details, or specific requirements not covered in the SOW.
      </p>

      <textarea
        value={value}
        onChange={(e) => {
          if (e.target.value.length <= MAX_CHARS) {
            onChange(e.target.value);
          }
        }}
        placeholder={`Examples:\n- VPN tunnel configurations\n- Transit Gateway attachments\n- Security group rules\n- IP address ranges\n- Specific firewall requirements\n- Compliance requirements`}
        rows={5}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y"
      />

      <div className="text-right mt-1">
        <span className={`text-xs ${charCount > MAX_CHARS * 0.9 ? 'text-orange-500' : 'text-gray-400'}`}>
          {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
        </span>
      </div>
    </div>
  );
}

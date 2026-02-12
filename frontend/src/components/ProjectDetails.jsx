import React from 'react';

const awsRegions = [
  'us-east-1 (N. Virginia)',
  'us-east-2 (Ohio)',
  'us-west-1 (N. California)',
  'us-west-2 (Oregon)',
  'ap-southeast-1 (Singapore)',
  'ap-southeast-2 (Sydney)',
  'ap-northeast-1 (Tokyo)',
  'ap-northeast-2 (Seoul)',
  'ap-south-1 (Mumbai)',
  'eu-west-1 (Ireland)',
  'eu-west-2 (London)',
  'eu-central-1 (Frankfurt)',
];

const azureRegions = [
  'Southeast Asia (Singapore)',
  'East Asia (Hong Kong)',
  'Japan East (Tokyo)',
  'Japan West (Osaka)',
  'Korea Central (Seoul)',
  'Australia East (Sydney)',
  'Central India (Pune)',
  'West Europe (Netherlands)',
  'North Europe (Ireland)',
  'UK South (London)',
  'East US (Virginia)',
  'West US 2 (Washington)',
];

export default function ProjectDetails({ details, onChange, platform }) {
  const regions = platform === 'azure' ? azureRegions : awsRegions;

  const handleChange = (field, value) => {
    onChange({ ...details, [field]: value });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Project Details
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Project Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={details.projectName}
            onChange={(e) => handleChange('projectName', e.target.value)}
            placeholder="e.g., Mizuho SASE Implementation"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Client Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={details.clientName}
            onChange={(e) => handleChange('clientName', e.target.value)}
            placeholder="e.g., Mizuho Bank Ltd."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Author Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={details.authorName}
            onChange={(e) => handleChange('authorName', e.target.value)}
            placeholder="e.g., Promit Bhattacherjee"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Document Version
          </label>
          <input
            type="text"
            value={details.version}
            onChange={(e) => handleChange('version', e.target.value)}
            placeholder="1.0"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Region
          </label>
          <select
            value={details.region}
            onChange={(e) => handleChange('region', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
          >
            <option value="">Select a region...</option>
            {regions.map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

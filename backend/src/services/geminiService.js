/**
 * Gemini AI Service
 * Uses Google Gemini (Thinking Model) to read, understand, reason about,
 * and extract structured data from Statement of Work (SOW) documents.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY or GOOGLE_API_KEY must be set in .env file');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    // Use Gemini 2.5 Flash or configurable model
    this.modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  }

  /**
   * Analyze a SOW document using Gemini AI.
   * The AI reads the full SOW text, reasons about it, then returns structured data.
   *
   * @param {string} sowText - The raw text extracted from the SOW document
   * @param {string} platform - 'aws' or 'azure'
   * @param {string} documentType - 'hld' or 'lld'
   * @param {object} projectDetails - User-provided project details
   * @returns {object} Structured analysis of the SOW
   */
  async analyzeSow(sowText, platform, documentType, projectDetails) {
    const model = this.genAI.getGenerativeModel({
      model: this.modelName,
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 65536,
        responseMimeType: 'application/json',
      },
    });

    const prompt = this._buildAnalysisPrompt(sowText, platform, documentType, projectDetails);

    try {
      console.log(`[GeminiService] Analyzing SOW with model: ${this.modelName}...`);
      const startTime = Date.now();

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`[GeminiService] Analysis complete in ${elapsed}s`);

      // Parse the JSON response
      const analysis = this._parseResponse(text);
      return analysis;
    } catch (error) {
      console.error('[GeminiService] Error analyzing SOW:', error.message);
      // Return a minimal structure so document generation can still proceed
      return this._getFallbackAnalysis(sowText, projectDetails);
    }
  }

  /**
   * Build the comprehensive analysis prompt for Gemini.
   * This prompt instructs the AI to THINK and REASON about the SOW content.
   */
  _buildAnalysisPrompt(sowText, platform, documentType, projectDetails) {
    const platformLabel = platform === 'aws' ? 'AWS' : 'Azure';

    return `You are an expert NTT DATA Solutions Architect. You are analyzing a Statement of Work (SOW) document to extract structured information for generating a ${documentType.toUpperCase()} (${documentType === 'hld' ? 'High-Level Design' : 'Low-Level Design'}) document for a ${platformLabel} cloud infrastructure project.

IMPORTANT INSTRUCTIONS:
1. READ the entire SOW document carefully
2. REASON about the content - understand the project context, requirements, and constraints
3. EXTRACT factual information directly from the SOW - do NOT make up information
4. Where the SOW is silent on a topic, indicate "Not specified in SOW" or provide reasonable NTT DATA standard defaults clearly marked as defaults
5. Pay special attention to: scope items, RACI matrices, network details, security requirements, server inventories, migration plans, and SLA terms

The project details provided by the user are:
- Project Name: ${projectDetails.projectName || 'Not provided'}
- Client Name: ${projectDetails.clientName || 'Not provided'}
- Author: ${projectDetails.authorName || 'Not provided'}
- Version: ${projectDetails.version || '1.0'}
- Region: ${projectDetails.region || 'Not specified'}
- Platform: ${platformLabel}

=== SOW DOCUMENT CONTENT ===
${sowText}
=== END OF SOW DOCUMENT ===

Now analyze the SOW and return a JSON object with the following structure. For each field, extract ACTUAL content from the SOW. If the SOW does not mention something, use reasonable defaults but mark them clearly.

Return ONLY valid JSON with this exact structure:

{
  "projectName": "string - project name from SOW or user input",
  "clientName": "string - client/customer name from SOW or user input",
  
  "executiveSummary": {
    "overview": "string - 2-3 paragraph executive summary of the project based on the SOW",
    "businessDrivers": ["array of business drivers/objectives mentioned in SOW"],
    "keyDeliverables": ["array of key deliverables from the SOW"]
  },
  
  "solutionStrategy": {
    "currentState": ["array of bullet points describing current state/AS-IS from SOW"],
    "targetState": ["array of bullet points describing target state/TO-BE from SOW"],
    "migrationApproach": "string - migration approach described in SOW (lift-and-shift, greenfield, hybrid, etc.)"
  },
  
  "scope": {
    "inScope": ["array of in-scope items directly from the SOW"],
    "outOfScope": ["array of out-of-scope items directly from the SOW"]
  },
  
  "requirements": ["array of requirements extracted from SOW"],
  
  "assumptions": ["array of assumptions from the SOW"],
  
  "constraints": [
    {
      "id": "CON-001",
      "scope": "string - category",
      "description": "string - constraint description from SOW",
      "hldDefinition": "Defined"
    }
  ],
  
  "risks": [
    {
      "id": "RSK-001",
      "scope": "string - category",
      "description": "string - risk description from SOW",
      "hldDefinition": "To be assessed"
    }
  ],
  
  "raci": {
    "infrastructureAndLicenses": [
      {"task": "string", "ntt": "R/A/C/I", "customer": "R/A/C/I"}
    ],
    "professionalServices": [
      {"task": "string", "ntt": "R/A/C/I", "customer": "R/A/C/I"}
    ],
    "deploymentActivities": [
      {"task": "string", "ntt": "R/A/C/I", "customer": "R/A/C/I"}
    ],
    "acceptanceTesting": [
      {"task": "string", "ntt": "R/A/C/I", "customer": "R/A/C/I"}
    ],
    "ongoingServices": [
      {"task": "string", "ntt": "R/A/C/I", "customer": "R/A/C/I"}
    ]
  },
  
  "components": ["array of technology/infrastructure components mentioned in SOW (e.g., 'Transit Gateway', 'FortiGate', 'VPN', etc.)"],
  
  "locations": ["array of geographic locations/regions mentioned in SOW"],
  
  "networkRanges": ["array of CIDR ranges/IP addresses mentioned in SOW"],
  
  "networkDesign": {
    "topology": "string - network topology description from SOW",
    "vpnConnections": ["array of VPN connection details from SOW"],
    "subnets": [
      {"name": "string", "cidr": "string", "purpose": "string", "zone": "CSZ/PSZ/AMZ"}
    ],
    "firewallRules": ["array of firewall/security group rules mentioned"],
    "dnsConfig": "string - DNS configuration details from SOW",
    "loadBalancing": "string - load balancing requirements from SOW"
  },
  
  "securityRequirements": ["array of security requirements from SOW"],
  
  "servers": [
    {
      "hostname": "string",
      "description": "string",
      "role": "string",
      "os": "string",
      "vcpu": "string",
      "memory": "string",
      "storage": "string",
      "environment": "Production/DR",
      "migrationMethod": "Lift and Shift / Greenfield"
    }
  ],
  
  "backupRequirements": {
    "policies": [
      {"type": "string", "frequency": "string", "retention": "string", "tier": "string"}
    ],
    "specialRequirements": ["array of special backup requirements from SOW"]
  },
  
  "drStrategy": {
    "overview": "string - DR strategy overview from SOW",
    "rpo": "string - RPO from SOW",
    "rto": "string - RTO from SOW",
    "drRegion": "string - DR region from SOW",
    "components": [
      {"component": "string", "drMethod": "string", "drRegion": "string"}
    ]
  },
  
  "migrationPlan": {
    "strategy": "string - overall migration strategy from SOW",
    "phases": [
      {"phase": "string", "activities": "string", "dependencies": "string", "deliverables": "string"}
    ],
    "serverMigrations": [
      {"hostname": "string", "description": "string", "method": "string", "phase": "string"}
    ]
  },
  
  "workloads": [
    {
      "name": "string - workload name",
      "description": "string - workload description",
      "infrastructure": "string - infrastructure details",
      "backupPolicy": "string - backup policy for this workload",
      "monitoring": "string - monitoring requirements"
    }
  ],
  
  "slaRequirements": [
    {"metric": "string", "target": "string", "measurementMethod": "string"}
  ],
  
  "softwareComponents": [
    {"area": "string", "product": "string", "version": "string", "licenseType": "string", "responsible": "string"}
  ],
  
  "complianceRequirements": ["array of compliance/regulatory requirements from SOW"],
  
  "additionalNotes": "string - any additional important information from the SOW that doesn't fit other categories"
}`;
  }

  /**
   * Parse the AI response, handling potential JSON formatting issues.
   */
  _parseResponse(responseText) {
    try {
      // Try direct parse first
      return JSON.parse(responseText);
    } catch (e) {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[1].trim());
        } catch (e2) {
          console.error('[GeminiService] Failed to parse extracted JSON:', e2.message);
        }
      }

      // Try to find JSON object in the response
      const objMatch = responseText.match(/\{[\s\S]*\}/);
      if (objMatch) {
        try {
          return JSON.parse(objMatch[0]);
        } catch (e3) {
          console.error('[GeminiService] Failed to parse found JSON object:', e3.message);
        }
      }

      console.error('[GeminiService] Could not parse response as JSON. Raw response length:', responseText.length);
      throw new Error('Failed to parse Gemini AI response as JSON');
    }
  }

  /**
   * Provide a minimal fallback analysis if the AI call fails.
   * This uses basic text extraction to ensure document generation still works.
   */
  _getFallbackAnalysis(sowText, projectDetails) {
    console.warn('[GeminiService] Using fallback analysis (AI call failed)');

    // Basic regex extraction as fallback
    const extractBullets = (text, keyword) => {
      const results = [];
      const regex = new RegExp(`${keyword}[:\\s]*([^\\n]+)`, 'gi');
      let match;
      while ((match = regex.exec(text)) !== null) {
        results.push(match[1].trim());
      }
      return results;
    };

    return {
      projectName: projectDetails.projectName || 'Untitled Project',
      clientName: projectDetails.clientName || 'Client',
      executiveSummary: {
        overview: 'Executive summary to be completed based on SOW analysis.',
        businessDrivers: [],
        keyDeliverables: []
      },
      solutionStrategy: {
        currentState: [],
        targetState: [],
        migrationApproach: 'To be determined'
      },
      scope: {
        inScope: extractBullets(sowText, 'in scope|included|scope includes'),
        outOfScope: extractBullets(sowText, 'out of scope|excluded|not included')
      },
      requirements: extractBullets(sowText, 'requirement|shall|must'),
      assumptions: extractBullets(sowText, 'assumption|assumed'),
      constraints: [],
      risks: [],
      raci: {
        infrastructureAndLicenses: [],
        professionalServices: [],
        deploymentActivities: [],
        acceptanceTesting: [],
        ongoingServices: []
      },
      components: [],
      locations: [],
      networkRanges: [],
      networkDesign: {
        topology: '',
        vpnConnections: [],
        subnets: [],
        firewallRules: [],
        dnsConfig: '',
        loadBalancing: ''
      },
      securityRequirements: [],
      servers: [],
      backupRequirements: { policies: [], specialRequirements: [] },
      drStrategy: {
        overview: '',
        rpo: '',
        rto: '',
        drRegion: '',
        components: []
      },
      migrationPlan: {
        strategy: '',
        phases: [],
        serverMigrations: []
      },
      workloads: [],
      slaRequirements: [],
      softwareComponents: [],
      complianceRequirements: [],
      additionalNotes: ''
    };
  }
}

module.exports = GeminiService;

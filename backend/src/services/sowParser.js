/**
 * SOW Parser - AI-Powered
 *
 * Reads SOW documents (PDF, DOCX, TXT), extracts raw text,
 * then uses Google Gemini AI to deeply analyze and understand the content.
 * Returns structured data for document generation.
 */

const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const GeminiService = require('./geminiService');

class SowParser {
  constructor() {
    this.geminiService = new GeminiService();
  }

  /**
   * Parse a SOW file and analyze it using Gemini AI.
   *
   * @param {string} filePath - Path to the SOW file (PDF, DOCX, or TXT)
   * @param {string} platform - 'aws' or 'azure'
   * @param {string} documentType - 'hld' or 'lld'
   * @param {object} projectDetails - User-provided project details
   * @returns {object} AI-analyzed structured data from the SOW
   */
  async parse(filePath, platform, documentType, projectDetails) {
    const ext = path.extname(filePath).toLowerCase();
    let rawText = '';

    switch (ext) {
      case '.pdf':
        rawText = await this.parsePdf(filePath);
        break;
      case '.docx':
        rawText = await this.parseDocx(filePath);
        break;
      case '.txt':
        rawText = fs.readFileSync(filePath, 'utf8');
        break;
      default:
        throw new Error(`Unsupported file type: ${ext}`);
    }

    console.log(`[SowParser] Extracted ${rawText.length} characters from ${ext} file`);

    // Use Gemini AI to analyze the SOW content
    const aiAnalysis = await this.geminiService.analyzeSow(
      rawText,
      platform || 'aws',
      documentType || 'hld',
      projectDetails || {}
    );

    // Merge AI analysis with raw text and ensure backward compatibility
    return this._normalizeAnalysis(aiAnalysis, rawText);
  }

  async parsePdf(filePath) {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  }

  async parseDocx(filePath) {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  }

  /**
   * Normalize the AI analysis to ensure all expected fields are present.
   * This maintains backward compatibility with the template processor.
   */
  _normalizeAnalysis(analysis, rawText) {
    const safe = (val, def) => val !== undefined && val !== null ? val : def;
    const safeArr = (val) => Array.isArray(val) ? val.filter(x => x != null) : [];
    const safeStrArr = (val) => Array.isArray(val) ? val.filter(x => x != null).map(String) : [];

    return {
      // Core fields (backward compatible with original parser)
      projectName: safe(analysis.projectName, ''),
      clientName: safe(analysis.clientName, ''),
      locations: safeStrArr(analysis.locations),
      components: safeStrArr(analysis.components),
      networkRanges: safeStrArr(analysis.networkRanges),
      securityRequirements: safeStrArr(analysis.securityRequirements),
      vpnConnections: safeStrArr(analysis.networkDesign?.vpnConnections),
      scope: {
        inScope: safeStrArr(analysis.scope?.inScope),
        outOfScope: safeStrArr(analysis.scope?.outOfScope),
      },
      requirements: safeStrArr(analysis.requirements),
      assumptions: safeStrArr(analysis.assumptions),
      rawText: rawText,

      // AI-enriched fields
      executiveSummary: analysis.executiveSummary || {
        overview: '',
        businessDrivers: [],
        keyDeliverables: []
      },
      solutionStrategy: analysis.solutionStrategy || {
        currentState: [],
        targetState: [],
        migrationApproach: ''
      },
      constraints: safeArr(analysis.constraints),
      risks: safeArr(analysis.risks),
      raci: analysis.raci || {
        infrastructureAndLicenses: [],
        professionalServices: [],
        deploymentActivities: [],
        acceptanceTesting: [],
        ongoingServices: []
      },
      networkDesign: analysis.networkDesign || {
        topology: '',
        vpnConnections: [],
        subnets: [],
        firewallRules: [],
        dnsConfig: '',
        loadBalancing: ''
      },
      servers: safeArr(analysis.servers),
      backupRequirements: analysis.backupRequirements || {
        policies: [],
        specialRequirements: []
      },
      drStrategy: analysis.drStrategy || {
        overview: '',
        rpo: '',
        rto: '',
        drRegion: '',
        components: []
      },
      migrationPlan: analysis.migrationPlan || {
        strategy: '',
        phases: [],
        serverMigrations: []
      },
      workloads: safeArr(analysis.workloads),
      slaRequirements: safeArr(analysis.slaRequirements),
      softwareComponents: safeArr(analysis.softwareComponents),
      complianceRequirements: safeStrArr(analysis.complianceRequirements),
      additionalNotes: safe(analysis.additionalNotes, '')
    };
  }
}

module.exports = SowParser;

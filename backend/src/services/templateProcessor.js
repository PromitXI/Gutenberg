const { HeadingLevel } = require('docx');
const DocxBuilder = require('../utils/docxBuilder');
const SowParser = require('./sowParser');

class TemplateProcessor {
  constructor() {
    this.sowParser = new SowParser();
  }

  async process(options) {
    const { sowFilePath, platform, documentType, additionalInfo, projectDetails } = options;

    // Pass platform, documentType, and projectDetails to the AI-powered parser
    const sowData = await this.sowParser.parse(sowFilePath, platform, documentType, projectDetails);
    const mergedData = this.mergeData(sowData, additionalInfo, projectDetails);
    const builder = new DocxBuilder(projectDetails, platform, documentType);

    const content = documentType === 'hld'
      ? this.generateHldContent(mergedData, platform, builder)
      : this.generateLldContent(mergedData, platform, builder);

    return await builder.build(content);
  }

  mergeData(sowData, additionalInfo, projectDetails) {
    return {
      ...sowData,
      additionalInfo: additionalInfo || '',
      projectDetails,
      projectName: projectDetails.projectName || sowData.projectName || 'Untitled Project',
      clientName: projectDetails.clientName || sowData.clientName || 'Client',
      // Ensure all AI-enriched fields are accessible
      executiveSummary: sowData.executiveSummary || { overview: '', businessDrivers: [], keyDeliverables: [] },
      solutionStrategy: sowData.solutionStrategy || { currentState: [], targetState: [], migrationApproach: '' },
      constraints: sowData.constraints || [],
      risks: sowData.risks || [],
      raci: sowData.raci || { infrastructureAndLicenses: [], professionalServices: [], deploymentActivities: [], acceptanceTesting: [], ongoingServices: [] },
      networkDesign: sowData.networkDesign || { topology: '', vpnConnections: [], subnets: [], firewallRules: [], dnsConfig: '', loadBalancing: '' },
      servers: sowData.servers || [],
      backupRequirements: sowData.backupRequirements || { policies: [], specialRequirements: [] },
      drStrategy: sowData.drStrategy || { overview: '', rpo: '', rto: '', drRegion: '', components: [] },
      migrationPlan: sowData.migrationPlan || { strategy: '', phases: [], serverMigrations: [] },
      workloads: sowData.workloads || [],
      slaRequirements: sowData.slaRequirements || [],
      softwareComponents: sowData.softwareComponents || [],
      complianceRequirements: sowData.complianceRequirements || [],
    };
  }

  // ─── HLD CONTENT GENERATION ───────────────────────────────────────────────

  generateHldContent(data, platform, b) {
    const content = [];
    const platformLabel = platform === 'aws' ? 'AWS' : 'Azure';
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const projShort = data.projectName.toLowerCase().replace(/\s+/g, '').substring(0, 8);

    // Title Page
    content.push(...b.createTitlePage(data));
    content.push(b.createPageBreak());

    // Table of Contents placeholder
    content.push(b.createHeading('Table of Contents', HeadingLevel.HEADING_1));
    content.push(b.createPara('(Auto-generated table of contents - Update field in Word to populate)', { italics: true, color: "666666" }));
    content.push(b.createPageBreak());

    // ═══════════════════════════════════════════════════════════════════════
    // 1. DOCUMENT CONTROL
    // ═══════════════════════════════════════════════════════════════════════
    content.push(b.createHeading('1. Document Control', HeadingLevel.HEADING_1));
    content.push(b.createPara('This section tracks the document lifecycle including revisions, review status, and responsibility assignments.'));

    content.push(b.createHeading('1.1 Document Identification', HeadingLevel.HEADING_2));
    content.push(b.createTable(
      ['Field', 'Value'],
      [
        ['Document Title', `${data.projectName} - High-Level Design`],
        ['Document Owner', data.projectDetails.authorName],
        ['Classification', 'Company Confidential - Client / Vendor Information'],
        ['Version', data.projectDetails.version || '1.0'],
        ['Date', today],
      ],
      [3600, 5760]
    ));

    content.push(b.createHeading('1.2 Preparation', HeadingLevel.HEADING_2));
    content.push(b.createTable(
      ['Action', 'Name', 'Role / Function', 'Date'],
      [
        ['Prepared by', data.projectDetails.authorName, 'Technical Architect', today],
        ['Reviewed by', '[Reviewer Name]', '[Role]', ''],
        ['Approved by', '[Approver Name]', '[Role]', ''],
      ],
      [1800, 2400, 2760, 2400]
    ));

    content.push(b.createHeading('1.3 Release History', HeadingLevel.HEADING_2));
    content.push(b.createTable(
      ['Version', 'Date', 'Author', 'Change Description', 'Status'],
      [
        [data.projectDetails.version || '1.0', today, data.projectDetails.authorName, 'Initial draft', 'Draft'],
      ],
      [1200, 1800, 1800, 2760, 1800]
    ));

    content.push(b.createHeading('1.4 Review Status', HeadingLevel.HEADING_2));
    content.push(b.createTable(
      ['Reviewer', 'Role', 'Status', 'Date'],
      [
        [data.projectDetails.authorName, 'Solution Architect', 'Pending Review', ''],
        ['[Client Reviewer]', 'Client Technical Lead', 'Pending Review', ''],
        ['[NTT Reviewer]', 'Project Manager', 'Pending Review', ''],
      ],
      [2400, 2400, 2160, 2400]
    ));
    content.push(b.createPageBreak());

    // ═══════════════════════════════════════════════════════════════════════
    // 2. EXECUTIVE SUMMARY
    // ═══════════════════════════════════════════════════════════════════════
    content.push(b.createHeading('2. Executive Summary', HeadingLevel.HEADING_1));

    // Use AI-analyzed executive summary if available
    if (data.executiveSummary && data.executiveSummary.overview) {
      // Split overview into paragraphs
      const overviewParagraphs = data.executiveSummary.overview.split(/\n+/).filter(p => p.trim());
      overviewParagraphs.forEach(p => content.push(b.createPara(p.trim())));
    } else {
      content.push(b.createPara(
        `This High-Level Design (HLD) document describes the solution architecture for the ${data.projectName} project for ${data.clientName}. ` +
        `The solution leverages ${platformLabel} cloud services to deliver a secure, scalable, and highly available infrastructure ` +
        `that meets the client's business and technical requirements.`
      ));
      content.push(b.createPara(
        `NTT DATA has produced this document to define the technical solution that will be delivered to fulfil ${data.clientName} requirements. ` +
        `NTT DATA, in agreement with ${data.clientName}, has decided to deploy this infrastructure on ${platformLabel}. ` +
        `The main site for this infrastructure will be in ${data.projectDetails.region || '[Primary Region]'} and the Disaster Recovery site will be in [DR Region].`
      ));
    }

    // Business Drivers from AI analysis
    if (data.executiveSummary && data.executiveSummary.businessDrivers && data.executiveSummary.businessDrivers.length > 0) {
      content.push(b.createPara('The key business drivers for this project are:', { spaceBefore: 120 }));
      data.executiveSummary.businessDrivers.forEach(driver => {
        content.push(b.createBullet(driver));
      });
    }

    // Key Deliverables from AI analysis
    if (data.executiveSummary && data.executiveSummary.keyDeliverables && data.executiveSummary.keyDeliverables.length > 0) {
      content.push(b.createPara('Key deliverables include:', { spaceBefore: 120 }));
      data.executiveSummary.keyDeliverables.forEach(del => {
        content.push(b.createBullet(del));
      });
    }

    if (data.components.length > 0) {
      content.push(b.createPara('The solution incorporates the following key technologies:', { spaceBefore: 120 }));
      data.components.forEach(comp => {
        content.push(b.createBullet(comp));
      });
    }
    if (data.locations.length > 0) {
      content.push(b.createPara('The deployment spans the following geographic locations:', { spaceBefore: 120 }));
      data.locations.forEach(loc => {
        content.push(b.createBullet(loc));
      });
    }
    content.push(b.createPageBreak());

    // ═══════════════════════════════════════════════════════════════════════
    // 3. SOLUTION STRATEGY
    // ═══════════════════════════════════════════════════════════════════════
    content.push(b.createHeading('3. Solution Strategy', HeadingLevel.HEADING_1));

    content.push(b.createHeading('3.1 Overview', HeadingLevel.HEADING_2));
    content.push(b.createPara(
      `The solution strategy for ${data.projectName} follows a structured approach to cloud infrastructure deployment on ${platformLabel}. ` +
      `The design prioritizes security, high availability, and operational efficiency while adhering to industry best practices and the client's specific requirements.`
    ));

    content.push(b.createHeading('3.2 Architecture Design Principles', HeadingLevel.HEADING_2));
    content.push(b.createPara(
      'Good architecture is one that meets the needs of the stakeholders, does not violate established principles of system architecture, ' +
      'and considers the relevant facilities by allowing for maintenance, evolution, and further development as the customer requires.'
    ));
    content.push(b.createInfoBox('Well-Architected Framework',
      platform === 'aws'
        ? 'This architecture follows the AWS Well-Architected Framework pillars: Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization, and Sustainability.'
        : 'This architecture follows the Azure Well-Architected Framework pillars: Operational Excellence, Security, Reliability, Performance Efficiency, and Cost Optimization. Reference: https://learn.microsoft.com/en-us/azure/well-architected/'
    ));
    content.push(b.createPara('This system architecture accomplishes the following principles:', { spaceBefore: 120 }));

    const designPrinciples = [
      { name: 'Simplicity', desc: 'Focus on customer requirements and provide the simplest infrastructure to accomplish the goals. If a standalone system achieves requirements, complex clustered systems should be avoided.' },
      { name: 'Scalability', desc: 'Systems are built on scalable infrastructure to provide resources needed and adapted to customer needs for current and future requirements.' },
      { name: 'Flexibility', desc: 'All systems are defined and sized to be adapted quickly to different configurations. For example, building standalone systems in a way that makes it easy to move to a different infrastructure or availability configuration.' },
      { name: 'Automation', desc: 'Automation is promoted over manual actions to ease deployments, respond to load peaks, and ease operations for repeatability while avoiding human errors.' },
      { name: 'Performance', desc: 'A performant system can execute tasks accomplishing the baseline agreed with the customer for specific or global operations.' },
      { name: 'Standardized', desc: 'Configuration and designs follow industry best practices and recommendations. NTT and customer standards are applied while maintaining vendor and industry recommendations as a baseline.' },
      { name: 'Supported', desc: 'The infrastructure uses only supported versions as a strict requirement to always have vendor support contracted.' },
      { name: 'Modern', desc: 'The latest versions of software are used, and it is highly recommended to use versions that will not be out of maintenance during the contract period.' },
      { name: 'Secure', desc: 'Security is based on customer requirements and NTT standards. By default, communications are secured using encryption. Security includes all elements needed to maintain the infrastructure up to date.' },
      { name: 'Compliance', desc: 'Must be in compliance with laws, policies, and regulations stated by the customer, industry, and government.' },
      { name: 'Resilient', desc: 'Based on customer business needs and agreements, availability for each system and component will range from 99.5% to 99.95%, with automated error detection and role switching mechanisms.' },
      { name: 'Durable', desc: 'Customer requirements determine the Recovery Point Objective (RPO) per system/host/element. If not specified, the maximum RPO will be applied.' },
    ];
    designPrinciples.forEach(p => {
      content.push(b.createPara(p.desc, { label: `${p.name}: ` }));
    });

    content.push(b.createHeading('3.3 Current State (AS-IS)', HeadingLevel.HEADING_2));
    // Use AI-analyzed current state if available
    if (data.solutionStrategy && data.solutionStrategy.currentState && data.solutionStrategy.currentState.length > 0) {
      content.push(b.createPara(
        'The current environment assessment identifies the following characteristics of the existing infrastructure:'
      ));
      data.solutionStrategy.currentState.forEach(item => content.push(b.createBullet(item)));
    } else {
      content.push(b.createPara(
        'The current environment assessment identifies the following characteristics of the existing infrastructure:'
      ));
      content.push(b.createBullet('Current network topology and connectivity requirements'));
      content.push(b.createBullet('Existing security controls and compliance posture'));
      content.push(b.createBullet('Application and workload inventory'));
      content.push(b.createBullet('Current operational processes and tooling'));
      content.push(b.createInfoBox('Note', 'Detailed current state analysis should be validated with the client during the discovery phase.'));
    }

    content.push(b.createHeading('3.4 Target State (TO-BE)', HeadingLevel.HEADING_2));
    // Use AI-analyzed target state if available
    if (data.solutionStrategy && data.solutionStrategy.targetState && data.solutionStrategy.targetState.length > 0) {
      content.push(b.createPara(
        `The target architecture deploys a ${platformLabel}-based solution that addresses the identified gaps and requirements:`
      ));
      data.solutionStrategy.targetState.forEach(item => content.push(b.createBullet(item)));
    } else {
      content.push(b.createPara(
        `The target architecture deploys a ${platformLabel}-based solution that addresses the identified gaps and requirements:`
      ));
      if (platform === 'aws') {
        content.push(b.createBullet('Multi-AZ deployment for high availability'));
        content.push(b.createBullet('VPC architecture with segmented subnets (public, private, management)'));
        content.push(b.createBullet('Transit Gateway for centralized routing and connectivity'));
        content.push(b.createBullet('Site-to-Site VPN or Direct Connect for hybrid connectivity'));
        content.push(b.createBullet('Security Groups and NACLs for network-level access control'));
        content.push(b.createBullet('CloudWatch and CloudTrail for monitoring and auditing'));
        content.push(b.createBullet('PSZ (Provider Service Zone) for management tooling'));
        content.push(b.createBullet('AMZ (Administration Management Zone) for privileged access'));
      } else {
        content.push(b.createBullet('Multi-region deployment for high availability'));
        content.push(b.createBullet('VNet architecture with segmented subnets'));
        content.push(b.createBullet('Virtual WAN or VNet Peering for connectivity'));
        content.push(b.createBullet('Site-to-Site VPN or ExpressRoute for hybrid connectivity'));
        content.push(b.createBullet('Network Security Groups (NSGs) for access control'));
        content.push(b.createBullet('Azure Monitor and Microsoft Sentinel for monitoring and security'));
        content.push(b.createBullet('PSZ (Provider Service Zone) for management tooling'));
        content.push(b.createBullet('AMZ (Administration Management Zone) for privileged access'));
      }
    }
    content.push(b.createPageBreak());

    // ═══════════════════════════════════════════════════════════════════════
    // 4. SCOPE, REQUIREMENTS, AND LIMITATIONS
    // ═══════════════════════════════════════════════════════════════════════
    content.push(b.createHeading('4. Scope, Requirements, and Limitations', HeadingLevel.HEADING_1));
    content.push(b.createPara(
      `This document contains the necessary information to permit the implementation of the ${data.clientName} environment in the new cloud environment based on ${platformLabel}. ` +
      'It also contains the explanation of the migration processes and methodology for each of the services.'
    ));

    content.push(b.createHeading('4.1 In Scope', HeadingLevel.HEADING_2));
    content.push(b.createPara('This document should cover:'));
    if (data.scope.inScope.length > 0) {
      data.scope.inScope.forEach(item => content.push(b.createBullet(item)));
    } else {
      const defaultInScope = platform === 'aws' ? [
        'Creation of the new Landing Zones in AWS that will include Production and DR',
        'VPC design and implementation',
        'Subnet configuration across availability zones',
        'Transit Gateway deployment and route configuration',
        'Site-to-Site VPN tunnel establishment',
        'Security group and NACL rule implementation',
        'NAT Gateway and Internet Gateway deployment',
        'Setup connectivity between AWS and the current environment to permit migration',
        'Deployment of new servers for Greenfield migration of services',
        'Create a new Backup infrastructure based on AWS native services',
        'PSZ (Provider Service Zone) deployment with monitoring, automation, and management tools',
        'Network monitoring and logging configuration',
        'Documentation and knowledge transfer'
      ] : [
        'Creation of the new Landing Zones in Azure that will include Production and DR',
        'VNet design and implementation',
        'Subnet configuration across regions',
        'Virtual WAN / VNet Peering configuration',
        'Site-to-Site VPN establishment',
        'Setup connectivity between Azure and the current environment to permit migration',
        'Setup connectivity between both Azure environments, Production and DR',
        'Network Security Group (NSG) implementation',
        'Azure Firewall deployment',
        'Deployment of new servers for Greenfield migration of services',
        'Create a new Backup infrastructure based on Azure native services',
        'PSZ (Provider Service Zone) deployment with monitoring, automation, and management tools',
        'Network monitoring and logging configuration',
        'Documentation and knowledge transfer'
      ];
      defaultInScope.forEach(item => content.push(b.createBullet(item)));
    }

    content.push(b.createHeading('4.2 Out of Scope', HeadingLevel.HEADING_2));
    if (data.scope.outOfScope.length > 0) {
      data.scope.outOfScope.forEach(item => content.push(b.createBullet(item)));
    } else {
      const defaultOutOfScope = [
        'Application layer deployment and configuration',
        'Database migration and data transfer',
        'End-user device configuration',
        'Third-party software licensing and procurement',
        'Physical data center operations',
        'Business continuity and disaster recovery planning (unless specified)',
        'Remote connection systems not owned or managed by NTT DATA'
      ];
      defaultOutOfScope.forEach(item => content.push(b.createBullet(item)));
    }

    content.push(b.createHeading('4.3 Requirements', HeadingLevel.HEADING_2));
    if (data.requirements.length > 0) {
      content.push(b.createTable(
        ['Requirement ID', 'Scope', 'Requirement Description', 'HLD Definition'],
        data.requirements.slice(0, 15).map((req, i) => [`REQ-${String(i + 1).padStart(3, '0')}`, 'Infrastructure', req, 'Defined']),
        [1200, 1800, 4260, 2100]
      ));
    } else {
      content.push(b.createPara('Requirements will be documented based on client discovery sessions and SOW analysis.', { italics: true }));
    }

    content.push(b.createHeading('4.4 Assumptions', HeadingLevel.HEADING_2));
    if (data.assumptions.length > 0) {
      content.push(b.createTable(
        ['Assumption ID', 'Scope', 'Assumption Description', 'HLD Definition'],
        data.assumptions.slice(0, 15).map((a, i) => [`ASM-${String(i + 1).padStart(3, '0')}`, 'Infrastructure', a, 'Defined']),
        [1200, 1800, 4260, 2100]
      ));
    } else {
      const defaultAssumptions = [
        `The client has an active ${platformLabel} account with appropriate permissions`,
        'Network connectivity between on-premises and cloud is available or will be provisioned',
        'The client will provide necessary access credentials and permissions in a timely manner',
        'All required approvals and change management processes are handled by the client',
        'IP address ranges provided do not conflict with existing network infrastructure',
        'Depending on the kind of migration, versions of OS and applications will be maintained'
      ];
      content.push(b.createTable(
        ['Assumption ID', 'Scope', 'Assumption Description', 'HLD Definition'],
        defaultAssumptions.map((a, i) => [`ASM-${String(i + 1).padStart(3, '0')}`, 'Infrastructure', a, 'Defined']),
        [1200, 1800, 4260, 2100]
      ));
    }

    content.push(b.createHeading('4.5 Constraints', HeadingLevel.HEADING_2));
    if (data.constraints && data.constraints.length > 0) {
      content.push(b.createTable(
        ['Constraint ID', 'Scope', 'Constraint Description', 'HLD Definition'],
        data.constraints.map((c, i) => [
          c.id || `CON-${String(i + 1).padStart(3, '0')}`,
          c.scope || 'Infrastructure',
          c.description || c,
          c.hldDefinition || 'Defined'
        ]),
        [1200, 1800, 4260, 2100]
      ));
    } else {
      content.push(b.createTable(
        ['Constraint ID', 'Scope', 'Constraint Description', 'HLD Definition'],
        [
          ['CON-001', 'Infrastructure', 'All resources must be deployed within the designated cloud regions', 'Defined'],
          ['CON-002', 'Security', 'All communications must use encrypted protocols (TLS 1.2+)', 'Defined'],
          ['CON-003', 'Compliance', 'Infrastructure must comply with applicable regulatory requirements', 'Defined'],
          ['CON-004', 'Operations', 'Only supported software versions may be deployed in production', 'Defined'],
        ],
        [1200, 1800, 4260, 2100]
      ));
    }

    content.push(b.createHeading('4.6 Risks', HeadingLevel.HEADING_2));
    if (data.risks && data.risks.length > 0) {
      content.push(b.createTable(
        ['Risk ID', 'Scope', 'Risk Description', 'HLD Definition'],
        data.risks.map((r, i) => [
          r.id || `RSK-${String(i + 1).padStart(3, '0')}`,
          r.scope || 'Infrastructure',
          r.description || r,
          r.hldDefinition || 'To be assessed'
        ]),
        [1200, 1800, 4260, 2100]
      ));
    } else {
      content.push(b.createTable(
        ['Risk ID', 'Scope', 'Risk Description', 'HLD Definition'],
        [
          ['RSK-001', 'Migration', 'Application compatibility issues during cloud migration', 'To be assessed'],
          ['RSK-002', 'Network', 'Latency impact on critical applications during hybrid phase', 'To be assessed'],
          ['RSK-003', 'Security', 'Non-standard implementations requiring disclaimers', 'To be assessed'],
          ['RSK-004', 'Timeline', 'Dependencies on client-side actions impacting schedule', 'To be assessed'],
        ],
        [1200, 1800, 4260, 2100]
      ));
    }
    content.push(b.createPageBreak());

    // ═══════════════════════════════════════════════════════════════════════
    // 5. IMPLEMENTATION PLAN AND STRATEGY
    // ═══════════════════════════════════════════════════════════════════════
    content.push(b.createHeading('5. Implementation Plan and Strategy', HeadingLevel.HEADING_1));
    content.push(b.createPara(
      'The implementation follows a phased approach to ensure controlled deployment and risk mitigation. ' +
      'As a very high-level plan, the following technical tasks will take place:'
    ));
    content.push(b.createBullet(`Create basic cloud infrastructure in ${platformLabel}`));
    content.push(b.createBullet('Expand or adapt the basic infrastructure: Active Directory, Backup, Monitoring, Patching, and Management systems'));
    content.push(b.createBullet('Deploy VMs needed'));
    content.push(b.createBullet('Execute post installs'));
    content.push(b.createBullet('Quality Assurance for the entire infrastructure'));
    content.push(b.createBullet('Move systems to operations'));
    content.push(b.createBullet('Handover to customer and service go-live'));
    content.push(b.createInfoBox('Note',
      'The detailed task list will be provided during the project execution. The objective of this document is to provide high-level design information without detailed planning. All mentioned tasks will be repeated per system if needed.'
    ));

    content.push(b.createTable(
      ['Phase', 'Activities', 'Dependencies', 'Deliverables'],
      (data.migrationPlan && data.migrationPlan.phases && data.migrationPlan.phases.length > 0)
        ? data.migrationPlan.phases.map(p => [
            p.phase || '',
            p.activities || '',
            p.dependencies || '',
            p.deliverables || ''
          ])
        : [
        ['Phase 0: Landing Zone', `${platformLabel} Landing Zone Preparation (PSZ Deployment), Firewall and management systems`, 'Client approvals', 'Base infrastructure + PSZ'],
        ['Phase 1: Foundation', `Account setup, ${platform === 'aws' ? 'VPC' : 'VNet'} creation, IAM/RBAC configuration`, 'Phase 0 complete', 'Core infrastructure'],
        ['Phase 2: Networking', 'Subnet deployment, routing configuration, gateway setup', 'Phase 1 complete', 'Network infrastructure'],
        ['Phase 3: Connectivity', 'VPN tunnels, peering, private endpoints', 'Phase 2 complete', 'Hybrid connectivity'],
        ['Phase 4: Security', 'Firewall rules, monitoring, logging configuration', 'Phase 3 complete', 'Security controls'],
        ['Phase 5: Migration', 'Server migration (Lift & Shift / Greenfield), data replication', 'Phase 4 complete', 'Migrated workloads'],
        ['Phase 6: Testing', 'Connectivity validation, failover testing, performance testing, QA', 'Phase 5 complete', 'Test results'],
        ['Phase 7: Handover', 'Documentation, knowledge transfer, operational procedures', 'Phase 6 complete', 'Final documentation'],
      ],
      [2100, 3060, 1800, 2400]
    ));

    content.push(b.createHeading('5.1 Project RACI Matrix', HeadingLevel.HEADING_2));
    content.push(b.createInfoBox('RACI Matrix', 'R = Responsible, A = Accountable, C = Consulted, I = Informed. This matrix defines the roles and responsibilities for key project activities.'));

    // Helper to render a RACI sub-section from AI data or fall back to defaults
    const renderRaciSection = (title, headingLevel, aiData, defaults) => {
      content.push(b.createHeading(title, headingLevel));
      if (aiData && aiData.length > 0) {
        content.push(b.createTable(
          ['Task', 'NTT', 'Customer'],
          aiData.map(item => [item.task || '', item.ntt || '', item.customer || '']),
          [4800, 2280, 2280]
        ));
      } else {
        content.push(b.createTable(
          ['Task', 'NTT', 'Customer'],
          defaults,
          [4800, 2280, 2280]
        ));
      }
    };

    renderRaciSection('5.1.1 Infrastructure and Licenses', HeadingLevel.HEADING_3,
      data.raci.infrastructureAndLicenses,
      [
        ['Cloud Account/Subscription Setup', 'R', 'A'],
        ['License Procurement', 'C', 'R/A'],
        ['Infrastructure Provisioning', 'R', 'A'],
        ['Network Configuration', 'R', 'A'],
      ]
    );

    renderRaciSection('5.1.2 Professional Services', HeadingLevel.HEADING_3,
      data.raci.professionalServices,
      [
        ['Solution Design', 'R/A', 'C'],
        ['Implementation Execution', 'R', 'A'],
        ['Security Implementation', 'R', 'A'],
        ['Documentation', 'R', 'A'],
      ]
    );

    renderRaciSection('5.1.3 Deployment Activities', HeadingLevel.HEADING_3,
      data.raci.deploymentActivities,
      [
        ['VM Deployment', 'R', 'A'],
        ['OS Configuration', 'R', 'A'],
        ['Application Deployment', 'C', 'R/A'],
        ['Data Migration', 'R', 'A'],
      ]
    );

    renderRaciSection('5.1.4 Acceptance Testing Activities', HeadingLevel.HEADING_3,
      data.raci.acceptanceTesting,
      [
        ['Infrastructure Testing', 'R', 'A'],
        ['Application Testing', 'C', 'R/A'],
        ['Security Validation', 'R', 'A'],
        ['UAT Sign-off', 'I', 'R/A'],
      ]
    );

    renderRaciSection('5.1.5 Ongoing Service Activities', HeadingLevel.HEADING_3,
      data.raci.ongoingServices,
      [
        ['Monitoring', 'R', 'I'],
        ['Patching', 'R', 'A'],
        ['Backup Management', 'R', 'A'],
        ['Incident Management', 'R', 'A'],
        ['Change Management', 'R', 'A'],
      ]
    );
    content.push(b.createPageBreak());

    // ═══════════════════════════════════════════════════════════════════════
    // 6. SOLUTION ARCHITECTURE
    // ═══════════════════════════════════════════════════════════════════════
    content.push(b.createHeading('6. Solution Architecture', HeadingLevel.HEADING_1));

    content.push(b.createHeading('6.1 The Solution', HeadingLevel.HEADING_2));
    content.push(b.createPara(
      `The solution deploys a comprehensive ${platformLabel} cloud infrastructure for ${data.clientName}. ` +
      `The architecture is designed following the hub-and-spoke model with distinct security zones including ` +
      `Customer Security Zone (CSZ), Provider Service Zone (PSZ), and Administration Management Zone (AMZ).`
    ));

    content.push(b.createHeading('6.2 Architecture Diagram', HeadingLevel.HEADING_2));
    content.push(b.createInfoBox('Architecture Diagram',
      `Insert the solution architecture diagram here. The diagram should illustrate the network topology, component placement, security zones (CSZ, PSZ, AMZ), and connectivity flows. ` +
      `Use draw.io, Lucidchart, or ${platformLabel} native diagramming tools. A separate diagram can be used for each environment or a combined diagram if components are not numerous.`
    ));
    content.push(b.createPara('[Architecture Diagram Placeholder]', { italics: true, color: "999999" }));

    content.push(b.createHeading('6.3 Component Overview', HeadingLevel.HEADING_2));
    content.push(b.createPara('The following table summarizes the key components of the solution architecture:'));
    if (platform === 'aws') {
      content.push(b.createTable(
        ['Component', 'AWS Service', 'Purpose', 'Quantity'],
        [
          ['Virtual Network', 'Amazon VPC', 'Network isolation and segmentation', '1+'],
          ['Routing Hub', 'Transit Gateway', 'Centralized route management', '1'],
          ['Internet Access', 'Internet Gateway', 'Public internet connectivity', '1 per VPC'],
          ['NAT', 'NAT Gateway', 'Outbound internet for private subnets', '1+ per AZ'],
          ['VPN', 'Site-to-Site VPN', 'Hybrid cloud connectivity', 'As required'],
          ['Firewall', 'Security Groups / NACLs', 'Network access control', 'Per resource'],
          ['Monitoring', 'CloudWatch', 'Infrastructure monitoring', '1'],
          ['Audit', 'CloudTrail', 'API activity logging', '1'],
          ['Backup', 'AWS Backup', 'Centralized backup management', '1'],
          ['IaC', 'Terraform / CloudFormation', 'Infrastructure as Code', '1'],
        ],
        [1800, 2100, 3360, 1200]
      ));
    } else {
      content.push(b.createTable(
        ['Component', 'Azure Service', 'Purpose', 'Quantity'],
        [
          ['Virtual Network', 'Azure VNet', 'Network isolation and segmentation', '1+'],
          ['Routing Hub', 'Virtual WAN / VNet Peering', 'Centralized route management', '1'],
          ['Firewall', 'Azure Firewall', 'Network traffic filtering', '1+'],
          ['NAT', 'NAT Gateway', 'Outbound internet for private subnets', '1+ per region'],
          ['VPN', 'VPN Gateway', 'Hybrid cloud connectivity', 'As required'],
          ['Access Control', 'Network Security Groups', 'Network access control', 'Per subnet'],
          ['Monitoring', 'Azure Monitor', 'Infrastructure monitoring', '1'],
          ['Security', 'Microsoft Sentinel', 'Security analytics', '1'],
          ['Backup', 'Recovery Service Vaults', 'Centralized backup management', '1+'],
          ['IaC', 'Terraform', 'Infrastructure as Code', '1'],
        ],
        [1800, 2400, 3060, 1200]
      ));
    }

    content.push(b.createHeading('6.4 Software Components, Versions, and Licenses', HeadingLevel.HEADING_2));
    if (data.softwareComponents && data.softwareComponents.length > 0) {
      content.push(b.createTable(
        ['Area', 'Product', 'Version', 'License Type', 'Responsible', 'EoS/EoL'],
        data.softwareComponents.map(sc => [
          sc.area || '', sc.product || '', sc.version || 'TBD',
          sc.licenseType || 'TBD', sc.responsible || 'TBD', 'TBD'
        ]),
        [1560, 1920, 1200, 1680, 1560, 1440]
      ));
    } else {
      content.push(b.createTable(
        ['Area', 'Product', 'Version', 'License Type', 'Responsible', 'EoS/EoL'],
        [
          ['Operating System', 'Windows Server 2022', 'Latest SP', 'Pay as Go / Reserved', 'NTT / Customer', 'TBD'],
          ['Operating System', platform === 'aws' ? 'Amazon Linux 2023' : 'Ubuntu Linux 22.04', 'Latest', 'Pay as Go / Reserved', 'NTT / Customer', 'TBD'],
          ['Monitoring', 'LogicMonitor', 'Latest', 'SaaS', 'NTT', 'N/A'],
          ['Automation', 'SaltStack / Ansible', 'Latest', 'Open Source', 'NTT', 'N/A'],
          ['IaC', 'Terraform', 'Latest', 'Open Source', 'NTT', 'N/A'],
          ['Database', 'SQL Server / PostgreSQL', 'TBD', 'Pay as Go / Reserved', 'Customer', 'TBD'],
        ],
        [1560, 1920, 1200, 1680, 1560, 1440]
      ));
    }
    content.push(b.createPageBreak());

    // ═══════════════════════════════════════════════════════════════════════
    // 7. NAMING CONVENTION
    // ═══════════════════════════════════════════════════════════════════════
    content.push(b.createHeading('7. Naming Convention', HeadingLevel.HEADING_1));
    content.push(b.createPara(
      'A basic part of any architecture design is the choice of naming styles and components. Solid naming conventions make designs easier to implement and understand in a collaborative environment. ' +
      'It is also important that component names enable system operations where filters, scripts, and grouping are often used.'
    ));
    content.push(b.createPara('The goals of the naming convention are:', { spaceBefore: 120 }));
    content.push(b.createBullet('Consistency'));
    content.push(b.createBullet('Clarity'));
    content.push(b.createBullet('Meaning'));
    content.push(b.createBullet('Ability to follow an "order of operations" type structure'));
    content.push(b.createBullet('Use the same case for all names when possible'));

    content.push(b.createHeading('7.1 Cloud Naming and Tagging', HeadingLevel.HEADING_2));

    content.push(b.createHeading('7.1.1 Cloud Resources Naming', HeadingLevel.HEADING_3));
    content.push(b.createInfoBox('Naming Format',
      platform === 'aws'
        ? 'Format: {project}-{environment}-{region}-{resource-type}-{identifier}  Example: ' + projShort + '-prod-apse1-vpc-001'
        : 'Format: {project}-{environment}-{region}-{resource-type}-{identifier}  Example: ' + projShort + '-prod-sea-vnet-001'
    ));
    if (platform === 'aws') {
      content.push(b.createTable(
        ['Resource Type', 'Abbreviation', 'Example'],
        [
          ['VPC', 'vpc', `${projShort}-prod-apse1-vpc-001`],
          ['Subnet', 'sn', `${projShort}-prod-apse1-sn-pub-001`],
          ['Security Group', 'sg', `${projShort}-prod-apse1-sg-web-001`],
          ['Transit Gateway', 'tgw', `${projShort}-prod-apse1-tgw-001`],
          ['NAT Gateway', 'natgw', `${projShort}-prod-apse1-natgw-001`],
          ['Route Table', 'rt', `${projShort}-prod-apse1-rt-pub-001`],
          ['VPN Gateway', 'vpngw', `${projShort}-prod-apse1-vpngw-001`],
          ['S3 Bucket', 's3', `${projShort}-prod-apse1-s3-backup-001`],
          ['EC2 Instance', 'ec2', `${projShort}-prod-apse1-ec2-web-001`],
          ['IAM Role', 'role', `${projShort}-prod-role-ec2-ssm`],
        ],
        [2400, 2100, 4860]
      ));
    } else {
      content.push(b.createTable(
        ['Resource Type', 'Abbreviation', 'Example'],
        [
          ['Virtual Network', 'vnet', `${projShort}-prod-sea-vnet-001`],
          ['Subnet', 'sn', `${projShort}-prod-sea-sn-pub-001`],
          ['NSG', 'nsg', `${projShort}-prod-sea-nsg-web-001`],
          ['Resource Group', 'rg', `${projShort}-prod-sea-rg-001`],
          ['VPN Gateway', 'vpngw', `${projShort}-prod-sea-vpngw-001`],
          ['Azure Firewall', 'afw', `${projShort}-prod-sea-afw-001`],
          ['Route Table', 'rt', `${projShort}-prod-sea-rt-pub-001`],
          ['Storage Account', 'st', `${projShort}prodseast001`],
          ['Virtual Machine', 'vm', `${projShort}-prod-sea-vm-web-001`],
          ['Recovery Vault', 'rsv', `${projShort}-prod-sea-rsv-001`],
        ],
        [2400, 2100, 4860]
      ));
    }

    content.push(b.createHeading('7.1.2 Cloud Resources Tagging', HeadingLevel.HEADING_3));
    content.push(b.createPara('All resources must be tagged with the following mandatory tags for operational and cost management:'));
    content.push(b.createTable(
      ['Tag Key', 'Description', 'Example Value'],
      [
        ['Project', 'Project name identifier', data.projectName],
        ['Environment', 'Deployment environment', 'Production / Staging / Development'],
        ['Owner', 'Resource owner or team', 'NTT / Customer'],
        ['CostCenter', 'Cost allocation center', '[Cost Center ID]'],
        ['ManagedBy', 'Management team', 'NTT DATA'],
        ['CreatedDate', 'Date of resource creation', today],
        ['Application', 'Application supported', '[Application Name]'],
      ],
      [2400, 3960, 3000]
    ));

    content.push(b.createHeading('7.2 Active Directory Domain Naming', HeadingLevel.HEADING_3));
    content.push(b.createPara('Active Directory domain naming follows the customer\'s existing domain naming standard. The domain structure will be determined during the discovery phase.'));

    content.push(b.createHeading('7.3 Hostname Naming', HeadingLevel.HEADING_3));
    content.push(b.createPara('Server hostnames follow a standardized convention for easy identification:'));
    content.push(b.createInfoBox('Hostname Format', 'Format: {project}{env}{role}{seq}  Example: ' + projShort + 'prodweb01'));

    content.push(b.createHeading('7.4 Service and Admin Users Naming', HeadingLevel.HEADING_3));
    content.push(b.createPara('Service accounts and administrative users follow naming conventions for consistency and auditability:'));
    content.push(b.createTable(
      ['Account Type', 'Naming Pattern', 'Example'],
      [
        ['Service Account', 'svc-{application}-{purpose}', 'svc-monitoring-readonly'],
        ['Admin Account', 'adm-{firstname}-{lastname}', 'adm-john-doe'],
        ['Break Glass Account', 'bg-{project}-{seq}', `bg-${projShort}-01`],
        ['PAM Managed Account', 'nttrmadm / nttrmadm2', 'nttrmadm'],
      ],
      [2400, 3000, 3960]
    ));
    content.push(b.createPageBreak());

    // ═══════════════════════════════════════════════════════════════════════
    // 8. NTT MANAGEMENT AMZ OVERVIEW
    // ═══════════════════════════════════════════════════════════════════════
    content.push(b.createHeading('8. NTT Management AMZ Overview', HeadingLevel.HEADING_1));
    content.push(b.createPara(
      'The Administration Management Zone (AMZ) is the NTT DATA secure management environment that provides centralized administration, privileged access, and operational tooling for managing customer infrastructure.'
    ));

    content.push(b.createHeading('8.1 Features', HeadingLevel.HEADING_2));
    content.push(b.createBullet('Centralized administration of all managed customer environments'));
    content.push(b.createBullet('Secure privileged access through PAM (Privileged Access Management)'));
    content.push(b.createBullet('Session recording and audit trail for all administrative access'));
    content.push(b.createBullet('Automated password rotation and credential management'));
    content.push(b.createBullet('Integration with ServiceNow for ITSM workflows'));

    content.push(b.createHeading('8.2 How Does AMZ Work?', HeadingLevel.HEADING_2));
    content.push(b.createPara(
      'NTT DATA engineers connect to customer environments in a secure way using the PAM solution hosted in the AMZ. ' +
      'All connections use the AMZ connection pool servers with user access control and session recording. ' +
      'A jump server is in place for non-standard services.'
    ));
    content.push(b.createInfoBox('AMZ Connectivity',
      `Direct connectivity from AMZ to customer workloads requires the following ports: SSH TCP 22, RDP TCP 3389, WinRM TCP 5986, LDAPS TCP 636, ICMP. ` +
      'These ports are required by the PAM master nodes for session manager and job manager.'
    ));

    content.push(b.createHeading('8.3 Role-based Access Control', HeadingLevel.HEADING_2));
    content.push(b.createPara(
      `Access to ${platformLabel} resources is controlled through role-based access control (RBAC). ` +
      `${platform === 'aws' ? 'AWS IAM policies' : 'Azure RBAC roles'} are assigned based on the principle of least privilege. ` +
      'All administrative access is routed through the AMZ for audit and compliance purposes.'
    ));

    content.push(b.createHeading('8.4 Privileged Access Management (PAM)', HeadingLevel.HEADING_2));
    content.push(b.createPara(
      'Privileged Access Management solution (XTAM) is used to access customer environments and services. ' +
      'It is an agentless account and password vault, session monitoring and task execution enterprise solution.'
    ));

    content.push(b.createHeading('8.4.1 Privileged Account Management', HeadingLevel.HEADING_3));
    content.push(b.createBullet('Strong password requirements with automated password rotation'));
    content.push(b.createBullet('"No password access" built into core - engineers never see actual credentials'));
    content.push(b.createBullet('Identity Vault to secure, organize and share privileged account access'));
    content.push(b.createBullet('Customer-specific vaults and individual personal vaults'));

    content.push(b.createHeading('8.4.2 Privileged Session Management', HeadingLevel.HEADING_3));
    content.push(b.createBullet('Secure, interactive remote sessions within standard web browser or native SSH clients'));
    content.push(b.createBullet('Video, Keystroke, and Clipboard recording'));
    content.push(b.createBullet('Workflow approval and Command Control'));
    content.push(b.createBullet('Robust event tracking and reporting with one year retention'));

    content.push(b.createHeading('8.4.3 Privileged Job Management', HeadingLevel.HEADING_3));
    content.push(b.createBullet('Automated task execution for routine maintenance'));
    content.push(b.createBullet('Scheduled credential rotation'));
    content.push(b.createBullet('Integration with ITSM for automated incident response'));

    content.push(b.createHeading('8.5 PAM Infrastructure Requirements', HeadingLevel.HEADING_2));
    content.push(b.createTable(
      ['Parameter', 'Specification'],
      [
        ['Operating System', 'Ubuntu 20.04 LTS'],
        ['CPU', '2 vCPU'],
        ['RAM', '4 GB'],
        ['OS Disk', '30 GB'],
        ['PAM Data Disk', '20 GB (/opt/xtam)'],
      ],
      [3600, 5760]
    ));

    content.push(b.createHeading('8.6 PAM Connectivity Requirements', HeadingLevel.HEADING_2));
    content.push(b.createTable(
      ['From', 'To', 'Ports / Protocols', 'Description'],
      [
        ['NTT DATA AMZ IPs', 'Customer Workloads', 'SSH TCP 22, RDP TCP 3389, WinRM TCP 5986, LDAPS TCP 636, ICMP', 'PAM session manager and job manager'],
        ['NTT DATA AMZ IPs', 'Customer XTAM Remote Nodes', 'SSH TCP 22, HTTP Proxy TCP 8081, XTAM TCP 4822, ICMP', 'Access from AMZ to remote nodes'],
        ['Customer XTAM Remote Nodes', 'Customer Workloads', 'SSH TCP 22, RDP TCP 3389, WinRM TCP 5986, LDAPS TCP 636, ICMP', 'Session and job manager ports'],
        ['XTAM Remote Servers', 'bin.xtontech.com', 'HTTPS TCP 443', 'XTAM setup and updates'],
      ],
      [2100, 2100, 3060, 2100]
    ));

    content.push(b.createHeading('8.7 Compliance', HeadingLevel.HEADING_2));
    content.push(b.createPara(
      'All AMZ operations comply with customer, industry, and government regulations. Session recordings and credential management meet audit requirements for SOC2, ISO 27001, PCI-DSS, and GDPR compliance frameworks.'
    ));
    content.push(b.createPageBreak());

    // ═══════════════════════════════════════════════════════════════════════
    // 9. INFRASTRUCTURE ARCHITECTURE
    // ═══════════════════════════════════════════════════════════════════════
    content.push(b.createHeading('9. Infrastructure Architecture', HeadingLevel.HEADING_1));

    content.push(b.createHeading('9.1 Overview', HeadingLevel.HEADING_2));
    content.push(b.createPara(
      `This section details the ${platformLabel} infrastructure components, networking, compute, storage, and identity services that form the foundation of the solution.`
    ));

    content.push(b.createHeading(`9.2 ${platformLabel} Basics`, HeadingLevel.HEADING_2));
    if (platform === 'aws') {
      content.push(b.createPara(
        'Amazon Web Services (AWS) provides a comprehensive cloud platform with global data center infrastructure. ' +
        'The solution leverages AWS regions and availability zones for high availability and disaster recovery.'
      ));
    } else {
      content.push(b.createPara(
        'Microsoft Azure provides a comprehensive cloud platform with global data center infrastructure. ' +
        'The solution leverages Azure regions and availability zones for high availability and disaster recovery.'
      ));
    }

    content.push(b.createHeading(`9.3 ${platformLabel} Diagram`, HeadingLevel.HEADING_2));
    content.push(b.createInfoBox(`${platformLabel} Infrastructure Diagram`,
      `Insert the ${platformLabel} infrastructure diagram showing the detailed layout of all cloud components, security zones, and connectivity. ` +
      'Relationship with external entities should be drawn on the diagram if they are part of the solution.'
    ));
    content.push(b.createPara(`[${platformLabel} Infrastructure Diagram Placeholder]`, { italics: true, color: "999999" }));

    content.push(b.createHeading(`9.4 ${platformLabel} Regions`, HeadingLevel.HEADING_2));
    content.push(b.createTable(
      ['Environment', 'Region', 'Purpose'],
      [
        ['Production', data.projectDetails.region || (platform === 'aws' ? 'ap-southeast-1' : 'Southeast Asia'), 'Primary production workloads'],
        ['Disaster Recovery', '[DR Region]', 'Business continuity and DR'],
      ],
      [2400, 3360, 3600]
    ));

    // 9.5 Network
    content.push(b.createHeading('9.5 Network', HeadingLevel.HEADING_2));

    content.push(b.createHeading(`9.5.1 ${platform === 'aws' ? 'Amazon VPC' : 'Azure Virtual Network'}`, HeadingLevel.HEADING_3));
    content.push(b.createPara(
      `The network design implements a hub-and-spoke topology using ${platform === 'aws' ? 'AWS Transit Gateway' : 'Azure Virtual WAN'} as the central routing hub. ` +
      'This provides centralized traffic management, simplified connectivity, and consistent security policy enforcement.'
    ));

    content.push(b.createHeading(`9.5.2 ${platform === 'aws' ? 'VPC Subnets' : 'Azure Subnets'}`, HeadingLevel.HEADING_3));
    content.push(b.createPara('Subnets are segmented by function and security zone. The following subnet types are deployed:'));
    content.push(b.createBullet('Public Subnets - Internet-facing resources (load balancers, bastion hosts)'));
    content.push(b.createBullet('Private Subnets - Application tier workloads'));
    content.push(b.createBullet('Management Subnets - Management and monitoring tools'));
    content.push(b.createBullet(`PSZ Subnets - Provider Service Zone (monitoring, automation, jump servers)`));
    if (platform === 'aws') {
      content.push(b.createBullet('TGW Subnets - Transit Gateway attachments'));
    } else {
      content.push(b.createBullet('AzureFirewallSubnet - Dedicated subnet for Azure Firewall'));
      content.push(b.createBullet('GatewaySubnet - Dedicated subnet for VPN Gateway'));
    }

    content.push(b.createHeading(`9.5.3 ${platform === 'aws' ? 'VPN Gateways' : 'Azure VPN Gateways'}`, HeadingLevel.HEADING_3));
    content.push(b.createPara('VPN connectivity provides secure hybrid cloud connectivity between on-premises infrastructure and the cloud environment.'));
    if (data.vpnConnections.length > 0) {
      data.vpnConnections.forEach(vpn => content.push(b.createBullet(vpn)));
    } else {
      content.push(b.createPara('VPN tunnel specifications will be finalized during the detailed design phase.', { italics: true }));
    }

    content.push(b.createHeading('9.5.4 Firewall', HeadingLevel.HEADING_3));
    content.push(b.createPara(
      platform === 'aws'
        ? 'AWS Network Firewall and/or third-party firewall appliances (e.g., FortiGate) provide stateful traffic inspection, IPS/IDS, and application-layer filtering.'
        : 'Azure Firewall and/or third-party Network Virtual Appliances (NVAs) provide stateful traffic inspection, IPS/IDS, and application-layer filtering.'
    ));

    content.push(b.createHeading(`9.5.5 ${platform === 'aws' ? 'Security Groups / NACLs' : 'Azure Network Security Groups'}`, HeadingLevel.HEADING_3));
    content.push(b.createPara(
      platform === 'aws'
        ? 'Security Groups provide stateful instance-level firewall rules. NACLs provide stateless subnet-level access control as an additional defense layer.'
        : 'Network Security Groups (NSGs) contain security rules that allow or deny inbound/outbound traffic. Rules are evaluated by priority (lower number = higher priority).'
    ));

    content.push(b.createHeading('9.5.6 IP Address Allocation', HeadingLevel.HEADING_3));

    content.push(b.createHeading('Production Site', HeadingLevel.HEADING_3));
    if (data.networkRanges.length > 0) {
      content.push(b.createTable(
        ['CIDR Block', 'Purpose', 'Environment'],
        data.networkRanges.map(cidr => [cidr, 'To be determined', 'Production']),
        [2400, 4560, 2400]
      ));
    } else {
      content.push(b.createPara('IP address allocation for Production site will be determined during the detailed design phase.', { italics: true }));
    }

    content.push(b.createHeading('DR Site', HeadingLevel.HEADING_3));
    content.push(b.createPara('IP address allocation for DR site will be determined during the detailed design phase.', { italics: true }));

    content.push(b.createHeading('9.5.7 NTP Configuration', HeadingLevel.HEADING_3));
    content.push(b.createPara(
      platform === 'aws'
        ? 'Amazon Time Sync Service provides a reliable NTP source accessible from within the VPC via the link-local address 169.254.169.123. All instances will synchronize time using this service.'
        : 'Azure VMs use the Hyper-V host time synchronization by default. For domain-joined machines, Active Directory domain controllers serve as the NTP source.'
    ));

    content.push(b.createHeading('9.5.8 DNS and Name Resolution', HeadingLevel.HEADING_3));
    content.push(b.createPara(
      platform === 'aws'
        ? 'Amazon Route 53 Resolver provides DNS resolution within the VPC. Private Hosted Zones are used for internal name resolution. DNS forwarding rules are configured for hybrid DNS resolution with on-premises infrastructure.'
        : 'Azure DNS provides name resolution within the VNet. Azure Private DNS Zones are used for internal and Private Endpoint name resolution. Conditional forwarding is configured for hybrid DNS resolution.'
    ));
    content.push(b.createInfoBox('Note', 'Host file will not be used unless a critical incident is raised and only as a workaround measure.'));

    // 9.6 Storage
    content.push(b.createHeading(`9.6 ${platform === 'aws' ? 'AWS Storage' : 'Azure Storage'}`, HeadingLevel.HEADING_2));

    content.push(b.createHeading(`9.6.1 ${platform === 'aws' ? 'S3 Buckets / EBS Volumes' : 'Storage Accounts'}`, HeadingLevel.HEADING_3));
    if (platform === 'aws') {
      content.push(b.createTable(
        ['Storage Type', 'Name', 'Purpose', 'Replication', 'Encryption'],
        [
          ['S3 Bucket', `${projShort}-prod-backup`, 'Backup storage', 'Cross-Region', 'SSE-KMS'],
          ['S3 Bucket', `${projShort}-prod-logs`, 'Log archival', 'Same-Region', 'SSE-S3'],
          ['EBS', 'Application volumes', 'Server storage', 'Within AZ', 'KMS encrypted'],
        ],
        [1560, 2160, 1920, 1560, 2160]
      ));
    } else {
      content.push(b.createTable(
        ['Storage Account', 'Kind', 'Replication', 'Resource Group', 'Description'],
        [
          [`${projShort}prodst001`, 'StorageV2', 'GRS', `${projShort}-rg`, 'Production data storage'],
          [`${projShort}prodstbkp`, 'StorageV2', 'GRS', `${projShort}-rg`, 'Backup storage'],
          [`${projShort}prodstlog`, 'StorageV2', 'LRS', `${projShort}-rg`, 'Diagnostics and log storage'],
        ],
        [1920, 1440, 1200, 1800, 3000]
      ));
    }

    // 9.7 Compute
    content.push(b.createHeading(`9.7 ${platform === 'aws' ? 'AWS Compute' : 'Azure Compute'}`, HeadingLevel.HEADING_2));

    content.push(b.createHeading('9.7.1 Available VM Profiles and Templates', HeadingLevel.HEADING_3));
    if (platform === 'aws') {
      content.push(b.createTable(
        ['Type', 'Instance Families', 'Description'],
        [
          ['General Purpose', 'T3, M5, M6i, M7i', 'Balanced CPU-to-memory ratio. Ideal for web servers, small/medium databases.'],
          ['Compute Optimized', 'C5, C6i, C7i', 'High CPU-to-memory ratio. Good for batch processing, application servers.'],
          ['Memory Optimized', 'R5, R6i, R7i, X2idn', 'High memory-to-CPU ratio. Great for databases, in-memory analytics.'],
          ['Storage Optimized', 'I3, I3en, D3', 'High disk throughput and IO. Ideal for big data, data warehousing.'],
          ['Accelerated Computing', 'P4, G5, Inf1', 'GPU-based instances for ML/AI and graphic rendering.'],
        ],
        [2400, 2760, 4200]
      ));
    } else {
      content.push(b.createTable(
        ['Type', 'Sizes', 'Description'],
        [
          ['General Purpose', 'B, Dsv3, Dv3, Dasv4, Dav4, Dv5, Dsv5', 'Balanced CPU-to-memory ratio. Ideal for testing, small-medium databases, low-medium traffic web servers.'],
          ['Compute Optimized', 'F, Fs, Fsv2, FX', 'High CPU-to-memory ratio. Good for medium traffic web servers, batch processes, application servers.'],
          ['Memory Optimized', 'Esv3, Ev3, Easv4, Eav4, Ev5, Esv5, Mv2', 'High memory-to-CPU ratio. Great for relational databases, large caches, in-memory analytics.'],
          ['Storage Optimized', 'Lsv2, Lsv3, Lasv3', 'High disk throughput and IO. Ideal for Big Data, SQL, NoSQL databases.'],
          ['GPU', 'NC, NCv3, ND, NV, NVv4', 'Specialized VMs for heavy graphic rendering and deep learning.'],
          ['High Performance', 'HB, HBv3, HC', 'Fastest CPU virtual machines with optional RDMA network interfaces.'],
        ],
        [2400, 2760, 4200]
      ));
    }

    content.push(b.createHeading('9.7.2 Instances - Production Site', HeadingLevel.HEADING_3));
    const prodServers = (data.servers || []).filter(s => s.environment !== 'DR');
    if (prodServers.length > 0) {
      content.push(b.createTable(
        ['Hostname', 'Description', `${platformLabel} Size`, 'OS', 'vCPU', 'Memory (GiB)'],
        prodServers.map(s => [
          s.hostname || '[TBD]', s.description || s.role || '', s.storage || '[Instance type]',
          s.os || '[OS Version]', s.vcpu || '[vCPU]', s.memory || '[RAM]'
        ]),
        [1560, 1920, 1560, 1560, 1080, 1080]
      ));
    } else {
      content.push(b.createTable(
        ['Hostname', 'Description', `${platformLabel} Size`, 'OS', 'vCPU', 'Memory (GiB)'],
        [
          ['[To be defined]', '[Server role]', '[Instance type]', '[OS Version]', '[vCPU]', '[RAM]'],
        ],
        [1560, 1920, 1560, 1560, 1080, 1080]
      ));
      content.push(b.createInfoBox('Note', 'Server specifications will be finalized after the HLD is approved and detailed sizing is completed.'));
    }

    content.push(b.createHeading('9.7.3 Instances - DR Site', HeadingLevel.HEADING_3));
    const drServers = (data.servers || []).filter(s => s.environment === 'DR');
    if (drServers.length > 0) {
      content.push(b.createTable(
        ['Hostname', 'Description', `${platformLabel} Size`, 'OS', 'vCPU', 'Memory (GiB)'],
        drServers.map(s => [
          s.hostname || '[TBD]', s.description || s.role || '', s.storage || '[Instance type]',
          s.os || '[OS Version]', s.vcpu || '[vCPU]', s.memory || '[RAM]'
        ]),
        [1560, 1920, 1560, 1560, 1080, 1080]
      ));
    } else {
      content.push(b.createTable(
        ['Hostname', 'Description', `${platformLabel} Size`, 'OS', 'vCPU', 'Memory (GiB)'],
        [
          ['[To be defined]', '[Server role]', '[Instance type]', '[OS Version]', '[vCPU]', '[RAM]'],
        ],
        [1560, 1920, 1560, 1560, 1080, 1080]
      ));
    }

    content.push(b.createHeading(`9.7.4 ${platform === 'aws' ? 'Availability Zones' : 'Availability Zones'}`, HeadingLevel.HEADING_3));
    if (platform === 'aws') {
      content.push(b.createPara(
        'AWS Availability Zones are physically separate locations within each AWS region that are tolerant to local failures. ' +
        'To ensure resiliency, a minimum of two availability zones are used for critical workloads.'
      ));
    } else {
      content.push(b.createPara(
        'Azure Availability Zones are physically separate locations within each Azure region tolerant to local failures. ' +
        'Failures can range from software and hardware failures to events such as earthquakes, floods, and fires. ' +
        'To ensure resiliency, a minimum of three separate availability zones are present in all enabled regions.'
      ));
    }

    content.push(b.createHeading(`9.7.5 ${platform === 'aws' ? 'Placement Groups' : 'Availability Sets'}`, HeadingLevel.HEADING_3));
    if (platform === 'aws') {
      content.push(b.createPara(
        'Placement groups control how instances are placed on underlying hardware. Spread placement groups distribute instances across distinct hardware to reduce correlated failures.'
      ));
    } else {
      content.push(b.createPara(
        'An availability set is a logical grouping of VMs that allows Azure to understand how your application is built to provide for redundancy and availability. ' +
        'Two or more VMs created within an availability set provide a highly available application meeting the 99.95% Azure SLA. ' +
        'There is no cost for the Availability Set itself.'
      ));
    }

    // 9.8 Identity and Security
    content.push(b.createHeading('9.8 Identity and Security', HeadingLevel.HEADING_2));
    content.push(b.createPara(
      platform === 'aws'
        ? 'AWS IAM provides identity and access management. AWS Organizations is used for multi-account governance. SSO integration with customer identity providers is configured as needed.'
        : `The subscription is under the designated Azure Active Directory tenant. Azure RBAC provides fine-grained access control to resources.`
    ));

    // 9.9 Other Objects/Services
    content.push(b.createHeading(`9.9 Other ${platformLabel} Objects/Services Required`, HeadingLevel.HEADING_2));
    content.push(b.createPara('Additional cloud-native services required for the project will be documented here based on workload requirements.', { italics: true }));

    // 9.10 Operating Systems
    content.push(b.createHeading('9.10 Operating Systems - OS Specific Settings', HeadingLevel.HEADING_2));
    content.push(b.createPara('Operating system specific configuration and hardening will be applied per NTT standards. Refer to the Security and Hardening section for details.'));
    content.push(b.createPageBreak());

    // ═══════════════════════════════════════════════════════════════════════
    // 10. SYSTEM CONTINUITY - BACKUP CONFIGURATION
    // ═══════════════════════════════════════════════════════════════════════
    content.push(b.createHeading('10. System Continuity - Backup Configuration', HeadingLevel.HEADING_1));
    content.push(b.createPara(
      'Backup will follow the standard backup recommendation from NTT and will have a combination of technologies to increase reliability and continuity.'
    ));

    content.push(b.createHeading('10.1 Backup Tools', HeadingLevel.HEADING_2));
    content.push(b.createPara(
      platform === 'aws'
        ? 'AWS Backup is the default tool for backups, providing centralized backup management across AWS services. Native embedded storage backup from multiple cloud services is also leveraged.'
        : 'Recovery Service Vaults is the Azure native tool and the main service used to back up the infrastructure using the snapshot functionality.'
    ));

    content.push(b.createHeading('10.2 Backup Infrastructure', HeadingLevel.HEADING_2));
    content.push(b.createPara(
      platform === 'aws'
        ? 'The backup infrastructure is provided by AWS Backup service with cross-region backup capabilities for DR purposes.'
        : 'The backup infrastructure is provided by Azure Recovery Service Vaults with geo-redundant storage for DR purposes.'
    ));

    content.push(b.createHeading('10.3 Data Types', HeadingLevel.HEADING_2));
    content.push(b.createPara('The following data types and components must be considered for backup:'));
    content.push(b.createBullet('Operating System - VM Servers'));
    content.push(b.createBullet('Databases'));
    content.push(b.createBullet('Disks / Volumes'));
    content.push(b.createBullet(platform === 'aws' ? 'S3 Buckets' : 'Storage Accounts'));
    content.push(b.createBullet('Application Configuration Files'));

    content.push(b.createHeading('10.4 Backup Policies', HeadingLevel.HEADING_2));
    content.push(b.createPara('The following retention policies are applied:'));
    if (data.backupRequirements && data.backupRequirements.policies && data.backupRequirements.policies.length > 0) {
      content.push(b.createTable(
        ['Backup Type', 'Frequency', 'Retention', 'Storage Tier'],
        data.backupRequirements.policies.map(p => [
          p.type || '', p.frequency || '', p.retention || '', p.tier || 'Standard'
        ]),
        [2400, 2160, 2160, 2640]
      ));
      if (data.backupRequirements.specialRequirements && data.backupRequirements.specialRequirements.length > 0) {
        content.push(b.createPara('Special backup requirements from SOW:', { spaceBefore: 120 }));
        data.backupRequirements.specialRequirements.forEach(req => content.push(b.createBullet(req)));
      }
    } else {
      content.push(b.createTable(
        ['Backup Type', 'Frequency', 'Retention', 'Storage Tier'],
        [
          ['Full VM Backup', 'Daily', '30 days', 'Standard'],
          ['Weekly Backup', 'Weekly (Sunday)', '12 weeks', 'Standard'],
          ['Monthly Backup', 'Monthly (1st)', '12 months', 'Archive'],
          ['Annual Backup', 'Yearly (Jan 1st)', '7 years', 'Archive'],
          ['Database Backup', 'Daily + Transaction Logs', '30 days', 'Standard'],
        ],
        [2400, 2160, 2160, 2640]
      ));
    }

    content.push(b.createHeading('10.5 Backup Sizing', HeadingLevel.HEADING_2));
    content.push(b.createPara('The backup sizing estimation will be calculated based on the total space currently protected. This will be finalized after server provisioning.', { italics: true }));

    content.push(b.createHeading('10.6 Backup Tests and Data Integrity', HeadingLevel.HEADING_2));
    content.push(b.createPara(
      'Backup verification and restore tests need to be conducted on a regular basis to ensure the backup policy is consistent. ' +
      'Restore tests will be scheduled quarterly to validate data integrity and recovery procedures.'
    ));

    content.push(b.createHeading('10.7 Backup Vaulting / Archiving', HeadingLevel.HEADING_2));
    content.push(b.createPara(
      platform === 'aws'
        ? 'Long-term backup data is automatically archived from S3 Standard to S3 Glacier after a configurable period (e.g., 6 months) for cost optimization.'
        : 'Long-term backup data is archived using Azure Backup Archive Tier for cost optimization. Recovery Service Vaults with GRS replication ensure cross-region protection.'
    ));
    content.push(b.createPageBreak());

    // ═══════════════════════════════════════════════════════════════════════
    // 11. PSZ - PROVIDER SERVICE ZONE
    // ═══════════════════════════════════════════════════════════════════════
    content.push(b.createHeading('11. PSZ - Provider Service Zone', HeadingLevel.HEADING_1));
    content.push(b.createPara(
      'The Provider Service Zone (PSZ) hosts the NTT DATA management and operational tooling required for infrastructure monitoring, automation, ' +
      'and administration. The PSZ is deployed within the customer\'s cloud environment in a dedicated management subnet.'
    ));

    // 11.1 Logic Monitor
    content.push(b.createHeading('11.1 Logic Monitor', HeadingLevel.HEADING_2));

    content.push(b.createHeading('11.1.1 Overview', HeadingLevel.HEADING_3));
    content.push(b.createPara(
      'NTT will use Logic Monitor as the primary monitoring tool for the new platforms. ' +
      'Logic Monitor is a SaaS-based monitoring and analytics platform which uses remote collectors to poll devices within platforms ' +
      'and send metadata to the cloud-based platform for reporting and analytics.'
    ));
    content.push(b.createPara('The Logic Monitor cloud portal provides:', { spaceBefore: 120 }));
    content.push(b.createBullet('Alerting and correlation'));
    content.push(b.createBullet('Dashboards and forecasting'));
    content.push(b.createBullet('Reporting'));
    content.push(b.createBullet('ServiceNow CMDB integration'));
    content.push(b.createPara(
      'All connections to the Logic Monitor cloud use HTTPS with TLS 1.2 encryption. All data stored is encrypted at rest using AES-256 encryption with a unique key per customer. ' +
      'The cloud portal is formally audited against SOC2 principles and information is handled in compliance with GDPR requirements.'
    ));
    content.push(b.createPara('Logic Monitor collectors support the following instrumentation protocols:', { spaceBefore: 120 }));
    content.push(b.createTable(
      ['Device', 'Protocol', 'Port'],
      [
        ['Windows Servers', 'WMI', 'TCP/135, TCP/24158'],
        ['Linux Servers', 'SSH, SNMPv3', 'TCP/22, UDP/161'],
        ['Network and Storage Devices', 'SSH, SNMPv3, HTTPS', 'TCP/22, UDP/161, TCP/443'],
        ['Any', 'ICMP (ping)', 'N/A'],
      ],
      [3000, 2760, 3600]
    ));

    content.push(b.createHeading('11.1.2 Design Principles', HeadingLevel.HEADING_3));
    content.push(b.createBullet('One Logic Monitor collector per region deployed as virtual machine in the PSZ'));
    content.push(b.createBullet('WMI monitoring will use privileged accounts by default'));
    content.push(b.createBullet('RBAC configured to provide access to relevant resources per customer'));
    content.push(b.createBullet('Portal supports 2FA and SAML IdP for authentication with IP whitelisting'));

    content.push(b.createHeading('11.1.3 Servers', HeadingLevel.HEADING_3));
    content.push(b.createTable(
      ['Server', 'Region', 'Operating System', 'vCPU', 'RAM (GB)', 'Disk'],
      [
        ['LMcollector-1', 'Production', 'Windows Server 2019 Std', '4', '8', '90 GB'],
        ['LMcollector-2', 'DR', 'Windows Server 2019 Std', '4', '8', '90 GB'],
      ],
      [1800, 1440, 2160, 960, 1080, 1080]
    ));

    content.push(b.createHeading('11.1.4 External Connectivity', HeadingLevel.HEADING_3));
    content.push(b.createTable(
      ['Source Server(s)', 'Destination', 'Reason'],
      [
        ['Logic Monitor Collectors', 'Logic Monitor Cloud', 'Monitoring data and configuration retrieval'],
        ['Logic Monitor Collectors', 'Qualys Cloud', 'Vulnerability and Compliance Scanning'],
        ['Logic Monitor Collectors', 'CrowdStrike', 'Antivirus reporting'],
        ['Logic Monitor Collectors', 'Windows Patching', 'Patch download from Microsoft'],
      ],
      [2760, 2760, 3840]
    ));

    // 11.2 Salt/Ansible (Automation)
    content.push(b.createHeading('11.2 Salt/Ansible (Automation)', HeadingLevel.HEADING_2));

    content.push(b.createHeading('11.2.1 Overview', HeadingLevel.HEADING_3));
    content.push(b.createPara(
      'The automation server is used for central management and remote command execution, patch management, automated QAs and audits, ' +
      'and compliance checks. These services are provided by SaltStack and Ansible, packed inside an NTT DATA managed docker image.'
    ));

    content.push(b.createHeading('11.2.2 Core Components', HeadingLevel.HEADING_3));
    content.push(b.createPara('Both Ansible and Salt obtain information (inventory or pillars) dynamically from the CMDB.'));

    content.push(b.createPara('SaltStack provides:', { label: 'SaltStack: ', spaceBefore: 120 }));
    content.push(b.createBullet('API with queue mechanism (ZeroMQ) linking automation stack with ITSM'));
    content.push(b.createBullet('ServiceNow CMDB enrichment for Windows and Linux servers'));
    content.push(b.createBullet('Patching execution orchestration for Windows and Linux servers'));
    content.push(b.createBullet('Automated incident and request response from ServiceNow platform'));

    content.push(b.createPara('Ansible provides:', { label: 'Ansible: ', spaceBefore: 120 }));
    content.push(b.createBullet('Quality Assurance of network, Windows and Linux devices against NTT, CIS1 and CIS2 standards'));
    content.push(b.createBullet('Systems Configuration Management'));
    content.push(b.createBullet('Network devices backup management'));
    content.push(b.createBullet('ServiceNow CMDB enrichment for Windows, Linux servers, and networking devices'));

    content.push(b.createHeading('11.2.3 Network Requirements', HeadingLevel.HEADING_3));
    content.push(b.createTable(
      ['Component', 'Ports', 'Description'],
      [
        ['Salt Master ↔ Minions', 'TCP 4505, 4506', 'AES-encrypted communication channel'],
        ['Salt API', 'TCP 8000', 'Must be reachable from NTT AMZ IPs'],
        ['Ansible → Linux/Network', 'TCP 22, 443', 'SSH and HTTPS access'],
        ['Ansible → Windows', 'TCP 5986', 'WinRM HTTPS access'],
      ],
      [2760, 2160, 4440]
    ));

    content.push(b.createHeading('11.2.4 Servers', HeadingLevel.HEADING_3));
    content.push(b.createTable(
      ['Server', 'Region', 'Operating System', 'vCPU', 'RAM (GB)', 'Disk'],
      [
        ['Automation Server', 'Production', 'Ubuntu 22.04', '6-8', '16', '60 GB + 30 GB (/var/lib/docker)'],
      ],
      [1800, 1440, 2160, 960, 1080, 2040]
    ));

    content.push(b.createHeading('11.2.5 External Connectivity', HeadingLevel.HEADING_3));
    content.push(b.createTable(
      ['Source Server(s)', 'Destination', 'Reason'],
      [
        ['Automation Server', 'Qualys Cloud', 'Vulnerability and Compliance Scanning'],
        ['Automation Server', 'CrowdStrike', 'Antivirus reporting'],
        ['Automation Server', 'Linux Patching Repos', 'Patch downloads'],
        ['Automation Server', platform === 'aws' ? 'ECR' : 'ACR', 'Docker image updates'],
        ['Automation Server', 'ServiceNow', 'CMDB enrichment'],
      ],
      [2760, 2760, 3840]
    ));

    // 11.3 Jump Server
    content.push(b.createHeading('11.3 Jump Server', HeadingLevel.HEADING_2));

    content.push(b.createHeading('11.3.1 Overview', HeadingLevel.HEADING_3));
    content.push(b.createPara(
      'Jump servers provide the ability for NTT to install tools for application management and connect to other servers and devices via RDP or SSH protocols.'
    ));

    content.push(b.createHeading('11.3.2 Design Principles', HeadingLevel.HEADING_3));
    content.push(b.createBullet('All jump servers deployed on Windows Server 2019 or later'));
    content.push(b.createBullet('Deployed in both Production and DR regions for redundancy'));
    content.push(b.createBullet('Hardened per NTT security standards'));

    content.push(b.createHeading('11.3.3 Servers', HeadingLevel.HEADING_3));
    content.push(b.createTable(
      ['Server', 'Region', 'Operating System', 'vCPU', 'RAM (GB)', 'Disk'],
      [
        ['Jump Server 1', 'Production', 'Windows Server 2019', '4', '8', '100 GB'],
        ['Jump Server 2', 'DR', 'Windows Server 2019', '4', '8', '100 GB'],
      ],
      [1800, 1440, 2160, 960, 1080, 1080]
    ));

    content.push(b.createHeading('11.3.4 External Connectivity', HeadingLevel.HEADING_3));
    content.push(b.createTable(
      ['Source Server(s)', 'Destination', 'Reason'],
      [
        ['Jump Servers', 'Qualys Cloud', 'Vulnerability and Compliance Scanning'],
        ['Jump Servers', 'CrowdStrike', 'Antivirus reporting'],
        ['Jump Servers', 'Windows Patching', 'Patch download from Microsoft'],
      ],
      [2760, 2760, 3840]
    ));
    content.push(b.createPageBreak());

    // ═══════════════════════════════════════════════════════════════════════
    // 12. PATCHING
    // ═══════════════════════════════════════════════════════════════════════
    content.push(b.createHeading('12. Patching', HeadingLevel.HEADING_1));
    content.push(b.createPara(
      'This section covers the tools and procedures for patching. The following principles apply to all system patching:'
    ));
    content.push(b.createBullet('Integration and Pre-production environments will usually be patched before Production'));
    content.push(b.createBullet('Security patches are applied on a daily basis to reduce risk'));
    content.push(b.createBullet('Standard patches are applied on a monthly basis'));
    content.push(b.createBullet('Emergency / critical patches are applied ad-hoc where required'));
    content.push(b.createBullet('When systems are redundant, patching is done with 1 hour offset between nodes to avoid general downtime'));

    content.push(b.createHeading('12.1 Patching Tools', HeadingLevel.HEADING_2));
    content.push(b.createTable(
      ['Element', 'Tool / Method'],
      [
        ['Windows OS', `WSUS for Windows, orchestrated by SaltStack`],
        ['Linux OS', `Linux repository server with SaltStack orchestration`],
        ['Databases', 'Manually using database tools'],
        [platformLabel + ' Services', 'Managed by cloud provider (auto-patched)'],
      ],
      [3600, 5760]
    ));

    if (platform === 'aws') {
      content.push(b.createHeading('12.2 Windows - WSUS', HeadingLevel.HEADING_2));
      content.push(b.createPara(
        'WSUS servers will be used to manage Microsoft updates, including reporting and approvals of patches. ' +
        'Patching will be orchestrated by SaltStack, but all Windows servers will download the updates from WSUS repositories.'
      ));

      content.push(b.createHeading('12.3 Linux - Repo Server', HeadingLevel.HEADING_2));
      content.push(b.createPara(
        'Linux repository server centralizes Linux updates from a single place, providing a reporting layer. ' +
        'Patching execution is orchestrated through SaltStack automation.'
      ));
    } else {
      content.push(b.createHeading('12.2 Windows - WSUS', HeadingLevel.HEADING_2));
      content.push(b.createPara(
        'WSUS servers will be used to manage Microsoft updates, including reporting and approvals of patches. ' +
        'Patching will be orchestrated by SaltStack, but all Windows servers will download the updates from WSUS repositories.'
      ));

      content.push(b.createHeading('12.3 Linux - Repo Server', HeadingLevel.HEADING_2));
      content.push(b.createPara(
        'Linux repository server centralizes Linux updates from a single place, providing a reporting layer. ' +
        'Patching is orchestrated through SaltStack automation for regions where it is available.'
      ));
    }

    content.push(b.createHeading('12.4 Patching Strategy', HeadingLevel.HEADING_2));
    content.push(b.createTable(
      ['Workload', 'Environment', 'Component', 'Patching Window'],
      [
        ['[Workload 1]', 'Production', 'OS', '[To be defined]'],
        ['[Workload 1]', 'DR', 'OS', '[To be defined]'],
        ['[Workload 2]', 'Production', 'Database', '[To be defined]'],
      ],
      [2400, 1920, 1920, 3120]
    ));
    content.push(b.createPageBreak());

    // ═══════════════════════════════════════════════════════════════════════
    // 13. SECURITY AND HARDENING
    // ═══════════════════════════════════════════════════════════════════════
    content.push(b.createHeading('13. Security and Hardening', HeadingLevel.HEADING_1));
    content.push(b.createPara(
      'The security architecture follows a defense-in-depth approach with multiple layers of security controls. ' +
      'The following hardening policies will be applied:'
    ));

    content.push(b.createHeading('13.1 Administration Users', HeadingLevel.HEADING_2));
    content.push(b.createPara(
      'Restrictive admin user access to operating systems and databases. All connections to customer environments use the AMZ connection pool servers ' +
      'with user access control and session recording (XTAM PAM). As all sessions are tracked and recorded, named users in the customer infrastructure ' +
      'are not required. User identification is done at connection level and later all actions can be traced.'
    ));

    content.push(b.createHeading('13.2 User Management', HeadingLevel.HEADING_2));
    content.push(b.createPara(
      'Define the types of users that will access the platform and how they will be managed (locally or federated). ' +
      'Specific users, roles, or permission management required inside the project that affects operations should be documented.'
    ));

    content.push(b.createHeading('13.3 Accessing the Platform', HeadingLevel.HEADING_2));
    content.push(b.createPara('The following mechanisms are used to securely access the platform:'));
    content.push(b.createBullet('VPN - Encrypted IPsec tunnels for site-to-site and remote access'));
    content.push(b.createBullet('PAM (XTAM) - Privileged Access Management for all administrative sessions'));
    content.push(b.createBullet('Jump Servers - Bastion hosts for RDP/SSH connectivity'));
    content.push(b.createBullet('SSL/TLS - All web communications use SSL encryption'));

    content.push(b.createHeading('13.4 Software Security', HeadingLevel.HEADING_2));
    content.push(b.createPara(
      'Software installed on the platform is kept secure through regular patching (refer to Patching section), vulnerability scanning via Qualys, ' +
      'and endpoint protection via CrowdStrike or equivalent solution.'
    ));

    content.push(b.createHeading('13.5 Infrastructure Security', HeadingLevel.HEADING_2));
    content.push(b.createInfoBox('Security Framework',
      'The security design aligns with the shared responsibility model and implements controls at the network, identity, data, and application layers.'
    ));
    content.push(b.createTable(
      ['Security Layer', 'Control', 'Implementation'],
      [
        ['Network', 'Segmentation', platform === 'aws' ? 'VPC Subnets, Security Groups, NACLs' : 'VNet Subnets, NSGs, Azure Firewall'],
        ['Network', 'Encryption in Transit', 'TLS 1.2+, IPsec VPN'],
        ['Network', 'Zone Isolation', 'Separate subnets for CSZ, PSZ, AMZ'],
        ['Identity', 'Access Management', platform === 'aws' ? 'IAM Policies, MFA, SSO' : 'Azure AD, RBAC, MFA, SSO'],
        ['Identity', 'Privileged Access', 'PAM (XTAM) with session recording'],
        ['Data', 'Encryption at Rest', platform === 'aws' ? 'KMS, S3 Encryption, EBS Encryption' : 'Azure Key Vault, Storage Encryption, Disk Encryption'],
        ['Monitoring', 'Threat Detection', platform === 'aws' ? 'GuardDuty, SecurityHub' : 'Microsoft Sentinel, Defender for Cloud'],
        ['Audit', 'Logging', platform === 'aws' ? 'CloudTrail, VPC Flow Logs' : 'Activity Logs, NSG Flow Logs'],
        ['Endpoint', 'Protection', 'CrowdStrike / Endpoint Detection and Response'],
        ['Vulnerability', 'Scanning', 'Qualys Cloud for vulnerability and compliance scanning'],
      ],
      [1800, 2100, 5460]
    ));

    content.push(b.createHeading('13.6 Data Classification and Management', HeadingLevel.HEADING_2));
    content.push(b.createPara('Data classification and handling mechanisms should be documented:'));
    content.push(b.createBullet('Specify the classification applied to data stored in the platform'));
    content.push(b.createBullet('List specific data handling mechanisms (e.g., data anonymization, encryption)'));
    content.push(b.createBullet('List policies for data within the platform (e.g., online data retention, secure deletion)'));
    content.push(b.createBullet('List certifications the platform must fulfil (e.g., PCI compliance, ISO 27001) and their impact on data and operations'));

    if (data.securityRequirements.length > 0) {
      content.push(b.createPara('Additional security requirements identified from the SOW:', { spaceBefore: 200 }));
      data.securityRequirements.forEach(req => content.push(b.createBullet(req)));
    }

    if (data.complianceRequirements && data.complianceRequirements.length > 0) {
      content.push(b.createHeading('13.7 Compliance Requirements', HeadingLevel.HEADING_2));
      content.push(b.createPara('The following compliance and regulatory requirements have been identified from the SOW:'));
      data.complianceRequirements.forEach(req => content.push(b.createBullet(req)));
    }
    content.push(b.createPageBreak());

    // ═══════════════════════════════════════════════════════════════════════
    // 14. NETWORKING SOLUTION
    // ═══════════════════════════════════════════════════════════════════════
    content.push(b.createHeading('14. Networking Solution', HeadingLevel.HEADING_1));

    content.push(b.createHeading('14.1 Connectivity Overview', HeadingLevel.HEADING_2));
    content.push(b.createPara('The following connectivity methods are employed:'));
    if (platform === 'aws') {
      content.push(b.createBullet('Site-to-Site VPN: IPsec tunnels for secure hybrid connectivity'));
      content.push(b.createBullet('Transit Gateway: Central hub for VPC interconnection'));
      content.push(b.createBullet('VPC Peering: Direct connectivity between VPCs where required'));
      content.push(b.createBullet('VPC Endpoints: Private access to AWS services'));
      content.push(b.createBullet('Direct Connect: Dedicated private connectivity (if applicable)'));
    } else {
      content.push(b.createBullet('Site-to-Site VPN: IPsec tunnels for secure hybrid connectivity'));
      content.push(b.createBullet('ExpressRoute: Dedicated private connectivity (if applicable)'));
      content.push(b.createBullet('VNet Peering: Direct connectivity between VNets'));
      content.push(b.createBullet('Private Endpoints: Private access to Azure services'));
      content.push(b.createBullet('Virtual WAN: Centralized hub for network connectivity'));
    }

    content.push(b.createHeading('14.2 Network Diagram', HeadingLevel.HEADING_2));
    content.push(b.createInfoBox('Network Diagram',
      'Insert a detailed network diagram to explain the network topology. If the network part is complex or key to understanding the infrastructure setup, ' +
      `a separate network diagram is required. For example, to explain how ${platform === 'aws' ? 'Transit Gateway' : 'Virtual WAN'} works.`
    ));
    content.push(b.createPara('[Network Diagram Placeholder]', { italics: true, color: "999999" }));

    content.push(b.createHeading('14.3 Traffic Flow Summary', HeadingLevel.HEADING_2));
    content.push(b.createTable(
      ['Traffic Flow', 'Source', 'Destination', 'Protocol', 'Path'],
      [
        ['Management', 'Admin (AMZ)', 'Cloud Resources', 'SSH/RDP/HTTPS', 'VPN > PSZ > Workloads'],
        ['Application', 'Users', 'Web Servers', 'HTTPS (443)', 'Internet > LB > App'],
        ['Database', 'App Servers', 'DB Servers', 'TCP (3306/5432)', 'Private Subnet'],
        ['Monitoring', 'All Resources', 'Monitoring (PSZ)', 'HTTPS/WMI/SNMP', `Internal > ${platform === 'aws' ? 'CloudWatch' : 'Azure Monitor'}`],
        ['Backup', 'Servers', 'Object Storage', 'HTTPS', `Private > ${platform === 'aws' ? 'S3 Endpoint' : 'Storage Account'}`],
        ['Automation', 'Salt/Ansible (PSZ)', 'Managed Servers', 'SSH/WinRM', 'PSZ > CSZ'],
      ],
      [1560, 1680, 1680, 1680, 2760]
    ));
    content.push(b.createPageBreak());

    // ═══════════════════════════════════════════════════════════════════════
    // 15. KEY COMPONENTS
    // ═══════════════════════════════════════════════════════════════════════
    content.push(b.createHeading('15. Key Components', HeadingLevel.HEADING_1));
    content.push(b.createPara('This section provides a detailed description of the major solution components and their configuration approach.'));

    if (data.components.length > 0) {
      data.components.forEach(comp => {
        content.push(b.createHeading(comp, HeadingLevel.HEADING_3));
        content.push(b.createPara(this.getComponentDescription(comp, platform)));
      });
    } else {
      content.push(b.createPara('Key components will be detailed based on the final architecture design.', { italics: true }));
    }
    content.push(b.createPageBreak());

    // ═══════════════════════════════════════════════════════════════════════
    // 16. HIGH AVAILABILITY DESIGN
    // ═══════════════════════════════════════════════════════════════════════
    content.push(b.createHeading('16. High Availability Design', HeadingLevel.HEADING_1));
    content.push(b.createPara(
      'The solution is designed for high availability with redundancy at multiple levels to minimize single points of failure.'
    ));
    if (platform === 'aws') {
      content.push(b.createTable(
        ['Component', 'HA Strategy', 'RPO', 'RTO'],
        [
          ['VPC Infrastructure', 'Multi-AZ deployment', 'N/A', 'Immediate'],
          ['NAT Gateway', 'One per AZ', '0', 'Automatic failover'],
          ['VPN Tunnels', 'Dual tunnel configuration', '0', '< 60 seconds'],
          ['Transit Gateway', 'Multi-AZ by default', '0', 'Automatic'],
          ['Compute', 'Auto Scaling Group across AZs', 'Near 0', '< 5 minutes'],
          ['PSZ Services', 'DR region collectors + automation', '0', '< 15 minutes'],
          ['Backup', 'Cross-region replication', '24 hours', '< 4 hours'],
        ],
        [2400, 3000, 1680, 2280]
      ));
    } else {
      content.push(b.createTable(
        ['Component', 'HA Strategy', 'RPO', 'RTO'],
        [
          ['VNet Infrastructure', 'Multi-region deployment', 'N/A', 'Immediate'],
          ['VPN Gateway', 'Active-Active configuration', '0', 'Automatic failover'],
          ['Azure Firewall', 'Availability Zones', '0', 'Automatic'],
          ['Load Balancer', 'Zone-redundant', '0', 'Automatic'],
          ['Compute', 'Virtual Machine Scale Sets / Availability Sets', 'Near 0', '< 5 minutes'],
          ['PSZ Services', 'DR region collectors + automation', '0', '< 15 minutes'],
          ['Backup', 'GRS Recovery Vaults', '24 hours', '< 4 hours'],
        ],
        [2400, 3000, 1680, 2280]
      ));
    }
    content.push(b.createPageBreak());

    // ═══════════════════════════════════════════════════════════════════════
    // 17. APPLICATION ARCHITECTURE
    // ═══════════════════════════════════════════════════════════════════════
    content.push(b.createHeading('17. Application Architecture', HeadingLevel.HEADING_1));

    content.push(b.createHeading('17.1 Applications', HeadingLevel.HEADING_2));
    content.push(b.createPara(
      'Document all applications to be deployed or migrated as part of this project. Include application details, dependencies, and any specific configuration requirements.'
    ));
    content.push(b.createPara('[Application inventory to be completed during discovery phase]', { italics: true, color: "999999" }));

    content.push(b.createHeading('17.2 Active Directory', HeadingLevel.HEADING_2));
    content.push(b.createPara(
      platform === 'aws'
        ? 'Active Directory services will be provided through AWS Managed Microsoft AD or self-managed AD on EC2 instances, depending on requirements.'
        : 'Active Directory services will leverage Azure Active Directory and/or domain controllers deployed within the Azure VNet.'
    ));

    content.push(b.createHeading('17.3 Logging', HeadingLevel.HEADING_2));
    content.push(b.createPara('Log management policies for all components of the platform:'));
    if (platform === 'aws') {
      content.push(b.createTable(
        ['Component', 'Log Origin', 'Log Management Policy'],
        [
          ['AWS Services', 'CloudTrail', 'CloudTrail logs retained in S3, lifecycle policies applied'],
          ['Web Servers', 'OS / Application Logs', 'Rsyslog pushes to centralized log aggregator; Filebeat for middleware logs'],
          ['Database Servers', 'Database Engine Logs', 'Retained per database vendor policy'],
          ['Network', 'VPC Flow Logs', `Flow logs sent to CloudWatch Logs and archived to S3`],
        ],
        [2400, 2400, 4560]
      ));
    } else {
      content.push(b.createTable(
        ['Component', 'Log Origin', 'Log Management Policy'],
        [
          ['Azure Services', 'Activity Logs', 'Retained in Log Analytics workspace per policy'],
          ['Web Servers', 'OS / Application Logs', 'Rsyslog pushes to centralized log aggregator; Filebeat for middleware logs'],
          ['Database Servers', 'Database Engine Logs', 'Retained per database vendor policy'],
          ['Network', 'NSG Flow Logs', 'Flow logs sent to Log Analytics and archived to Storage Account'],
        ],
        [2400, 2400, 4560]
      ));
    }

    content.push(b.createHeading('17.4 Monitoring', HeadingLevel.HEADING_2));
    content.push(b.createPara('Monitoring of all services/components is 24x7.'));
    content.push(b.createBullet('Alerts for production services/components are raised 24x7'));
    content.push(b.createBullet('Alerts for non-production services/components are raised between 08:00 and 17:00 Monday to Friday'));
    content.push(b.createPara('NTT DATA has defined a standard set of monitors:', { spaceBefore: 120 }));
    content.push(b.createBullet('Free disk space for all partitions'));
    content.push(b.createBullet('Average system load and CPU usage'));
    content.push(b.createBullet('Memory usage'));
    content.push(b.createBullet('I/O operations for each disk'));
    content.push(b.createBullet('Network traffic'));
    content.push(b.createBullet('SSH/RDP connectivity'));
    content.push(b.createBullet('TCP/IP connectivity'));
    content.push(b.createPara('Additional workload-specific monitoring will be described per workload.'));
    content.push(b.createPageBreak());

    // ═══════════════════════════════════════════════════════════════════════
    // 18. DR STRATEGY
    // ═══════════════════════════════════════════════════════════════════════
    content.push(b.createHeading('18. Disaster Recovery Strategy', HeadingLevel.HEADING_1));
    if (data.drStrategy && data.drStrategy.overview) {
      content.push(b.createPara(data.drStrategy.overview));
      if (data.drStrategy.rpo || data.drStrategy.rto) {
        content.push(b.createInfoBox('DR Targets',
          `RPO: ${data.drStrategy.rpo || 'To be determined'}  |  RTO: ${data.drStrategy.rto || 'To be determined'}  |  DR Region: ${data.drStrategy.drRegion || 'To be determined'}`
        ));
      }
    } else {
      content.push(b.createPara(
        'Specify if the project includes a specific process/infrastructure for disaster recovery or business continuity purposes.'
      ));
    }

    content.push(b.createHeading('18.1 Management Servers DR Strategy', HeadingLevel.HEADING_2));
    if (data.drStrategy && data.drStrategy.components && data.drStrategy.components.length > 0) {
      content.push(b.createPara(
        'Management servers and infrastructure components will be replicated to the DR region using the following strategies:'
      ));
      content.push(b.createTable(
        ['Component', 'DR Method', 'DR Region'],
        data.drStrategy.components.map(c => [
          c.component || '', c.drMethod || '', c.drRegion || data.drStrategy.drRegion || '[DR Region]'
        ]),
        [2760, 3000, 3600]
      ));
    } else {
      content.push(b.createPara(
        'Management servers in the PSZ will be replicated to DR. Depending on the tool, servers will be replicated using ' +
        `${platform === 'aws' ? 'AWS Elastic Disaster Recovery or deployed as a second server in the DR region' : 'Azure Site Recovery (ASR) or deployed as a second server in the DR region'}.`
      ));
      content.push(b.createTable(
        ['Component', 'DR Method', 'DR Region'],
        [
          ['Logic Monitor Collector', 'Separate DR instance', '[DR Region]'],
          ['Automation Server', 'Docker image redeployment', '[DR Region]'],
          ['Jump Server', 'Separate DR instance', '[DR Region]'],
        ],
        [2760, 3000, 3600]
      ));
    }

    content.push(b.createHeading('18.2 Backup DR Strategy', HeadingLevel.HEADING_2));
    content.push(b.createPara(
      platform === 'aws'
        ? 'Backup data is replicated to the DR region using AWS Backup cross-region copy. S3 buckets use Cross-Region Replication (CRR) for backup data redundancy.'
        : 'Backup data is replicated to the DR region through Azure Recovery Service Vaults configured with Geo-Redundant Storage (GRS).'
    ));

    content.push(b.createHeading('18.3 Application DR Strategy', HeadingLevel.HEADING_2));
    content.push(b.createPara(
      `Application-level disaster recovery strategy will be determined per workload. Options include ${platform === 'aws' ? 'AWS Elastic Disaster Recovery, cross-region RDS replication, and active-passive failover configurations' : 'Azure Site Recovery (ASR), SQL Always-On availability groups, and active-passive failover configurations'}.`
    ));
    content.push(b.createPageBreak());

    // ═══════════════════════════════════════════════════════════════════════
    // 19. MIGRATION PROJECT
    // ═══════════════════════════════════════════════════════════════════════
    content.push(b.createHeading('19. Migration Project', HeadingLevel.HEADING_1));

    content.push(b.createHeading('19.1 Migration Strategy', HeadingLevel.HEADING_2));
    if (data.migrationPlan && data.migrationPlan.strategy) {
      content.push(b.createPara(data.migrationPlan.strategy));
    } else {
      content.push(b.createPara(
        'This section describes the high-level plan for migration of services. Two primary methods are available:'
      ));
    }
    content.push(b.createPara(
      platform === 'aws'
        ? 'Lift and Shift: Using AWS Application Migration Service (MGN) to replicate VMs to AWS. Once ready, a cutover is executed to the new environment.'
        : 'Lift and Shift: Using Azure Migrate to replicate VMs from the current environment to Azure. Once ready, a failover is executed to the new environment.',
      { label: 'Lift and Shift: ' }
    ));
    content.push(b.createPara(
      `Greenfield: A new server is created in ${platformLabel} and then data is replicated using the corresponding technology.`,
      { label: 'Greenfield: ' }
    ));
    content.push(b.createInfoBox('Migration Sequence',
      `First step: Preparation and configuration of the Landing Zone in the ${platformLabel} environment and setup of the necessary connectivity. ` +
      'During this process, migration of services can be scheduled.'
    ));

    content.push(b.createHeading('19.2 Migration Methodology', HeadingLevel.HEADING_2));

    content.push(b.createHeading('19.2.1 OS Migration', HeadingLevel.HEADING_3));
    content.push(b.createPara('Two main methods to migrate systems:'));
    content.push(b.createBullet(
      platform === 'aws'
        ? 'Lift and Shift: VMs replicated from current environment to AWS using AWS MGN'
        : 'Lift and Shift: VMs replicated from current VMware/Hyper-V environment to Azure using Azure Migrate'
    ));
    content.push(b.createBullet(`Greenfield: New VM deployed in ${platformLabel}, data and services migrated manually`));

    content.push(b.createHeading('19.2.2 Application Migration', HeadingLevel.HEADING_3));
    content.push(b.createPara('Application migration approach depends on the application architecture, dependencies, and vendor support for cloud deployment.'));

    content.push(b.createHeading('19.3 System/Server/Application Migration Table', HeadingLevel.HEADING_2));
    if (data.migrationPlan && data.migrationPlan.serverMigrations && data.migrationPlan.serverMigrations.length > 0) {
      content.push(b.createTable(
        ['Hostname', 'Description', 'Migration Procedure', 'Migration Phase'],
        data.migrationPlan.serverMigrations.map(s => [
          s.hostname || '[TBD]', s.description || '', s.method || 'TBD', s.phase || 'TBD'
        ]),
        [2100, 2760, 2400, 2100]
      ));
    } else {
      content.push(b.createTable(
        ['Hostname', 'Description', 'Migration Procedure', 'Migration Phase'],
        [
          ['[Server 1]', '[Description]', 'Lift and Shift / Greenfield', 'Phase [X]'],
          ['[Server 2]', '[Description]', 'Lift and Shift / Greenfield', 'Phase [X]'],
          ['[Server 3]', '[Description]', 'Lift and Shift / Greenfield', 'Phase [X]'],
        ],
        [2100, 2760, 2400, 2100]
      ));
    }

    content.push(b.createHeading('19.4 Migration Phases', HeadingLevel.HEADING_2));

    content.push(b.createHeading(`19.4.1 Phase 0 - ${platformLabel} Landing Zone Preparation (PSZ Deployment)`, HeadingLevel.HEADING_3));
    content.push(b.createPara(
      'During Phase 0, the Landing Zone, the Firewall, and the management systems will be deployed. This includes both Production and DR environments.'
    ));

    content.push(b.createHeading('19.4.2 Phase 1 - Core Infrastructure', HeadingLevel.HEADING_3));
    content.push(b.createPara('Network infrastructure, VPN connectivity, and foundational services deployment.'));

    content.push(b.createHeading('19.4.3 Phase 2 - Workload Migration', HeadingLevel.HEADING_3));
    content.push(b.createPara('Migration of primary workloads according to the migration table above.'));

    content.push(b.createHeading('19.4.4 Phase 3 - Validation and Cutover', HeadingLevel.HEADING_3));
    content.push(b.createPara('Final validation, testing, and production cutover.'));
    content.push(b.createPageBreak());

    // ═══════════════════════════════════════════════════════════════════════
    // 20. CUSTOMER WORKLOADS
    // ═══════════════════════════════════════════════════════════════════════
    content.push(b.createHeading('20. Customer Workloads', HeadingLevel.HEADING_1));
    content.push(b.createPara(
      'This section documents the solution specification for each workload within the project scope, including infrastructure, ' +
      'application, backup, monitoring, patching, and QA specifications.'
    ));

    content.push(b.createHeading('20.1 Workload Overview', HeadingLevel.HEADING_2));
    if (data.workloads && data.workloads.length > 0) {
      data.workloads.forEach((wl, index) => {
        content.push(b.createHeading(`20.1.${index + 1} ${wl.name || `Workload ${index + 1}`}`, HeadingLevel.HEADING_3));
        if (wl.description) content.push(b.createPara(wl.description));
        if (wl.infrastructure) content.push(b.createPara(wl.infrastructure, { label: 'Infrastructure: ' }));
        if (wl.backupPolicy) content.push(b.createPara(wl.backupPolicy, { label: 'Backup: ' }));
        if (wl.monitoring) content.push(b.createPara(wl.monitoring, { label: 'Monitoring: ' }));
      });
    } else {
      content.push(b.createPara('[Short description of the concrete workload]', { italics: true, color: "999999" }));
    }

    content.push(b.createHeading('20.2 Workload Architecture', HeadingLevel.HEADING_2));
    content.push(b.createInfoBox('Topology Diagram',
      'Insert infrastructure diagram to understand deployed components and their interactions. Relationship with external entities should be drawn if they are part of the solution.'
    ));

    content.push(b.createHeading('20.3 Workload Infrastructure', HeadingLevel.HEADING_2));
    content.push(b.createPara(
      'Document IaaS, PaaS, SaaS, and every component deployed under the project scope. Include infrastructure components per environment ' +
      'with their main characteristics, software components with versions and configuration, domain names and certificates, and 3rd party integrations.'
    ));

    content.push(b.createHeading('20.4 Workload Backup Strategy', HeadingLevel.HEADING_2));
    content.push(b.createTable(
      ['Workload', 'Environment', 'Component', 'Policy'],
      [
        ['[Workload 1]', 'Production', '[Component]', '[Backup Policy]'],
        ['[Workload 1]', 'DR', '[Component]', '[Backup Policy]'],
      ],
      [2400, 1920, 2160, 2880]
    ));

    content.push(b.createHeading('20.5 Workload Monitoring', HeadingLevel.HEADING_2));
    content.push(b.createPara('Describe custom monitoring for each workload beyond the standard set of monitors.'));

    content.push(b.createHeading('20.6 Quality Acceptance', HeadingLevel.HEADING_2));
    content.push(b.createPara('As part of the project handover to operational support, NTT DATA performs the following quality acceptance checks:'));
    content.push(b.createTable(
      ['Check', 'Description'],
      [
        ['Monitoring', 'Monitoring is enabled, configured correctly and verified with the customer'],
        ['Access', 'All instances have RDP/SSH access enabled to NTT DATA'],
        ['Processes', 'Start-up and stop processes defined for all instances'],
        ['Tagging', 'All services are tagged appropriately'],
        ['Documentation', 'Each workload is documented with custom functions and non-standard characteristics'],
        ['Escalations', 'Contacts defined, RACI matrix in place, phone numbers, emails, time schedules'],
        ['Patching', 'Time/date, execution process/order, contacts for notification'],
        ['Backup', 'Inclusions/exclusions, how, where, when, contacts for notification'],
        ['Scaling', 'Auto scaling groups correctly configured with recommended policies'],
        ['Permissions', 'Agreed with client for non-admin access'],
        ['Custom Scripts', 'Defined, captured in repo, tested, and defined where they run from'],
        ['Security', `Firewall and ${platform === 'aws' ? 'AWS IAM' : 'Azure RBAC'} checked for recommended configuration`],
      ],
      [2400, 6960]
    ));

    content.push(b.createHeading('20.7 Application Release (Code) Management', HeadingLevel.HEADING_2));
    content.push(b.createPara(
      'Describe application release procedures and code management with the customer. CI/CD tool automations should be documented along with custom scripts, cron jobs, and any automation in place.'
    ));

    content.push(b.createHeading('20.8 Post Implementation Review', HeadingLevel.HEADING_2));
    content.push(b.createPara('Document any pending points to be developed in the near future after the project and outside the initial scope.'));
    content.push(b.createPageBreak());

    // ═══════════════════════════════════════════════════════════════════════
    // 21. INFRASTRUCTURE AS CODE (Terraform)
    // ═══════════════════════════════════════════════════════════════════════
    content.push(b.createHeading('21. Infrastructure as Code (Terraform)', HeadingLevel.HEADING_1));
    content.push(b.createPara(
      'Terraform is the system used to deploy and maintain cloud resource infrastructure using Infrastructure as Code (IaC) mechanisms.'
    ));

    content.push(b.createHeading('21.1 Benefits', HeadingLevel.HEADING_2));
    content.push(b.createBullet('Infrastructure as Code: Manages and provisions components via definition files; allows building, changing, and versioning infrastructure'));
    content.push(b.createBullet('Automated Infrastructure Management: Works with configuration files to define and store infrastructure state for controlled updates'));
    content.push(b.createBullet('Reduced Time to Provision: NTT DATA has an extensive Terraform code repository for rapid deployment'));
    content.push(b.createBullet('Portability and Flexibility: Code can be reused across multiple infrastructure providers'));
    content.push(b.createBullet('Multi-cloud Ready: Useful for Disaster Recovery or Hybrid environments'));
    content.push(b.createBullet('Simplicity: Easy to learn coding with elegant template language'));

    content.push(b.createHeading('21.2 Terraform Guidelines', HeadingLevel.HEADING_2));
    content.push(b.createBullet('Standardized Terraform modules for common deployment approach'));
    content.push(b.createBullet('Separate change affectation depending on the workload'));
    content.push(b.createBullet(
      platform === 'aws'
        ? 'State files saved and locked remotely within versioned S3 and DynamoDB'
        : 'State files saved and locked remotely within Azure Storage Account with state locking'
    ));
    content.push(b.createBullet('CI/CD pipelines for automated deployments (GitLab/GitHub Actions)'));
    content.push(b.createPageBreak());

    // ═══════════════════════════════════════════════════════════════════════
    // 22. SERVICE LEVEL AGREEMENT
    // ═══════════════════════════════════════════════════════════════════════
    content.push(b.createHeading('22. Service Level Agreement', HeadingLevel.HEADING_1));
    content.push(b.createPara('The following service level targets apply to the deployed infrastructure:'));
    if (data.slaRequirements && data.slaRequirements.length > 0) {
      content.push(b.createTable(
        ['Metric', 'Target', 'Measurement Method'],
        data.slaRequirements.map(sla => [
          sla.metric || '', sla.target || '', sla.measurementMethod || ''
        ]),
        [2700, 2400, 4260]
      ));
    } else {
      content.push(b.createTable(
        ['Metric', 'Target', 'Measurement Method'],
        [
          ['Infrastructure Availability', '99.95%', 'Cloud provider SLA'],
          ['VPN Tunnel Availability', '99.9%', 'Monitoring alerts'],
          ['Incident Response (P1)', '< 15 minutes', 'Ticketing system'],
          ['Incident Response (P2)', '< 1 hour', 'Ticketing system'],
          ['Incident Response (P3)', '< 4 hours', 'Ticketing system'],
          ['Incident Response (P4)', '< 8 hours', 'Ticketing system'],
          ['Change Request Turnaround', '< 5 business days', 'Change management system'],
          ['Backup Success Rate', '> 99%', 'Backup monitoring'],
          ['Patching Compliance', '> 95%', 'Patch management reports'],
        ],
        [2700, 2400, 4260]
      ));
    }
    content.push(b.createPageBreak());

    // ═══════════════════════════════════════════════════════════════════════
    // 23. APPENDIX
    // ═══════════════════════════════════════════════════════════════════════
    content.push(b.createHeading('23. Appendix', HeadingLevel.HEADING_1));
    content.push(b.createPara('This section contains supplementary information and references.'));

    content.push(b.createHeading('23.1 Glossary', HeadingLevel.HEADING_2));
    content.push(b.createTable(
      ['Term', 'Definition'],
      [
        ['HLD', 'High-Level Design - Architecture overview document'],
        ['LLD', 'Low-Level Design - Detailed technical configuration document'],
        ['VPC', 'Virtual Private Cloud - Isolated network in AWS'],
        ['VNet', 'Virtual Network - Isolated network in Azure'],
        ['CIDR', 'Classless Inter-Domain Routing - IP addressing scheme'],
        ['IPsec', 'Internet Protocol Security - VPN encryption protocol'],
        ['HA', 'High Availability - System design for minimal downtime'],
        ['AZ', 'Availability Zone - Isolated data center within a region'],
        ['AMZ', 'Administration Management Zone - NTT secure management environment for privileged access and operations'],
        ['PSZ', 'Provider Service Zone - NTT management zone hosting monitoring, automation, and admin tooling'],
        ['CSZ', 'Customer Security Zone - Customer workload zone with security controls and network segmentation'],
        ['SMZ', 'Service Management Zone - Zone for service management tools and ITSM integration'],
        ['PAM', 'Privileged Access Management - Solution for secure administrative access with session recording'],
        ['XTAM', 'Xtontech Access Manager - PAM tool used by NTT for privileged session management'],
        ['RACI', 'Responsible, Accountable, Consulted, Informed - Responsibility matrix'],
        ['RPO', 'Recovery Point Objective - Maximum acceptable data loss measured in time'],
        ['RTO', 'Recovery Time Objective - Maximum acceptable downtime for recovery'],
        ['IaC', 'Infrastructure as Code - Managing infrastructure through code definitions (e.g., Terraform)'],
        ['WSUS', 'Windows Server Update Services - Microsoft patch management'],
        ['CMDB', 'Configuration Management Database - IT asset and configuration repository'],
        ['QA', 'Quality Acceptance - NTT standard checks performed during project handover'],
        ['ASR', 'Azure Site Recovery - Disaster recovery service for Azure workloads'],
        ['DR', 'Disaster Recovery - Strategy and infrastructure for business continuity'],
      ],
      [2400, 6960]
    ));

    content.push(b.createHeading('23.2 Contact Information', HeadingLevel.HEADING_2));
    content.push(b.createTable(
      ['Role', 'Name', 'Email', 'Phone'],
      [
        ['Solution Architect', data.projectDetails.authorName, '[email]', '[phone]'],
        ['Project Manager', '[Name]', '[email]', '[phone]'],
        ['Client Technical Lead', '[Name]', '[email]', '[phone]'],
        ['Network Engineer', '[Name]', '[email]', '[phone]'],
        ['Security Engineer', '[Name]', '[email]', '[phone]'],
      ],
      [2100, 2400, 2760, 2100]
    ));

    if (data.additionalInfo) {
      content.push(b.createHeading('23.3 Additional Notes', HeadingLevel.HEADING_2));
      content.push(b.createPara(data.additionalInfo));
    }

    return content;
  }

  // ─── LLD CONTENT GENERATION ───────────────────────────────────────────────

  generateLldContent(data, platform, b) {
    const content = [];
    const platformLabel = platform === 'aws' ? 'AWS' : 'Azure';
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    // Title Page
    content.push(...b.createTitlePage(data));
    content.push(b.createPageBreak());

    // Table of Contents
    content.push(b.createHeading('Table of Contents', HeadingLevel.HEADING_1));
    content.push(b.createPara('(Auto-generated table of contents - Update field in Word to populate)', { italics: true, color: "666666" }));
    content.push(b.createPageBreak());

    // 1. Document Control
    content.push(b.createHeading('1. Document Control', HeadingLevel.HEADING_1));

    content.push(b.createHeading('1.1 Release History', HeadingLevel.HEADING_2));
    content.push(b.createTable(
      ['Version', 'Date', 'Author', 'Change Description', 'Status'],
      [
        [data.projectDetails.version || '1.0', today, data.projectDetails.authorName, 'Initial draft', 'Draft'],
      ],
      [1200, 1800, 1800, 2760, 1800]
    ));

    content.push(b.createHeading('1.2 RACI Matrix', HeadingLevel.HEADING_2));
    content.push(b.createTable(
      ['Activity', 'NTT', 'Client', 'Vendor'],
      [
        ['Infrastructure Provisioning', 'R', 'A', 'C'],
        ['Network Configuration', 'R', 'A', 'I'],
        ['Security Configuration', 'R', 'A', 'I'],
        ['VPN Configuration', 'R', 'A', 'C'],
        ['Testing & Validation', 'R', 'A', 'C'],
        ['Documentation', 'R', 'A', 'I'],
      ],
      [3600, 1920, 1920, 1920]
    ));

    content.push(b.createHeading('1.3 Review Colors', HeadingLevel.HEADING_2));
    content.push(b.createTable(
      ['Color', 'Meaning'],
      [
        ['Green', 'Approved / Completed'],
        ['Yellow', 'In Review / Pending'],
        ['Red', 'Rejected / Requires Changes'],
        ['Grey', 'Not Started'],
      ],
      [3000, 6360]
    ));
    content.push(b.createPageBreak());

    // 2. Introduction
    content.push(b.createHeading('2. Introduction', HeadingLevel.HEADING_1));

    content.push(b.createHeading('2.1 Project Overview', HeadingLevel.HEADING_2));
    content.push(b.createPara(
      `This Low-Level Design (LLD) document provides the detailed technical configuration specifications for the ${data.projectName} project. ` +
      `It serves as the implementation guide for the ${platformLabel} infrastructure deployment for ${data.clientName}.`
    ));
    content.push(b.createPara(
      'This document should be read in conjunction with the corresponding HLD document, which provides the architectural overview and design rationale.'
    ));

    content.push(b.createHeading('2.2 Connectivity Overview', HeadingLevel.HEADING_2));
    content.push(b.createPara('The connectivity design encompasses the following elements:'));
    if (platform === 'aws') {
      content.push(b.createBullet('VPC-to-VPC connectivity via Transit Gateway'));
      content.push(b.createBullet('On-premises to AWS connectivity via Site-to-Site VPN'));
      content.push(b.createBullet('Internet egress via NAT Gateway'));
      content.push(b.createBullet('Private service access via VPC Endpoints'));
    } else {
      content.push(b.createBullet('VNet-to-VNet connectivity via VNet Peering / Virtual WAN'));
      content.push(b.createBullet('On-premises to Azure connectivity via VPN Gateway'));
      content.push(b.createBullet('Internet egress via NAT Gateway'));
      content.push(b.createBullet('Private service access via Private Endpoints'));
    }

    content.push(b.createHeading('2.3 VPN Breakdown', HeadingLevel.HEADING_2));
    if (data.vpnConnections.length > 0) {
      content.push(b.createPara('The following VPN connections are identified:'));
      data.vpnConnections.forEach(vpn => content.push(b.createBullet(vpn)));
    } else {
      content.push(b.createPara('VPN tunnel configurations will be specified based on the finalized network design.'));
      content.push(b.createTable(
        ['VPN Connection', 'Source', 'Destination', 'Type', 'Status'],
        [
          ['VPN-001', 'On-Premises DC', `${platformLabel} Region`, 'Site-to-Site IPsec', 'Planned'],
          ['VPN-002', 'Branch Office', `${platformLabel} Region`, 'Site-to-Site IPsec', 'Planned'],
        ],
        [1800, 1920, 1920, 1920, 1800]
      ));
    }

    content.push(b.createHeading('2.4 Traffic Flow Summary', HeadingLevel.HEADING_2));
    content.push(b.createTable(
      ['Traffic Flow', 'Source', 'Destination', 'Protocol', 'Path'],
      [
        ['Management', 'Admin Network', 'Cloud Resources', 'SSH/RDP/HTTPS', 'VPN > VPC/VNet'],
        ['Application', 'Users', 'Web Servers', 'HTTPS (443)', 'Internet > LB > App'],
        ['Database', 'App Servers', 'DB Servers', 'TCP (3306/5432)', 'Private Subnet'],
        ['Monitoring', 'All Resources', 'Monitoring Service', 'HTTPS', `Internal > ${platform === 'aws' ? 'CloudWatch' : 'Azure Monitor'}`],
        ['Backup', 'Servers', 'Object Storage', 'HTTPS', `Private > ${platform === 'aws' ? 'S3 Endpoint' : 'Storage Account'}`],
      ],
      [1560, 1680, 1680, 1680, 2760]
    ));
    content.push(b.createPageBreak());

    // 3. VPC/VNet Architecture
    content.push(b.createHeading(`3. ${platform === 'aws' ? 'VPC' : 'VNet'} Architecture`, HeadingLevel.HEADING_1));

    content.push(b.createHeading(`3.1 ${platform === 'aws' ? 'VPC' : 'VNet'} Summary`, HeadingLevel.HEADING_2));
    if (platform === 'aws') {
      content.push(b.createTable(
        ['VPC Name', 'CIDR Block', 'Region', 'DNS Hostnames', 'DNS Resolution', 'Tenancy'],
        [
          [`${data.projectName}-prod-vpc`, data.networkRanges[0] || '10.0.0.0/16', data.projectDetails.region || 'ap-southeast-1', 'Enabled', 'Enabled', 'Default'],
        ],
        [1800, 1560, 1560, 1560, 1560, 1320]
      ));
    } else {
      content.push(b.createTable(
        ['VNet Name', 'Address Space', 'Region', 'Resource Group', 'DNS Servers'],
        [
          [`${data.projectName}-prod-vnet`, data.networkRanges[0] || '10.0.0.0/16', data.projectDetails.region || 'Southeast Asia', `${data.projectName}-rg`, 'Azure Default'],
        ],
        [1920, 1920, 1920, 1920, 1680]
      ));
    }

    content.push(b.createHeading('3.2 IP Address Allocation', HeadingLevel.HEADING_2));
    content.push(b.createInfoBox('IP Planning',
      'IP address allocation follows a structured approach to ensure scalability and avoid conflicts with existing networks. Subnets are sized according to workload requirements with room for growth.'
    ));
    if (data.networkRanges.length > 0) {
      content.push(b.createTable(
        ['CIDR Block', 'Usable IPs', 'Allocation', 'Environment'],
        data.networkRanges.map(cidr => [cidr, this.calculateUsableIPs(cidr), 'To be assigned', 'Production']),
        [2400, 1800, 3360, 1800]
      ));
    } else {
      content.push(b.createTable(
        ['CIDR Block', 'Usable IPs', 'Allocation', 'Environment'],
        [
          ['10.0.0.0/16', '65,534', 'Production VPC/VNet', 'Production'],
          ['10.0.0.0/24', '251', 'Public Subnet AZ-1', 'Production'],
          ['10.0.1.0/24', '251', 'Public Subnet AZ-2', 'Production'],
          ['10.0.10.0/24', '251', 'Private Subnet AZ-1', 'Production'],
          ['10.0.11.0/24', '251', 'Private Subnet AZ-2', 'Production'],
          ['10.0.20.0/24', '251', 'Management Subnet', 'Production'],
        ],
        [2400, 1800, 3360, 1800]
      ));
    }
    content.push(b.createPageBreak());

    // 4. Subnet Configuration
    content.push(b.createHeading('4. Subnet Configuration', HeadingLevel.HEADING_1));
    content.push(b.createPara('Subnets are configured across multiple availability zones for high availability and are segmented by function.'));
    if (platform === 'aws') {
      content.push(b.createTable(
        ['Subnet Name', 'CIDR', 'AZ', 'Type', 'Auto-assign Public IP', 'Route Table'],
        [
          ['pub-subnet-az1', '10.0.0.0/24', 'ap-southeast-1a', 'Public', 'Yes', 'rt-public'],
          ['pub-subnet-az2', '10.0.1.0/24', 'ap-southeast-1b', 'Public', 'Yes', 'rt-public'],
          ['priv-subnet-az1', '10.0.10.0/24', 'ap-southeast-1a', 'Private', 'No', 'rt-private-az1'],
          ['priv-subnet-az2', '10.0.11.0/24', 'ap-southeast-1b', 'Private', 'No', 'rt-private-az2'],
          ['mgmt-subnet-az1', '10.0.20.0/24', 'ap-southeast-1a', 'Private', 'No', 'rt-mgmt'],
          ['tgw-subnet-az1', '10.0.30.0/28', 'ap-southeast-1a', 'Private', 'No', 'rt-tgw'],
          ['tgw-subnet-az2', '10.0.30.16/28', 'ap-southeast-1b', 'Private', 'No', 'rt-tgw'],
        ],
        [1920, 1560, 1680, 1200, 1680, 1320]
      ));
    } else {
      content.push(b.createTable(
        ['Subnet Name', 'Address Prefix', 'NSG', 'Purpose', 'Delegation', 'Service Endpoints'],
        [
          ['sn-public-001', '10.0.0.0/24', 'nsg-public', 'Public-facing', 'None', 'None'],
          ['sn-public-002', '10.0.1.0/24', 'nsg-public', 'Public-facing', 'None', 'None'],
          ['sn-private-001', '10.0.10.0/24', 'nsg-private', 'Application', 'None', 'Storage, SQL'],
          ['sn-private-002', '10.0.11.0/24', 'nsg-private', 'Application', 'None', 'Storage, SQL'],
          ['sn-mgmt-001', '10.0.20.0/24', 'nsg-mgmt', 'Management', 'None', 'None'],
          ['AzureFirewallSubnet', '10.0.30.0/26', 'N/A', 'Azure Firewall', 'Required', 'N/A'],
          ['GatewaySubnet', '10.0.31.0/27', 'N/A', 'VPN Gateway', 'Required', 'N/A'],
        ],
        [1800, 1560, 1320, 1320, 1200, 1560]
      ));
    }
    content.push(b.createPageBreak());

    // 5. Gateway Configuration
    content.push(b.createHeading('5. Gateway Configuration', HeadingLevel.HEADING_1));

    content.push(b.createHeading('5.1 Internet Gateways', HeadingLevel.HEADING_2));
    if (platform === 'aws') {
      content.push(b.createTable(
        ['Resource', 'Name', 'Attached VPC', 'Purpose'],
        [['Internet Gateway', `${data.projectName}-igw`, `${data.projectName}-prod-vpc`, 'Internet access for public subnets']],
        [2400, 2400, 2760, 1800]
      ));
    } else {
      content.push(b.createPara('Azure does not use a discrete Internet Gateway resource. Public internet access is controlled through Azure Firewall and NSG rules.'));
    }

    content.push(b.createHeading('5.2 NAT Gateways', HeadingLevel.HEADING_2));
    content.push(b.createPara(`NAT Gateways provide outbound internet connectivity for resources in private subnets.`));
    if (platform === 'aws') {
      content.push(b.createTable(
        ['NAT Gateway Name', 'Subnet', 'Elastic IP', 'AZ'],
        [
          [`${data.projectName}-natgw-az1`, 'pub-subnet-az1', 'Allocated', 'ap-southeast-1a'],
          [`${data.projectName}-natgw-az2`, 'pub-subnet-az2', 'Allocated', 'ap-southeast-1b'],
        ],
        [2700, 2400, 1860, 2400]
      ));
    } else {
      content.push(b.createTable(
        ['NAT Gateway Name', 'Subnet', 'Public IP', 'SKU'],
        [
          [`${data.projectName}-natgw-001`, 'sn-public-001', 'Allocated', 'Standard'],
        ],
        [2700, 2400, 1860, 2400]
      ));
    }
    content.push(b.createPageBreak());

    // 6. Route Tables
    content.push(b.createHeading('6. Route Table Configuration', HeadingLevel.HEADING_1));
    content.push(b.createPara('Route tables define traffic paths for each subnet tier.'));
    if (platform === 'aws') {
      content.push(b.createHeading('Public Route Table (rt-public)', HeadingLevel.HEADING_3));
      content.push(b.createTable(
        ['Destination', 'Target', 'Status', 'Notes'],
        [
          ['10.0.0.0/16', 'local', 'Active', 'VPC local traffic'],
          ['0.0.0.0/0', 'igw-xxxxxxxx', 'Active', 'Internet traffic via IGW'],
        ],
        [2400, 2400, 1560, 3000]
      ));

      content.push(b.createHeading('Private Route Table (rt-private-az1)', HeadingLevel.HEADING_3));
      content.push(b.createTable(
        ['Destination', 'Target', 'Status', 'Notes'],
        [
          ['10.0.0.0/16', 'local', 'Active', 'VPC local traffic'],
          ['0.0.0.0/0', 'nat-xxxxxxxx', 'Active', 'Internet via NAT Gateway'],
          ['172.16.0.0/12', 'tgw-xxxxxxxx', 'Active', 'On-premises via TGW'],
        ],
        [2400, 2400, 1560, 3000]
      ));
    } else {
      content.push(b.createHeading('Public Route Table (rt-public)', HeadingLevel.HEADING_3));
      content.push(b.createTable(
        ['Address Prefix', 'Next Hop Type', 'Next Hop Address', 'Notes'],
        [
          ['0.0.0.0/0', 'Internet', 'N/A', 'Default internet route'],
          ['10.0.0.0/16', 'VNet', 'N/A', 'VNet local traffic'],
        ],
        [2400, 2400, 1800, 2760]
      ));

      content.push(b.createHeading('Private Route Table (rt-private)', HeadingLevel.HEADING_3));
      content.push(b.createTable(
        ['Address Prefix', 'Next Hop Type', 'Next Hop Address', 'Notes'],
        [
          ['0.0.0.0/0', 'Virtual Appliance', 'Azure Firewall IP', 'Forced tunneling'],
          ['10.0.0.0/16', 'VNet', 'N/A', 'VNet local traffic'],
          ['172.16.0.0/12', 'Virtual Network Gateway', 'N/A', 'On-premises via VPN'],
        ],
        [2400, 2400, 1800, 2760]
      ));
    }
    content.push(b.createPageBreak());

    // 7. Security Groups / NSGs
    content.push(b.createHeading(`7. ${platform === 'aws' ? 'Security Groups' : 'Network Security Groups (NSGs)'}`, HeadingLevel.HEADING_1));
    content.push(b.createInfoBox('Security Groups',
      platform === 'aws'
        ? 'Security Groups are stateful firewalls that control inbound and outbound traffic at the instance level. Rules are evaluated as a whole (no explicit deny).'
        : 'NSGs contain security rules that allow or deny inbound/outbound traffic. Rules are evaluated by priority (lower number = higher priority).'
    ));

    if (platform === 'aws') {
      content.push(b.createHeading('sg-web - Web Tier Security Group', HeadingLevel.HEADING_3));
      content.push(b.createTable(
        ['Direction', 'Protocol', 'Port Range', 'Source/Destination', 'Description'],
        [
          ['Inbound', 'TCP', '443', '0.0.0.0/0', 'HTTPS from internet'],
          ['Inbound', 'TCP', '80', '0.0.0.0/0', 'HTTP from internet (redirect)'],
          ['Outbound', 'All', 'All', '0.0.0.0/0', 'All outbound traffic'],
        ],
        [1320, 1200, 1200, 2400, 3240]
      ));

      content.push(b.createHeading('sg-app - Application Tier Security Group', HeadingLevel.HEADING_3));
      content.push(b.createTable(
        ['Direction', 'Protocol', 'Port Range', 'Source/Destination', 'Description'],
        [
          ['Inbound', 'TCP', '8080', 'sg-web', 'App traffic from web tier'],
          ['Inbound', 'TCP', '22', 'sg-mgmt', 'SSH from management'],
          ['Outbound', 'All', 'All', '0.0.0.0/0', 'All outbound traffic'],
        ],
        [1320, 1200, 1200, 2400, 3240]
      ));

      content.push(b.createHeading('sg-mgmt - Management Security Group', HeadingLevel.HEADING_3));
      content.push(b.createTable(
        ['Direction', 'Protocol', 'Port Range', 'Source/Destination', 'Description'],
        [
          ['Inbound', 'TCP', '22', 'VPN CIDR', 'SSH from VPN'],
          ['Inbound', 'TCP', '3389', 'VPN CIDR', 'RDP from VPN'],
          ['Inbound', 'TCP', '443', 'VPN CIDR', 'HTTPS management'],
          ['Outbound', 'All', 'All', '0.0.0.0/0', 'All outbound traffic'],
        ],
        [1320, 1200, 1200, 2400, 3240]
      ));
    } else {
      content.push(b.createHeading('nsg-public - Public Tier NSG', HeadingLevel.HEADING_3));
      content.push(b.createTable(
        ['Priority', 'Direction', 'Protocol', 'Port', 'Source', 'Destination', 'Action'],
        [
          ['100', 'Inbound', 'TCP', '443', 'Internet', 'VNet', 'Allow'],
          ['110', 'Inbound', 'TCP', '80', 'Internet', 'VNet', 'Allow'],
          ['4096', 'Inbound', 'Any', 'Any', 'Any', 'Any', 'Deny'],
        ],
        [1080, 1200, 1080, 960, 1440, 1440, 1080]
      ));

      content.push(b.createHeading('nsg-private - Private Tier NSG', HeadingLevel.HEADING_3));
      content.push(b.createTable(
        ['Priority', 'Direction', 'Protocol', 'Port', 'Source', 'Destination', 'Action'],
        [
          ['100', 'Inbound', 'TCP', '8080', 'sn-public', 'VNet', 'Allow'],
          ['110', 'Inbound', 'TCP', '22', 'sn-mgmt', 'VNet', 'Allow'],
          ['4096', 'Inbound', 'Any', 'Any', 'Any', 'Any', 'Deny'],
        ],
        [1080, 1200, 1080, 960, 1440, 1440, 1080]
      ));

      content.push(b.createHeading('nsg-mgmt - Management NSG', HeadingLevel.HEADING_3));
      content.push(b.createTable(
        ['Priority', 'Direction', 'Protocol', 'Port', 'Source', 'Destination', 'Action'],
        [
          ['100', 'Inbound', 'TCP', '22', 'VPN CIDR', 'VNet', 'Allow'],
          ['110', 'Inbound', 'TCP', '3389', 'VPN CIDR', 'VNet', 'Allow'],
          ['120', 'Inbound', 'TCP', '443', 'VPN CIDR', 'VNet', 'Allow'],
          ['4096', 'Inbound', 'Any', 'Any', 'Any', 'Any', 'Deny'],
        ],
        [1080, 1200, 1080, 960, 1440, 1440, 1080]
      ));
    }
    content.push(b.createPageBreak());

    // 8. VPC Endpoints / Private Endpoints
    content.push(b.createHeading(`8. ${platform === 'aws' ? 'VPC Endpoints' : 'Private Endpoints'}`, HeadingLevel.HEADING_1));
    content.push(b.createInfoBox('Private Connectivity',
      platform === 'aws'
        ? 'VPC Endpoints provide private connectivity to AWS services without traversing the public internet, improving security and reducing data transfer costs.'
        : 'Private Endpoints provide private connectivity to Azure services via private IP addresses in your VNet, ensuring traffic stays on the Microsoft backbone network.'
    ));
    if (platform === 'aws') {
      content.push(b.createTable(
        ['Endpoint Name', 'Service', 'Type', 'Subnet', 'Security Group'],
        [
          ['vpce-s3', 'com.amazonaws.region.s3', 'Gateway', 'All route tables', 'N/A'],
          ['vpce-dynamodb', 'com.amazonaws.region.dynamodb', 'Gateway', 'All route tables', 'N/A'],
          ['vpce-ssm', 'com.amazonaws.region.ssm', 'Interface', 'priv-subnet-az1', 'sg-endpoints'],
          ['vpce-logs', 'com.amazonaws.region.logs', 'Interface', 'priv-subnet-az1', 'sg-endpoints'],
          ['vpce-monitoring', 'com.amazonaws.region.monitoring', 'Interface', 'priv-subnet-az1', 'sg-endpoints'],
        ],
        [1800, 2760, 1200, 1800, 1800]
      ));
    } else {
      content.push(b.createTable(
        ['Endpoint Name', 'Target Resource', 'Subnet', 'Private IP', 'DNS Zone'],
        [
          ['pe-storage', 'Storage Account', 'sn-private-001', 'Auto-assigned', 'privatelink.blob.core.windows.net'],
          ['pe-keyvault', 'Key Vault', 'sn-private-001', 'Auto-assigned', 'privatelink.vaultcore.azure.net'],
          ['pe-sql', 'SQL Database', 'sn-private-001', 'Auto-assigned', 'privatelink.database.windows.net'],
        ],
        [1800, 1920, 1680, 1560, 2400]
      ));
    }
    content.push(b.createPageBreak());

    // 9. Elastic IPs / Public IPs
    content.push(b.createHeading(`9. ${platform === 'aws' ? 'Elastic IP Addresses' : 'Public IP Addresses'}`, HeadingLevel.HEADING_1));
    content.push(b.createPara(`Static public IP addresses allocated for the infrastructure:`));
    content.push(b.createTable(
      ['Name', 'Allocation', 'Associated Resource', 'Purpose'],
      [
        [`${data.projectName}-eip-natgw-1`, 'Static', 'NAT Gateway AZ-1', 'Outbound internet (AZ-1)'],
        [`${data.projectName}-eip-natgw-2`, 'Static', 'NAT Gateway AZ-2', 'Outbound internet (AZ-2)'],
        [`${data.projectName}-eip-vpn`, 'Static', 'VPN Gateway', 'VPN endpoint'],
      ],
      [2400, 1440, 2520, 3000]
    ));
    content.push(b.createPageBreak());

    // 10. VPN Configuration
    content.push(b.createHeading('10. VPN Configuration', HeadingLevel.HEADING_1));

    content.push(b.createHeading('10.1 Site-to-Site VPN Parameters', HeadingLevel.HEADING_2));
    content.push(b.createTable(
      ['Parameter', 'Value'],
      [
        ['VPN Type', 'Route-based (BGP or Static)'],
        ['Number of Tunnels', '2 (Active/Standby or Active/Active)'],
        ['Encryption', 'AES-256-GCM'],
        ['Hashing', 'SHA-256'],
        ['DH Group', 'Group 20 (384-bit ECP)'],
        ['Lifetime (Phase 1)', '28800 seconds (8 hours)'],
        ['Lifetime (Phase 2)', '3600 seconds (1 hour)'],
        ['Dead Peer Detection', 'Enabled (10s interval, 3 retries)'],
        ['NAT Traversal', 'Enabled'],
        ['Perfect Forward Secrecy', 'Enabled (DH Group 20)'],
      ],
      [3600, 5760]
    ));

    content.push(b.createHeading('10.2 IKE Phase 1 (IKEv2)', HeadingLevel.HEADING_2));
    content.push(b.createInfoBox('IKE Phase 1',
      'IKE Phase 1 establishes a secure authenticated communication channel between VPN peers using the Internet Key Exchange protocol.'
    ));
    content.push(b.createTable(
      ['Parameter', 'Primary', 'Alternative'],
      [
        ['IKE Version', 'IKEv2', 'IKEv1 (fallback)'],
        ['Encryption Algorithm', 'AES-256-GCM', 'AES-256-CBC'],
        ['Integrity Algorithm', 'SHA-384', 'SHA-256'],
        ['DH Group', 'Group 20', 'Group 14'],
        ['PRF', 'SHA-384', 'SHA-256'],
        ['SA Lifetime', '28800 seconds', '86400 seconds'],
        ['Authentication', 'Pre-Shared Key', 'Certificate'],
      ],
      [2400, 3480, 3480]
    ));

    content.push(b.createHeading('10.3 IKE Phase 2 (IPsec)', HeadingLevel.HEADING_2));
    content.push(b.createInfoBox('IKE Phase 2',
      'IKE Phase 2 negotiates the IPsec Security Associations that protect the actual data traffic flowing through the VPN tunnel.'
    ));
    content.push(b.createTable(
      ['Parameter', 'Primary', 'Alternative'],
      [
        ['ESP Encryption', 'AES-256-GCM', 'AES-256-CBC'],
        ['ESP Integrity', 'SHA-256', 'SHA-384'],
        ['PFS Group', 'Group 20', 'Group 14'],
        ['SA Lifetime', '3600 seconds', '1800 seconds'],
        ['Replay Detection', 'Enabled', 'Enabled'],
        ['Mode', 'Tunnel', 'Tunnel'],
      ],
      [2400, 3480, 3480]
    ));
    content.push(b.createPageBreak());

    // 11. Security Appliance Deployment
    content.push(b.createHeading('11. Security Appliance Deployment', HeadingLevel.HEADING_1));

    content.push(b.createHeading('11.1 Deployment Configuration', HeadingLevel.HEADING_2));
    const hasFortigate = data.components.some(c => c.toLowerCase().includes('forti'));
    if (hasFortigate) {
      content.push(b.createPara('Fortinet security appliances are deployed for centralized security management and logging.'));
      content.push(b.createTable(
        ['Appliance', 'Instance Type', 'Deployment', 'Subnet', 'Purpose'],
        [
          ['FortiGate', platform === 'aws' ? 'c5.xlarge' : 'Standard_F4s_v2', 'Active-Passive HA', 'Security Subnet', 'Next-gen firewall'],
          ['FortiManager', platform === 'aws' ? 'c5.large' : 'Standard_F2s_v2', 'Single Instance', 'Management Subnet', 'Centralized management'],
          ['FortiAnalyzer', platform === 'aws' ? 'c5.large' : 'Standard_F2s_v2', 'Single Instance', 'Management Subnet', 'Log analytics'],
        ],
        [1560, 1800, 1800, 1800, 2400]
      ));
    } else {
      content.push(b.createPara(
        `Security appliance specifications will be determined based on the selected vendor and deployment model. ` +
        `${platform === 'aws' ? 'AWS Network Firewall or third-party appliances from AWS Marketplace' : 'Azure Firewall or third-party NVAs from Azure Marketplace'} may be used.`
      ));
    }

    content.push(b.createHeading('11.2 Port Requirements', HeadingLevel.HEADING_2));
    content.push(b.createTable(
      ['Service', 'Protocol', 'Port', 'Direction', 'Purpose'],
      [
        ['Management', 'TCP', '443', 'Inbound', 'Web-based management console'],
        ['Management', 'TCP', '22', 'Inbound', 'CLI access via SSH'],
        ['Logging', 'TCP', '514', 'Inbound', 'Syslog from managed devices'],
        ['Logging', 'TCP', '443', 'Outbound', 'Cloud logging service'],
        ['HA Sync', 'TCP/UDP', '703', 'Bidirectional', 'HA heartbeat and sync'],
        ['NTP', 'UDP', '123', 'Outbound', 'Time synchronization'],
        ['DNS', 'UDP/TCP', '53', 'Outbound', 'Name resolution'],
      ],
      [1560, 1320, 1080, 1560, 3840]
    ));
    content.push(b.createPageBreak());

    // 12. SOC Integration
    content.push(b.createHeading('12. SOC Integration', HeadingLevel.HEADING_1));
    content.push(b.createPara(
      'Security Operations Center (SOC) integration enables centralized security monitoring, incident detection, and response capabilities.'
    ));
    content.push(b.createTable(
      ['Integration Point', 'Protocol', 'Destination', 'Data Type', 'Frequency'],
      [
        ['SIEM Log Forwarding', 'Syslog/TCP 514', 'SOC SIEM Platform', 'Security events', 'Real-time'],
        ['Flow Logs', 'HTTPS', platform === 'aws' ? 'S3 > SIEM' : 'Storage > Sentinel', 'Network flows', 'Near real-time'],
        ['Alert Notifications', 'HTTPS/Webhook', 'SOC Alert Platform', 'Critical alerts', 'Real-time'],
        ['Vulnerability Scans', 'HTTPS', 'SOC Scanner', 'Scan results', 'Scheduled'],
      ],
      [2100, 1560, 2100, 1800, 1800]
    ));
    content.push(b.createPageBreak());

    // 13. High Availability Design
    content.push(b.createHeading('13. High Availability Design', HeadingLevel.HEADING_1));
    content.push(b.createPara('The infrastructure is designed with redundancy at every layer to maximize availability.'));
    content.push(b.createTable(
      ['Component', 'HA Strategy', 'Failover Type', 'RPO', 'RTO'],
      [
        [platform === 'aws' ? 'VPC' : 'VNet', 'Multi-AZ / Multi-region', 'Automatic', 'N/A', 'N/A'],
        ['NAT Gateway', 'One per AZ', 'Automatic', '0', 'Immediate'],
        ['VPN', 'Dual tunnels', 'Automatic (BGP)', '0', '< 60s'],
        [platform === 'aws' ? 'Transit Gateway' : 'Virtual WAN', 'Built-in HA', 'Automatic', '0', 'Immediate'],
        ['Security Appliance', 'Active-Passive', 'Stateful failover', '0', '< 30s'],
        ['Load Balancer', 'Zone-redundant', 'Automatic', '0', 'Immediate'],
      ],
      [1800, 1920, 1680, 960, 1200]
    ));
    content.push(b.createPageBreak());

    // 14. Naming Convention
    content.push(b.createHeading('14. Naming Convention', HeadingLevel.HEADING_1));
    content.push(b.createPara('All resources follow a standardized naming convention for consistency.'));
    content.push(b.createInfoBox('Naming Format',
      platform === 'aws'
        ? 'Format: {project}-{env}-{region}-{resource}-{seq}  Example: proj-prod-apse1-vpc-001'
        : 'Format: {project}-{env}-{region}-{resource}-{seq}  Example: proj-prod-sea-vnet-001'
    ));
    content.push(b.createTable(
      ['Abbreviation', 'Environment'],
      [
        ['prod', 'Production'],
        ['stg', 'Staging'],
        ['dev', 'Development'],
        ['uat', 'User Acceptance Testing'],
      ],
      [3000, 6360]
    ));
    content.push(b.createPageBreak());

    // 15. Transit Gateway / Virtual WAN
    content.push(b.createHeading(`15. ${platform === 'aws' ? 'Transit Gateway' : 'Virtual WAN'} Configuration`, HeadingLevel.HEADING_1));

    if (platform === 'aws') {
      content.push(b.createHeading('15.1 TGW Attachments', HeadingLevel.HEADING_2));
      content.push(b.createTable(
        ['Attachment Name', 'Type', 'Resource', 'Subnets', 'Route Table'],
        [
          ['tgw-attach-prod-vpc', 'VPC', `${data.projectName}-prod-vpc`, 'tgw-subnet-az1, tgw-subnet-az2', 'tgw-rt-prod'],
          ['tgw-attach-vpn', 'VPN', 'Site-to-Site VPN', 'N/A', 'tgw-rt-vpn'],
        ],
        [2100, 1080, 2100, 2280, 1800]
      ));

      content.push(b.createHeading('15.2 TGW Route Tables', HeadingLevel.HEADING_2));
      content.push(b.createHeading('tgw-rt-prod', HeadingLevel.HEADING_3));
      content.push(b.createTable(
        ['Destination', 'Attachment', 'Route Type', 'Status'],
        [
          ['10.0.0.0/16', 'tgw-attach-prod-vpc', 'Static', 'Active'],
          ['172.16.0.0/12', 'tgw-attach-vpn', 'Propagated', 'Active'],
          ['0.0.0.0/0', 'tgw-attach-prod-vpc', 'Static', 'Blackhole'],
        ],
        [2400, 2760, 1800, 2400]
      ));
    } else {
      content.push(b.createHeading('15.1 Virtual WAN Hub', HeadingLevel.HEADING_2));
      content.push(b.createTable(
        ['Parameter', 'Value'],
        [
          ['Virtual WAN Name', `${data.projectName}-vwan`],
          ['Hub Name', `${data.projectName}-hub-sea`],
          ['Hub Region', data.projectDetails.region || 'Southeast Asia'],
          ['Hub Address Prefix', '10.100.0.0/24'],
          ['SKU', 'Standard'],
        ],
        [3600, 5760]
      ));

      content.push(b.createHeading('15.2 Hub Connections', HeadingLevel.HEADING_2));
      content.push(b.createTable(
        ['Connection Name', 'Type', 'Connected Resource', 'Routing Configuration'],
        [
          [`conn-${data.projectName}-vnet`, 'VNet Connection', `${data.projectName}-prod-vnet`, 'Default route table'],
          [`conn-${data.projectName}-vpn`, 'VPN (S2S)', 'On-premises gateway', 'Default route table'],
        ],
        [2400, 1800, 2760, 2400]
      ));
    }
    content.push(b.createPageBreak());

    // 16. Appendix
    content.push(b.createHeading('16. Appendix', HeadingLevel.HEADING_1));

    content.push(b.createHeading('16.1 Resource Summary', HeadingLevel.HEADING_2));
    content.push(b.createPara('Complete inventory of all provisioned resources:'));
    if (platform === 'aws') {
      content.push(b.createTable(
        ['Resource Type', 'Count', 'Names'],
        [
          ['VPC', '1', `${data.projectName}-prod-vpc`],
          ['Subnets', '7', 'pub(2), priv(2), mgmt(1), tgw(2)'],
          ['Internet Gateway', '1', `${data.projectName}-igw`],
          ['NAT Gateway', '2', `${data.projectName}-natgw-az1/az2`],
          ['Transit Gateway', '1', `${data.projectName}-tgw`],
          ['Route Tables', '4', 'rt-public, rt-private-az1/az2, rt-mgmt'],
          ['Security Groups', '4+', 'sg-web, sg-app, sg-db, sg-mgmt'],
          ['VPC Endpoints', '5+', 'S3, DynamoDB, SSM, Logs, Monitoring'],
          ['Elastic IPs', '3+', 'NAT GW (2), VPN (1)'],
        ],
        [2400, 1200, 5760]
      ));
    } else {
      content.push(b.createTable(
        ['Resource Type', 'Count', 'Names'],
        [
          ['Resource Group', '1', `${data.projectName}-rg`],
          ['Virtual Network', '1', `${data.projectName}-prod-vnet`],
          ['Subnets', '7', 'public(2), private(2), mgmt(1), fw(1), gw(1)'],
          ['NAT Gateway', '1', `${data.projectName}-natgw-001`],
          ['VPN Gateway', '1', `${data.projectName}-vpngw`],
          ['Azure Firewall', '1', `${data.projectName}-afw`],
          ['NSGs', '3+', 'nsg-public, nsg-private, nsg-mgmt'],
          ['Route Tables', '3', 'rt-public, rt-private, rt-mgmt'],
          ['Private Endpoints', '3+', 'Storage, Key Vault, SQL'],
        ],
        [2400, 1200, 5760]
      ));
    }

    content.push(b.createHeading('16.2 Contact Information', HeadingLevel.HEADING_2));
    content.push(b.createTable(
      ['Role', 'Name', 'Email', 'Phone'],
      [
        ['Solution Architect', data.projectDetails.authorName, '[email]', '[phone]'],
        ['Project Manager', '[Name]', '[email]', '[phone]'],
        ['Client Technical Lead', '[Name]', '[email]', '[phone]'],
        ['Network Engineer', '[Name]', '[email]', '[phone]'],
      ],
      [2100, 2400, 2760, 2100]
    ));

    if (data.additionalInfo) {
      content.push(b.createHeading('16.3 Additional Notes', HeadingLevel.HEADING_2));
      content.push(b.createPara(data.additionalInfo));
    }

    return content;
  }

  // ─── HELPER METHODS ───────────────────────────────────────────────────────

  getComponentDescription(component, platform) {
    const descriptions = {
      'Transit Gateway': platform === 'aws'
        ? 'AWS Transit Gateway acts as a centralized routing hub that connects VPCs, VPN connections, and Direct Connect gateways. It simplifies network architecture by eliminating complex VPC peering relationships.'
        : 'Azure Virtual WAN provides a centralized routing hub for connecting VNets, VPN connections, and ExpressRoute circuits.',
      'TGW': 'Transit Gateway provides centralized route management and traffic inspection capabilities across the entire network.',
      'VPN': `Site-to-Site VPN establishes encrypted IPsec tunnels between the on-premises infrastructure and ${platform === 'aws' ? 'AWS' : 'Azure'} cloud environment, ensuring secure hybrid connectivity.`,
      'VPC': 'Amazon Virtual Private Cloud provides an isolated network environment with full control over IP addressing, subnets, routing, and security.',
      'VNet': 'Azure Virtual Network provides an isolated network environment for deploying Azure resources with full control over IP addressing and security.',
      'FortiGate': 'FortiGate Next-Generation Firewall provides advanced threat protection, SSL inspection, and application control capabilities.',
      'FortiManager': 'FortiManager provides centralized management for Fortinet security devices including policy management, firmware updates, and configuration backup.',
      'FortiAnalyzer': 'FortiAnalyzer provides centralized logging, reporting, and analytics for Fortinet security infrastructure.',
      'Fortinet': 'Fortinet security fabric provides integrated security across the network including next-gen firewall, VPN, and advanced threat protection.',
      'Load Balancer': platform === 'aws'
        ? 'Elastic Load Balancing distributes incoming traffic across multiple targets for high availability.'
        : 'Azure Load Balancer distributes incoming traffic across backend pool instances.',
      'ALB': 'Application Load Balancer operates at Layer 7 and routes traffic based on content of the request.',
      'NLB': 'Network Load Balancer operates at Layer 4 and handles millions of requests per second with ultra-low latency.',
      'NAT Gateway': `NAT Gateway enables outbound internet connectivity for resources in private subnets while preventing unsolicited inbound connections.`,
      'Internet Gateway': 'Internet Gateway provides connectivity between the VPC and the public internet for resources with public IP addresses.',
      'QRadar': 'IBM QRadar SIEM provides real-time security event monitoring, correlation, and threat detection.',
      'SIEM': 'Security Information and Event Management system aggregates and analyzes security events from across the infrastructure.',
      'SOC': 'Security Operations Center provides 24/7 monitoring, incident detection, and response capabilities.',
      'Firewall': `${platform === 'aws' ? 'AWS Network Firewall' : 'Azure Firewall'} provides managed, stateful network traffic inspection and filtering.`,
      'WAF': `${platform === 'aws' ? 'AWS WAF' : 'Azure WAF'} protects web applications from common exploits and vulnerabilities.`,
      'CloudWatch': 'Amazon CloudWatch provides monitoring and observability for AWS resources and applications.',
      'Azure Monitor': 'Azure Monitor provides comprehensive monitoring for Azure resources with metrics, logs, and alerts.',
      'GuardDuty': 'Amazon GuardDuty provides intelligent threat detection that continuously monitors for malicious activity.',
      'SASE': 'Secure Access Service Edge converges networking and security functions into a unified cloud-delivered service.',
      'SD-WAN': 'Software-Defined Wide Area Network provides centralized control and optimization of WAN connectivity.',
      'Zscaler': 'Zscaler provides cloud-native security including Secure Web Gateway, CASB, and Zero Trust Network Access.',
      'ZTNA': 'Zero Trust Network Access provides secure remote access to applications based on identity and context.',
    };
    return descriptions[component] || `${component} is deployed as part of the infrastructure solution to support the project requirements.`;
  }

  calculateUsableIPs(cidr) {
    const prefix = parseInt(cidr.split('/')[1]);
    if (isNaN(prefix) || prefix < 0 || prefix > 32) return 'N/A';
    const total = Math.pow(2, 32 - prefix);
    const usable = Math.max(total - 5, 0); // AWS/Azure reserve 5 IPs per subnet
    return usable.toLocaleString();
  }
}

module.exports = TemplateProcessor;

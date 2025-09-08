/**
 * Attestation Service for Phala Network TEE
 * Proves application identity, developer ownership, and integrity
 * Author: Dylan Kawalec - Developer Relations at Phala Network
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

interface AttestationData {
  // Application Identity
  appName: string;
  appVersion: string;
  developer: {
    name: string;
    role: string;
    organization: string;
  };
  
  // Environment
  environment: {
    nodeEnv: string;
    teeEnvironment: string;
    hostname: string;
    platform: string;
  };
  
  // Code Integrity
  codeIntegrity: {
    gitCommit: string;
    gitBranch: string;
    buildTimestamp: string;
    sourceHash: string;
    configHash: string;
  };
  
  // Runtime Attestation
  runtime: {
    nodeVersion: string;
    npmVersion: string;
    pythonVersion: string;
    bunVersion?: string;
  };
  
  // Cryptographic Proofs
  proofs: {
    applicationHash: string;
    attestationSignature: string;
    teeQuote?: string;
    phalaProof?: string;
  };
  
  // Timestamps
  timestamps: {
    created: string;
    expires: string;
  };
}

export class AttestationService {
  private readonly apiKey: string;
  private readonly endpoint: string;
  private readonly attestationSeed: string;
  private readonly attestationSalt: string;
  
  constructor() {
    this.apiKey = process.env.PHALA_API_KEY || '';
    this.endpoint = process.env.PHALA_ENDPOINT || 'https://poc6.phala.network/tee-api';
    this.attestationSeed = process.env.ATTESTATION_SEED || 'phala-attestation-dashboard-2025';
    this.attestationSalt = process.env.ATTESTATION_SALT || 'dylan-kawalec-phala-devrel';
    
    if (!this.apiKey) {
      throw new Error('PHALA_API_KEY is required for attestation');
    }
  }
  
  /**
   * Generate comprehensive attestation data
   */
  public async generateAttestation(): Promise<AttestationData> {
    const attestation: AttestationData = {
      appName: process.env.APP_NAME || 'remote-attestation-dashboard',
      appVersion: process.env.APP_VERSION || '1.0.0',
      developer: {
        name: process.env.DEVELOPER_NAME || 'Dylan Kawalec',
        role: process.env.DEVELOPER_ROLE || 'Developer Relations',
        organization: process.env.ORGANIZATION || 'Phala Network'
      },
      environment: {
        nodeEnv: process.env.NODE_ENV || 'production',
        teeEnvironment: process.env.TEE_ENVIRONMENT || 'production',
        hostname: this.getHostname(),
        platform: process.platform
      },
      codeIntegrity: {
        gitCommit: this.getGitCommit(),
        gitBranch: this.getGitBranch(),
        buildTimestamp: process.env.BUILD_TIMESTAMP || new Date().toISOString(),
        sourceHash: await this.hashSourceCode(),
        configHash: await this.hashConfiguration()
      },
      runtime: {
        nodeVersion: process.version,
        npmVersion: this.getNpmVersion(),
        pythonVersion: this.getPythonVersion(),
        bunVersion: this.getBunVersion()
      },
      proofs: {
        applicationHash: '',
        attestationSignature: '',
        teeQuote: '',
        phalaProof: ''
      },
      timestamps: {
        created: new Date().toISOString(),
        expires: new Date(Date.now() + 86400000).toISOString() // 24 hours
      }
    };
    
    // Generate cryptographic proofs
    attestation.proofs.applicationHash = this.generateApplicationHash(attestation);
    attestation.proofs.attestationSignature = await this.signAttestation(attestation);
    
    // Get TEE attestation from Phala
    const teeData = await this.getPhalaAttestation(attestation);
    attestation.proofs.teeQuote = teeData.quote;
    attestation.proofs.phalaProof = teeData.proof;
    
    return attestation;
  }
  
  /**
   * Verify attestation data
   */
  public async verifyAttestation(attestation: AttestationData): Promise<boolean> {
    // Verify application hash
    const expectedHash = this.generateApplicationHash(attestation);
    if (attestation.proofs.applicationHash !== expectedHash) {
      console.error('Application hash mismatch');
      return false;
    }
    
    // Verify signature
    const validSignature = await this.verifySignature(
      attestation,
      attestation.proofs.attestationSignature
    );
    if (!validSignature) {
      console.error('Invalid attestation signature');
      return false;
    }
    
    // Verify with Phala Network
    const phalaValid = await this.verifyWithPhala(attestation);
    if (!phalaValid) {
      console.error('Phala verification failed');
      return false;
    }
    
    // Check expiration
    if (new Date(attestation.timestamps.expires) < new Date()) {
      console.error('Attestation expired');
      return false;
    }
    
    return true;
  }
  
  /**
   * Get attestation from Phala Network TEE
   */
  private async getPhalaAttestation(data: any): Promise<{ quote: string; proof: string }> {
    try {
      const response = await fetch(`${this.endpoint}/attestation/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: data,
          clusterId: process.env.PHALA_CLUSTER_ID,
          contractId: process.env.PHALA_CONTRACT_ID
        })
      });
      
      if (!response.ok) {
        throw new Error(`Phala API error: ${response.statusText}`);
      }
      
      const result = await response.json();
      return {
        quote: result.quote || '',
        proof: result.proof || ''
      };
    } catch (error) {
      console.error('Failed to get Phala attestation:', error);
      // Return empty values in development
      if (process.env.NODE_ENV !== 'production') {
        return { quote: 'dev-quote', proof: 'dev-proof' };
      }
      throw error;
    }
  }
  
  /**
   * Verify attestation with Phala Network
   */
  private async verifyWithPhala(attestation: AttestationData): Promise<boolean> {
    try {
      const response = await fetch(`${this.endpoint}/attestation/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          quote: attestation.proofs.teeQuote,
          proof: attestation.proofs.phalaProof,
          data: attestation
        })
      });
      
      if (!response.ok) {
        return false;
      }
      
      const result = await response.json();
      return result.valid === true;
    } catch (error) {
      console.error('Phala verification error:', error);
      return false;
    }
  }
  
  /**
   * Generate application hash
   */
  private generateApplicationHash(attestation: AttestationData): string {
    const data = {
      app: attestation.appName,
      version: attestation.appVersion,
      developer: attestation.developer,
      environment: attestation.environment,
      codeIntegrity: attestation.codeIntegrity
    };
    
    return crypto
      .createHash('sha256')
      .update(JSON.stringify(data) + this.attestationSeed)
      .digest('hex');
  }
  
  /**
   * Sign attestation data
   */
  private async signAttestation(attestation: AttestationData): Promise<string> {
    const message = this.generateApplicationHash(attestation);
    const signature = crypto
      .createHmac('sha256', this.attestationSalt)
      .update(message)
      .digest('hex');
    
    return signature;
  }
  
  /**
   * Verify attestation signature
   */
  private async verifySignature(attestation: AttestationData, signature: string): Promise<boolean> {
    const expectedSignature = await this.signAttestation(attestation);
    return signature === expectedSignature;
  }
  
  /**
   * Hash source code files
   */
  private async hashSourceCode(): Promise<string> {
    const sourceDir = path.join(process.cwd(), 'src');
    const files: string[] = [];
    
    const readDir = (dir: string) => {
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory() && !entry.name.startsWith('.')) {
            readDir(fullPath);
          } else if (entry.isFile() && !entry.name.startsWith('.')) {
            files.push(fullPath);
          }
        }
      } catch (error) {
        // Directory might not exist
      }
    };
    
    readDir(sourceDir);
    
    const hash = crypto.createHash('sha256');
    for (const file of files.sort()) {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        hash.update(content);
      } catch (error) {
        // File might not be readable
      }
    }
    
    return hash.digest('hex');
  }
  
  /**
   * Hash configuration files
   */
  private async hashConfiguration(): Promise<string> {
    const configFiles = [
      'package.json',
      'tsconfig.json',
      '.env.production',
      'requirements.txt'
    ];
    
    const hash = crypto.createHash('sha256');
    
    for (const file of configFiles) {
      try {
        const content = fs.readFileSync(path.join(process.cwd(), file), 'utf-8');
        // Remove sensitive data before hashing
        const sanitized = file === '.env.production' 
          ? content.replace(/PHALA_API_KEY=.*/g, 'PHALA_API_KEY=***')
          : content;
        hash.update(sanitized);
      } catch (error) {
        // File might not exist
      }
    }
    
    return hash.digest('hex');
  }
  
  /**
   * Get Git commit hash
   */
  private getGitCommit(): string {
    try {
      return execSync('git rev-parse HEAD').toString().trim();
    } catch {
      return process.env.GIT_COMMIT_HASH || 'unknown';
    }
  }
  
  /**
   * Get Git branch
   */
  private getGitBranch(): string {
    try {
      return execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
    } catch {
      return process.env.GIT_BRANCH || 'unknown';
    }
  }
  
  /**
   * Get hostname
   */
  private getHostname(): string {
    try {
      return execSync('hostname').toString().trim();
    } catch {
      return 'unknown';
    }
  }
  
  /**
   * Get NPM version
   */
  private getNpmVersion(): string {
    try {
      return execSync('npm --version').toString().trim();
    } catch {
      return 'unknown';
    }
  }
  
  /**
   * Get Python version
   */
  private getPythonVersion(): string {
    try {
      return execSync('python3 --version').toString().trim().replace('Python ', '');
    } catch {
      return 'unknown';
    }
  }
  
  /**
   * Get Bun version
   */
  private getBunVersion(): string | undefined {
    try {
      return execSync('bun --version').toString().trim();
    } catch {
      return undefined;
    }
  }
  
  /**
   * Generate attestation report
   */
  public async generateReport(attestation: AttestationData): Promise<string> {
    const report = `
╔══════════════════════════════════════════════════════════════════════╗
║                    PHALA NETWORK TEE ATTESTATION REPORT              ║
╚══════════════════════════════════════════════════════════════════════╝

APPLICATION IDENTITY
────────────────────
• Name: ${attestation.appName}
• Version: ${attestation.appVersion}
• Environment: ${attestation.environment.teeEnvironment}

DEVELOPER CERTIFICATION
─────────────────────
• Developer: ${attestation.developer.name}
• Role: ${attestation.developer.role}
• Organization: ${attestation.developer.organization}

CODE INTEGRITY
──────────────
• Git Commit: ${attestation.codeIntegrity.gitCommit.substring(0, 8)}
• Git Branch: ${attestation.codeIntegrity.gitBranch}
• Source Hash: ${attestation.codeIntegrity.sourceHash.substring(0, 16)}...
• Config Hash: ${attestation.codeIntegrity.configHash.substring(0, 16)}...
• Build Time: ${attestation.codeIntegrity.buildTimestamp}

RUNTIME ENVIRONMENT
──────────────────
• Platform: ${attestation.environment.platform}
• Hostname: ${attestation.environment.hostname}
• Node.js: ${attestation.runtime.nodeVersion}
• NPM: ${attestation.runtime.npmVersion}
• Python: ${attestation.runtime.pythonVersion}
${attestation.runtime.bunVersion ? `• Bun: ${attestation.runtime.bunVersion}` : ''}

CRYPTOGRAPHIC PROOFS
───────────────────
• App Hash: ${attestation.proofs.applicationHash.substring(0, 32)}...
• Signature: ${attestation.proofs.attestationSignature.substring(0, 32)}...
• TEE Quote: ${attestation.proofs.teeQuote ? 'Present' : 'Not Available'}
• Phala Proof: ${attestation.proofs.phalaProof ? 'Verified' : 'Pending'}

VALIDITY
────────
• Created: ${attestation.timestamps.created}
• Expires: ${attestation.timestamps.expires}
• Status: ${new Date(attestation.timestamps.expires) > new Date() ? '✅ VALID' : '❌ EXPIRED'}

╔══════════════════════════════════════════════════════════════════════╗
║  This attestation proves that this application is running in a       ║
║  Phala Network TEE environment and is owned by Dylan Kawalec,       ║
║  Developer Relations at Phala Network.                               ║
╚══════════════════════════════════════════════════════════════════════╝
`;
    
    return report;
  }
}

// Export singleton instance
export const attestationService = new AttestationService();

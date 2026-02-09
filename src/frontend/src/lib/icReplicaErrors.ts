/**
 * Utilities for detecting and mapping Internet Computer replica rejection errors
 * to user-friendly, actionable error messages.
 */

interface ReplicaRejection {
  reject_code?: number;
  reject_message?: string;
  error_code?: string;
}

/**
 * Extracts replica rejection details from an unknown error object.
 * Handles various error formats from @dfinity/agent.
 */
export function extractReplicaRejection(error: unknown): ReplicaRejection | null {
  if (!error) return null;

  // Check if error is an object
  if (typeof error !== 'object') return null;

  const err = error as any;

  // Direct properties on error object
  const rejection: ReplicaRejection = {
    reject_code: err.reject_code ?? err.code,
    reject_message: err.reject_message ?? err.message,
    error_code: err.error_code,
  };

  // Check nested body property (common in IC agent errors)
  if (err.body) {
    rejection.reject_code = rejection.reject_code ?? err.body.reject_code;
    rejection.reject_message = rejection.reject_message ?? err.body.reject_message;
    rejection.error_code = rejection.error_code ?? err.body.error_code;
  }

  // Return null if we couldn't extract any useful info
  if (!rejection.reject_code && !rejection.reject_message && !rejection.error_code) {
    return null;
  }

  return rejection;
}

/**
 * Detects if an error is a "canister stopped" rejection (IC0508).
 * Checks both error code and reject message content.
 */
export function isCanisterStopped(error: unknown): boolean {
  const rejection = extractReplicaRejection(error);
  if (!rejection) return false;

  // Check error code
  if (rejection.error_code === 'IC0508') return true;

  // Check reject code (5 = CanisterReject)
  if (rejection.reject_code === 5) {
    // Check if message contains "is stopped"
    const message = rejection.reject_message?.toLowerCase() || '';
    if (message.includes('is stopped') || message.includes('stopped')) {
      return true;
    }
  }

  return false;
}

/**
 * Produces a user-friendly English error message for canister-stopped upload failures.
 */
export function getCanisterStoppedMessage(): string {
  return 'The backend canister is currently stopped. Uploads cannot proceed until the canister is started or redeployed. Please contact the system administrator.';
}

/**
 * Maps an upload error to an actionable English error message.
 * Returns both a user-friendly summary and technical details for debugging.
 */
export function mapUploadError(error: unknown): { summary: string; details: string } {
  // Check if it's a canister-stopped error
  if (isCanisterStopped(error)) {
    const rejection = extractReplicaRejection(error);
    return {
      summary: getCanisterStoppedMessage(),
      details: rejection?.reject_message || 'Canister stopped (IC0508)',
    };
  }

  // Extract any available error details
  const rejection = extractReplicaRejection(error);
  
  // Build technical details string
  let details = '';
  if (rejection) {
    if (rejection.error_code) details += `Error code: ${rejection.error_code}. `;
    if (rejection.reject_code) details += `Reject code: ${rejection.reject_code}. `;
    if (rejection.reject_message) details += rejection.reject_message;
  } else if (error instanceof Error) {
    details = error.message;
  } else if (typeof error === 'string') {
    details = error;
  } else {
    details = 'Unknown error occurred';
  }

  return {
    summary: 'Upload failed. Please check the error details below and try again.',
    details: details.trim() || 'No additional error information available',
  };
}

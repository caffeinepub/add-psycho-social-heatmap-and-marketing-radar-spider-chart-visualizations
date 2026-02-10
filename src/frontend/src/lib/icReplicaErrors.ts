/**
 * Utilities for detecting and mapping Internet Computer replica rejection errors
 * to user-friendly, actionable error messages.
 */

interface ReplicaRejection {
  reject_code?: number;
  reject_message?: string;
  error_code?: string;
  request_id?: string;
  canister_id?: string;
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
    request_id: err.request_id,
    canister_id: err.canister_id,
  };

  // Check nested body property (common in IC agent errors)
  if (err.body) {
    rejection.reject_code = rejection.reject_code ?? err.body.reject_code;
    rejection.reject_message = rejection.reject_message ?? err.body.reject_message;
    rejection.error_code = rejection.error_code ?? err.body.error_code;
  }

  // Check for request_id in various locations
  if (err.requestId) rejection.request_id = rejection.request_id ?? err.requestId;
  if (err.body?.request_id) rejection.request_id = rejection.request_id ?? err.body.request_id;

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
  return 'The backend canister is currently stopped or unavailable. Uploads cannot proceed until the canister is started or redeployed. Please try again later or contact the system administrator.';
}

/**
 * Formats technical replica rejection details as a readable multi-line English block.
 */
export function formatTechnicalDetails(rejection: ReplicaRejection | null, fallbackError?: unknown): string {
  if (!rejection) {
    // Fallback to basic error message
    if (fallbackError instanceof Error) {
      return fallbackError.message;
    } else if (typeof fallbackError === 'string') {
      return fallbackError;
    }
    return 'Unknown error occurred';
  }

  const lines: string[] = [];

  if (rejection.error_code) {
    lines.push(`Error Code: ${rejection.error_code}`);
  }

  if (rejection.reject_code !== undefined) {
    lines.push(`Reject Code: ${rejection.reject_code}`);
  }

  if (rejection.reject_message) {
    lines.push(`Message: ${rejection.reject_message}`);
  }

  if (rejection.request_id) {
    lines.push(`Request ID: ${rejection.request_id}`);
  }

  if (rejection.canister_id) {
    lines.push(`Canister ID: ${rejection.canister_id}`);
  }

  return lines.length > 0 ? lines.join('\n') : 'No additional error information available';
}

/**
 * Maps an upload error to an actionable English error message.
 * Returns both a user-friendly summary and technical details for debugging.
 */
export function mapUploadError(error: unknown): { summary: string; details: string } {
  const rejection = extractReplicaRejection(error);

  // Check if it's a canister-stopped error
  if (isCanisterStopped(error)) {
    return {
      summary: getCanisterStoppedMessage(),
      details: formatTechnicalDetails(rejection, error),
    };
  }

  // For other errors, provide generic message with technical details
  return {
    summary: 'Upload failed. Please check the error details below and try again.',
    details: formatTechnicalDetails(rejection, error),
  };
}

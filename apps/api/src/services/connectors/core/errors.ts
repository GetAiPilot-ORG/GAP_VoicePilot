export class ConnectorError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(code: string, message: string, statusCode: number = 400) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  public toJSON() {
    return {
      code: this.code,
      message: this.message,
    };
  }
}

export class ConnectorNotConnectedError extends ConnectorError {
  constructor(message: string = 'Workspace connector is not connected or enabled') {
    super('connector_not_connected', message, 404);
  }
}

export class PermissionDeniedError extends ConnectorError {
  constructor(message: string = 'Permission denied for this agent or connector') {
    super('permission_denied', message, 403);
  }
}

export class ToolDisabledError extends ConnectorError {
  constructor(toolName: string) {
    super('tool_disabled', `Tool '${toolName}' is disabled for this connector`, 403);
  }
}

export class ConfirmationRequiredError extends ConnectorError {
  constructor(toolName: string) {
    super('confirmation_required', `Tool '${toolName}' requires user confirmation before execution`, 409);
  }
}

export class CredentialExpiredError extends ConnectorError {
  constructor(message: string = 'Connector credentials have expired and need re-authorization') {
    super('credential_expired', message, 401);
  }
}

export class ProviderRateLimitedError extends ConnectorError {
  constructor(message: string = 'Upstream provider rate limit exceeded') {
    super('provider_rate_limited', message, 429);
  }
}

export class ProviderError extends ConnectorError {
  constructor(message: string = 'Upstream provider returned an error') {
    super('provider_error', message, 502);
  }
}

export class TimeoutError extends ConnectorError {
  constructor(toolName: string, timeoutMs: number) {
    super('timeout', `Tool execution for '${toolName}' timed out after ${timeoutMs}ms`, 408);
  }
}

export class InvalidArgumentsError extends ConnectorError {
  constructor(message: string = 'Invalid tool arguments provided') {
    super('invalid_arguments', message, 400);
  }
}

import { NormalizedVoicePilotEvent } from '../events/types';

export class TemplateInterpolator {
  /**
   * Recursively interpolate string template placeholders using data from NormalizedVoicePilotEvent.
   * Example: "Summary: {{summary}} for {{customer.name}}" -> "Summary: Lead requested demo for John"
   */
  public static interpolate(target: any, event: NormalizedVoicePilotEvent): any {
    if (typeof target === 'string') {
      return this.interpolateString(target, event);
    }

    if (Array.isArray(target)) {
      return target.map((item) => this.interpolate(item, event));
    }

    if (target && typeof target === 'object') {
      const result: Record<string, any> = {};
      for (const [key, value] of Object.entries(target)) {
        result[key] = this.interpolate(value, event);
      }
      return result;
    }

    return target;
  }

  private static interpolateString(str: string, event: NormalizedVoicePilotEvent): string {
    return str.replace(/\{\{\s*([\w\.]+)\s*\}\}/g, (match, path) => {
      const val = this.getValueByPath(event, path);
      if (val === undefined || val === null) {
        return '';
      }
      return String(val);
    });
  }

  private static getValueByPath(obj: any, path: string): any {
    if (!obj || !path) return undefined;

    // Handle shortcut aliases
    if (path === 'summary') return obj.summary;
    if (path === 'outcome') return obj.outcome;
    if (path === 'transcript') return obj.transcript;
    if (path === 'call_id') return obj.call_id;
    if (path === 'assistant_id') return obj.assistant_id;
    if (path === 'workspace_id') return obj.workspace_id;

    // Handle dot notation paths (e.g. customer.name, call.duration_seconds)
    const parts = path.split('.');
    let current = obj;

    for (const part of parts) {
      if (current === null || current === undefined) {
        return undefined;
      }
      current = current[part];
    }

    return current;
  }
}

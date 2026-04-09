/**
 * Base class for all plugin-related errors in Boltdocs.
 */
export class PluginError extends Error {
  public readonly pluginName: string

  constructor(pluginName: string, message: string) {
    super(`[plugin:${pluginName}] ${message}`)
    this.name = 'PluginError'
    this.pluginName = pluginName
    Object.setPrototypeOf(this, PluginError.prototype)
  }
}

/**
 * Specifically for schema or structure validation failures.
 */
export class PluginValidationError extends PluginError {
  constructor(pluginName: string, message: string) {
    super(pluginName, `Validation failed: ${message}`)
    this.name = 'PluginValidationError'
    Object.setPrototypeOf(this, PluginValidationError.prototype)
  }
}

/**
 * Specifically for version mismatch or compatibility issues.
 */
export class PluginCompatibilityError extends PluginError {
  constructor(pluginName: string, message: string) {
    super(pluginName, `Compatibility error: ${message}`)
    this.name = 'PluginCompatibilityError'
    Object.setPrototypeOf(this, PluginCompatibilityError.prototype)
  }
}

/**
 * Specifically for attempts to use capabilities without proper permissions.
 */
export class PluginPermissionError extends PluginError {
  constructor(pluginName: string, permission: string) {
    super(pluginName, `Missing required permission: '${permission}'`)
    this.name = 'PluginPermissionError'
    Object.setPrototypeOf(this, PluginPermissionError.prototype)
  }
}

/**
 * Specifically for errors that occur during the execution of a lifecycle hook.
 */
export class PluginHookError extends PluginError {
  public readonly hookName: string

  constructor(pluginName: string, hookName: string, originalError: Error) {
    super(pluginName, `Error in hook '${hookName}': ${originalError.message}`)
    this.name = 'PluginHookError'
    this.hookName = hookName
    // Prepend the hook name to the stack if possible
    this.stack = originalError.stack
    Object.setPrototypeOf(this, PluginHookError.prototype)
  }
}

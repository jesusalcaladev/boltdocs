import React from "react";
import "./Field.css";

export interface FieldProps {
  /** The name of the property or field */
  name: string;
  /** The data type of the field (e.g., "string", "number", "boolean") */
  type?: string;
  /** The default value if not provided */
  defaultValue?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Description or additional content */
  children: React.ReactNode;
  /** Optional anchor ID for linking */
  id?: string;
  /** Optional extra class name */
  className?: string;
}

/**
 * A highly aesthetic and readable component for documenting API fields/properties.
 */
export function Field({
  name,
  type,
  defaultValue,
  required = false,
  children,
  id,
  className = "",
}: FieldProps) {
  return (
    <div className={`ld-field ${className}`.trim()} id={id}>
      <div className="ld-field__header">
        <div className="ld-field__signature">
          <code className="ld-field__name">{name}</code>
          {type && (
            <span className="ld-field__type-badge">
              {type}
            </span>
          )}
          {required && (
            <span className="ld-field__required-badge">required</span>
          )}
        </div>
        
        {defaultValue && (
          <div className="ld-field__default">
            <span className="ld-field__default-label">Default:</span>
            <code className="ld-field__default-value">{defaultValue}</code>
          </div>
        )}
      </div>
      
      <div className="ld-field__content">
        {children}
      </div>
    </div>
  );
}

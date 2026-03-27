import React from "react";
import "./ComponentProps.css";

export interface PropItem {
  /** Name of the property */
  name: string;
  /** Data type of the property */
  type: string;
  /** Default value if not provided */
  defaultValue?: string;
  /** Whether the property is mandatory */
  required?: boolean;
  /** Description of what the property does */
  description: React.ReactNode;
}

export interface ComponentPropsProps {
  /** Title for the props section (optional) */
  title?: string;
  /** Array of property definitions */
  props: PropItem[];
  /** Optional extra class name */
  className?: string;
}

/**
 * A highly compact, minimalist component for displaying component properties in a table.
 */
export function ComponentProps({
  title,
  props,
  className = "",
}: ComponentPropsProps) {
  return (
    <div className={`ld-component-props ${className}`.trim()}>
      {title && <h3 className="ld-component-props__title">{title}</h3>}
      <div className="ld-component-props__wrapper">
        <table className="ld-component-props__table">
          <thead>
            <tr>
              <th>Property</th>
              <th>Type</th>
              <th>Default</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {props.map((prop, index) => (
              <tr key={`${prop.name}-${index}`}>
                <td className="ld-prop-name-cell">
                  <code>{prop.name}</code>
                  {prop.required && <span className="ld-prop-required">*</span>}
                </td>
                <td className="ld-prop-type-cell">
                  <code className="ld-prop-type-tag">{prop.type}</code>
                </td>
                <td className="ld-prop-default-cell">
                  {prop.defaultValue ? (
                    <code>{prop.defaultValue}</code>
                  ) : (
                    <span className="ld-prop-none">—</span>
                  )}
                </td>
                <td className="ld-prop-desc-cell">
                  {prop.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

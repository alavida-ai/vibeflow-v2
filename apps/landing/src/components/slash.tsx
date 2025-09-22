import React from 'react';

interface SlashProps {
  /**
   * The thickness of the slash line
   */
  thickness?: number;
  /**
   * The width of the SVG viewBox
   */
  width?: number;
  /**
   * The height of the SVG viewBox
   */
  height?: number;
  /**
   * The color of the slash
   */
  color?: string;
  /**
   * Additional CSS classes
   */
  className?: string;
}

export const Slash: React.FC<SlashProps> = ({
  thickness = 2,
  width = 24,
  height = 24,
  color = 'currentColor',
  className = '',
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <line
        x1={width * 0.7}
        y1={height * 0.1}
        x2={width * 0.3}
        y2={height * 0.9}
        stroke={color}
        strokeWidth={thickness}
        strokeLinecap="round"
      />
    </svg>
  );
};

export default Slash;

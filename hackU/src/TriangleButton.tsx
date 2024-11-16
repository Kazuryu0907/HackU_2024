import React from "react";
import "./styles.css"; // CSSファイルをインポート

interface TriangleButtonProps {
  onClick: () => void;
}

const TriangleButton: React.FC<TriangleButtonProps> = ({ onClick }) => {
  return (
    <button className="triangle-button" onClick={onClick}>
      {/* ボタンの中にはテキストはないので、三角形として見える */}
    </button>
  );
};

export default TriangleButton;

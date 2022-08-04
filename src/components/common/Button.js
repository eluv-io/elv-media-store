import React from "react";
import ImageIcon from "Components/common/ImageIcon";

export const IconButton = ({icon, title}) => {
  return (
    <button type="button" className="icon-button" title={title}>
      <ImageIcon icon={icon} />
    </button>
  );
};

export const Button = ({children, variant="primary", icon}) => {
  return (
    <button type="button" className={`button button--${variant}`}>
      <div className="button__content">
        { icon ? <ImageIcon className="button__icon" icon={icon} /> : null }
        { children }
      </div>
    </button>
  );
};

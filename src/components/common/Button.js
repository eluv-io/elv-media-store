import React, {useEffect, useRef, useState} from "react";
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

export const ButtonWithMenu = ({buttonProps, RenderMenu, className=""}) => {
  const ref = useRef();
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const onClickOutside = event => {
      if(!ref.current || !ref.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("click", onClickOutside);

    return () => document.removeEventListener("click", onClickOutside);
  }, []);

  return (
    <div className={`menu-button ${showMenu ? "menu-button--active" : ""} ${className}`} ref={ref}>
      <button
        {...buttonProps}
        className={`menu-button__button ${buttonProps?.className || ""}`}
        onClick={() => {
          setShowMenu(!showMenu);

          if(buttonProps?.onClick) {
            buttonProps.onClick();
          }
        }}
      />
      {
        showMenu ?
          <div className="menu-button__menu">
            { RenderMenu(() => setShowMenu(false)) }
          </div> : null
      }
    </div>
  );
};

import React, {useState} from "react";
import ImageIcon from "Components/common/ImageIcon";

const ExpandableSection = ({header, icon, children, expanded=false, toggleable=true, className="", contentClassName="", additionalContent}) => {
  const [ show, setShow ] = useState(expanded);

  return (
    <div className={`expandable-section ${show ? "expandable-section-shown" : "expandable-section-hidden"} ${className}`}>
      <button className="expandable-section__header ellipsis" onClick={() => toggleable && setShow(!show)} tabIndex={0}>
        { icon ? <ImageIcon className="expandable-section__header__icon" icon={icon} title={header} /> : null}
        { header }
      </button>
      { show ? <div className={`expandable-section__content ${contentClassName}`}>{ children }</div> : null }
      { additionalContent || null }
    </div>
  );
};

export default ExpandableSection;

import React, {useState} from "react";
import {Link} from "react-router-dom";
import Card from "Components/common/Card";

const Slider = ({itemObjects, linkPath, OnClick}) => {
  const [items, setItems] = useState(itemObjects);
  const [animate, setAnimate] = useState(false);

  const LinkContainer = (props) => {
    const link = typeof linkPath === "function" ? linkPath(props) : linkPath;

    return (
      <Link
        className="card-link"
        to={link}
      >
        <Card
          image={props.imageUrl}
          title={props.title}
        />
      </Link>
    );
  };

  const ButtonContainer = (props) => {
    return (
      <button
        className="card-action"
        onClick={() => OnClick(props)}
      >
        <Card
          image={props.imageUrl}
          title={props.title}
        />
      </button>
    );
  };

  return (
    <div className="slider">
      <div className={`item-row${animate ? " item-row--sliding" : ""}`}>
        {
          items.map(({objectId, imageUrl, title, title_type}) => (
            <div key={objectId} className="slider-item">
              {
                linkPath ?
                  LinkContainer({objectId, imageUrl, title, title_type}) :
                  ButtonContainer({objectId, imageUrl, title})
              }
            </div>
          ))
        }
      </div>
      {
        items.length > 4 &&
        <span
          className="handle handle-next"
          role="button"
          onClick={() => {
            const newItems = items.slice(4).concat(items.slice(0, 4));

            setAnimate(true);

            setTimeout(() => {
              setAnimate(false);
              setItems(newItems);
            }, 3000);
          }}
        >
          <div className="right-caret" />
        </span>
      }
    </div>
  );
};

export default Slider;

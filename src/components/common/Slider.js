import React, {useCallback, useState} from "react";
import {Link} from "react-router-dom";
import Card from "Components/common/Card";
import {Swiper, SwiperSlide} from "swiper/react";
import {Navigation, A11y} from "swiper";
import "swiper/css";
import "swiper/css/navigation";

const Slider = ({items, linkPath, OnClick, itemsToShow=4}) => {
  const [swiperRef, setSwiperRef] = useState(null);
  const [isEnd, setIsEnd] = useState(false);
  const [isBeginning, setIsBeginning] = useState(true);

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

  const HandleLeftClick = useCallback(() => {
    if(!swiperRef) return;
    swiperRef.slidePrev();
  }, [swiperRef]);

  const HandleRightClick = useCallback(() => {
    if(!swiperRef) return;
    swiperRef.slideNext();
  }, [swiperRef]);

  const PageContent = () => {
    return (
      <div className="slider">
        {
          !isBeginning && (items.length > itemsToShow) && <span role="button" onClick={HandleLeftClick} className="handle handle-prev">
            <div className="left-caret"/>
          </span>
        }
        <Swiper
          modules={[Navigation, A11y]}
          direction="horizontal"
          spaceBetween={12}
          slidesPerView={itemsToShow}
          onSwiper={setSwiperRef}
          onSlideChange={(swiper) => {
            setIsBeginning(swiper.isBeginning);
            setIsEnd(swiper.isEnd);
          }}
          breakpoints={{
            300: {
              slidesPerView: 2,
              spaceBetween: 6
            },
            850: {
              slidesPerView: 3,
              spaceBetween: 6
            },
            1000: {
              slidesPerView: 4,
              spaceBetween: 12
            },
            1250: {
              slidesPerView: 4,
              spaceBetween: 12
            },
          }}
        >
          {
            items.map(({objectId, imageUrl, title, title_type}) => (
              <SwiperSlide key={objectId}>
                {
                  linkPath ?
                    LinkContainer({objectId, imageUrl, title, title_type}) :
                    ButtonContainer({objectId, imageUrl, title})
                }
              </SwiperSlide>
            ))
          }

          {/*<div className="swiper-button-prev swiper-custom-nav"></div>*/}
          {/*<div className="swiper-button-next swiper-custom-nav"></div>*/}
        </Swiper>
        {
          !isEnd && (items.length > itemsToShow) && <span role="button" onClick={HandleRightClick} className="handle handle-next">
            <div className="right-caret"/>
          </span>
        }
      </div>
    );
  };

  return PageContent();
};

export default Slider;

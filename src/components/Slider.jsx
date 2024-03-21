import { useEffect, useState } from 'react';
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';
import Spinner from '../components/Spinner';
import SwiperCore from 'swiper';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css/bundle';
import { useNavigate } from 'react-router-dom';
import { CATEGORY } from '../constants';

function Slider() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  SwiperCore.use([Autoplay, Navigation, Pagination]);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);

    const fetchUserListings = async () => {
      const listingRef = collection(db, 'listings');
      const q = query(listingRef, orderBy('timestamp', 'desc'), limit(5));

      const querySnap = await getDocs(q);
      let listingArr = [];
      querySnap.forEach((doc) => {
        return listingArr.push({ id: doc.id, data: doc.data() });
      });

      setListings(listingArr);
      setLoading(false);
    };

    fetchUserListings();
  }, []);

  console.log(listings);

  if (loading) {
    return <Spinner />;
  }
  return (
    <>
      {listings.length !== 0 && (
        <>
          <Swiper
            slidesPerView={1}
            navigation
            pagination={{ type: 'progressbar' }}
            effect="fade"
            modules={[EffectFade]}
            autoplay={{ delay: 3000 }}
          >
            {listings.map(({ data, id }) => (
              <SwiperSlide key={id} onClick={() => navigate(`${CATEGORY.href}/${data.type}/${id}`)}>
                <div
                  className="relative w-full overflow-hidden h-[300px]"
                  style={{ background: `url(${data.imgUrls[0]}) center no-repeat`, backgroundSize: 'cover' }}
                ></div>

                <p className="text-[#f1faee] absolute left-1 top-3 font-medium max-w-[90%] bg-[#457b9d] shadow-lg opacity-90 p-2 rounded-br-3xl">
                  {data.name}
                </p>

                <p className="text-[#f1faee] absolute left-1 bottom-1 font-medium max-w-[90%] bg-[#e63946] shadow-lg opacity-90 p-2 rounded-tr-3xl">
                  $
                  {data?.discountedPrice?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') ??
                    data?.regularPrice?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  {data.type === 'rent' && ' / month'}
                </p>
              </SwiperSlide>
            ))}
          </Swiper>
        </>
      )}
    </>
  );
}

export default Slider;

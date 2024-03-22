import { useEffect, useState } from 'react';
import Slider from '../components/Slider';
import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';
import { CATEGORY, OFFERS } from '../constants';
import ListingItem from '../components/ListingItem';

function Home() {
  const [offerListings, setOfferListings] = useState(null);
  const [rentListings, setRentListings] = useState(null);
  const [saleListings, setSaleListings] = useState(null);

  useEffect(() => {
    const fetchUserListings = async () => {
      try {
        const listingRef = collection(db, 'listings');
        const q = query(listingRef, where('offer', '==', true), orderBy('timestamp', 'desc'), limit(5));

        const querySnap = await getDocs(q);

        let queriedListings = [];
        querySnap.forEach((doc) => {
          return queriedListings.push({ id: doc.id, data: doc.data() });
        });

        setOfferListings(queriedListings);
      } catch (error) {
        console.error(error);
      }
    };

    fetchUserListings();
  }, []);

  useEffect(() => {
    const fetchUserListings = async () => {
      try {
        const listingRef = collection(db, 'listings');
        const q = query(listingRef, where('type', '==', 'rent'), orderBy('timestamp', 'desc'), limit(5));

        const querySnap = await getDocs(q);

        let queriedListings = [];
        querySnap.forEach((doc) => {
          return queriedListings.push({ id: doc.id, data: doc.data() });
        });

        setRentListings(queriedListings);
      } catch (error) {
        console.error(error);
      }
    };

    fetchUserListings();
  }, []);

  useEffect(() => {
    const fetchUserListings = async () => {
      try {
        const listingRef = collection(db, 'listings');
        const q = query(listingRef, where('type', '==', 'sale'), orderBy('timestamp', 'desc'), limit(5));

        const querySnap = await getDocs(q);

        let queriedListings = [];
        querySnap.forEach((doc) => {
          return queriedListings.push({ id: doc.id, data: doc.data() });
        });

        setSaleListings(queriedListings);
      } catch (error) {
        console.error(error);
      }
    };

    fetchUserListings();
  }, []);

  return (
    <div>
      <Slider />

      <div className="max-w-6xl mx-auto pt-4">
        {offerListings && offerListings.length > 0 && (
          <div className="m-2 mb-6">
            <h2 className="px-3 text-2xl mt-6 font-semibold">Recent Offers</h2>
            <Link to={OFFERS.href}>
              <p className="px-3 text-sm text-blue-600 hover:text-blue-800 transition duration-150 ease-in-out">
                Show more offers
              </p>
            </Link>

            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 mt-2">
              {offerListings.map((listing) => (
                <ListingItem key={listing.id} listing={listing.data} id={listing.id} />
              ))}
            </ul>
          </div>
        )}

        {rentListings && rentListings.length > 0 && (
          <div className="m-2 mb-6">
            <h2 className="px-3 text-2xl mt-6 font-semibold">Places for rent</h2>
            <Link to={`${CATEGORY.href}/${rentListings[0].data.type}`}>
              <p className="px-3 text-sm text-blue-600 hover:text-blue-800 transition duration-150 ease-in-out">
                Show more places for rent
              </p>
            </Link>

            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 mt-2">
              {rentListings.map((listing) => (
                <ListingItem key={listing.id} listing={listing.data} id={listing.id} />
              ))}
            </ul>
          </div>
        )}

        {saleListings && saleListings.length > 0 && (
          <div className="m-2 mb-6">
            <h2 className="px-3 text-2xl mt-6 font-semibold">Places for sale</h2>
            <Link to={`${CATEGORY.href}/${saleListings[0].data.type}`}>
              <p className="px-3 text-sm text-blue-600 hover:text-blue-800 transition duration-150 ease-in-out">
                Show more places for sale
              </p>
            </Link>

            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 mt-2">
              {saleListings.map((listing) => (
                <ListingItem key={listing.id} listing={listing.data} id={listing.id} />
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;

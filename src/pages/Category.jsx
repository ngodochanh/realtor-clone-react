import { useEffect, useState } from 'react';
import Spinner from '../components/Spinner';
import { collection, getDocs, limit, orderBy, query, startAfter, where } from 'firebase/firestore';
import { db } from '../firebase';
import { toast } from 'react-toastify';
import ListingItem from '../components/ListingItem';
import { useParams } from 'react-router-dom';

function Category() {
  const [listings, setListings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastFetchedListing, setLastFetchedListing] = useState(null);
  const params = useParams();

  useEffect(() => {
    setLoading(true);

    try {
      const fetchUserListings = async () => {
        const listingRef = collection(db, 'listings');
        const q = query(listingRef, where('type', '==', params.categoryName), orderBy('timestamp', 'desc'), limit(10));

        const querySnap = await getDocs(q);
        const lastVisible = querySnap.docs[querySnap.docs.length - 1];
        setLastFetchedListing(lastVisible);
        let queriedListings = [];
        querySnap.forEach((doc) => {
          return queriedListings.push({ id: doc.id, data: doc.data() });
        });

        setListings(queriedListings);
      };

      fetchUserListings();
      setLoading(false);
    } catch (error) {
      toast.error('Could not fetch listing');
    }
  }, [params.categoryName]);

  const onFetchMoreListings = async () => {
    try {
      const fetchUserListings = async () => {
        const listingRef = collection(db, 'listings');
        const q = query(
          listingRef,
          where('type', '==', params.categoryName),
          orderBy('timestamp', 'desc'),
          startAfter(lastFetchedListing),
          limit(5)
        );

        const querySnap = await getDocs(q);
        const lastVisible = querySnap.docs[querySnap.docs.length - 1];
        setLastFetchedListing(lastVisible);
        let queriedListings = [];
        querySnap.forEach((doc) => {
          return queriedListings.push({ id: doc.id, data: doc.data() });
        });

        setListings((prevState) => [...prevState, ...queriedListings]);
      };

      fetchUserListings();
    } catch (error) {
      toast.error('Could not fetch listing');
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="max-w-6xl mx-auto pt-3">
      <h2 className=" text-3xl mt-6 font-semibold text-center mb-6">
        {params.categoryName === 'rent' ? 'Places for rent' : 'Places for sale'}
      </h2>
      {listings && listings.length > 0 ? (
        <main className="mb-6">
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 mt-2">
            {listings.map((listing) => (
              <ListingItem key={listing.id} listing={listing.data} id={listing.id} />
            ))}
          </ul>

          {lastFetchedListing && (
            <div className="flex justify-center items-center">
              <button
                className="bg-white px-3 py-1.5 text-gray-700 border border-gray-300 mb-6 mt-6 
                hover:border-slate-600 rounded transition duration-150 ease-in-out"
                onClick={onFetchMoreListings}
              >
                Load more
              </button>
            </div>
          )}
        </main>
      ) : (
        <p>
          {params.categoryName === 'rent' ? 'No rental are currently available.' : 'No sales are currently available.'}
        </p>
      )}
    </div>
  );
}

export default Category;

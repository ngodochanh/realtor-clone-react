import { useEffect, useState } from 'react';
import { getAuth, signOut, updateProfile } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { CREATE_LISTING, HOME } from '../constants';
import { FcHome } from 'react-icons/fc';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import Spinner from '../components/Spinner';
import ListingItem from '../components/ListingItem';

function Profile() {
  const auth = getAuth();
  const navigate = useNavigate();
  const [changeDetail, setChangeDetail] = useState(false);
  const [formData, setFormData] = useState({
    name: auth.currentUser.displayName,
    email: auth.currentUser.email,
  });
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);

  const { name, email } = formData;

  const onLogout = async () => {
    try {
      await signOut(auth);
      navigate(HOME.href);
    } catch (error) {
      console.log(error);
    }
  };

  const onChange = (e) => {
    setFormData((prevState) => ({ ...prevState, [e.target.name]: e.target.value }));
  };

  const onSubmit = async () => {
    try {
      if (auth.currentUser.displayName !== name) {
        await updateProfile(auth.currentUser, {
          displayName: name,
        });

        const docRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(docRef, {
          name,
        });
      }
      toast.success('Profile details updated');
    } catch (error) {
      toast.error('Could not update the profile details');
    }
  };

  if (loading) {
    return <Spinner />;
  }

  useEffect(() => {
    const fetchUserListings = async () => {
      const listingRef = collection(db, 'listings');
      const q = query(listingRef, where('userRef', '==', auth.currentUser.uid), orderBy('timestamp', 'desc'));

      const querySnap = await getDocs(q);
      let listingArr = [];
      querySnap.forEach((doc) => {
        return listingArr.push({ id: doc.id, data: doc.data() });
      });

      setListings(listingArr);
      setLoading(false);
    };

    fetchUserListings();
  }, [auth.currentUser.uid]);

  return (
    <>
      <section className="max-w-6xl mx-auto flex justify-center items-center flex-col">
        <h1 className="text-3xl text-center mt-6 font-bold">My Profile</h1>

        <div className="w-full md:w-[50%] mt-6 px-3">
          <form className="space-y-6">
            <input
              type="text"
              name="name"
              value={name}
              disabled={!changeDetail}
              onChange={onChange}
              className={`w-full px-4 py-2 text-xl text-gray-700 border border-gray-300 rounded transition ease-in-out ${
                changeDetail ? 'bg-red-200' : 'bg-white'
              }`}
            />

            <input
              type="email"
              name="email"
              value={email}
              disabled
              onChange={onChange}
              className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition ease-in-out"
            />

            <div className="flex justify-between whitespace-nowrap  text-sm sm:text-lg">
              <p className="flex items-center">
                Do you want to change your name?
                <span
                  className="text-red-600 hover:text-red-700 transition ease-in-out duration-200 ml-1 cursor-pointer"
                  onClick={() => {
                    changeDetail && onSubmit();
                    setChangeDetail((prevState) => !prevState);
                  }}
                >
                  {changeDetail ? 'Apply change' : 'Edit'}
                </span>
              </p>

              <p
                className="text-blue-600 hover:text-blue-800 transition duration-200 ease-in-out cursor-pointer"
                onClick={onLogout}
              >
                Sign out
              </p>
            </div>
          </form>
          <button
            type="submit"
            className="w-full mt-6 bg-blue-600 text-white uppercase px-7 py-3 text-sm font-medium rounded shadow-md hover:bg-blue-700 transition duration-150 ease-in-out hover:shadow-lg active:bg-blue-800"
          >
            <Link className="flex justify-center items-center" to={CREATE_LISTING.href}>
              <FcHome className="mr-2 text-3xl bg-red-200 rounded-full p-1 border-2" />
              Sell or rent your home
            </Link>
          </button>
        </div>
      </section>

      <div className="max-w-6xl px-3 mt-6 mx-auto">
        {!loading && listings.length > 0 && (
          <>
            <h2 className="text-2xl text-center font-semibold">My Listings</h2>

            <ul>
              {listings.map((listing) => (
                <ListingItem key={listing.id} id={listing.id} listing={listing.data} />
              ))}
            </ul>
          </>
        )}
      </div>
    </>
  );
}

export default Profile;

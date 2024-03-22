import { useEffect, useState } from 'react';
import Spinner from '../components/Spinner';
import { toast } from 'react-toastify';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { v4 as uuidv4 } from 'uuid';
import { doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db, storage } from '../firebase';
import { useNavigate, useParams } from 'react-router-dom';
import { CATEGORY, HOME } from '../constants';

function EditListing() {
  const [formData, setFormData] = useState({
    type: 'rent',
    name: '',
    bedrooms: 1,
    bathrooms: 1,
    parking: false,
    furnished: false,
    address: '',
    description: '',
    offer: false,
    regularPrice: 0,
    discountedPrice: 0,
    latitude: 0,
    longitude: 0,
    images: {},
  });
  const [geolocationEnabled, setGeoLocationEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const auth = getAuth();
  const navigate = useNavigate();
  const params = useParams();
  const [listing, setListing] = useState([]);
  const {
    type,
    name,
    bedrooms,
    bathrooms,
    parking,
    furnished,
    address,
    description,
    offer,
    regularPrice,
    discountedPrice,
    latitude,
    longitude,
    images,
  } = formData;

  useEffect(() => {
    setLoading(true);

    const fetchListing = async () => {
      const docRef = doc(db, 'listings', params.listingId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setListing(docSnap.data());
        setFormData({
          ...docSnap.data(),
          latitude: docSnap.data().geolocation.lat,
          longitude: docSnap.data().geolocation.lng,
        });
      } else {
        navigate(HOME.href);
        toast.error('Listing does not exist');
      }
    };

    fetchListing();
    setLoading(false);
  }, [navigate, params.listingId]);

  useEffect(() => {
    if (listing.length !== 0 && listing.userRef !== auth.currentUser.uid) {
      toast.error("You can't edit this listing");
      navigate(HOME.href);
    }
  }, [auth.currentUser.uid, listing, navigate]);

  const onChange = (e) => {
    let boolean = null;

    if (e.target.value === 'true') {
      boolean = true;
    }

    if (e.target.value === 'false') {
      boolean = false;
    }

    if (e.target.files) {
      setFormData((prevState) => ({
        ...prevState,
        images: e.target.files,
      }));
    }

    if (!e.target.files) {
      setFormData((prevState) => ({ ...prevState, [e.target.name]: boolean ?? e.target.value }));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (+discountedPrice >= +regularPrice) {
      setLoading(false);
      toast.error('Discounted price needs to be less than regular price');
      return;
    }

    // Xử lý tạo độ
    let geolocation = {};
    let location;
    if (!geolocationEnabled) {
      geolocation.lat = +latitude;
      geolocation.lng = +longitude;
    }

    let formDataCopy = {};
    if (images) {
      if (images.length > 6) {
        setLoading(false);
        toast.error('Maximum 6 images are allowed');
        return;
      }

      // > 2mb
      let errorFile = 0;
      for (const file of images) {
        if (handleSingleImage(file)) {
          errorFile++;
          setLoading(false);
          toast.error(`File ${file.name} exceeds the 2MB limit.`);
        }
      }

      if (errorFile > 0) {
        return;
      }

      const storeImage = (image) => {
        return new Promise((resolve, reject) => {
          const fileName = `${auth.currentUser.uid}-${image.name}-${uuidv4()}`;
          const storageRef = ref(storage, fileName);
          const uploadTask = uploadBytesResumable(storageRef, image);

          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              toast.info(`Uploading ${image.name} is ${progress} % done`);
              switch (snapshot.state) {
                case 'paused':
                  toast.info(`Uploading ${image.name} is paused`);
                  break;
                case 'running':
                  toast.info(`Uploading ${image.name} running`);
                  break;
              }
            },
            (error) => {
              reject(error);
            },
            () => {
              getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                resolve(downloadURL);
              });
            }
          );
        });
      };

      const deleteImage = async (imageUrl) => {
        const imageRef = ref(storage, imageUrl);

        try {
          await deleteObject(imageRef);
          console.log('Image deleted from database:', imageUrl);
          toast.success('Image deleted from database:', imageUrl);
        } catch (error) {
          console.error('Error deleting image from database:', error);
          toast.error('Error deleting image from database');
        }
      };

      const newImagesSelected = images.length > 0;
      let imgUrls = [];
      if (!newImagesSelected) {
        imgUrls = formData.imgUrls || [];
      } else {
        imgUrls = await Promise.all([...images].map((image) => storeImage(image)))
          .then((urls) => {
            return urls.filter((url) => url !== undefined);
          })
          .catch((error) => {
            setLoading(false);
            toast.error('Images not uploaded');
          });

        formData.imgUrls.forEach((imageUrl) => {
          if (!imgUrls.includes(imageUrl)) {
            deleteImage(imageUrl);
          }
        });
      }

      formDataCopy = {
        ...formData,
        imgUrls,
        geolocation,
        timestamp: serverTimestamp(),
        userRef: auth.currentUser.uid,
      };

      delete formDataCopy.images;
    } else {
      formDataCopy = {
        ...formData,
        geolocation,
        timestamp: serverTimestamp(),
        userRef: auth.currentUser.uid,
      };
    }

    !formDataCopy.offer && delete formDataCopy.discountedPrice;
    delete formDataCopy.latitude;
    delete formDataCopy.longitude;
    setLoading(false);
    const docRef = doc(db, 'listings', params.listingId);
    await updateDoc(docRef, formDataCopy);
    toast.success('Listing edited');
    navigate(`${CATEGORY.href}/${formDataCopy.type}/${docRef.id}`);
  };

  const handleSingleImage = (file) => {
    const fileSizeInBytes = file.size;
    const fileSizeInMB = fileSizeInBytes / (1024 * 1024);

    return fileSizeInMB > 2 ? true : false;
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <main className="max-w-md px-2 mx-auto">
      <h1 className="text-3xl text-center mt-6 font-bold">Edit Listing</h1>

      <form onSubmit={onSubmit}>
        <p className="text-lg mt-6 font-semibold">Sell / Rent</p>
        <div className="flex gap-x-6">
          <button
            type="button"
            name="type"
            value="sale"
            className={`px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow active:shadow-lg transition duration-150 ease-in-out w-full ${
              type === 'rent' ? 'bg-white text-black' : 'bg-slate-600 text-white'
            }`}
            onClick={onChange}
          >
            sell
          </button>

          <button
            type="button"
            name="type"
            value="rent"
            className={`px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow active:shadow-lg transition duration-150 ease-in-out w-full ${
              type === 'sale' ? 'bg-white text-black' : 'bg-slate-600 text-white'
            }`}
            onClick={onChange}
          >
            rent
          </button>
        </div>

        <p className="text-lg mt-6 font-semibold">Name</p>
        <input
          type="text"
          name="name"
          value={name}
          onChange={onChange}
          placeholder="Name"
          maxLength="32"
          minLength="10"
          required
          className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 mb-6"
        />

        <div className="flex gap-x-6 mb-6">
          <div>
            <p className="text-lg font-semibold">Beds</p>
            <input
              type="number"
              name="bedrooms"
              value={bedrooms}
              onChange={onChange}
              min="1"
              max="50"
              required
              className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 text-center"
            />
          </div>

          <div>
            <p className="text-lg font-semibold">Baths</p>
            <input
              type="number"
              name="bathrooms"
              value={bathrooms}
              onChange={onChange}
              min="1"
              max="50"
              required
              className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 text-center"
            />
          </div>
        </div>

        <p className="text-lg mt-6 font-semibold">Parking spot</p>
        <div className="flex gap-x-6">
          <button
            type="button"
            name="parking"
            value={true}
            className={`px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow active:shadow-lg transition duration-150 ease-in-out w-full ${
              !parking ? 'bg-white text-black' : 'bg-slate-600 text-white'
            }`}
            onClick={onChange}
          >
            yes
          </button>

          <button
            type="button"
            name="parking"
            value={false}
            className={`px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow active:shadow-lg transition duration-150 ease-in-out w-full ${
              parking ? 'bg-white text-black' : 'bg-slate-600 text-white'
            }`}
            onClick={onChange}
          >
            no
          </button>
        </div>

        <p className="text-lg mt-6 font-semibold">Furnished</p>
        <div className="flex gap-x-6">
          <button
            type="button"
            name="furnished"
            value={true}
            className={`px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow active:shadow-lg transition duration-150 ease-in-out w-full ${
              !furnished ? 'bg-white text-black' : 'bg-slate-600 text-white'
            }`}
            onClick={onChange}
          >
            yes
          </button>

          <button
            type="button"
            name="furnished"
            value={false}
            className={`px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow active:shadow-lg transition duration-150 ease-in-out w-full ${
              furnished ? 'bg-white text-black' : 'bg-slate-600 text-white'
            }`}
            onClick={onChange}
          >
            no
          </button>
        </div>

        <p className="text-lg mt-6 font-semibold">Address</p>
        <textarea
          type="text"
          name="address"
          value={address}
          onChange={onChange}
          placeholder="Address"
          required
          className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600"
        />

        {!geolocationEnabled && (
          <div className=" flex gap-x-6 justify-start">
            <div>
              <p className="text-lg mt-6 font-semibold">Latitude</p>
              <input
                type="text"
                name="latitude"
                value={latitude}
                onChange={onChange}
                min="-90"
                max="90"
                pattern="[0-9]+(\.[0-9]+)?"
                required
                className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:bg-white focus:border-slate-600 focus:text-gray-700 text-center"
              />
            </div>

            <div>
              <p className="text-lg mt-6 font-semibold">Longitude</p>
              <input
                type="text"
                name="longitude"
                value={longitude}
                onChange={onChange}
                min="-180"
                max="180"
                pattern="-?\d+(\.\d+)?"
                required
                className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:bg-white focus:border-slate-600 focus:text-gray-700 text-center"
              />
            </div>
          </div>
        )}

        <p className="text-lg mt-6 font-semibold">Description</p>
        <textarea
          type="text"
          name="description"
          value={description}
          onChange={onChange}
          placeholder="Description"
          required
          className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 mb-6"
        />

        <p className="text-lg font-semibold">Offer</p>
        <div className="flex gap-x-6 mb-6">
          <button
            type="button"
            name="offer"
            value={true}
            className={`px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow active:shadow-lg transition duration-150 ease-in-out w-full ${
              !offer ? 'bg-white text-black' : 'bg-slate-600 text-white'
            }`}
            onClick={onChange}
          >
            yes
          </button>

          <button
            type="button"
            name="offer"
            value={false}
            className={`px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow active:shadow-lg transition duration-150 ease-in-out w-full ${
              offer ? 'bg-white text-black' : 'bg-slate-600 text-white'
            }`}
            onClick={onChange}
          >
            no
          </button>
        </div>

        <div className="flex items-center mb-6">
          <div>
            <p className="text-lg font-semibold">Regular price</p>

            <div className="flex w-full justify-center items-center gap-x-6">
              <input
                type="number"
                name="regularPrice"
                value={regularPrice}
                onChange={onChange}
                min="0"
                max="400000000"
                required
                className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded 
                transition duration-150 ease-in-out focus:text-gray-700  focus:bg-white focus:border-slate-600 text-center"
              />
              {type === 'rent' && (
                <div>
                  <p className="text-sm w-full whitespace-nowrap">$ / Month</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {offer && (
          <div className="flex items-center mb-6">
            <div>
              <p className="text-lg font-semibold">Discounted price</p>

              <div className="flex w-full justify-center items-center gap-x-6">
                <input
                  type="number"
                  name="discountedPrice"
                  value={discountedPrice}
                  onChange={onChange}
                  min="50"
                  max="400000000"
                  required={offer}
                  className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded 
                  transition duration-150 ease-in-out focus:text-gray-700  focus:bg-white focus:border-slate-600 text-center"
                />
                {type === 'rent' && (
                  <div>
                    <p className="text-sm w-full whitespace-nowrap">$ / Month</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mb-6">
          <p className="text-lg font-semibold">Images</p>
          <p className="text-gray-600">The first image will be the cover (max 6)</p>
          <input
            type="file"
            name="images"
            onChange={onChange}
            accept=".jpg, .png, .jpeg"
            multiple
            className="w-full px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded transition 
            duration-150 ease-in-out focus:bg-white focus:border-slate-600"
          />
        </div>

        <button
          type="submit"
          className="mb-6 w-full px-7 py-3 bg-blue-600 text-white font-medium text-sm uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out"
        >
          Edit Listing
        </button>
      </form>
    </main>
  );
}

export default EditListing;

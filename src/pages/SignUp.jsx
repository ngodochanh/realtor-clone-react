import { useState } from 'react';
import { AiFillEyeInvisible, AiFillEye } from 'react-icons/ai';
import { Link } from 'react-router-dom';
import OAuth from '../components/OAuth';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { db } from '../firebase';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FORGOT_PASSWORD, HOME, SIGN_IN } from '../constants';

function SignUp() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const { name, email, password } = formData;

  const onChange = (e) => {
    setFormData((prevState) => ({ ...prevState, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      updateProfile(auth.currentUser, {
        displayName: name,
      });
      const user = userCredential.user;
      const formDataCopy = { ...formData };
      delete formDataCopy.password;
      formDataCopy.timestamp = serverTimestamp();

      await setDoc(doc(db, 'users', user.uid), formDataCopy);
      // toast.success('Sign up was successful');
      navigate(HOME.href);
    } catch (error) {
      toast.error('Something went wrong with the registration');
    }
  };

  return (
    <section>
      <h1 className="text-3xl text-center mt-6 font-bold capitalize">Sign Up</h1>

      <div className="flex justify-center flex-wrap items-center px-6 py-12 max-w-6xl mx-auto">
        <div className="mb-12 md:w-[67%] md:mb-6 lg:w-[50%]  ">
          <img src="/Auth/key.jpg" alt="key" className="w-full rounded-2xl" />
        </div>

        <div className="w-full md:w-[67%] lg:w-[40%] lg:ml-20">
          <form className="space-y-6" onSubmit={onSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Full name"
              value={name}
              className="w-full px-4 py-2 text-xl text-gray-700 bg-white border-gray-300 rounded transition 
              ease-in-out"
              onChange={onChange}
            />

            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={email}
              autoComplete="email"
              className="w-full px-4 py-2 text-xl text-gray-700 bg-white border-gray-300 rounded transition 
              ease-in-out"
              onChange={onChange}
            />

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                value={password}
                autoComplete="current-password"
                className="w-full px-4 py-2 text-xl text-gray-700 bg-white border-gray-300 rounded transition ease-in-out"
                onChange={onChange}
              />

              {showPassword ? (
                <AiFillEyeInvisible
                  className="absolute right-3 top-[50%] translate-y-[-50%] text-xl cursor-pointer"
                  onClick={() => setShowPassword((prevState) => !prevState)}
                />
              ) : (
                <AiFillEye
                  className="absolute right-3 top-[50%] translate-y-[-50%] text-xl cursor-pointer"
                  onClick={() => setShowPassword((prevState) => !prevState)}
                />
              )}
            </div>

            <div className="flex justify-between whitespace-nowrap text-sm sm:text-lg">
              <p>
                Have an account?
                <Link
                  to={SIGN_IN.href}
                  className="text-red-600 hover:text-red-700 transition duration-200 ease-in-out ml-1"
                >
                  Sign in
                </Link>
              </p>

              <p>
                <Link
                  to={FORGOT_PASSWORD.href}
                  className="text-blue-600 hover:text-blue-800 transition duration-200 ease-in-out"
                >
                  Forgot password?
                </Link>
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white px-7 py-3 text-sm font-medium uppercase rounded shadow-sm hover:bg-blue-700 transition duration-150 ease-in-out"
            >
              Sign Up
            </button>

            <div className="flex items-center my-4 before:border-t before:flex-1 before:border-gray-300 after:border-t after:flex-1 after:border-gray-300">
              <p className="text-center font-semibold mx-4">OR</p>
            </div>

            <OAuth />
          </form>
        </div>
      </div>
    </section>
  );
}

export default SignUp;

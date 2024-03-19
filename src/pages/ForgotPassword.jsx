import { useState } from 'react';
import { Link } from 'react-router-dom';
import OAuth from '../components/OAuth';
import { toast } from 'react-toastify';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { SIGN_IN, SIGN_UP } from '../constants';

function FotgotPasword() {
  const [email, setEmail] = useState('');

  const onChange = (e) => {
    setEmail(e.target.value);
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      const auth = getAuth();
      sendPasswordResetEmail(auth, email);
      toast.success('Email was sent');
    } catch (error) {
      toast.error('Could not send reset password');
    }
  };

  return (
    <section>
      <h1 className="text-3xl text-center mt-6 font-bold">Forgot Password</h1>

      <div className="flex justify-center flex-wrap items-center px-6 py-12 max-w-6xl mx-auto">
        <div className="mb-12 md:w-[67%] md:mb-6 lg:w-[50%]  ">
          <img src="/Auth/key.jpg" alt="key" className="w-full rounded-2xl" />
        </div>

        <div className="w-full md:w-[67%] lg:w-[40%] lg:ml-20">
          <form className="space-y-6" onSubmit={onSubmit}>
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

            <div className="flex justify-between whitespace-nowrap text-sm sm:text-lg">
              <p>
                Don't have an account?
                <Link
                  to={SIGN_UP.href}
                  className="text-red-600 hover:text-red-700 transition duration-200 ease-in-out ml-1"
                >
                  Register
                </Link>
              </p>

              <p>
                <Link
                  to={SIGN_IN.href}
                  className="text-blue-600 hover:text-blue-800 transition duration-200 ease-in-out"
                >
                  Sign in instead
                </Link>
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white px-7 py-3 text-sm font-medium uppercase rounded shadow-sm hover:bg-blue-700 transition duration-150 ease-in-out"
            >
              Send reset password
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

export default FotgotPasword;

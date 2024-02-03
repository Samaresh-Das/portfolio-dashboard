import { app } from "@/firebase";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  User,
  signOut,
} from "firebase/auth";
import { useState } from "react";
import Button from "./ui/Button";

const SignIn = () => {
  const [user, setUser] = useState<User | null>(null);
  const [signedIn, setSignedIn] = useState(false);
  const provider = new GoogleAuthProvider();

  const auth = getAuth(app);

  const authHandler = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential?.accessToken;
        // The signed-in user info.
        const userData = result.user;
        // IdP data available using getAdditionalUserInfo(result)
        console.log(userData?.email);
        setUser(userData);
        setSignedIn(true);
      })
      .catch((error: any) => {
        console.log(error);
      });
  };

  const signOutHandler = () => {
    signOut(auth)
      .then(() => {
        setSignedIn(false);
      })
      .catch((error: any) => {
        console.log(error);
      });
  };

  console.log(user?.email);
  return (
    <div className="px-6 sm:px-0 max-w-sm mx-auto  ">
      <h1 className="text-[#FF8303] font-intro2 text-[30px] text-center mb-[32px] mt-10">
        This site is only for admins. This is not a showcase project. Only
        selected user is allowed.
      </h1>
      {!signedIn && (
        <Button onClick={authHandler} type="button">
          <svg
            className="mr-2 -ml-1 w-4 h-4"
            aria-hidden="true"
            focusable="false"
            data-prefix="fab"
            data-icon="google"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 488 512"
          >
            <path
              fill="currentColor"
              d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
            ></path>
          </svg>
          Sign up with Google(Admin only)<div></div>
        </Button>
      )}
      {signedIn && (
        <Button className="text-center mx-auto" onClick={signOutHandler}>
          Sign Out
        </Button>
      )}
    </div>
  );
};

export default SignIn;

import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyAkAjDqfwKFCO5APEn8ZmAY05GXc47Plx4",
  authDomain: "crybaby-43163.firebaseapp.com",
  projectId: "crybaby-43163",
  storageBucket: "crybaby-43163.appspot.com",
  messagingSenderId: "533694826752",
  appId: "1:533694826752:web:071f83f48ced6f96e78be5",
  measurementId: "G-0VCL930T0H"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { app, storage };

// ok <3 
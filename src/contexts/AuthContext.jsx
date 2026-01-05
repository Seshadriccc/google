import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";


const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setCurrentUser(user);
                // Fetch user role and data from Firestore
                const userRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(userRef);

                if (docSnap.exists()) {
                    setUserData(docSnap.data());
                } else {
                    // RACE CONDITION FIX: Only auto-create profile for Google Sign In.
                    // Email/Password signup handles its own profile creation in the signup() function.
                    // Checking providerData to see if it's Google.
                    const isGoogle = user.providerData.some(p => p.providerId === 'google.com');

                    if (isGoogle) {
                        const newUserData = {
                            email: user.email,
                            displayName: user.displayName,
                            role: "student", // Default for Google is Student
                            strikes: 0
                        };
                        await setDoc(userRef, newUserData);
                        setUserData(newUserData);
                    }
                    // For Email/Pass, we wait for signup() to set the user data to avoid overwriting Role.
                }
            } else {
                setCurrentUser(null);
                setUserData(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const loginWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
    };

    const signup = async (email, password, name, role = "student") => {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(res.user, { displayName: name });

        // Create user in Firestore
        const newUserProfile = {
            email: email,
            displayName: name,
            role: role,
            strikes: 0
        };
        await setDoc(doc(db, "users", res.user.uid), newUserProfile);

        // OPTIMISTIC UPDATE: Update state immediately to prevent navigation race conditions
        setCurrentUser(res.user);
        setUserData(newUserProfile);

        return res;
    };

    const login = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const logout = () => {
        return signOut(auth);
    };

    const value = {
        currentUser,
        userData,
        loginWithGoogle,
        signup,
        login,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

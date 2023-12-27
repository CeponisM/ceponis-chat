import React, { useState, useEffect } from 'react';
import { signInAnonymously as signInAnonymouslyFirebase } from 'firebase/auth';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth as firebaseAuth } from '../firebase';
import { collection, doc, setDoc, getDoc } from "firebase/firestore";
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { db } from '../firebase';
import { onDisconnect } from 'firebase/database';
import { ref, set, remove, getDatabase } from 'firebase/database';
import { db as firebaseDatabase } from '../firebase';
import firebase from 'firebase/compat/app';

const SignIn = () => {
    const [uid, setUid] = useState(null);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isSignedIn, setIsSignedIn] = useState(false);

    const handleUsernameChange = (e) => {
        setUsername(e.target.value);
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };

    const signIn = () => {
        const usernameLower = username.toLowerCase();
        const docRef = doc(db, "Users", usernameLower);
    
        getDoc(docRef).then((docSnapshot) => {
            if (docSnapshot.exists()) {
                // User exists, get the email
                const email = docSnapshot.data().email;
    
                signInWithEmailAndPassword(firebaseAuth, email, password)
                    .then((userCredential) => {
                        // User signed in
                        console.log('User signed in: ', userCredential.user.uid);
    
                        // Update isOnline status in Firestore
                        setDoc(docRef, { isOnline: true }, { merge: true });
                    })
                    .catch((error) => {
                        // Error occurred during sign-in
                        console.log('Sign in error: ', error.code, error.message);
                    });
            } else {
                // Validate username before creating a new account
                if (usernameLower.length < 6) {
                    console.log('Username is too short. It must be at least 6 characters.');
                    return;
                }
    
                // Other validation checks can be added here
    
                // User does not exist, create a new one
                const email = `${usernameLower}@mceponis.com`;
    
                createUserWithEmailAndPassword(firebaseAuth, email, password)
                    .then((userCredential) => {
                        // User registered
                        console.log('User registered: ', userCredential.user.uid);
    
                        // Add the user details to Firestore
                        setDoc(docRef, { uid: userCredential.user.uid, username: usernameLower, email: email, isOnline: true });
                    })
                    .catch((error) => {
                        // Error occurred during registration
                        console.log('Registration error: ', error.code, error.message);
                    });
            }
        });
    };    

    const signInAnonymously = () => {
        signInAnonymouslyFirebase(firebaseAuth)
            .then((userCredential) => {
                // User signed in anonymously
                const user = userCredential.user;
                console.log('User signed in anonymously: ', user.uid);

                // Since it's an anonymous user, they won't have an email
                const generatedEmail = user.uid + "@mceponis.com";

                // Add the uid and a generated email to the user document in Firestore
                const docRef = doc(db, "Users", user.uid);
                setDoc(docRef, { uid: user.uid, email: generatedEmail, isOnline: true, username: 'Anon' })
                    .then(() => console.log('Anonymous user data set in Firestore'))
                    .catch((error) => console.log('Error setting anonymous user data in Firestore: ', error));
            })
            .catch((error) => {
                // Error occurred
                console.log('Error signing in anonymously: ', error.code, error.message);
            });
    };

    useEffect(() => {
        // Observer for authentication state changes
        const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
            if (user) {
                let currentUsername;
    
                if (user.isAnonymous) {
                    // Handle anonymous users
                    currentUsername = `${user.uid}`;
                    // You might want to handle anonymous users differently in your app
                } else {
                    // Extract username from the user object for non-anonymous users
                    currentUsername = user.email.toLowerCase();
                    const domainToRemove = "@mceponis.com";
    
                    if (currentUsername.endsWith(domainToRemove)) {
                        currentUsername = currentUsername.replace(domainToRemove, "");
                    }
                }
    
                setUsername(currentUsername);
    
                if (currentUsername) {
                    // User is signed in, update online status
                    setDoc(doc(db, "Users", currentUsername), { isOnline: true }, { merge: true })
                        .then(() => console.log('User status updated to online'))
                        .catch((error) => console.log('Error updating user status: ', error));
                }
    
                setUid(user.uid);
            }
        });

        const handleBeforeUnload = () => {
            if (firebaseAuth.currentUser) {
                // Extract username from the user object or another source
                let currentUsername = firebaseAuth.currentUser;
                if (firebaseAuth.currentUser.isAnonymous) {
                    // Handle anonymous users
                    currentUsername = `${currentUsername.uid}`;
                    // You might want to handle anonymous users differently in your app
                } else {
                    // Extract username from the user object for non-anonymous users
                    currentUsername = currentUsername.email.toLowerCase();
                    const domainToRemove = "@mceponis.com";
    
                    if (currentUsername.endsWith(domainToRemove)) {
                        currentUsername = currentUsername.replace(domainToRemove, "");
                    }
                }
                // Update isOnline status in Firestore
                setDoc(doc(db, "Users", currentUsername), { isOnline: false }, { merge: true })
                    .then(() => console.log('User status updated to offline'))
                    .catch((error) => console.log('Error updating user status: ', error));
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            unsubscribe(); // Unsubscribe from the observer when the component unmounts
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [firebaseAuth.currentUser]);

    const handleSignOut = () => {
        const currentUser = firebaseAuth.currentUser;
    
        if (!currentUser) {
            console.log('No user is currently signed in.');
            return;
        }
    
        let currentIdentifier;
        if (currentUser.isAnonymous) {
            // For anonymous users, use uid as the identifier
            currentIdentifier = `${currentUser.uid}`;
        } else {
            // For non-anonymous users, extract username from the email
            const currentUserEmail = currentUser.email.toLowerCase();
            const domainToRemove = "@mceponis.com";
    
            if (currentUserEmail.endsWith(domainToRemove)) {
                currentIdentifier = currentUserEmail.replace(domainToRemove, "");
            } else {
                currentIdentifier = currentUserEmail;
            }
        }
    
        signOut(firebaseAuth).then(() => {
            console.log('User signed out');
    
            // Update isOnline status in Firestore
            if (currentIdentifier) {
                setDoc(doc(db, "Users", currentIdentifier), { isOnline: false }, { merge: true })
                    .then(() => console.log('User status updated to offline'))
                    .catch((error) => console.log('Error updating user status in Firestore: ', error));
            }
        }).catch((error) => {
            console.log('Sign out error: ', error);
        });
    };    

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
            setIsSignedIn(!!user);
        });

        // Clean up the listener when the component unmounts
        return unsubscribe;
    }, []);

    return (
        <div className='username-select'>
            {isSignedIn ? (
                <button onClick={handleSignOut}>Sign Out</button>
            ) : (
                <>
                    <input value={username} onChange={handleUsernameChange} placeholder="Username (6 char min)" />
                    <input value={password} onChange={handlePasswordChange} placeholder="Password (6 char min)" type="password" />
                    <button onClick={signIn}>Register/Sign-in</button>
                    <button onClick={signInAnonymously}>Sign In Anonymously</button>
                </>
            )}
        </div>
    );
}

export default SignIn;
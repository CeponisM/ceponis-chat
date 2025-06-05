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
    const [username, setUsername] = useState('testing');
    const [password, setPassword] = useState('testing');
    const [isSignedIn, setIsSignedIn] = useState(false);
    const [error, setError] = useState('');

    const handleUsernameChange = (e) => {
        setUsername(e.target.value);
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };

    const signIn = () => {
        setError('');

        const usernameLower = username.toLowerCase();

        if (usernameLower.length < 6 || password.length < 6) {
            setError('Username and password must be at least 6 characters.');
            return;
        }

        const docRef = doc(db, "Users", usernameLower);

        getDoc(docRef).then((docSnapshot) => {
            if (docSnapshot.exists()) {
                const email = docSnapshot.data().email;

                signInWithEmailAndPassword(firebaseAuth, email, password)
                    .then((userCredential) => {
                        console.log('User signed in: ', userCredential.user.uid);
                        setDoc(docRef, { isOnline: true }, { merge: true });
                    })
                    .catch((error) => {
                        console.log('Sign in error: ', error.code, error.message);
                        setError('Incorrect username or password.');
                    });
            } else {
                const email = `${usernameLower}@mceponis.com`;

                createUserWithEmailAndPassword(firebaseAuth, email, password)
                    .then((userCredential) => {
                        console.log('User registered: ', userCredential.user.uid);
                        setDoc(docRef, { uid: userCredential.user.uid, username: usernameLower, email: email, isOnline: true });
                    })
                    .catch((error) => {
                        console.log('Registration error: ', error.code, error.message);
                        setError('Failed to register user. Try a different username or password.');
                    });
            }
        });
    };

    const signInAnonymously = () => {
        setError('');

        signInAnonymouslyFirebase(firebaseAuth)
            .then((userCredential) => {
                const user = userCredential.user;
                console.log('User signed in anonymously: ', user.uid);
                const generatedEmail = user.uid + "@mceponis.com";
                const docRef = doc(db, "Users", user.uid);
                setDoc(docRef, { uid: user.uid, email: generatedEmail, isOnline: true, username: 'Anon' })
                    .then(() => console.log('Anonymous user data set in Firestore'))
                    .catch((error) => console.log('Error setting anonymous user data in Firestore: ', error));
            })
            .catch((error) => {
                console.log('Error signing in anonymously: ', error.code, error.message);
                setError('Anonymous sign-in failed.');
            });
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
            if (user) {
                let currentUsername;
                if (user.isAnonymous) {
                    currentUsername = `${user.uid}`;
                } else {
                    currentUsername = user.email.toLowerCase();
                    const domainToRemove = "@mceponis.com";
                    if (currentUsername.endsWith(domainToRemove)) {
                        currentUsername = currentUsername.replace(domainToRemove, "");
                    }
                }

                setUsername(currentUsername);

                if (currentUsername) {
                    setDoc(doc(db, "Users", currentUsername), { isOnline: true }, { merge: true })
                        .then(() => console.log('User status updated to online'))
                        .catch((error) => console.log('Error updating user status: ', error));
                }

                setUid(user.uid);
            }
        });

        const handleBeforeUnload = () => {
            if (firebaseAuth.currentUser) {
                let currentUsername = firebaseAuth.currentUser;
                if (firebaseAuth.currentUser.isAnonymous) {
                    currentUsername = `${currentUsername.uid}`;
                } else {
                    currentUsername = currentUsername.email.toLowerCase();
                    const domainToRemove = "@mceponis.com";
                    if (currentUsername.endsWith(domainToRemove)) {
                        currentUsername = currentUsername.replace(domainToRemove, "");
                    }
                }
                setDoc(doc(db, "Users", currentUsername), { isOnline: false }, { merge: true })
                    .then(() => console.log('User status updated to offline'))
                    .catch((error) => console.log('Error updating user status: ', error));
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            unsubscribe();
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
            currentIdentifier = `${currentUser.uid}`;
        } else {
            const currentUserEmail = currentUser.email.toLowerCase();
            const domainToRemove = "@mceponis.com";
            currentIdentifier = currentUserEmail.endsWith(domainToRemove)
                ? currentUserEmail.replace(domainToRemove, "")
                : currentUserEmail;
        }

        signOut(firebaseAuth).then(() => {
            console.log('User signed out');
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
        return unsubscribe;
    }, []);

    return (
        <div className={`username-select`}>
            {isSignedIn ? (
                <div className='username-button-content'>
                    <button onClick={handleSignOut}>Sign Out</button>
                </div>
            ) : (
                <div className={`signin-form-container`}>
                    <input
                        value={username}
                        onChange={handleUsernameChange}
                        placeholder="Username (6 char min)"
                    />
                    <input
                        value={password}
                        onChange={handlePasswordChange}
                        placeholder="Password (6 char min)"
                        type="password"
                    />
                    <button onClick={signIn}>Register / Sign-in</button>
                    <button onClick={signInAnonymously}>Sign In Anonymously</button>
                    {error && <p className="error" role="alert">{error}</p>}
                </div>
            )}
        </div>
    );
};

export default SignIn;

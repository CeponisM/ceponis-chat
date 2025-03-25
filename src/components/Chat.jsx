import React, { useEffect, useState } from 'react';
import { auth } from '../firebase';
import { firestore as firebaseFirestore } from '../firebase';
import SignIn from './SignIn';
import '../index.css';
import CircularProgress from '@mui/material/CircularProgress';
import { collection, onSnapshot, query, doc, addDoc, Timestamp, orderBy } from "firebase/firestore";

function Chat({ hideChat }) {
    const [users, setUsers] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [showOffline, setShowOffline] = useState(false);
    const [sortedUsers, setSortedUsers] = useState([]);
    const [isSending, setIsSending] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const getAIResponse = async (message) => {
        setIsLoading(true);
        setError(null);
        try {
            // Make a request to your server-side function
            const response = await fetch('https://us-central1-chat-7f392.cloudfunctions.net/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message }),
            });

            console.log('Response status: ', response.status);
            console.log('Response headers: ', response.headers);

            // Check if the response status is OK (status code in the range 200-299)
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Parse the JSON response
            const data = await response.json();
            console.log('Received data: ', data);

            // Check if the response contains the expected property
            if (!data || !data.message) {
                throw new Error('Invalid response structure from server');
            }

            // Return the AI's response
            return data.message;
        } catch (error) {
            console.error('Error in getAIResponse: ', error);
            setError('Failed to get AI response. Please try again.');
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async () => {
        setIsSending(true);
        try {
            if (newMessage.trim() !== '' && currentUser && selectedUser) {
                // Check if the current user is anonymous
                let currentUsername = currentUser.isAnonymous ? currentUser.uid : currentUser.email;
                const domainToRemove = "@mceponis.com";

                if (currentUsername.endsWith(domainToRemove)) {
                    currentUsername = currentUsername.replace(domainToRemove, "");
                }

                const chatId = currentUsername < selectedUser.username ? `${currentUsername}_${selectedUser.username}` : `${selectedUser.username}_${currentUsername}`;
                const messageRef = collection(doc(firebaseFirestore, 'Chats', chatId), 'Messages');

                // Send the current user's message
                await addDoc(messageRef, {
                    text: newMessage,
                    sentAt: Timestamp.now(),
                    sentBy: currentUser.uid
                });

                // If the selected user is the AI get response
                if (selectedUser.uid === 'ai-agent') {
                    const aiResponse = await getAIResponse(newMessage); // call server-side function

                    // Send the AI's message
                    await addDoc(messageRef, {
                        text: aiResponse,
                        sentAt: Timestamp.now(),
                        sentBy: 'ai-agent'
                    });
                }

                setNewMessage('');

                onSnapshot(query(collection(doc(firebaseFirestore, 'Chats', chatId), 'Messages'), orderBy('sentAt', 'asc')), (snapshot) => {
                    const fetchedMessages = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
                    setMessages(fetchedMessages);
                });
            }
        } catch (error) {
            console.error('Error in handleSendMessage: ', error);
        }
        setIsSending(false);
    };

    // Selecting new user for chat
    const handleUserClick = async (user) => {
        try {
            setSelectedUser(user);
            // Check if the current user is anonymous
            let currentUsername = currentUser.isAnonymous ? currentUser.uid : currentUser.email;
            const domainToRemove = "@mceponis.com";

            if (currentUsername.endsWith(domainToRemove)) {
                currentUsername = currentUsername.replace(domainToRemove, "");
            }

            if (user) {
                const chatId = currentUsername < user.username ? `${currentUsername}_${user.username}` : `${user.username}_${currentUsername}`;
                const chatRef = doc(firebaseFirestore, 'Chats', chatId);

                // Set up an onSnapshot listener with orderBy
                const unsubscribe = onSnapshot(query(collection(chatRef, 'Messages'), orderBy('sentAt', 'asc')), (snapshot) => {
                    const fetchedMessages = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
                    setMessages(fetchedMessages);
                });

                // Return the unsubscribe function to clean up the listener when the component unmounts
                return unsubscribe;
            }
        } catch (error) {
            console.error('Error in handleUserClick: ', error);
        }
    };

    // subscribe to database "Users" - store in currentUsers
    useEffect(() => {
        let unsubscribe;

        const unsubscribeAuth = auth.onAuthStateChanged((user) => {
            try {
                setCurrentUser(user);

                if (user) {
                    // User is signed in, fetch users
                    unsubscribe = onSnapshot(query(collection(firebaseFirestore, 'Users')), (snapshot) => {
                        const fetchedUsers = snapshot.docs.map((doc) => ({ id: doc.id, uid: doc.data().uid, ...doc.data() }));
                        setUsers(fetchedUsers);
                    });
                }
            } catch (error) {
                console.error('Error in useEffect: ', error);
            }
        });

        return () => {
            unsubscribe && unsubscribe(); // unsubscribe on unmount
            unsubscribeAuth();
        }
    }, []);

    // Chat message updates on user click or change of current user
    useEffect(() => {
        let unsubscribe;

        if (selectedUser && currentUser != null) {
            // Check if the current user is anonymous
            let currentUsername = currentUser.isAnonymous ? currentUser.uid : currentUser.email;
            const domainToRemove = "@mceponis.com";

            if (currentUsername.endsWith(domainToRemove)) {
                currentUsername = currentUsername.replace(domainToRemove, "");
            }
            const chatId = currentUsername < selectedUser.username ? `${currentUsername}_${selectedUser.username}` : `${selectedUser.username}_${currentUsername}`;
            const chatRef = doc(firebaseFirestore, 'Chats', chatId);
            try {
                // Set up an onSnapshot listener with orderBy
                unsubscribe = onSnapshot(query(collection(chatRef, 'Messages'), orderBy('sentAt', 'asc')), (snapshot) => {
                    const fetchedMessages = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
                    setMessages(fetchedMessages);
                }, (error) => {
                    console.error('Error in onSnapshot: ', error);
                });
            } catch (error) {
                console.error('Error setting up onSnapshot: ', error);
            }
        }

        return () => {
            unsubscribe && unsubscribe();
        }
    }, [selectedUser, currentUser]);

    // Sender or reciever
    const getMessageClass = (message) => {
        return message.sentBy === (currentUser ? currentUser.uid : null) ? 'chat-message' : 'chat-message-other';
    };

    // sort by online status
    useEffect(() => {
        setSortedUsers([...users].sort((a, b) => b.isOnline - a.isOnline));
    }, [users]);

    return (
        <div className='chat-main'>
            <div className='chat-content'>
                <SignIn />
                <div className='chat-button-content'>
                    <button onClick={hideChat}>Home</button>
                </div>
                <div className='main-content'>
                    <div>
                        {/* User view */}
                        <label>
                            <input
                                type="checkbox"
                                checked={showOffline}
                                onChange={() => setShowOffline(!showOffline)}
                            />
                            Show Offline Users
                        </label>
                        {currentUser && (
                            <ul>
                                {sortedUsers.map(user => (
                                    (user.isOnline || showOffline) && (
                                        <li key={user.id}>
                                            <div className='user-button'>
                                                <button onClick={() => handleUserClick(user)}>
                                                    {user.isOnline ? <span style={{ color: 'green', paddingRight: '3px' }}>● </span> : <span style={{ paddingRight: '13px' }} />}
                                                    <img
                                                        src={user.profileImage || "https://yourteachingmentor.com/wp-content/uploads/2020/12/istockphoto-1223671392-612x612-1.jpg"}
                                                        className='select-user-img'
                                                        alt=""
                                                        height="21"
                                                        width="21"
                                                    />
                                                    {user.username}
                                                </button>
                                            </div>
                                        </li>
                                    )
                                ))}
                            </ul>
                        )}
                    </div>
                    {/* Message view */}
                    <div>

                        {isLoading && <p>Loading...</p>}
                        {error && <p role="alert" className="error">{error}</p>}

                        <div className='chat-messages'>
                            <div className='selectedUserName'>{selectedUser ? selectedUser.username : 'Select a user'}</div>
                            <div>
                                {messages.map((message, index) => (
                                    <div key={index} className={`chat-send chat-send-message`}>
                                        {getMessageClass(message) === 'chat-message-other' ?
                                            <img src="https://yourteachingmentor.com/wp-content/uploads/2020/12/istockphoto-1223671392-612x612-1.jpg" className='profile-img' alt="" height={'21'} width="21" />
                                            :
                                            ''
                                        }
                                        <div className='message-bubble-container'>
                                            <div className={`${getMessageClass(message)}`}>
                                                {message.text}
                                            </div>
                                        </ div>
                                        {getMessageClass(message) === 'chat-message' ?
                                            <img src="https://yourteachingmentor.com/wp-content/uploads/2020/12/istockphoto-1223671392-612x612-1.jpg" className='profile-img' alt="" height={'21'} width="21" />
                                            :
                                            ''
                                        }
                                    </div>
                                ))}
                            </div>
                            {/* New message input */}
                            <div className='space-fill'></div>
                            <div className='chat-messages-new'>
                                <input
                                    className='chat-messages-new-input'
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                />
                                <button className='chat-send-button' onClick={handleSendMessage} disabled={isSending}>
                                    {isSending ? <CircularProgress size={24} /> : 'Send'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Chat;
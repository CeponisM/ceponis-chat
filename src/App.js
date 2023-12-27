import { useState } from 'react';
import Chat from './components/Chat';
import styles from './index.css';

function App() {
    const [showChat, setShowChat] = useState(false);

    const hideChat = () => {
        setShowChat(false);
    };

    return (
        <div className={styles.App}>
            <div><h1>Ceponis Chat</h1></div>
            {showChat ? <Chat hideChat={hideChat} /> :
                <div>
                    <button className='main-buttons'>Source Code</button>
                    <button className='main-buttons' onClick={() => setShowChat(true)}>Chat Now</button>
                </div>
            }
        </div>
    );
}

export default App;
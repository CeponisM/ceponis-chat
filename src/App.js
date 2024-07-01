import { useState } from 'react';
import Chat from './components/Chat';
import styles from './index.css';

function App() {
    const [showChat, setShowChat] = useState(false);
    const [isNightMode, setIsNightMode] = useState(false);

    const handleToggle = () => {
        setIsNightMode(!isNightMode);
    };

    const hideChat = () => {
        setShowChat(false);
    };

    return (
        <div className={isNightMode ? 'main-app night-mode' : 'main-app'}>
            <div className={styles.App}>
                <header>
                    <h1>Ceponis Chat</h1>
                </header>
                <main>
                    <span className='night-mode-section' style={{ marginLeft: '10px' }}>Night Mode &nbsp;
                        <label className="switch">
                            <input type="checkbox" onChange={handleToggle} />
                            <span className="slider round"></span>
                        </label>
                    </span>

                    {showChat ? <Chat hideChat={hideChat} /> :
                        <div className='main-button-section'>
                            <button
                                className='main-buttons'
                                onClick={() => window.location.href = 'https://github.com/CeponisM/ceponis-chat'}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Source Code
                            </button>
                            <button className='main-buttons' onClick={() => setShowChat(true)}>Chat Now</button>
                        </div>
                    }
                </main>
            </div>
        </div>
    );
}

export default App;
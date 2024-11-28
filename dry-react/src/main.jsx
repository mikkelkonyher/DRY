import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './Pages/App';
import './index.css';
import { checkToken } from './authUtils';

function Main() {
    useEffect(() => {
        checkToken();
    }, []);

    return <App />;
}

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <BrowserRouter>
            <Main />
        </BrowserRouter>
    </StrictMode>,
);
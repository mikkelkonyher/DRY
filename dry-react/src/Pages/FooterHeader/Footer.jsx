import './Footer.css';
import XIcon from '@mui/icons-material/X';
import InstagramIcon from '@mui/icons-material/Instagram';


function Footer() {
    const currentYear = new Date().getFullYear();
    return (
        <footer className="footer">
            <div className="footer-content">

                <div className="footer-icons">
                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                        <XIcon/>
                    </a>
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                        <InstagramIcon/>
                    </a>

                </div>
                <p className="footer-text">© {currentYear} GearNinja | Support@GearNinja.dk</p>
            </div>

        </footer>
    );
}

export default Footer;
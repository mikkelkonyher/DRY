import './Footer.css';
import XIcon from '@mui/icons-material/X';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';


function Footer() {
    const currentYear = new Date().getFullYear();
    return (
        <footer className="footer">
            <div className="footer-content">

                <div className="footer-icons">
                    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                        <FacebookIcon />
                    </a>
                    <a href="https://www.instagram.com/gearninja.dk/" target="_blank" rel="noopener noreferrer">
                        <InstagramIcon />
                    </a>
                </div>
                <p className="footer-text">© {currentYear} GearNinja | Gearninja@Gearninja.dk</p>
            </div>
        </footer>
    );
}

export default Footer;
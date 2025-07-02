import './AboutPage.css';

function AboutPage() {
    return (
        <div className="about-container">
            <div className="about-flex">
                <div className="about-content">
                    <h1 className="about-title">Om os</h1>

                    <p>
                        GearNinja er et online musikmarked og fællesskab skabt af musikere – for musikere.
                    </p>

                    <p>
                        Vi er non-profit og sat i verden som et modsvar til rodede salgsopslag, spam og falske profiler.
                        Hos os er der ingen skjult datahøst eller algoritmer med skjulte dagsordener
                        – kun ægte gear, ægte mennesker og en platform bygget på gennemsigtighed og tillid.
                    </p>

                    <p>
                        Vi er Mikkel Konyher og Troels Dankert. Vores venskab går tilbage til gymnasiet i 2007,
                        hvor vi startede vores første band sammen. Musikken har fulgt os siden, og med tiden voksede
                        også en fælles passion for digital design og softwareudvikling.
                    </p>

                    <p>
                        GearNinja er vores svar på et behov vi selv har mærket som aktive musikere: et trygt og
                        overskueligt sted at købe, sælge og nørde musikudstyr – og ikke mindst møde andre, der deler
                        kærligheden til musik.
                    </p>

                    <p>
                        Velkommen til GearNinja – hvor gearskift sker med god karma.
                    </p>

                    <p className="about-signature">
                        De bedste hilsner,<br />
                        Mikkel & Troels
                    </p>

                    {/* Signaturbillederne her */}
                    <div className="signatures">
                        <img
                            src="src/assets/Mikkel signatur.png"
                            alt="Mikkel signatur"
                            className="signature-image"
                        />
                        <img
                            src="src/assets/Troels signatur.png"
                            alt="Troels signatur"
                            className="signature-image"
                        />
                    </div>
                </div>

                <div className="about-image-wrapper">
                    <img
                        src="src/assets/459118063_539597145247047_8853740358288590339_n-1.webp"
                        alt="Mikkel og Troels"
                        className="about-image"
                    />
                </div>
            </div>
        </div>
    );
}

export default AboutPage;
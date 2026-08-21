import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="main-footer">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            {/* Main Footer Box Start */}
            <div className="main-footer-box">
              {/* Footer About Start */}
              <div className="footer-about">
                {/* Footer Logo Start */}
                <div className="footer-logo">
                  <Link to="/">
                    <img
                      src="/nho-logo.webp"
                      alt="New Hope Orphanage logo"
                      height="300"
                      width="300"
                    />
                  </Link>
                </div>
                {/* Footer Logo End */}

                {/* Footer Contact Detail Start */}
                <div className="footer-contact-detail">
                  <div className="footer-contact-item">
                    <p>Contact Us Here</p>
                    <h3>
                      <a href="tel:+237676516652">+237 676 516 652</a>
                    </h3>
                  </div>

                  <div className="footer-contact-item">
                    <p>Need live support!</p>
                    <h3>
                      <a href="mailto:newhopeorphanahe@gmail.com">
                        newhopeorphanahe@gmail.com
                      </a>
                    </h3>
                  </div>
                </div>
                {/* Footer Contact Detail End */}

                {/* Footer Social Links Start */}
                <div className="footer-social-links">
                  <h3>Follow Us on</h3>
                  <ul>
                    <li>
                      <a href="#">
                        <i className="fa-brands fa-linkedin"></i>
                      </a>
                    </li>
                    <li>
                      <a href="#">
                        <i className="fa-brands fa-x-twitter"></i>
                      </a>
                    </li>
                    <li>
                      <a href="#">
                        <i className="fa-brands fa-facebook-f"></i>
                      </a>
                    </li>
                    <li>
                      <a href="#">
                        <i className="fa-brands fa-instagram"></i>
                      </a>
                    </li>
                  </ul>
                </div>
                {/* Footer Social Links End */}
              </div>
              {/* Footer About End */}

              {/* Footer Links Box Start */}
              <div className="footer-links-box">
                {/* Footer Links Start */}
                <div className="footer-links">
                  <h3>Quick links</h3>
                  <ul>
                    <li>
                      <Link to="/">Home</Link>
                    </li>
                    <li>
                      <Link to="/about-us">About Us</Link>
                    </li>
                    <li>
                      <Link to="/donation">Donate</Link>
                    </li>
                    <li>
                      <Link to="/contact">Contact</Link>
                    </li>
                  </ul>
                </div>
                {/* Footer Links End */}

                {/* Footer Links Start */}
                <div className="footer-links footer-service-links">
                  <h3>Pages</h3>
                  <ul>
                    <li>
                      <Link to="/video-gallery">Video Gallery</Link>
                    </li>
                    <li>
                      <Link to="/faqs">FAQs</Link>
                    </li>
                    <li>
                      <Link to="/team">Our Team</Link>
                    </li>
                    <li>
                      <Link to="/login">Sign In</Link>
                    </li>
                  </ul>
                </div>
                {/* Footer Links End */}
              </div>
              {/* Footer Links Box End */}
            </div>
            {/* Main Footer Box End */}
          </div>
        </div>
      </div>

      {/* Footer Copyright Start */}
      <div className="footer-copyright">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="copyright-text">
                <p style={{ fontSize: "larger" }}>
                  {`Copyright © ${new Date().getFullYear()} New Hope Orphanage All Rights Reserved.`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Footer Copyright End */}
    </footer>
  );
}

import instagramIcon from "../icons/instagram.svg";
import telegramIcon from "../icons/telegram.svg";
import tiktokIcon from "../icons/tik-tok.svg";
import footlines from "../icons/footerlines.svg";

function Footer() {
  return (
    <footer>
      <img className="line5 max-w-full mx-auto" src={footlines} alt="" />

      <div className="footerContent">
        <div className="footerLeft">
          <div className="makeUs">Make us a part of your lifestyle</div>
          <div className="socialLogos desktopSocialLogos">
            <a href="#" onClick={(e) => e.preventDefault()} aria-label="Instagram">
              <img src={instagramIcon} alt="" />
            </a>
            <a href="#" onClick={(e) => e.preventDefault()} aria-label="Telegram">
              <img src={telegramIcon} alt="" />
            </a>
            <a href="#" onClick={(e) => e.preventDefault()} aria-label="TikTok">
              <img src={tiktokIcon} alt="" />
            </a>
          </div>
        </div>
        <div className="tasteIn desktopTasteIn">
          A taste of home <br /> in every dish
        </div>

        <div className="footerBottomRow mobileFooterBottomRow">
          <div className="socialLogos">
            <a href="#" onClick={(e) => e.preventDefault()} aria-label="Instagram">
              <img src={instagramIcon} alt="" />
            </a>
            <a href="#" onClick={(e) => e.preventDefault()} aria-label="Telegram">
              <img src={telegramIcon} alt="" />
            </a>
            <a href="#" onClick={(e) => e.preventDefault()} aria-label="TikTok">
              <img src={tiktokIcon} alt="" />
            </a>
          </div>
          <div className="tasteIn">
            A taste of home <br /> in every dish
          </div>
        </div>
      </div>

      <div className="footerCopyright">© ShaiQas company All Rights Reserved.</div>
    </footer>
  );
}

export default Footer;

import type { Lang } from "../i18n";

interface Props {
  lang?: Lang;
}

export default function Footer({ lang }: Props) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="fixed-copyright-footer">
      <div className="footer-inner">
        <p className="copyright-text">
          {lang === "bn"
            ? `© ${currentYear} জীবনবিন্দু ফাউন্ডেশন। সর্বস্বত্ব সংরক্ষিত।`
            : `© ${currentYear} Jibonbindu Foundation. All rights reserved.`}
        </p>
      </div>
    </footer>
  );
}
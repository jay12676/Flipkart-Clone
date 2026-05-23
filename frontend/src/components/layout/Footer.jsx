export default function Footer() {
  return (
    <footer className="mt-12 bg-[#172337] text-xs text-white/80">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 md:grid-cols-4">
        <FooterColumn title="About">
          <FooterLink>Contact Us</FooterLink>
          <FooterLink>About Us</FooterLink>
          <FooterLink>Careers</FooterLink>
        </FooterColumn>
        <FooterColumn title="Help">
          <FooterLink>Payments</FooterLink>
          <FooterLink>Shipping</FooterLink>
          <FooterLink>Returns</FooterLink>
        </FooterColumn>
        <FooterColumn title="Policy">
          <FooterLink>Privacy</FooterLink>
          <FooterLink>Terms of Use</FooterLink>
          <FooterLink>Security</FooterLink>
        </FooterColumn>
        <FooterColumn title="Social">
          <FooterLink>Facebook</FooterLink>
          <FooterLink>Twitter</FooterLink>
          <FooterLink>YouTube</FooterLink>
        </FooterColumn>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-[11px] text-white/60">
        Flipkart Clone — for Scaler SDE Intern assignment. Not affiliated with Flipkart Internet
        Private Limited.
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }) {
  return (
    <div>
      <h4 className="mb-2 text-[11px] uppercase tracking-wider text-flipMuted">{title}</h4>
      <ul className="space-y-1">{children}</ul>
    </div>
  );
}

function FooterLink({ children }) {
  return (
    <li>
      <span className="cursor-pointer hover:text-white">{children}</span>
    </li>
  );
}

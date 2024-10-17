import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f1f1f1' }}>
      <p>© {currentYear} E-Bus Ticketing. All Rights Reserved.</p>
    </footer>
  );
};

export default Footer;

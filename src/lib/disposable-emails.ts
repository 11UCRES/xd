// Common disposable/temporary email domains to block
const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com", "guerrillamail.com", "guerrillamailblock.com", "grr.la",
  "tempmail.com", "temp-mail.org", "throwaway.email", "yopmail.com",
  "sharklasers.com", "guerrillamail.info", "guerrillamail.net", "guerrillamail.org",
  "guerrillamail.de", "trashmail.com", "trashmail.me", "trashmail.net",
  "dispostable.com", "maildrop.cc", "fakeinbox.com", "mailnesia.com",
  "tempail.com", "tempr.email", "discard.email", "discardmail.com",
  "discardmail.de", "emailondeck.com", "33mail.com", "maildrop.cc",
  "mailcatch.com", "mailexpire.com", "mailmoat.com", "mytemp.email",
  "mt2015.com", "thankyou2010.com", "trash-mail.com", "trashymail.com",
  "trashymail.net", "wegwerfmail.de", "wegwerfmail.net", "wh4f.org",
  "yopmail.fr", "yopmail.net", "jetable.org", "nospam.ze.tc",
  "tempinbox.com", "tempinbox.co.uk", "getnada.com", "10minutemail.com",
  "10minutemail.net", "mohmal.com", "burnermail.io", "mailtemp.net",
  "harakirimail.com", "crazymailing.com", "tmail.ws", "emailfake.com",
  "tmpmail.net", "tmpmail.org", "bupmail.com", "mailnator.com",
  "spamgourmet.com", "mytrashmail.com", "mailzilla.com", "armyspy.com",
  "cuvox.de", "dayrep.com", "einrot.com", "fleckens.hu", "gustr.com",
  "jourrapide.com", "rhyta.com", "superrito.com", "teleworm.us",
  "tempmailaddress.com", "tempmailo.com", "tempomail.fr", "mailsac.com",
]);

export function isDisposableEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return false;
  return DISPOSABLE_DOMAINS.has(domain);
}

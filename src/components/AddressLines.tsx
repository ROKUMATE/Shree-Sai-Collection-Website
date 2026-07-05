type AddressData = {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  pincode: string;
};

/** Postal-address block used on order pages, checkout and the account page. */
export function AddressLines({ address }: { address: AddressData }) {
  return (
    <address className="text-sm not-italic leading-relaxed text-ink-soft">
      <span className="font-medium text-ink">{address.fullName}</span>
      <br />
      {address.line1}
      {address.line2 && (
        <>
          <br />
          {address.line2}
        </>
      )}
      <br />
      {address.city}, {address.state} — {address.pincode}
      <br />☎ {address.phone}
    </address>
  );
}

export const formatEUR = (n) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR" }).format(
    n,
  );

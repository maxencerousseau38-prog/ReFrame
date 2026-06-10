import { staticFile } from "remotion";
import { z } from "zod";

/**
 * Props schema for a car-listing promo video.
 *
 * These fields map directly onto a DriveOS vehicle record, so a listing can be
 * rendered into an MP4 by passing the vehicle data as input props:
 *
 *   npx remotion render CarListing out/listing.mp4 --props=./vehicle.json
 */
export const carListingSchema = z.object({
  dealershipName: z.string(),
  make: z.string(),
  model: z.string(),
  year: z.number().int().min(1900).max(2100),
  price: z.number().nonnegative(),
  currency: z.string().default("EUR"),
  mileageKm: z.number().nonnegative(),
  fuel: z.string(),
  transmission: z.string(),
  highlights: z.array(z.string()).max(4),
  photos: z.array(z.string()).min(1),
  accentColor: z.string(),
});

export type CarListingProps = z.infer<typeof carListingSchema>;

export const defaultCarListing: CarListingProps = {
  dealershipName: "DriveOS Motors",
  make: "Peugeot",
  model: "3008 GT",
  year: 2022,
  price: 28990,
  currency: "EUR",
  mileageKm: 34250,
  fuel: "Diesel",
  transmission: "Automatique",
  highlights: [
    "Toit panoramique",
    "Caméra 360°",
    "Sièges chauffants",
    "Garantie 12 mois",
  ],
  photos: [staticFile("car1.svg"), staticFile("car2.svg"), staticFile("car3.svg")],
  accentColor: "#2563eb",
};

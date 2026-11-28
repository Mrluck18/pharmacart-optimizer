import { type InferSchemaType, model, Schema } from 'mongoose';

const pharmacySchema = new Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    baseUrl: { type: String, required: true, trim: true },
    shippingCost: { type: Number, required: true, min: 0 },
    freeShippingThreshold: { type: Number, required: true, min: 0 },
  },
  { timestamps: true },
);

export type PharmacyDocument = InferSchemaType<typeof pharmacySchema>;

export const PharmacyModel = model('Pharmacy', pharmacySchema);

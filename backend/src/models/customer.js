import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    contact: { type: String, required: true },
    address: { type: String, required: true },
    loanAmount: { type: Number, required: true },
    interestRate: { type: Number, required: true },
    loanDuration: { type: Number, required: true },
    monthlySettlement: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    remainingBalance: { type: Number, required: true },
    createdAt: { type: String, default: () => new Date().toISOString() },
    status: {
      type: String,
      enum: ['active', 'completed', 'defaulted'],
      default: 'active',
    },
  },
  {
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform(doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
      },
    },
  }
);

export default mongoose.model('Customer', customerSchema);

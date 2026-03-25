import PaymentService from "@/services/PaymentService";
import { useState } from "react";

// Add this interface at the top
interface BNPLFormProps {
  user: { uid: string; name?: string; email?: string; phone?: string }; // add fields used in your code
  totalAmount: string | number;
  appointmentId: string;
}

export default function BNPLForm({
  user,
  totalAmount,
  appointmentId,
}: BNPLFormProps) {
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [installments, setInstallments] = useState(6);
  const [loading, setLoading] = useState(false);

  const handleBNPLPayment = async () => {
    try {
      setLoading(true);

      const result = await PaymentService.processPayment(
        user.uid!, // userId must be string
        user.name || "", // userName string
        Number(totalAmount), // amount must be number
        "bnpl", // PaymentMethod
        "appointment", // entityType
        appointmentId, // entityId
        "BNPL Payment", // description
        {
          // extraDetails
          email,
          phone,
          installments,
        },
      );

      alert(result.message);
    } catch (error) {
      console.error(error);
      alert("BNPL application failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Apply for BNPL</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="text"
        placeholder="Phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <select
        value={installments}
        onChange={(e) => setInstallments(Number(e.target.value))}
      >
        <option value={3}>3 months</option>
        <option value={6}>6 months</option>
        <option value={12}>12 months</option>
      </select>

      <button onClick={handleBNPLPayment} disabled={loading}>
        {loading ? "Submitting..." : "Apply for BNPL"}
      </button>
    </div>
  );
}

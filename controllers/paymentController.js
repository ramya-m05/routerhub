const handlePayment = async () => {
  try {
    // 1️⃣ Create order from backend
    const { data } = await API.post("/payment/create-order", {
      amount: totalAmount,
    });

    console.log("ORDER DATA:", data);

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY,
      amount: data.amount,
      currency: data.currency,
      order_id: data.id,

      name: "RouterKart",
      description: "Order Payment",

      // ✅ OPTIONAL BUT GOOD
      prefill: {
        name: localStorage.getItem("userName") || "User",
        email: JSON.parse(localStorage.getItem("user"))?.email || "",
      },

      handler: async function (response) {
        console.log("PAYMENT SUCCESS:", response);

        // ✅ FIX: send correct fields
        await API.post("/payment/verify", {
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        });

        alert("Payment successful 🎉");
      },

      theme: {
        color: "#FEE12B",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();

  } catch (err) {
    console.error("PAYMENT ERROR:", err.response?.data || err);
    alert("Payment failed");
  }
};
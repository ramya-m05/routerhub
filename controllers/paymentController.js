const handlePayment = async () => {
  try {
    // 1️⃣ Call YOUR backend (NOT Razorpay directly)
    const { data } = await API.post("/payment/create-order", {
      amount: totalAmount, // your cart total
    });

    console.log("ORDER DATA:", data);

    // 2️⃣ Razorpay options
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY, // public key only
      amount: data.amount,
      currency: data.currency,
      order_id: data.id,

      name: "RouterKart",
      description: "Order Payment",

      handler: async function (response) {
        console.log("PAYMENT SUCCESS:", response);

        // 3️⃣ Verify payment
        await API.post("/payment/verify", response);

        alert("Payment successful 🎉");
      },

      theme: {
        color: "#FEE12B",
      },
    };

    // 4️⃣ Open Razorpay
    const rzp = new window.Razorpay(options);
    rzp.open();

  } catch (err) {
    console.error("PAYMENT ERROR:", err.response?.data || err);
    alert("Payment failed");
  }
};
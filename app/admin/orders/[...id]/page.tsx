"use client";

import AdminNavbar from "@/app/components/AdminNavbar";
import BackButton from "@/app/components/BackButton";
import Loading from "@/app/components/Loading";
import axios from "axios";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface OrderLine {
  id: number;
  order_id: number;
  product_id: number;
  price: number;
  quantity: number;
  product_img: string;
  product_name: string;
  product_price: number;
  product_amount: number;
}

interface User {
  id: number;
  f_name: string;
  l_name: string;
  phone_number: string;
  email: string;
  tier_rank: number;
  address: string;
}

interface Order {
  id: number;
  o_status: string;
  o_total_price: number;
  o_timestamp: string;
  userID: number;
  tracking_number: string;
  f_name: string;
  l_name: string;
  phone_number: string;
  email: string;
  address: string;
  tier_rank: number;
}

const statusMapping: { [key: string]: string } = {
  P: "Pending",
  PD: "Paid",
  C: "Confirmed",
  S: "Shipping",
  X: "Canceled",
};

export default function OrderDetail() {
  const { id } = useParams();
  const [orderLines, setOrderLines] = useState<OrderLine[]>([]);
  const [order, setOrder] = useState<Order>();
  const [user, setUser] = useState<User>();
  const [loading, setLoading] = useState(false);
  const [showFullAddress, setShowFullAddress] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isAdding, setIsAdding] = useState(false);
  const [isImage, setIsImage] = useState(false);
  const [transactionId, setTransactionId] = useState<number>(0);

  const handleToggleAddress = () => {
    setShowFullAddress((prev) => !prev);
  };

  const handleTrackingNumberChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setTrackingNumber(e.target.value);
  };

  const handleTrackingNumberUpdate = async () => {
    const updatedOrder = {
      ...order,
      tracking_number: trackingNumber,
      o_status: "S",
    };
    setOrder(updatedOrder);
    try {
      const response = await axios.put(
        `http://localhost:8000/order/${id}`,
        {
          ...updatedOrder,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      alert("อัพเดตสถานะเสร็จสิ้น");
      setIsAdding(false);
      // Optionally, update the order state with the new tracking number
      setOrder((prev) =>
        prev ? { ...prev, tracking_number: trackingNumber } : prev
      );
    } catch (err) {
      console.error("Error updating tracking number:", err);
    }
  };

  const handleCancelOrder = async () => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this order?"
    );
    if (confirmCancel) {
      const updatedOrder = {
        ...order,
        o_status: "X",
      };
      setOrder(updatedOrder);
      try {
        const response = await axios.put(
          `http://localhost:8000/order/${id}`,
          {
            ...updatedOrder,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      } catch (err) {
        console.error("Error cancel order:", err);
      }
    }
  };

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `http://localhost:8000/order/user/detail/${id}`
        );
        setOrder(response.data);
        setTrackingNumber(response.data.tracking_number); // Initialize tracking number state

        const imageResponse = await axios.get(
          `http://localhost:8000/transaction/order/${response.data.id}`
        );
        console.log(imageResponse.data.t_image_url);
        setTransactionId(imageResponse.data.id);
        setImageUrl(imageResponse.data.t_image_url);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching order:", err);
      }
    };
    fetchOrder();
  }, [id]);

  const confirmOrder = async () => {
    const updatedOrder = {
      ...order,
      o_status: "C",
    };
    setOrder(updatedOrder);
    try {
      const response = await axios.put(
        `http://localhost:8000/order/${id}`,
        {
          ...updatedOrder,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      alert("อัพเดตสถานะเสร็จสิ้น");
      setIsImage(false);
    } catch (err) {
      console.error("Error confirm order:", err);
    }
  };
  const notConfirmOrder = async () => {
    const updatedOrder = {
      ...order,
      o_status: "P",
    };
    setOrder(updatedOrder);
    try {
      const response = await axios.put(
        `http://localhost:8000/order/${id}`,
        {
          ...updatedOrder,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      deleteTransaction();
      alert("อัพเดตสถานะเสร็จสิ้น");
      setIsImage(false);
    } catch (err) {
      console.error("Error confirm order:", err);
    }
  };

  useEffect(() => {
    const fetchOrderLines = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `http://localhost:8000/orders/${id}/orderlines`
        );
        setOrderLines(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching order lines:", err);
      }
    };
    fetchOrderLines();
  }, [id]);

  const deleteTransaction = async () => {
    var t_Id = Number(transactionId); // Replace with the actual transactionId;
    try {
      const response = await axios.delete(
        `http://localhost:8000/transaction/${t_Id}`
      );
      setIsAdding(false);
    } catch (err) {
      console.error("Error deleting transaction:", err);
    }
  };

  const handleImage = () => {
    if (imageUrl) setIsImage(true);
  };

  if (loading) {
    return (
      <div>
        <Loading />
      </div>
    );
  }

  console.log(order);
  return (
    <div>
      <header>
        <AdminNavbar />
        <BackButton />
      </header>
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-semibold mb-4">รายละเอียดคำสั่งซื้อ</h1>

        {order && (
          <div className="flex flex-col my-4">
            <div className="flex flex-col sm:flex-row justify-between ">
              <div className="mb-6">
                <h2 className="text-lg font-bold">ข้อมูลคำสั่งซื้อ</h2>
                <p>
                  <strong>หมายเลขคำสั่งซื้อ:</strong> {order.id}
                </p>
                <p>
                  <strong>สถานะคำสั่งซื้อ: </strong>
                  <span
                    className={`font-semibold ${
                      order.o_status === "X"
                        ? "text-red-500"
                        : order.o_status === "S"
                        ? "text-blue-500"
                        : "text-green-500"
                    }`}
                  >
                    {statusMapping[order.o_status] || "Unknown"}
                  </span>
                </p>
                <p>
                  <strong>ยอดสุทธิ:</strong>{" "}
                  <span className="text-lg">
                    {order.o_total_price.toFixed(2)} บาท
                  </span>
                </p>
                <p>
                  <strong>วันที่ทำรายการ:</strong>{" "}
                  {new Date(order.o_timestamp).toLocaleString()}
                </p>
              </div>
              <div className="mb-6 w-80 ml-auto">
                <h3 className="text-lg font-bold">ข้อมูลลูกค้า</h3>
                <p>
                  <strong>ชื่อลูกค้า:</strong> {order.f_name} {order.l_name}
                </p>
                <p>
                  <strong>อีเมลล์:</strong> {order.email}
                </p>
                <p>
                  <strong>เบอร์โทรศัพท์:</strong> {order.phone_number}
                </p>
                <p className="break-words">
                  <strong>ที่อยู่:</strong> {order.address}
                </p>
              </div>
            </div>
            <div className="flex flex-col my-4">
              {/* Existing order details code */}
              {isAdding ? (
                <div>
                  <strong>Tracking Number:</strong>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={handleTrackingNumberChange}
                    placeholder={order.tracking_number}
                    className="border rounded p-2 w-full"
                  />
                  <button
                    onClick={handleTrackingNumberUpdate}
                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded w-full"
                  >
                    ยืนยัน
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAdding(true)}
                  className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  อัพเดตสถานะการจัดส่งสินค้า
                </button>
              )}

              {!isImage ? (
                <button
                  onClick={handleImage}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
                >
                  ตรวจหลักฐานการเงิน
                </button>
              ) : (
                <div>
                  <div className="mt-4">
                    {imageUrl !== "Credit Card Receipt" ? (
                      imageUrl === "" ? (
                        <p className="text-gray-500">Waiting For Payment</p>
                      ) : (
                        <>
                          <h3 className="font-semibold">Uploaded Receipt:</h3>
                          <img
                            src={imageUrl}
                            alt="Uploaded Receipt"
                            className="mt-2 max-w-full"
                          />
                        </>
                      )
                    ) : (
                      <p className="text-green-500 font-bold">Credit Card Payment</p>
                    )}
                  </div>

                  <div className="flex flex-row gap-x-3">
                    <button
                      onClick={confirmOrder}
                      className="mt-2 px-4 py-2 bg-blue-500 text-white rounded w-full"
                    >
                      ยืนยัน
                    </button>
                    <button
                      onClick={notConfirmOrder}
                      className="mt-2 px-4 py-2 bg-red-500 text-white rounded w-full"
                    >
                      ไม่ยืนยัน
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={handleCancelOrder}
                className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
              >
                Cancel Order
              </button>
            </div>
          </div>
        )}

        <h2 className="text-lg font-bold mb-2">รายการสินค้า</h2>
        {orderLines ? (
          <ul className="space-y-4">
            {orderLines.map((line) => (
              <li
                key={line.id}
                className="p-4 bg-gray-50 border border-gray-200 rounded-lg shadow-sm"
              >
                <div className="flex items-center">
                  <img
                    src={line.product_img}
                    alt={line.product_name}
                    className="h-20 w-20 object-cover rounded mr-4"
                  />
                  <div>
                    <h3 className="text-lg font-semibold">
                      {line.product_name}
                    </h3>
                    <p>
                      ราคา:{" "}
                      <span className="font-semibold">
                        {line.product_price.toFixed(2)} บาท
                      </span>
                    </p>
                    <p>
                      จำนวน:{" "}
                      <span className="font-semibold">{line.quantity}</span>
                    </p>
                    <p>
                      รวมทั้งหมด:{" "}
                      <span className="font-semibold">
                        {line.product_price * line.quantity} บาท
                      </span>
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No order lines found.</p>
        )}
      </div>
    </div>
  );
}

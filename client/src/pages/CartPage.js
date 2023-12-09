import React, { useState, useEffect } from "react";
import Layout from "./../components/Layout/Layout";
import { useCart } from "../context/cart";
import { useAuth } from "../context/auth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import "../styles/CartStyles.css";
import { Radio } from "antd";
import moment from "moment";

const CartPage = () => {
  const [auth, setAuth] = useAuth();
  const [cart, setCart] = useCart();
  const [clientToken, setClientToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [quantities, setQuantities] = useState([]);
  const navigate = useNavigate();
  const groupedCart = [];
  cart.forEach((product) => {
    const existingProduct = groupedCart.find((item) => item._id === product._id);
    if (existingProduct) {
      existingProduct.quantity += product.quantity;
    } else {
      groupedCart.push({ ...product });
    }
  });
  useEffect(() => {
    const newQuantities = cart.map((p) => ({
      id: p._id,
      quantity: p.quantity,
    }));
    setQuantities(newQuantities);
  }, [cart]);

  const getQuantityFromInventory = async(productId) => {
    const res = await axios.get(`/api/v1/product/get-product/${productId}/quantity`);
    if (res.status === 200) {
      return res.data.quantity;
    } else {
      return 0;
    }
  };

  const changeQuantity = async(pid, quantity) => {
    const productQuantity = await getQuantityFromInventory(pid);
    if(quantity === 0) {
      window.alert("Vui lòng nhập số lượng sản phẩm lớn hơn 0")
    }
  if (quantity > productQuantity) {
    toast.error("Số lượng vượt quá số lượng hiện có");
    return;
  }
  try {
    const updatedCart = cart.map((item) => {
      if (item._id === pid) {
        return { ...item, quantity };
      }
      return item;
    });
    console.log();
    setCart(updatedCart, 
      localStorage.setItem("cart", JSON.stringify(updatedCart))
    );
  } catch (error) {
    console.log(error);
  }
  };
  // Tổng giá tiền
  const totalPrice = () => {
    try {
      let total = 0;
      cart?.map((item) => {
        total = total + item.price * item.quantity;
      });
      return total;
    } catch (error) {
      console.log(error);
    }
  };

  // Xóa mục trong giỏ hàng
  const removeCartItem = (pid) => {
    try {
      let myCart = [...cart];
      let index = myCart.findIndex((item) => item._id === pid);
      myCart.splice(index, 1);
      setCart(myCart);
      localStorage.setItem("cart", JSON.stringify(myCart));
    } catch (error) {
      console.log(error);
    }
  };

  // Lấy mã thông báo thanh toán
  const getToken = async () => {
    try {
      const { data } = await axios.get("/api/v1/product/braintree/token");
      setClientToken(data?.clientToken);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getToken();
  }, [auth?.token]);

  // Xử lý thanh toán
  const handlePayment = async () => {
    try {
      setLoading(true);
      const { data } = await axios.post("/api/v1/product/braintree/payment", {
        nonce: "off",
        cart,
      });
      setLoading(false);
      localStorage.removeItem("cart");
      setCart([]);
      navigate("/dashboard/user/orders");
      toast.success("Thanh toán thành công");
      const currentTime = moment().format("YYYY-MM-DD HH:mm:ss");
      const newOrder = { createdAt: currentTime };

      const updatedOrders = [...orders, newOrder];
      setOrders(updatedOrders);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="cart-page">
        <div className="row">
          <div className="col-md-12">
            <h1 className="text-center bg-light p-2 mb-1">
              {!auth?.user
                ? "Xin chào"
                : `Xin chào  ${auth?.token && auth?.user?.name}`}
              <p className="text-center">
                {cart?.length
                  ? `Bạn có ${cart.length} sản phẩm trong giỏ hàng ${
                      auth?.token ? "" : "Vui lòng đăng nhập để thanh toán!"
                    }`
                  : "Giỏ hàng của bạn đang trống"}
              </p>
            </h1>
          </div>
        </div>
        <div className="container">
          <div className="row">
            <div className="col-md-7 p-0 m-0">
              {groupedCart?.map((p) => (
                <div className="row card flex-row" key={p._id}>
                  <div className="col-md-4">
                    <img
                      src={`/api/v1/product/product-photo/${p._id}`}
                      className="card-img-top"
                      alt={p.name}
                      width="100%"
                      height={"130px"}
                    />
                  </div>
                  <div className="col-md-4">
                    <p>{p.name}</p>
                    <p>Giá: {p.price.toLocaleString()}đ</p>
                  </div>
                  <div className="col-md-4 cart-remove-btn">
                    <button
                      className="btn btn-danger"
                      onClick={() => removeCartItem(p._id)}
                    >
                      Xóa
                    </button>
                    <div className="ms-2 quantity">
                      Số lượng:
                      <input
                        className="ip"
                        type="number"
                        min="1"
                        value={
                          quantities.length === 0
                            ? 1
                            : quantities.find((quantity) => quantity.id === p._id)
                                .quantity
                        }
                        onChange={(e) =>
                          changeQuantity(p._id, parseInt(e.target.value))
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="col-md-4 ms-5 cart-summary">
              <h2>Giỏ hàng</h2>
              <p>Tổng tiền | Kiểm tra | Thanh toán</p>
              <hr />
              <h4>Tổng tiền: {totalPrice().toLocaleString()}đ </h4>
              {auth?.user?.address ? (
                <>
                  <div className="mb-3">
                    <h4 className="p-2" style={{color: "white", background: "#3366FF"}}>Địa chỉ giao hàng</h4>
                    <p style={{color: "red"}}>
                      Vui lòng nhập đúng địa chỉ giao hàng
                    </p>
                    <h5>{auth?.user?.address}</h5>
                    <button
                      className="btn btn-outline-warning"
                      onClick={() => navigate("/dashboard/user/profile")}
                    >
                      Thay đổi địa chỉ
                    </button>
                  </div>
                </>
              ) : (
                <div className="mb-3">
                  {auth?.token ? (
                    <button
                      className="btn btn-outline-warning"
                      onClick={() => navigate("/dashboard/user/profile")}
                    >
                      Cập nhật địa chỉ
                    </button>
                  ) : (
                    <button
                      className="btn btn-outline-warning"
                      onClick={() =>
                        navigate("/login", {
                          state: "/cart",
                        })
                      }
                    >
                      Vui lòng đăng nhập để thanh toán
                    </button>
                  )}
                </div>
              )}
              <div className="mt-2">
                {!clientToken || !auth?.token || !cart?.length ? (
                  ""
                ) : (
                  <>
                    <Radio checked>
                      <h6>Thanh toán bằng tiền mặt</h6>
                    </Radio>
                    <Radio disabled>
                      <h6>Thanh toán bằng thẻ (Chưa hỗ trợ)</h6>
                    </Radio>
                    <div className="d-flex justify-content-center mb-3" >
                      <button
                        className="btn btn-primary"
                        onClick={handlePayment}
                        disabled={loading || !auth?.user?.address}
                      >
                      {loading ? "Đang tải...." : "Thanh toán"}
                    </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CartPage;

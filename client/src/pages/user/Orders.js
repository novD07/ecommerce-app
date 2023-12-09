import React, { useState, useEffect } from "react";
import UserMenu from "../../components/Layout/UserMenu";
import Layout from "./../../components/Layout/Layout";
import axios from "axios";
import { useAuth } from "../../context/auth";
import moment from "moment";

const Orders = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [auth, setAuth] = useAuth();
  const reversedOrders = [...orders].reverse();
  const calculateOrderTotal = (order) => {
    return order.products.reduce((total, product) => total + (product.price * product.quantity), 0);
  };
  const handleProductClose = () => {
    setSelectedOrder(null);
  };

  const toggleDiv = (order) => {
    setSelectedOrder(order === selectedOrder ? null : order);
  };

  const getOrders = async () => {
    try {
      const { data } = await axios.get("/api/v1/auth/orders");
      setOrders(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (auth?.token) getOrders();
  }, [auth?.token]);

  return (
    <Layout title={"Your Orders"}>
      <div className="container-fluid p-3 m-3 dashboard">
        <div className="row">
          <div className="col-md-3">
            <UserMenu />
          </div>
          <div className="col-md-9">
            <h1 className="text-center">All Orders</h1>
            {reversedOrders?.map((o, i) => {
              return (
                <div className="border shadow" key={o._id}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th scope="col">#</th>
                        <th scope="col">Trạng thái</th>
                        <th scope="col">Thời gian đặt hàng</th>
                        <th scope="col">Số lượng</th>
                        <th scope="col">Tổng tiền</th>
                        <th scope="col">Chi tiết</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{i + 1}</td>
                        <td>{o?.status}</td>
                        <td>{moment(o?.createdAt).format("HH:mm:ss || DD-MM-YYYY")}</td>
                        <td>{o.products.reduce((total, product) => total + product.quantity, 0)}</td>
                        <td>{calculateOrderTotal(o).toLocaleString()}đ</td>
                        <td>
                          <button className="btn btn-primary" onClick={() => toggleDiv(o)}>
                            Xem
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  {selectedOrder && selectedOrder._id === o._id && (
                    <div className="container">
                      {selectedOrder?.products?.map((p, i) => (
                        <div className="row mb-2 p-3 card flex-row" key={p._id}>
                          <div className="col-md-4">
                            <img
                              src={`/api/v1/product/product-photo/${p._id}`}
                              className="card-img-top"
                              alt={p.name}
                              width="100px"
                              height="100px"
                            />
                          </div>
                          <div className="col-md-8">
                            <p>{p.name}</p>
                            <p>{p.description.substring(0, 30)}</p>
                            <p>Giá: {p.price.toLocaleString()}đ</p>
                            <p>Số lượng: {p.quantity}</p> {/* Thêm dòng này */}
                          </div>
                        </div>
                      ))}
                      
                      <div className="d-flex justify-content-center mb-3">
                        <button className="btn btn-danger" onClick={handleProductClose}>
                          Đóng
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Orders;

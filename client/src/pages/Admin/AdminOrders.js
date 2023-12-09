import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import AdminMenu from "../../components/Layout/AdminMenu";
import Layout from "../../components/Layout/Layout";
import { useAuth } from "../../context/auth";
import moment from "moment";
import { Select } from "antd";
const { Option } = Select;

const AdminOrders = () => {
  const [status, setStatus] = useState([
    "Chưa xử lí",
    "Chấp nhận",
    "Từ chối",
  ]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [auth, setAuth] = useAuth();
  const calculateOrderTotal = (order) => {
    return order.products.reduce((total, product) => total + (product.price * product.quantity), 0);
  };
  const handleProductClose = () => {
    setSelectedOrder(null);
  };
  function toggleDiv(order) {
    setSelectedOrder(order);
  }
  const getOrders = async () => {
    try {
      const { data } = await axios.get("/api/v1/auth/all-orders");
      setOrders(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (auth?.token) getOrders();
  }, [auth?.token]);

  const handleChange = async (orderId, value) => {
    try {
      const { data } = await axios.put(`/api/v1/auth/order-status/${orderId}`, {
        status: value,
      });
      getOrders();
    } catch (error) {
      console.log(error);
    }
  };
  
  return (
    <Layout title={"Đơn đặt hàng"}>
      <div className="row dashboard">
        <div className="col-md-3">
          <AdminMenu />
        </div>
        <div className="col-md-9">
          <h1 className="text-center">Tất cả đơn hàng</h1>
          {orders?.map((o, i) => {
            return (
              <div className="border shadow" key={o._id}>
                <table className="table">
                  <thead>
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">Trạng thái</th>
                      <th scope="col">Người mua</th>
                      <th scope="col">Số điện thoại</th>
                      <th scope="col">Địa chỉ</th>
                      <th scope="col">Thời gian</th>
                      <th scope="col">Số lượng</th>
                      <th scope="col">Tổng tiền</th>
                      <th scope="col">Chi tiết</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{i + 1}</td>
                      <td>
                        <Select
                          bordered={false}
                          onChange={(value) => handleChange(o._id, value)}
                          defaultValue={o?.status}
                        >
                          {status.map((s, i) => (
                            <Option key={i} value={s}>
                              {s}
                            </Option>
                          ))}
                        </Select>
                      </td>
                      <td>{o?.buyer?.name}</td>
                      <td>{o?.buyer?.phone}</td>
                      <td>{o?.buyer?.address}</td>
                      <td>{moment(o?.createdAt).format('HH:mm:ss || DD-MM-YYYY')}</td>
                      
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
                {selectedOrder && selectedOrder._id === o._id && (<div className="container" >
                  <div className="mb-3">
                    {selectedOrder?.products?.map((p, i) => (
                      <div className="row mb-2 p-3 card flex-row" key={p._id}>
                        <div className="col-md-4">
                          <img
                            src={`/api/v1/product/product-photo/${p._id}`}
                            className="card-img-top"
                            alt={p.name}
                            width="100px"
                            height={"100px"}
                          />
                        </div>
                        <div className="col-md-8">
                          <p>{p.name}</p>
                          <p>{p.description.substring(0, 30)}</p>
                          <p>Giá : {p.price.toLocaleString()}đ</p>
                          <p>Số lượng: {p.quantity}</p> 
                        </div>
                        
                      </div>
                    ))}
                    <div className="d-flex justify-content-center">
                        <button className="btn btn-danger" onClick={handleProductClose}>
                          Đóng
                        </button>
                    </div>
                  </div>
                </div>
                 )}
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

export default AdminOrders;

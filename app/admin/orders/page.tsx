"use client";

import { useEffect, useState } from "react";

type Order = {
  id: number;
  customer_name: string;
  customer_phone: string;
  table_number: string;
  notes: string;
  total_lbp: number;
  status: string;
  created_at: string;
};

type OrderItem = {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price_lbp: number;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [items, setItems] = useState<OrderItem[]>([]);

  async function loadOrders() {
    const res = await fetch("/api/orders", { cache: "no-store" });
    const data = await res.json();

    setOrders(Array.isArray(data.orders) ? data.orders : []);
    setItems(Array.isArray(data.items) ? data.items : []);
  }

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-6 text-white">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-semibold">Orders</h1>

        <div className="mt-6 space-y-4">
          {orders.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/10 p-5">
              No orders yet
            </div>
          ) : (
            orders.map((order) => {
              const orderItems = items.filter(
                (item) => Number(item.order_id) === Number(order.id)
              );

              return (
                <div
                  key={order.id}
                  className="rounded-3xl border border-white/10 bg-white/10 p-5 shadow-xl backdrop-blur-2xl"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-semibold">
                        Order #{order.id}
                      </h2>
                      <p className="text-sm text-neutral-300">
                        {new Date(order.created_at).toLocaleString()}
                      </p>
                    </div>

                    <div className="rounded-full bg-amber-300 px-3 py-1 text-sm font-semibold text-black">
                      {order.status}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2 text-sm text-neutral-200">
                    {order.customer_name && <p>Name: {order.customer_name}</p>}
                    {order.customer_phone && <p>Phone: {order.customer_phone}</p>}
                    {order.table_number && <p>Table: {order.table_number}</p>}
                    {order.notes && <p>Notes: {order.notes}</p>}
                  </div>

                  <div className="mt-4 space-y-2">
                    {orderItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between rounded-2xl bg-black/30 px-4 py-3"
                      >
                        <div>
                          <p className="font-medium">{item.product_name}</p>
                          <p className="text-xs text-neutral-400">
                            Qty: {item.quantity}
                          </p>
                        </div>

                        <p className="text-amber-200">
                          {Number(item.price_lbp * item.quantity).toLocaleString(
                            "en-US"
                          )}{" "}
                          L.L
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 border-t border-white/10 pt-4 text-right text-lg font-semibold text-amber-200">
                    Total: {Number(order.total_lbp).toLocaleString("en-US")} L.L
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}
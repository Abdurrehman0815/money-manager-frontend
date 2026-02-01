# 💰 Money Manager - Frontend

A responsive, feature-rich personal finance dashboard built with **React (Vite)** and **Tailwind CSS**. This application provides a seamless interface for users to track income, manage expenses, visualize spending habits, and perform secure P2P transfers with strict financial logic.

![Project Status](https://img.shields.io/badge/Status-Active-success)
![License](https://img.shields.io/badge/License-MIT-blue)

## 🚀 Live Deployment

**Base URL:** `https://money-manager-frontend-steel.vercel.app`

## 🌟 Features

* **Interactive Dashboard:** Real-time visual breakdown of Income vs. Expenses using **Bar Charts** and detailed Category breakdowns using **Pie Charts**.
* **Smart Transaction Handling:**
    * **Add Money (Deposit):** Updates real account balances (Cash/Bank).
    * **Track Income:** Records statistical income for budgeting without affecting bank balances incorrectly.
    * **Expenses:** Deducts from specific accounts with strict budget checks.
    * **Self-Transfers:** Move money seamlessly between Cash and Bank accounts.
    * **P2P Transfers:** Send money to other users via email (recorded as an Expense for the sender and a Deposit for the receiver).
* **Strict Financial Logic:**
    * Prevents expenses from exceeding Total Income.
    * Prevents recording Income higher than actual Account Balances.
    * Prevents spending more than the available balance in a specific account.
* **Advanced Filtering:** Filter transactions by Date Range (Week, Month, Year, Custom), Category (Food, Fuel, etc.), and Division (Personal/Office).
* **Time-Locked Security:** Transactions can only be Edited or Deleted within **12 hours** of creation to ensure historical accuracy.
* **Responsive Design:** Fully optimized for desktop, tablet, and mobile devices using Tailwind CSS.

## 🛠️ Tech Stack

* **Framework:** [React.js](https://reactjs.org/) (powered by Vite)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **State Management:** React Context API (`AuthContext`)
* **Data Visualization:** [Recharts](https://recharts.org/) (Bar & Pie Charts)
* **API Integration:** [Axios](https://axios-http.com/)
* **Routing:** React Router DOM
* **Notifications:** React Toastify
* **Icons:** React Icons (FontAwesome/Material Design)


## 📂 Project Structure

```bash
src/
├── components/       # Reusable components (Navbar, TransactionModal, etc.)
├── context/          # Global state (AuthContext for user login/token)
├── pages/            # Main views (Login, Register, Dashboard)
├── assets/           # Images and static files
├── App.jsx           # Main application entry point & routing
└── main.jsx          # React DOM rendering

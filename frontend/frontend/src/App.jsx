import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");

  const [expenses, setExpenses] = useState([]);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  // GET expenses
  const getExpenses = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/expenses");
      const data = await response.json();

      if (data.success) {
        setExpenses(data.expenses);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // ADD / UPDATE
  const saveExpense = async () => {
    if (!title || !amount || !category) {
      setMessage("Please fill all fields ⚠️");
      return;
    }

    try {
      const url = editingId
        ? `http://localhost:5000/api/expenses/${editingId}`
        : "http://localhost:5000/api/expenses";

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          amount: Number(amount),
          category,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(
          editingId
            ? "Expense updated successfully ✅"
            : "Expense added successfully ✅"
        );

        clearForm();
        getExpenses();
      }
    } catch (error) {
      console.log(error);
      setMessage("Server error ❌");
    }
  };

  // EDIT
  const editExpense = (expense) => {
    setEditingId(expense._id);
    setTitle(expense.title);
    setAmount(expense.amount);
    setCategory(expense.category);
    setMessage("");
  };

  // DELETE
  const deleteExpense = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/expenses/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (data.success) {
        setMessage("Expense deleted successfully 🗑️");
        getExpenses();
      }
    } catch (error) {
      console.log(error);
    }
  };

  // CLEAR FORM
  const clearForm = () => {
    setTitle("");
    setAmount("");
    setCategory("");
    setEditingId(null);
  };

  // TOTAL EXPENSE
  const totalExpense = expenses.reduce(
    (total, expense) => total + Number(expense.amount),
    0
  );

  // TOTAL CATEGORIES
  const categories = new Set(
    expenses.map((expense) => expense.category)
  ).size;

  // CATEGORY-WISE TOTAL
  const categoryTotals = expenses.reduce((totals, expense) => {
    const categoryName = expense.category;
    const amount = Number(expense.amount);

    if (!totals[categoryName]) {
      totals[categoryName] = 0;
    }

    totals[categoryName] += amount;

    return totals;
  }, {});

  // SEARCH + FILTER
  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch = expense.title
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      filterCategory === "All" ||
      expense.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    getExpenses();
  }, []);

  return (
    <div className="app">
      <div className="container">

        {/* HEADER */}
        <header>
          <h1>💰 Expense Tracker</h1>
          <p>Manage your daily expenses easily</p>
        </header>

        {/* DASHBOARD STATS */}
        <div className="stats">

          <div className="stat-card">
            <span>Total Expenses</span>
            <h2>₹{totalExpense}</h2>
          </div>

          <div className="stat-card">
            <span>Total Records</span>
            <h2>{expenses.length}</h2>
          </div>

          <div className="stat-card">
            <span>Categories</span>
            <h2>{categories}</h2>
          </div>

        </div>

        {/* ANALYTICS */}
        <div className="analytics-card">
          <h2>📊 Category Analytics</h2>

          {Object.keys(categoryTotals).length === 0 ? (
            <p className="empty">No analytics available.</p>
          ) : (
            Object.entries(categoryTotals).map(
              ([categoryName, total]) => (
                <div className="analytics-row" key={categoryName}>
                  <span>{categoryName}</span>
                  <strong>₹{total}</strong>
                </div>
              )
            )
          )}
        </div>

        {/* FORM */}
        <div className="form-card">

          <h2>
            {editingId ? "✏️ Edit Expense" : "➕ Add Expense"}
          </h2>

          <input
            type="text"
            placeholder="Expense title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Select Category</option>
            <option value="Food">🍔 Food</option>
            <option value="Travel">✈️ Travel</option>
            <option value="Shopping">🛍️ Shopping</option>
            <option value="Bills">💡 Bills</option>
            <option value="Entertainment">🎬 Entertainment</option>
            <option value="Other">📦 Other</option>
          </select>

          <div className="form-buttons">

            <button className="primary-btn" onClick={saveExpense}>
              {editingId ? "Update Expense" : "Add Expense"}
            </button>

            {editingId && (
              <button className="cancel-btn" onClick={clearForm}>
                Cancel
              </button>
            )}

          </div>

          {message && <p className="message">{message}</p>}

        </div>

        {/* SEARCH + FILTER */}
        <div className="search-filter">

          <input
            type="text"
            placeholder="🔎 Search expense..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            <option value="Food">🍔 Food</option>
            <option value="Travel">✈️ Travel</option>
            <option value="Shopping">🛍️ Shopping</option>
            <option value="Bills">💡 Bills</option>
            <option value="Entertainment">🎬 Entertainment</option>
            <option value="Other">📦 Other</option>
          </select>

        </div>

        {/* EXPENSE LIST */}
        <div className="expense-section">

          <h2>Recent Expenses</h2>

          {filteredExpenses.length === 0 ? (
            <p className="empty">
              No matching expenses found.
            </p>
          ) : (
            filteredExpenses.map((expense) => (

              <div className="expense-card" key={expense._id}>

                <div>
                  <h3>{expense.title}</h3>
                  <span>{expense.category}</span>
                </div>

                <div className="expense-right">

                  <strong>₹{expense.amount}</strong>

                  <div>
                    <button
                      className="edit-btn"
                      onClick={() => editExpense(expense)}
                    >
                      Edit ✏️
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() => deleteExpense(expense._id)}
                    >
                      Delete 🗑️
                    </button>
                  </div>

                </div>

              </div>

            ))
          )}

        </div>

      </div>
    </div>
  );
}

export default App;
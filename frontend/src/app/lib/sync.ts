import { useBudgetStore } from "./store/budgetStore";

const BACKEND_URL = "http://localhost:4000";

// Helper to get logged-in email (or default seed user)
function getEmail() {
  return localStorage.getItem("email") || "hire-me@anshumat.org";
}

export async function syncBudget() {
  const state = useBudgetStore.getState();
  const localBudget = state.budget;

  const email = getEmail();

  if (!navigator.onLine) {
    console.log("Offline — cannot sync");
    return;
  }

  // 1️⃣ Fetch latest server version
  const resLatest = await fetch(`${BACKEND_URL}/budget/latest?email=${email}`);
  const latestData = await resLatest.json();

  const serverBudget = latestData.budget;
  const serverTime = latestData.timestamp
    ? Date.parse(latestData.timestamp)
    : 0;

  const localTime = localBudget.updatedAt;

  // 2️⃣ Compare timestamps
  if (!serverBudget || localTime > serverTime) {
    // Local is newer → PUSH
    console.log("Local is newer → pushing to server");

    const res = await fetch(`${BACKEND_URL}/budget/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        budget: localBudget,
      }),
    });

    const data = await res.json();

    if (data.success) {
      state.markSynced(Date.parse(data.timestamp));
      console.log("Synced local → server");
    }
  } else if (serverTime > localTime) {
    // Server is newer → PULL
    console.log("Server is newer → pulling to local");

    useBudgetStore.setState({
      budget: {
        ...serverBudget,
        syncStatus: "synced",
        syncedAt: serverTime,
      },
    });
  } else {
    // Already synced
    console.log("Already synced — no changes");
    state.markSynced(localTime);
  }
}

export async function pullLatest() {
  try {
    const email = getEmail();

    const res = await fetch(`${BACKEND_URL}/budget/latest?email=${email}`);

    const data = await res.json();
    return data.budget || null;
  } catch (err) {
    console.error("Fetch latest failed:", err);
    return null;
  }
}

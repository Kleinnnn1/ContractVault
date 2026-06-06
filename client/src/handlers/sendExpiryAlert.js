const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp();
}

exports.sendExpiryAlerts = onSchedule("every day 08:00", async () => {
  const db = admin.firestore();

  const now = new Date();
  const in30Days = new Date();
  in30Days.setDate(now.getDate() + 30);

  const todayStr = now.toISOString().split("T")[0];
  const futureStr = in30Days.toISOString().split("T")[0];

  console.log(`Checking expiries between ${todayStr} and ${futureStr}`);

  const snapshot = await db
    .collection("documents")
    .where("status", "==", "ready")
    .where("expiryDate", ">=", todayStr)
    .where("expiryDate", "<=", futureStr)
    .get();

  if (snapshot.empty) {
    console.log("No expiring documents found.");
    return null;
  }

  const batch = db.batch();

  snapshot.forEach((docSnap) => {
    const doc = docSnap.data();
    const daysLeft = Math.ceil(
      (new Date(doc.expiryDate) - now) / (1000 * 60 * 60 * 24)
    );

    const notifRef = db
      .collection("users")
      .doc(doc.uid)
      .collection("notifications")
      .doc();

    batch.set(notifRef, {
      type: "expiry_warning",
      documentId: docSnap.id,
      documentTitle: doc.title || doc.fileName,
      expiryDate: doc.expiryDate,
      daysLeft,
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`Alert queued: "${doc.title}" — ${daysLeft} days left`);
  });

  await batch.commit();
  console.log(`✓ ${snapshot.size} alert(s) written`);
  return null;
});
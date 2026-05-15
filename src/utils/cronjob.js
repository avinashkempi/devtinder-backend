const cron = require("node-cron");
const { subDays, startOfDay, endOfDay } = require("date-fns");
const connectionRequestModel = require("../models/connectionRequest");

cron.schedule("0 8 * * *", async () => {
  const yesterday = subDays(new Date(), 1);
  const yesterdayStart = startOfDay(yesterday);
  const yesterdayEnd = endOfDay(yesterday);

  const pendingRequests = await connectionRequestModel
    .find({
      status: "interested",
      createdAt: {
        $gte: yesterdayStart,
        $lt: yesterdayEnd,
      },
    })
    .select("fromUserId toUserId")
    .populate("fromUserId toUserId", "email");

  const listOfEmails = [
    ...new Set(pendingRequests.map((req) => req.toUserId.email)),
  ];
  console.log(listOfEmails);
});

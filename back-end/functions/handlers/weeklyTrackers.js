const { db } = require("../utils/init");

const getAllWeeklyTrackersOfUser = (userId) => {
  db.collection("weeklyTrackers")
    .where("userId", "==", `${userId}`)
    .orderBy("dateCreated", "desc")
    .get()
    .then((data) => {
      let trackers = [];
      data.forEach((doc) => {
        trackers.push({
          trackerId: doc.id,
          userId: doc.data().userId,
          startDate: doc.data().startDate,
          endDate: doc.data().endDate, // after 7 days
          moodSelected: doc.data().moodSelected,
          journalWritten: doc.data().journalWritten,
        });
      });

      return trackers;
    })
    .catch((err) => {
      console.log(err);
      throw new Error("Problem in getting all weekly trackers of a user");
    });
};

exports.getThisWeekTracker = (req, res) => {
  const current = new Date().getTime();
  getAllWeeklyTrackersOfUser(req.user.userId)
    .then((weeklyTrackers) => {
      const tracker = weeklyTrackers.filter(
        (tracker) => current >= tracker.startDate && current <= tracker.endDate
      );

      return res.status(200).json(tracker[0]);
    })
    .catch((err) => {
      console.error(err);
      res
        .status(500)
        .json({ error: "Something went wrong, please try again!" });
    });
};

exports.createAWeeklyTrackerForUser = (userId) => {
  const newWeeklyTracker = {
    userId: userId,
    startDate: new Date().getTime(),
    endDate: new Date().getTime() + 604800000, // after 7 days
    moodSelected: [0, 0, 0, 0, 0, 0, 0],
    journalWritten: [false, false, false, false, false, false, false],
  };

  db.collection("weeklyTrackers")
    .add(newWeeklyTracker)
    .then((doc) => {
      const resWeeklyTracker = newWeeklyTracker;
      resWeeklyTracker.weeklyTrackerId = doc.id;

      res.status(200).json(resWeeklyTracker);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: "Something went wrong, please try again",
      });
    });
};

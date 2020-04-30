const loopback = require("loopback");
module.exports = function (app) {
  const router = app.loopback.Router();
  const Bookings = app.models.Booking;
  const Slots = app.models.Slot;
  const Stores = app.models.Store; 
  const bodyParser = require("body-parser");
  const moment = require("moment");
  require("mongodb-moment")(moment);

  router.use(bodyParser.json({ extended: true }));

  router.post("/api/bookings", (req, res) => {
    const newBooking = req.body;

    const bookingsForSlot = Bookings.find({ "where": { "slotId": newBooking.slotId } });
    const slot = Slots.findById(newBooking.slotId, { include: 'bookings' }); 

    Promise.all([bookingsForSlot, slot])
        .then(queries => {
            const foundBookings = queries[0];
            const foundSlot = queries[1];

            if (!foundBookings || !foundSlot) {
                res.json({ "error": "This slot does not exist"})
            } else if (foundBookings.length < foundSlot.maxPeoplePerSlot) {
                Bookings.create(newBooking)
                    .then(createdBooking => res.json(createdBooking))
                    .catch(err => console.log(err));
            } else {
                res.json({ "error": "This slot is no longer available. Try a different slot."})
            }
        }) 
        .catch(err => console.log(err))
  })

  router.get("/api/availableSlots", (req, res) => {
    //req.body comes in w/ storeId. 
    //for now only query avail slots for today; can change it to 3-7 day increments if store commits to regular duration/maxPeople 
    const { storeId } = req.body; 
    const tomorrow = moment().add(1, 'days').startOf('day').utc().toISOString(); 
    const yesterday = moment().subtract(1, 'days').endOf('day').utc().toISOString();
    const dayStart = moment().startOf('day').utc().toISOString();
    const dayEnd = moment().endOf('day').utc().toISOString();
    
    Slots.find({
      "where": { 
        date: 
          { between: [yesterday, tomorrow] }, 
          storeId: storeId
      }, include: 'bookings'})
      .then(slots => {
        if (!slots) {
          //generate new timeslots in db based on maxPeoplePerSlot and duration 
          //return new slot results of db query 
          res.json({ "error": "No bookings found for this date and storeId."})
        } else { 
        const avail = slots.filter((booking) => {
            let numBookings = booking.bookings().length; 
            let maxPeoplePerSlot = booking.maxPeoplePerSlot;
            return numBookings < maxPeoplePerSlot;
        });
        res.json(avail)
      }})
      .catch(err => console.log(err));
  })
  
  app.use(router);
};
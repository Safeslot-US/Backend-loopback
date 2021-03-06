const loopback = require("loopback");
module.exports = function (app) {
  const router = app.loopback.Router();
  const { Booking, Slot, Store } = app.models; 
  const bodyParser = require("body-parser");
  const moment = require("moment");
  const generateTimeslots = require('./helpers').generateTimeslots; 
  // require("mongodb-moment")(moment);
  router.use(bodyParser.json({ extended: true }));

  router.post("/api/bookings", (req, res) => {
    const newBooking = req.body;
    const bookingsForSlot = Booking.find({ "where": { "slotId": newBooking.slotId } });
    const slot = Slot.findById(newBooking.slotId, { include: 'bookings' }); 

    Promise.all([bookingsForSlot, slot])
        .then(queries => {
            const foundBookings = queries[0];
            const foundSlot = queries[1];

            if (!foundBookings || !foundSlot) {
                res.json({ "error": "This slot does not exist"})
            } else if (foundBookings.length < foundSlot.maxPeoplePerSlot) {
                Booking.create(newBooking)
                    .then(createdBooking => res.json(createdBooking))
                    .catch(err => console.log(err));
            } else {
                res.json({ "error": "This slot is no longer available. Try a different slot."})
            }
        }) 
        .catch(err => console.log(err))
  })

  router.get("/api/availableSlots", (req, res) => {
    //Get available slots for today.
    const { storeId } = req.body; 
    // const tomorrow = moment().utc().add(1, 'days').startOf('day').toISOString(); 
    // const yesterday = moment().utc().subtract(1, 'days').endOf('day').toISOString();
    const dayStart = moment().utc().startOf('day').toISOString();
    const dayEnd = moment().utc().endOf('day').toISOString();

    Slot.find({
      "where": { 
        date: 
          { between: [dayStart, dayEnd] }, 
          storeId: storeId
      }, include: 'bookings'})
      .then(slots => {
        if (!slots) {
          res.json({ "error": "No slots created for this date and storeId yet."})
        } else { 
        const avail = slots.filter((booking) => {
            let numBookings = booking.bookings().length; 
            let maxPeoplePerSlot = booking.maxPeoplePerSlot;
            return numBookings < maxPeoplePerSlot;
        });
        res.json(avail);
      }})
      .catch(err => console.log(err));
  })

  router.get("/api/generateSlots", (req, res) => {
    //Generate new slots for today.
    const { storeId } = req.body; 
    Store.findById(storeId)
      .then(store => { 
        const { id, openingHour, closingHour, slotDuration, maxPeoplePerSlot } = store; 
        const newSlots = generateTimeslots(slotDuration, openingHour, closingHour, id, maxPeoplePerSlot);
        Slot.create(newSlots)
          .then(newSlots => { 
            res.json(newSlots)
          })
          .catch(err => console.log(err))
      })
      .catch(err => console.log(err));
  })
  
  app.use(router);
};
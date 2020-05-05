//Adapted from https://codepen.io/attilab/pen/KWmQMB?editors=0010
//Generates an array of timeslots based on timeinterval

function generateTimeslots(timeInterval, startTime, endTime, storeId, maxPeoplePerSlot) {
   // Assert valid time interval.
   if (timeInterval < 20 || timeInterval > 60 || timeInterval % 10 !== 0) {
     throw new Error('Can only accept 20, 30, 60')
   }
 
   // Break down start and end hours/minutes.
   const [startHour, startMinute] = startTime.split(':')
   const endMinute = endTime.split(':')[1]
 
   // Check for interval validity with regards to start and end times.
   const validIntervalMap = {
     20: ['00', '20', '40'],
     30: ['00', '30'],
     60: ['00'],
   }
   if (
     validIntervalMap[timeInterval].indexOf(startMinute) === -1 ||
     validIntervalMap[timeInterval].indexOf(endMinute) === -1
   ) {
     throw new Error('Incorrect time interval')
   }
 
   // Dumb time slot class.
   class Time {
     constructor (hour, minute) {
       this.hour = parseInt(hour, 10)
       this.minute = parseInt(minute, 10)
     }
 
     /**
      * Return formatted time as string of hour:minute
      *
      * @returns {string}
      */
     get () {
       let formatted = { hour: this.hour, minute: this.minute }
       for (let prop in formatted) {
         if (formatted[prop] < 10) {
           formatted[prop] = `0${formatted[prop]}`
         }
       }
       return `${formatted.hour}:${formatted.minute}`
     }
 
     /**
      * Add minutes to a time
      *
      * @param {number} minute
      * @returns {string}
      */
     add (minute) {
       const newMinute = this.minute + minute
       if (newMinute >= 60) {
         this.hour += parseInt(newMinute / 60, 10)
         this.minute = newMinute % 60
       } else {
         this.minute = newMinute
       }
 
       return this.get()
     }
   }
 
   // Instantiate start and end times
   const start = new Time(startHour, startMinute)
   // Add the first slot.
   const slots = [start.get()]
 
   // Keep adding slots until the expected end slot is reached.
   while (slots.lastIndexOf(endTime) === -1) {
     slots.push(start.add(timeInterval))
   }

   const pairedSlots = generatePairs(slots, startTime, endTime, storeId, maxPeoplePerSlot);
 
   return pairedSlots; 
 }

 function generatePairs(slots, startTime, endTime, storeId, maxPeoplePerSlot){
     const newSlots = [];

     for (let i = 0; i < slots.length - 1; i++) {
        let slotObj = {
            "startTime": slots[i], 
            "endTime": slots[i + 1], 
            "maxPeoplePerSlot": maxPeoplePerSlot, 
            "storeId": storeId
        };
        newSlots.push(slotObj);
     }

     return newSlots; 
 }

 module.exports = { 
     generateTimeslots: generateTimeslots 
 }

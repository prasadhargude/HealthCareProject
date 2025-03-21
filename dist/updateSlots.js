import { updateAvailableSlots } from './app/lib/updateAvailableSlots';
updateAvailableSlots()
    .then(function () { return console.log('Slots updated successfully'); })
    .catch(function (error) { return console.error('Error updating slots:', error); });

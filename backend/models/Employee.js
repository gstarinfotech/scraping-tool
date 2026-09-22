const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    name: String,
    mobile: Number,
    email: String,
    password: String,
    status: { type: Boolean, default: true },
    account: String,
    canedit: { type: String, default: false },
    role: String,
    sheet: { type: mongoose.Schema.Types.Mixed, default: {} },
    sheetlist: { type: [String], default: [] },
    secretkey: { type: String, default: '' },
    clientid: { type: String, default: '' },
    addedby: String,
    img: { type: String, default: '' },
    Date: { type: String, default: () => new Date().toLocaleString() },
});

module.exports = mongoose.model('Employee2', employeeSchema);

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import clientPromise from './mongodb';
import { addDays, format } from 'date-fns';
export function updateAvailableSlots() {
    return __awaiter(this, void 0, void 0, function () {
        var client, db, collection, yesterday, specialties, timeSlots, i, date, _i, specialties_1, specialty, _a, timeSlots_1, time;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, clientPromise];
                case 1:
                    client = _b.sent();
                    db = client.db("healthconnect");
                    collection = db.collection("availableSlots");
                    yesterday = format(addDays(new Date(), -1), 'yyyy-MM-dd');
                    return [4 /*yield*/, collection.deleteMany({ date: { $lt: yesterday } })];
                case 2:
                    _b.sent();
                    specialties = ["General Physician", "Cardiologist", "Dermatologist", "Pediatrician"];
                    timeSlots = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"];
                    i = 0;
                    _b.label = 3;
                case 3:
                    if (!(i < 3)) return [3 /*break*/, 10];
                    date = format(addDays(new Date(), i), 'yyyy-MM-dd');
                    _i = 0, specialties_1 = specialties;
                    _b.label = 4;
                case 4:
                    if (!(_i < specialties_1.length)) return [3 /*break*/, 9];
                    specialty = specialties_1[_i];
                    _a = 0, timeSlots_1 = timeSlots;
                    _b.label = 5;
                case 5:
                    if (!(_a < timeSlots_1.length)) return [3 /*break*/, 8];
                    time = timeSlots_1[_a];
                    return [4 /*yield*/, collection.updateOne({ specialty: specialty, date: date, time: time }, {
                            $setOnInsert: {
                                specialty: specialty,
                                date: date,
                                time: time,
                                isAvailable: true
                            }
                        }, { upsert: true })];
                case 6:
                    _b.sent();
                    _b.label = 7;
                case 7:
                    _a++;
                    return [3 /*break*/, 5];
                case 8:
                    _i++;
                    return [3 /*break*/, 4];
                case 9:
                    i++;
                    return [3 /*break*/, 3];
                case 10:
                    console.log('Available slots updated successfully');
                    return [2 /*return*/];
            }
        });
    });
}

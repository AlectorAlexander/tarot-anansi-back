import {model as mongooseCreateModel, Document, Schema } from "mongoose";
import { ISchedules } from "../dtos/schedules.dtos";
import MongoModel from "src/modules/MongoModel";

export const SchedulesSchema = new Schema<ISchedules & Document>({
    user_id: { type: String, required: true },
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    date_creation: { type: Date, default: Date.now, required: true },
    date_update: { type: Date, default: Date.now, required: true },
})

class SchedulesModel extends MongoModel<ISchedules & Document> {
    constructor(model = mongooseCreateModel('schedules', SchedulesSchema)) {
        super(model)
    }

}
export default SchedulesModel
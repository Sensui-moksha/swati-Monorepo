import { BaseRepository } from "./BaseRepository";
import { Setting, ISetting } from "../models/Setting";
import { FilterQuery } from "mongoose";

export class SettingRepository extends BaseRepository<ISetting> {
  constructor() {
    super(Setting);
  }

  async findByKey(key: string): Promise<ISetting | null> {
    return this.findOne({ key } as FilterQuery<ISetting>);
  }

  async upsertByKey(
    key: string,
    value: any,
    meta: Partial<ISetting> = {},
  ): Promise<ISetting> {
    const updated = await this.model
      .findOneAndUpdate(
        { key },
        { $set: { value, ...meta } },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      )
      .exec();
    return updated as ISetting;
  }
}

export const settingRepository = new SettingRepository();

import { Injectable } from "@nestjs/common";
import { DbService } from "../db/db.service";

@Injectable()
export class CheckService {
  constructor(
    private readonly dbService: DbService,
  ) {}

  async check() {
    const visits = await this.dbService.read('visit');
    return `Visit recorder in DB: ${visits || 0}`;
  }
}
import { Module } from "@nestjs/common";
import { CheckController } from "./check.controller";
import { CheckService } from "./check.service";
import { DbModule } from "../db/db.module";

@Module({
  imports: [DbModule],
  controllers: [CheckController],
  providers: [CheckService],
})
export class CheckModule {}
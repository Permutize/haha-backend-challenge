import { Module } from "@nestjs/common";
import { DbService } from "./db.service";
import { QueueModule } from "../queue/queue.module";

@Module({
  providers: [DbService],
  exports: [DbService],
})
export class DbModule {}